import jwt from 'jsonwebtoken';

export const testEnv = () => {
  process.env.NODE_ENV = 'test';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/fpconnect_test';
  process.env.DIRECT_URL = 'postgresql://test:test@localhost:5432/fpconnect_test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
  process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
};

export const authToken = (user = {}) => {
  return jwt.sign(
    {
      id: user.id || 'user-1',
      role: user.role || 'ALUMNO',
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

export const mockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'ana@example.com',
  password: '$2b$10$hashed',
  firstName: 'Ana',
  lastName: 'Lopez',
  role: 'ALUMNO',
  status: 'ACTIVO',
  profileImage: null,
  bio: null,
  location: 'Sevilla',
  createdAt: new Date('2026-01-01T10:00:00.000Z'),
  updatedAt: new Date('2026-01-02T10:00:00.000Z'),
  lastLogin: null,
  ...overrides,
});
