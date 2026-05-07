// Servicio de Conexiones (Follow System)
import prisma from '../config/prisma.js';
import logger from '../config/logger.js';
import { AppError } from '../middlewares/errorHandler.js';
import notificationService from './notification.service.js';

export const connectionService = {
  // Seguir a un usuario
  followUser: async (followerId, followingId, io = null) => {
    // Validar que no sea el mismo usuario
    if (followerId === followingId) {
      throw new AppError('No puedes seguirte a ti mismo', 400);
    }

    // Verificar que el usuario a seguir existe
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar si ya lo sigue
    const existingConnection = await prisma.connection.findFirst({
      where: {
        followerId,
        followingId,
      },
    });

    if (existingConnection) {
      throw new AppError('Ya estás siguiendo a este usuario', 400);
    }

    // Crear conexión
    const connection = await prisma.connection.create({
      data: {
        followerId,
        followingId,
        status: 'ACTIVE',
      },
    });

    logger.info(`👥 ${followerId} ahora sigue a ${followingId}`);

    const actorName = await notificationService.getActorName(followerId);
    await notificationService.createNotificationIfRecipientIsDifferent({
      userId: followingId,
      type: 'follow',
      title: 'Nuevo seguidor',
      message: `${actorName} te ha empezado a seguir`,
      actorId: followerId,
      targetId: followingId,
      relatedData: { followerId },
    }, followerId, io);

    return {
      message: 'Usuario seguido exitosamente',
      connection,
    };
  },

  // Dejar de seguir
  unfollowUser: async (followerId, followingId) => {
    const connection = await prisma.connection.findFirst({
      where: {
        followerId,
        followingId,
      },
    });

    if (!connection) {
      throw new AppError('No estás siguiendo a este usuario', 400);
    }

    await prisma.connection.delete({
      where: { id: connection.id },
    });

    logger.info(`👋 ${followerId} dejó de seguir a ${followingId}`);

    return { message: 'Usuario dejado de seguir' };
  },

  // Obtener seguidores de un usuario
  getFollowers: async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const followers = await prisma.connection.findMany({
      where: { followingId: userId, status: 'ACTIVE' },
      include: {
        follower: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            role: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });

    const total = await prisma.connection.count({
      where: { followingId: userId, status: 'ACTIVE' },
    });

    return {
      followers: followers.map((conn) => conn.follower),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  // Obtener usuarios que sigue
  getFollowing: async (userId, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const following = await prisma.connection.findMany({
      where: { followerId: userId, status: 'ACTIVE' },
      include: {
        following: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            role: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });

    const total = await prisma.connection.count({
      where: { followerId: userId, status: 'ACTIVE' },
    });

    return {
      following: following.map((conn) => conn.following),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  // Verificar si sigue a un usuario
  isFollowing: async (followerId, followingId) => {
    const connection = await prisma.connection.findFirst({
      where: {
        followerId,
        followingId,
        status: 'ACTIVE',
      },
    });

    return !!connection;
  },

  // Obtener estadísticas de conexiones
  getConnectionStats: async (userId) => {
    const followerCount = await prisma.connection.count({
      where: { followingId: userId, status: 'ACTIVE' },
    });

    const followingCount = await prisma.connection.count({
      where: { followerId: userId, status: 'ACTIVE' },
    });

    return {
      followers: followerCount,
      following: followingCount,
    };
  },

  // Bloquear usuario (futuro)
  blockUser: async (blockerId, blockedId) => {
    // Primero, eliminar cualquier conexión existente
    await prisma.connection.deleteMany({
      where: {
        OR: [
          { followerId: blockerId, followingId: blockedId },
          { followerId: blockedId, followingId: blockerId },
        ],
      },
    });

    // Crear conexión bloqueada
    const blocked = await prisma.connection.create({
      data: {
        followerId: blockerId,
        followingId: blockedId,
        status: 'BLOCKED',
      },
    });

    logger.info(`🚫 ${blockerId} bloqueó a ${blockedId}`);

    return { message: 'Usuario bloqueado' };
  },

  // Desbloquear usuario
  unblockUser: async (blockerId, blockedId) => {
    const connection = await prisma.connection.findFirst({
      where: {
        followerId: blockerId,
        followingId: blockedId,
        status: 'BLOCKED',
      },
    });

    if (!connection) {
      throw new AppError('Usuario no está bloqueado', 400);
    }

    await prisma.connection.delete({
      where: { id: connection.id },
    });

    logger.info(`🔓 ${blockerId} desbloqueó a ${blockedId}`);

    return { message: 'Usuario desbloqueado' };
  },

  // Obtener recomendaciones (usuarios a seguir)
  getRecommendations: async (userId, limit = 10) => {
    // Obtener IDs de usuarios ya seguidos
    const following = await prisma.connection.findMany({
      where: { followerId: userId, status: 'ACTIVE' },
      select: { followingId: true },
    });

    const followingIds = [userId, ...following.map((conn) => conn.followingId)];

    // Obtener usuarios activos no seguidos
    const recommendations = await prisma.user.findMany({
      where: {
        id: { notIn: followingIds },
        status: 'ACTIVO',
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        profileImage: true,
        bio: true,
        role: true,
      },
      take: limit,
    });

    return recommendations;
  },
};

export default connectionService;
