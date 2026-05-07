import { jest, describe, test, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import prisma, { resetPrismaMock } from './__mocks__/prisma.js';
import { authToken, mockUser, testEnv } from './testUtils.js';

testEnv();

jest.unstable_mockModule('../config/prisma.js', () => ({
  default: prisma,
}));

const { app, server, io } = await import('../index.js');

const studentUser = mockUser({
  id: 'student-user-1',
  email: 'alumno@example.com',
  role: 'ALUMNO',
});

const studentProfile = {
  id: 'student-profile-1',
  userId: studentUser.id,
  cicle: 'DAM',
  specialization: null,
  seekingJob: true,
  user: {
    id: studentUser.id,
    firstName: studentUser.firstName,
    lastName: studentUser.lastName,
    email: studentUser.email,
    profileImage: null,
    bio: null,
    location: 'Sevilla',
  },
};

const offer = {
  id: 'offer-1',
  enterpriseId: 'enterprise-profile-1',
  title: 'Desarrollador DAM en prácticas',
  description: 'Prácticas para alumnado DAM',
  type: 'PRACTICAS',
  status: 'ABIERTA',
  salary: '600€/mes',
  location: 'Sevilla',
  remote: false,
  createdAt: new Date('2026-01-01T10:00:00.000Z'),
  updatedAt: new Date('2026-01-01T10:00:00.000Z'),
};

describe('Offer application routes', () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  afterAll(() => {
    io.close();
    if (server.listening) {
      server.close();
    }
  });

  describe('POST /api/offers/:id/apply', () => {
    test('allows a student to apply successfully', async () => {
      const application = {
        id: 'application-1',
        jobOfferId: offer.id,
        studentId: studentProfile.id,
        coverLetter: 'Me interesa la oferta.',
        status: 'PENDIENTE',
        appliedAt: new Date('2026-01-02T10:00:00.000Z'),
        updatedAt: new Date('2026-01-02T10:00:00.000Z'),
        jobOffer: {
          ...offer,
          enterprise: {
            id: offer.enterpriseId,
            user: {
              id: 'enterprise-user-1',
              firstName: 'Empresa',
              lastName: 'FP',
              email: 'empresa@example.com',
            },
          },
        },
      };

      prisma.studentProfile.findUnique.mockResolvedValue(studentProfile);
      prisma.jobOffer.findUnique.mockResolvedValue(offer);
      prisma.jobApplication.findUnique.mockResolvedValue(null);
      prisma.jobApplication.create.mockResolvedValue(application);

      const response = await request(app)
        .post(`/api/offers/${offer.id}/apply`)
        .set('Authorization', `Bearer ${authToken({ id: studentUser.id, role: 'ALUMNO' })}`)
        .send({ coverLetter: application.coverLetter });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: application.id,
        jobOfferId: offer.id,
        studentId: studentProfile.id,
        status: 'PENDING',
      });
      expect(prisma.jobApplication.create).toHaveBeenCalledWith(expect.objectContaining({
        data: {
          jobOfferId: offer.id,
          studentId: studentProfile.id,
          coverLetter: application.coverLetter,
          status: 'PENDIENTE',
        },
      }));
    });

    test('returns 409 for duplicate application', async () => {
      prisma.studentProfile.findUnique.mockResolvedValue(studentProfile);
      prisma.jobOffer.findUnique.mockResolvedValue(offer);
      prisma.jobApplication.findUnique.mockResolvedValue({
        id: 'application-existing',
        jobOfferId: offer.id,
        studentId: studentProfile.id,
        status: 'PENDIENTE',
      });

      const response = await request(app)
        .post(`/api/offers/${offer.id}/apply`)
        .set('Authorization', `Bearer ${authToken({ id: studentUser.id, role: 'ALUMNO' })}`)
        .send({ coverLetter: 'Duplicada' });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(prisma.jobApplication.create).not.toHaveBeenCalled();
    });

    test('returns 403 for a non-student user', async () => {
      prisma.studentProfile.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post(`/api/offers/${offer.id}/apply`)
        .set('Authorization', `Bearer ${authToken({ id: 'enterprise-user-1', role: 'EMPRESA' })}`)
        .send({ coverLetter: 'No soy alumno' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(prisma.jobOffer.findUnique).not.toHaveBeenCalled();
      expect(prisma.jobApplication.create).not.toHaveBeenCalled();
    });
  });
});
