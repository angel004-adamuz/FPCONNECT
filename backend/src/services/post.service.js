// Servicio de Posts (Feed y gestión)
import prisma from '../config/prisma.js';
import logger from '../config/logger.js';
import { AppError } from '../middlewares/errorHandler.js';
import notificationService from './notification.service.js';

export const postService = {
  // Crear post
  createPost: async (userId, postData) => {
    const { content, imageUrl, visibility } = postData;

    const post = await prisma.post.create({
      data: {
        authorId: userId,
        content,
        imageUrl,
        visibility: visibility || 'PUBLIC',
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
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 3, // Últimos 3 comentarios
        },
      },
    });

    logger.info(`📝 Post creado: ${post.id} por ${userId}`);
    return post;
  },

  // Obtener feed (posts públicos con paginación)
  getFeed: async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    // Obtener IDs de usuarios que sigue
    const following = await prisma.connection.findMany({
      where: {
        followerId: userId,
        status: 'ACTIVE',
      },
      select: { followingId: true },
    });

    const followingIds = following.map((conn) => conn.followingId);

    // Posts del usuario + posts de usuarios que sigue + todos los públicos
    const where = {
      OR: [
        { visibility: 'PUBLIC' },
        { authorId: userId },
        {
          authorId: { in: followingIds },
          visibility: 'FRIENDS_ONLY'
        },
      ],
    };

    const posts = await prisma.post.findMany({
      where,
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
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
        likes: {
          where: { userId },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });

    const total = await prisma.post.count({ where });

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  // Obtener post específico
  getPostById: async (postId, userId = null) => {
    const post = await prisma.post.findUnique({
      where: { id: postId },
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
        comments: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profileImage: true,
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
        },
        likes: userId
          ? {
              where: { userId },
              select: { id: true },
            }
          : false,
      },
    });

    if (!post) {
      throw new AppError('Post no encontrado', 404);
    }

    return post;
  },

  // Obtener posts de usuario
  getUserPosts: async (userId, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
      where: { authorId: userId },
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
        comments: {
          select: { id: true },
        },
        likes: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    });

    const total = await prisma.post.count({ where: { authorId: userId } });

    return {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  // Actualizar post
  updatePost: async (postId, userId, updateData) => {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError('Post no encontrado', 404);
    }

    if (post.authorId !== userId) {
      throw new AppError('No tienes permiso para editar este post', 403);
    }

    const allowedFields = ['content', 'imageUrl', 'visibility'];
    const filteredData = {};

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key)) {
        filteredData[key] = updateData[key];
      }
    });

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: filteredData,
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
        comments: {
          select: { id: true },
        },
        likes: {
          select: { id: true },
        },
      },
    });

    logger.info(`✏️ Post actualizado: ${postId}`);
    return updatedPost;
  },

  // Eliminar post
  deletePost: async (postId, userId) => {
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new AppError('Post no encontrado', 404);
    }

    if (post.authorId !== userId) {
      throw new AppError('No tienes permiso para eliminar este post', 403);
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    logger.info(`🗑️ Post eliminado: ${postId}`);
    return { message: 'Post eliminado' };
  },

  // Like a post
  likePost: async (postId, userId, io = null) => {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!post) {
      throw new AppError('Post no encontrado', 404);
    }

    // Verificar si ya le dio like
    const existingLike = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingLike) {
      throw new AppError('Ya has dado like a este post', 400);
    }

    // Crear like
    await prisma.like.create({
      data: {
        postId,
        userId,
      },
    });

    // Actualizar contador
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { increment: 1 } },
    });

    logger.info(`👍 Like en post ${postId} por ${userId}`);

    const actorName = await notificationService.getActorName(userId);
    await notificationService.createNotificationIfRecipientIsDifferent({
      userId: post.authorId,
      type: 'like',
      title: 'Nuevo me gusta',
      message: `${actorName} le dio me gusta a tu publicación`,
      actorId: userId,
      targetId: postId,
      relatedData: { postId },
    }, userId, io);

    return { message: 'Like agregado' };
  },

  // Unlike post
  unlikePost: async (postId, userId) => {
    const like = await prisma.like.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!like) {
      throw new AppError('No has dado like a este post', 400);
    }

    // Eliminar like
    await prisma.like.delete({
      where: { id: like.id },
    });

    // Actualizar contador
    await prisma.post.update({
      where: { id: postId },
      data: { likeCount: { decrement: 1 } },
    });

    logger.info(`👎 Unlike en post ${postId} por ${userId}`);

    return { message: 'Like removido' };
  },

  // Obtener posts con filtro búsqueda
  searchPosts: async (searchTerm, limit = 10, offset = 0) => {
    const posts = await prisma.post.findMany({
      where: {
        content: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        visibility: 'PUBLIC',
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
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const total = await prisma.post.count({
      where: {
        content: {
          contains: searchTerm,
          mode: 'insensitive',
        },
        visibility: 'PUBLIC',
      },
    });

    return { posts, total };
  },
};

export default postService;
