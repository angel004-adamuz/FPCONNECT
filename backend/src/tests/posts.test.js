import { jest, describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import prisma, { resetPrismaMock } from './__mocks__/prisma.js';
import { authToken, mockUser, testEnv } from './testUtils.js';

testEnv();

jest.unstable_mockModule('../config/prisma.js', () => ({
  default: prisma,
}));

const { app, server, io } = await import('../index.js');

const postAuthor = mockUser({
  id: 'author-1',
  firstName: 'Autor',
  lastName: 'FP',
});

const createdPost = {
  id: 'post-1',
  authorId: postAuthor.id,
  content: 'Primera publicación de prueba',
  imageUrl: null,
  visibility: 'PUBLIC',
  likeCount: 0,
  commentCount: 0,
  createdAt: new Date('2026-01-01T10:00:00.000Z'),
  updatedAt: new Date('2026-01-01T10:00:00.000Z'),
  author: {
    id: postAuthor.id,
    firstName: postAuthor.firstName,
    lastName: postAuthor.lastName,
    profileImage: null,
    role: 'ALUMNO',
  },
  comments: [],
};

describe('Post routes', () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  afterAll(() => {
    io.close();
    if (server.listening) {
      server.close();
    }
  });

  describe('POST /api/posts', () => {
    test('creates a post for an authenticated user', async () => {
      prisma.post.create.mockResolvedValue(createdPost);

      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken({ id: postAuthor.id, role: 'ALUMNO' })}`)
        .send({ content: createdPost.content, visibility: 'PUBLIC' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: createdPost.id,
        content: createdPost.content,
        authorId: postAuthor.id,
      });
      expect(prisma.post.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          authorId: postAuthor.id,
          content: createdPost.content,
          visibility: 'PUBLIC',
        }),
      }));
    });

    test('returns 401 when unauthenticated', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({ content: createdPost.content });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(prisma.post.create).not.toHaveBeenCalled();
    });

    test('returns 400 when content is missing', async () => {
      const response = await request(app)
        .post('/api/posts')
        .set('Authorization', `Bearer ${authToken({ id: postAuthor.id, role: 'ALUMNO' })}`)
        .send({ visibility: 'PUBLIC' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(prisma.post.create).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/posts/:id/like', () => {
    test('adds a like for an authenticated user', async () => {
      const liker = mockUser({ id: 'student-2', firstName: 'Luis', lastName: 'Garcia' });
      const post = {
        ...createdPost,
        authorId: postAuthor.id,
        author: {
          id: postAuthor.id,
          firstName: postAuthor.firstName,
          lastName: postAuthor.lastName,
        },
      };

      prisma.post.findUnique.mockResolvedValue(post);
      prisma.like.findFirst.mockResolvedValue(null);
      prisma.like.create.mockResolvedValue({
        id: 'like-1',
        postId: post.id,
        userId: liker.id,
        createdAt: new Date('2026-01-01T10:05:00.000Z'),
      });
      prisma.post.update.mockResolvedValue({ ...post, likeCount: 1 });
      prisma.user.findUnique.mockResolvedValue(liker);
      prisma.notification.create.mockResolvedValue({
        id: 'notification-1',
        userId: post.authorId,
        type: 'like',
        title: 'Nuevo me gusta',
        message: 'Luis Garcia le dio me gusta a tu publicación',
        actorId: liker.id,
        targetId: post.id,
        isRead: false,
        createdAt: new Date('2026-01-01T10:05:00.000Z'),
      });

      const response = await request(app)
        .post(`/api/posts/${post.id}/like`)
        .set('Authorization', `Bearer ${authToken({ id: liker.id, role: 'ALUMNO' })}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Like agregado');
      expect(prisma.like.create).toHaveBeenCalledWith({
        data: {
          postId: post.id,
          userId: liker.id,
        },
      });
      expect(prisma.post.update).toHaveBeenCalledWith({
        where: { id: post.id },
        data: { likeCount: { increment: 1 } },
      });
    });

    test('returns 401 when unauthenticated', async () => {
      const response = await request(app).post('/api/posts/post-1/like');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(prisma.like.create).not.toHaveBeenCalled();
    });
  });
});
