// Servicio de Comentarios
import prisma from '../config/prisma.js';
import logger from '../config/logger.js';
import { AppError } from '../middlewares/errorHandler.js';
import notificationService from './notification.service.js';

export const commentService = {
  // Crear comentario
  createComment: async (postId, userId, content, io = null) => {
    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError('Post no encontrado', 404);
    }

    // Crear comentario
    const comment = await prisma.comment.create({
      data: {
        postId,
        authorId: userId,
        content,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            role: true,
          },
        },
      },
    });

    // Actualizar contador de comentarios en post
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    });

    logger.info(`💬 Comentario creado en post ${postId} por ${userId}`);

    const actorName = await notificationService.getActorName(userId);
    await notificationService.createNotificationIfRecipientIsDifferent({
      userId: post.authorId,
      type: 'comment',
      title: 'Nuevo comentario',
      message: `${actorName} comentó en tu publicación`,
      actorId: userId,
      targetId: postId,
      relatedData: { postId, commentId: comment.id },
    }, userId, io);

    return comment;
  },

  // Obtener comentarios de un post
  getPostComments: async (postId, page = 1, limit = 10, userId = null) => {
    const skip = (page - 1) * limit;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            role: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });

    const total = await prisma.comment.count({ where: { postId } });

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  // Actualizar comentario
  updateComment: async (commentId, userId, newContent) => {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comentario no encontrado', 404);
    }

    if (comment.authorId !== userId) {
      throw new AppError('No tienes permiso para editar este comentario', 403);
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content: newContent },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
            role: true,
          },
        },
      },
    });

    logger.info(`✏️ Comentario actualizado: ${commentId}`);
    return updatedComment;
  },

  // Eliminar comentario
  deleteComment: async (commentId, userId) => {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comentario no encontrado', 404);
    }

    if (comment.authorId !== userId) {
      throw new AppError('No tienes permiso para eliminar este comentario', 403);
    }

    // Obtener el postId antes de eliminar
    const postId = comment.postId;

    // Eliminar comentario
    await prisma.comment.delete({
      where: { id: commentId },
    });

    // Actualizar contador en post
    await prisma.post.update({
      where: { id: postId },
      data: { commentCount: { decrement: 1 } },
    });

    logger.info(`🗑️ Comentario eliminado: ${commentId}`);
    return { message: 'Comentario eliminado' };
  },

  // Like comentario
  likeComment: async (commentId, userId) => {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new AppError('Comentario no encontrado', 404);
    }

    const existingLike = await prisma.like.findFirst({
      where: {
        commentId,
        userId,
      },
    });

    if (existingLike) {
      throw new AppError('Ya has dado like a este comentario', 400);
    }

    await prisma.like.create({
      data: {
        commentId,
        userId,
      },
    });

    await prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { increment: 1 } },
    });

    logger.info(`👍 Like en comentario ${commentId} por ${userId}`);
    return { message: 'Like agregado al comentario' };
  },

  // Unlike comentario
  unlikeComment: async (commentId, userId) => {
    const like = await prisma.like.findFirst({
      where: {
        commentId,
        userId,
      },
    });

    if (!like) {
      throw new AppError('No has dado like a este comentario', 400);
    }

    await prisma.like.delete({
      where: { id: like.id },
    });

    await prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { decrement: 1 } },
    });

    logger.info(`👎 Unlike en comentario ${commentId} por ${userId}`);
    return { message: 'Like removido del comentario' };
  },
};

export default commentService;
