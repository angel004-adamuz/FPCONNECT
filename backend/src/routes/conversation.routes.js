import { Router } from 'express';
import prisma from '../config/prisma.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = Router();

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  profileImage: true,
  role: true,
};

const getOtherParticipantId = (conversation, userId) => {
  return conversation.participantIds.find((participantId) => participantId !== userId);
};

const getConversationForUser = async (conversationId, userId) => {
  return prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participantIds: { has: userId },
    },
  });
};

const enrichConversation = async (conversation, userId) => {
  const otherParticipantId = getOtherParticipantId(conversation, userId);
  const [otherUser, lastMessage, unreadCount] = await Promise.all([
    otherParticipantId
      ? prisma.user.findUnique({ where: { id: otherParticipantId }, select: userSelect })
      : null,
    prisma.message.findFirst({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.message.count({
      where: {
        conversationId: conversation.id,
        recipientId: userId,
        isRead: false,
      },
    }),
  ]);

  return {
    ...conversation,
    otherUser,
    lastMessage,
    unreadCount,
  };
};

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { recipientId } = req.body;

    if (!recipientId || recipientId === req.user.id) {
      return res.status(400).json({ success: false, message: 'Destinatario no valido' });
    }

    const recipient = await prisma.user.findFirst({
      where: { id: recipientId, status: 'ACTIVO' },
      select: { id: true },
    });

    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Usuario destinatario no encontrado' });
    }

    const existingConversation = await prisma.conversation.findFirst({
      where: {
        isGroup: false,
        participantIds: { hasEvery: [req.user.id, recipientId] },
      },
    });

    const conversation = existingConversation || await prisma.conversation.create({
      data: {
        participantIds: [req.user.id, recipientId],
        isGroup: false,
      },
    });

    res.status(existingConversation ? 200 : 201).json({
      success: true,
      data: await enrichConversation(conversation, req.user.id),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: { has: req.user.id },
      },
      orderBy: [
        { lastMessageAt: 'desc' },
        { updatedAt: 'desc' },
      ],
    });

    const enriched = await Promise.all(
      conversations.map((conversation) => enrichConversation(conversation, req.user.id))
    );

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const conversation = await getConversationForUser(req.params.id, req.user.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversacion no encontrada' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: conversation.id },
        include: {
          sender: { select: userSelect },
          recipient: { select: userSelect },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.message.count({ where: { conversationId: conversation.id } }),
    ]);

    res.json({
      success: true,
      data: {
        messages: messages.reverse(),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/:id/messages', authMiddleware, async (req, res) => {
  try {
    const { content } = req.body;
    const conversation = await getConversationForUser(req.params.id, req.user.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversacion no encontrada' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'El mensaje no puede estar vacio' });
    }

    const recipientId = getOtherParticipantId(conversation, req.user.id);

    if (!recipientId) {
      return res.status(400).json({ success: false, message: 'No se pudo resolver destinatario' });
    }

    const message = await prisma.$transaction(async (tx) => {
      const createdMessage = await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderId: req.user.id,
          recipientId,
          content: content.trim(),
        },
        include: {
          sender: { select: userSelect },
          recipient: { select: userSelect },
        },
      });

      await tx.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: createdMessage.createdAt },
      });

      return createdMessage;
    });

    const io = req.app.get('io');
    io?.to(recipientId).emit('new_message', { conversationId: conversation.id, message });
    io?.to(req.user.id).emit('new_message', { conversationId: conversation.id, message });

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    const conversation = await getConversationForUser(req.params.id, req.user.id);

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversacion no encontrada' });
    }

    const result = await prisma.message.updateMany({
      where: {
        conversationId: conversation.id,
        recipientId: req.user.id,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    const otherParticipantId = getOtherParticipantId(conversation, req.user.id);
    const io = req.app.get('io');
    io?.to(otherParticipantId).emit('message_read', {
      conversationId: conversation.id,
      readerId: req.user.id,
    });
    io?.to(req.user.id).emit('message_read', {
      conversationId: conversation.id,
      readerId: req.user.id,
    });

    res.json({ success: true, data: { readMessages: result.count } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
