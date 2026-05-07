import { jest, describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import bcrypt from 'bcryptjs';
import request from 'supertest';
import prisma, { resetPrismaMock } from './__mocks__/prisma.js';
import { authToken, mockUser, testEnv } from './testUtils.js';

testEnv();

jest.unstable_mockModule('../config/prisma.js', () => ({
  default: prisma,
}));

const { app, server, io } = await import('../index.js');

const registerPayload = {
  email: 'ana@example.com',
  password: 'Password123',
  firstName: 'Ana',
  lastName: 'Lopez',
  role: 'ALUMNO',
};

describe('Auth routes', () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  afterAll(() => {
    io.close();
    if (server.listening) {
      server.close();
    }
  });

  describe('POST /api/auth/register', () => {
    test('returns 201 and tokens when registration succeeds', async () => {
      const createdUser = mockUser({
        id: 'student-user-1',
        email: registerPayload.email,
        firstName: registerPayload.firstName,
        lastName: registerPayload.lastName,
        role: registerPayload.role,
      });

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue(createdUser);
      prisma.studentProfile.create.mockResolvedValue({ id: 'student-profile-1', userId: createdUser.id });

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        id: createdUser.id,
        email: registerPayload.email,
        role: 'ALUMNO',
      });
      expect(response.body.data.token).toEqual(expect.any(String));
      expect(response.body.data.refreshToken).toEqual(expect.any(String));
      expect(prisma.studentProfile.create).toHaveBeenCalledWith({
        data: { userId: createdUser.id },
      });
    });

    test('returns 409 for duplicate email', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser({ email: registerPayload.email }));

      const response = await request(app)
        .post('/api/auth/register')
        .send(registerPayload);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    test('returns 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ email: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(expect.any(Array));
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/auth/login', () => {
    test('returns 200 and tokens when credentials are valid', async () => {
      const password = 'Password123';
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = mockUser({ password: hashedPassword });

      prisma.user.findUnique.mockResolvedValue(user);
      prisma.user.update.mockResolvedValue({ ...user, lastLogin: new Date() });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        id: user.id,
        email: user.email,
        role: user.role,
      });
      expect(response.body.data.token).toEqual(expect.any(String));
      expect(response.body.data.refreshToken).toEqual(expect.any(String));
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: { lastLogin: expect.any(Date) },
      });
    });

    test('returns 401 when password is wrong', async () => {
      const user = mockUser({
        password: await bcrypt.hash('CorrectPassword123', 10),
      });

      prisma.user.findUnique.mockResolvedValue(user);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: user.email, password: 'WrongPassword123' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    test('returns 404 when user is not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'missing@example.com', password: 'Password123' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/auth/me', () => {
    test('returns the authenticated user for a valid JWT', async () => {
      const user = mockUser({
        id: 'student-user-1',
        password: undefined,
        studentProfile: { id: 'student-profile-1', userId: 'student-user-1' },
        enterpriseProfile: null,
        centerProfile: null,
      });

      prisma.user.findUnique.mockResolvedValue(user);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken({ id: user.id, role: user.role })}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toMatchObject({
        id: user.id,
        email: user.email,
        role: user.role,
      });
    });

    test('returns 401 without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });
});
