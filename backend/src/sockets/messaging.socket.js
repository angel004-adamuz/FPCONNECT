// Configuración de Socket.io para mensajería en tiempo real
import { Server } from 'socket.io';
import logger from '../config/logger.js';
import prisma from '../config/prisma.js';

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

export const initializeSocket = (server, config) => {
  const io = new Server(server, {
    cors: {
      origin: config.cors_origin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  const connectedUsers = new Map();

  io.on('connection', (socket) => {
    logger.debug(`Socket conectado: ${socket.id}`);

    socket.on('user:connect', (userId) => {
      if (!userId) return;

      connectedUsers.set(userId, socket.id);
      socket.join(userId);
      socket.data.userId = userId;
      logger.debug(`Usuario ${userId} conectado (socket: ${socket.id})`);
      io.emit('user:online', { userId });
    });

    socket.on('message:send', async (data, ack) => {
      try {
        const senderId = socket.data.userId || data.senderId;
        const { conversationId, content } = data;

        if (!senderId || !conversationId || !content?.trim()) {
          socket.emit('message:error', { error: 'Datos de mensaje incompletos' });
          ack?.({ success: false, error: 'Datos de mensaje incompletos' });
          return;
        }

        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            participantIds: { has: senderId },
          },
        });

        if (!conversation) {
          socket.emit('message:error', { error: 'Conversacion no encontrada' });
          ack?.({ success: false, error: 'Conversacion no encontrada' });
          return;
        }

        const recipientId = getOtherParticipantId(conversation, senderId);

        if (!recipientId) {
          socket.emit('message:error', { error: 'Destinatario no encontrado' });
          ack?.({ success: false, error: 'Destinatario no encontrado' });
          return;
        }

        const message = await prisma.$transaction(async (tx) => {
          const createdMessage = await tx.message.create({
            data: {
              conversationId,
              senderId,
              recipientId,
              content: content.trim(),
            },
            include: {
              sender: { select: userSelect },
              recipient: { select: userSelect },
            },
          });

          await tx.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: createdMessage.createdAt },
          });

          return createdMessage;
        });

        io.to(recipientId).emit('new_message', { conversationId, message });
        io.to(senderId).emit('new_message', { conversationId, message });
        socket.emit('message:sent', { id: message.id, status: 'sent' });
        ack?.({ success: true, data: message });
      } catch (error) {
        logger.error('Error al enviar mensaje:', error);
        socket.emit('message:error', { error: 'Error al enviar mensaje' });
        ack?.({ success: false, error: 'Error al enviar mensaje' });
      }
    });

    socket.on('message:read', async (data) => {
      try {
        const readerId = socket.data.userId || data.userId;
        const { conversationId } = data;

        if (!readerId || !conversationId) return;

        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            participantIds: { has: readerId },
          },
        });

        if (!conversation) return;

        await prisma.message.updateMany({
          where: {
            conversationId,
            recipientId: readerId,
            isRead: false,
          },
          data: {
            isRead: true,
            readAt: new Date(),
          },
        });

        const otherParticipantId = getOtherParticipantId(conversation, readerId);
        io.to(otherParticipantId).emit('message_read', { conversationId, readerId });
        io.to(readerId).emit('message_read', { conversationId, readerId });
      } catch (error) {
        logger.error('Error al marcar como leído:', error);
      }
    });

    socket.on('notification:send', async (data) => {
      try {
        const { userId, type, title, message } = data;

        const notification = await prisma.notification.create({
          data: {
            userId,
            type,
            title,
            message,
          },
        });

        io.to(userId).emit('notification:received', {
          id: notification.id,
          userId: notification.userId,
          type,
          title,
          message,
          createdAt: notification.createdAt,
          isRead: notification.isRead,
        });
        io.to(userId).emit('new_notification', notification);
      } catch (error) {
        logger.error('Error al enviar notificación:', error);
      }
    });

    socket.on('post:created', (data) => {
      io.emit('post:new', data);
      logger.debug(`Post creado: ${data.id}`);
    });

    socket.on('post:liked', (data) => {
      io.emit('post:liked', data);
    });

    socket.on('comment:added', (data) => {
      io.emit('comment:new', data);
    });

    socket.on('disconnect', () => {
      const disconnectedUserId = socket.data.userId;

      if (disconnectedUserId) {
        connectedUsers.delete(disconnectedUserId);
        logger.debug(`Usuario ${disconnectedUserId} desconectado`);
        io.emit('user:offline', { userId: disconnectedUserId });
      }

      logger.debug(`Socket desconectado: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error(`Error de socket ${socket.id}:`, error);
    });
  });

  return io;
};

export default initializeSocket;
