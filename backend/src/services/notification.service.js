import prisma from '../config/prisma.js';
import logger from '../config/logger.js';
import { AppError } from '../middlewares/errorHandler.js';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  profileImage: true,
  role: true,
};

const serializeRelatedData = (relatedData) => {
  if (!relatedData) return null;
  if (typeof relatedData === 'string') return relatedData;
  return JSON.stringify(relatedData);
};

const emitNotification = (io, notification) => {
  if (!io || !notification?.userId) return;
  io.to(notification.userId).emit('new_notification', notification);
};

export const notificationService = {
  createNotification: async ({
    userId,
    type,
    title,
    message,
    actorId = null,
    targetId = null,
    relatedData = null,
  }, io = null) => {
    if (!userId || !type || !title || !message) {
      throw new AppError('Faltan datos obligatorios de la notificación', 400);
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actorId,
        targetId,
        relatedData: serializeRelatedData(relatedData),
      },
      include: {
        user: { select: userSelect },
      },
    });

    emitNotification(io, notification);
    logger.info(`Notificación creada para ${userId}: ${type}`);
    return notification;
  },

  createNotificationIfRecipientIsDifferent: async (data, actorId, io = null) => {
    if (!data?.userId || data.userId === actorId) return null;
    return notificationService.createNotification(data, io);
  },

  getNotifications: async (userId) => {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: [
          { isRead: 'asc' },
          { createdAt: 'desc' },
        ],
        include: {
          user: { select: userSelect },
        },
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return { notifications, unreadCount };
  },

  markAsRead: async (notificationId, userId) => {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      throw new AppError('Notificación no encontrada', 404);
    }

    if (notification.isRead) return notification;

    return prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  },

  markAllAsRead: async (userId) => {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { updated: result.count };
  },

  getActorName: async (actorId) => {
    if (!actorId) return 'Alguien';

    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: {
        firstName: true,
        lastName: true,
      },
    });

    if (!actor) return 'Alguien';
    return `${actor.firstName} ${actor.lastName}`.trim();
  },
};

export default notificationService;
