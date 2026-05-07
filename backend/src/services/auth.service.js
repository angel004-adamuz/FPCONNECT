// Servicio de autenticación
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma.js';
import config from '../config/index.js';
import logger from '../config/logger.js';
import { AppError } from '../middlewares/errorHandler.js';

const SALT_ROUNDS = 10;

export const authService = {
  normalizeRecoveryAnswer: (answer = '') => {
    return answer.trim().toLowerCase();
  },

  // Hash de contraseña
  hashPassword: async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  // Comparar contraseña
  comparePassword: async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
  },

  // Generar JWT
  generateToken: (userId, role, expiresIn = config.jwt_expires_in) => {
    return jwt.sign(
      { id: userId, role },
      config.jwt_secret,
      { expiresIn }
    );
  },

  // Generar Refresh Token
  generateRefreshToken: (userId, role) => {
    return jwt.sign(
      { id: userId, role },
      config.refresh_token_secret,
      { expiresIn: config.refresh_token_expires_in }
    );
  },

  // Verificar Refresh Token
  verifyRefreshToken: (token) => {
    try {
      return jwt.verify(token, config.refresh_token_secret);
    } catch (error) {
      throw new AppError('Refresh token inválido', 401);
    }
  },

  // Registro de usuario
  register: async (userData) => {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      recoveryQuestion,
      recoveryAnswer,
    } = userData;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('El email ya está registrado', 409);
    }

    // Hash de la contraseña
    const hashedPassword = await authService.hashPassword(password);
    const hasRecoveryConfig = Boolean(recoveryQuestion && recoveryAnswer);

    if ((recoveryQuestion && !recoveryAnswer) || (!recoveryQuestion && recoveryAnswer)) {
      throw new AppError('Debes enviar pregunta y respuesta de recuperación juntas', 400);
    }

    const recoveryAnswerHash = hasRecoveryConfig
      ? await authService.hashPassword(authService.normalizeRecoveryAnswer(recoveryAnswer))
      : null;

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role,
        recoveryQuestion: recoveryQuestion || null,
        recoveryAnswerHash,
        recoveryUpdatedAt: hasRecoveryConfig ? new Date() : null,
      },
    });

    // Crear perfil específico según el rol
    if (role === 'ALUMNO') {
      await prisma.studentProfile.create({
        data: { userId: user.id },
      });
    } else if (role === 'EMPRESA') {
      await prisma.enterpriseProfile.create({
        data: { userId: user.id, companyName: '' },
      });
    } else if (role === 'CENTRO') {
      await prisma.centerProfile.create({
        data: { userId: user.id, centerName: '' },
      });
    }

    logger.info(`✅ Usuario registrado: ${email} (${role})`);

    // Generar tokens
    const token = authService.generateToken(user.id, user.role);
    const refreshToken = authService.generateRefreshToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      refreshToken,
    };
  },

  // Obtener pregunta de recuperación por email
  getRecoveryChallenge: async (email) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        status: true,
        recoveryQuestion: true,
        recoveryAnswerHash: true,
      },
    });

    if (!user || user.status !== 'ACTIVO' || !user.recoveryQuestion || !user.recoveryAnswerHash) {
      return {
        hasChallenge: false,
      };
    }

    return {
      hasChallenge: true,
      recoveryQuestion: user.recoveryQuestion,
    };
  },

  // Restablecer contraseña por recuperación personalizada
  resetPasswordWithRecovery: async ({ email, recoveryAnswer, newPassword }) => {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        status: true,
        password: true,
        recoveryAnswerHash: true,
      },
    });

    if (!user || !user.recoveryAnswerHash) {
      throw new AppError('No se pudo verificar la recuperación para este usuario', 400);
    }

    if (user.status !== 'ACTIVO') {
      throw new AppError('Usuario no activo', 403);
    }

    const normalizedAnswer = authService.normalizeRecoveryAnswer(recoveryAnswer);
    const isAnswerValid = await authService.comparePassword(normalizedAnswer, user.recoveryAnswerHash);

    if (!isAnswerValid) {
      throw new AppError('La respuesta de recuperación no es correcta', 401);
    }

    const isSamePassword = await authService.comparePassword(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError('La nueva contraseña debe ser diferente a la actual', 400);
    }

    const hashedPassword = await authService.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });
  },

  // Configurar recuperación personalizada para un usuario autenticado
  configureRecovery: async (userId, { recoveryQuestion, recoveryAnswer }) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const normalizedAnswer = authService.normalizeRecoveryAnswer(recoveryAnswer);
    const recoveryAnswerHash = await authService.hashPassword(normalizedAnswer);

    await prisma.user.update({
      where: { id: userId },
      data: {
        recoveryQuestion,
        recoveryAnswerHash,
        recoveryUpdatedAt: new Date(),
      },
    });
  },

  // Login
  login: async (email, password) => {
    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña
    const isPasswordValid = await authService.comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new AppError('Email o contraseña incorrectos', 401);
    }

    // Verificar estado del usuario
    if (user.status !== 'ACTIVO') {
      throw new AppError('Usuario no activo', 403);
    }

    // Actualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    logger.info(`✅ Login exitoso: ${email}`);

    // Generar tokens
    const token = authService.generateToken(user.id, user.role);
    const refreshToken = authService.generateRefreshToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
      refreshToken,
    };
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const decoded = authService.verifyRefreshToken(refreshToken);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    if (user.status !== 'ACTIVO') {
      throw new AppError('Usuario no activo', 403);
    }

    const newToken = authService.generateToken(user.id, user.role);
    const newRefreshToken = authService.generateRefreshToken(user.id, user.role);

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  },

  // Obtener usuario por ID
  getUserById: async (userId) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        profileImage: true,
        bio: true,
        location: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return user;
  },
};

export default authService;
