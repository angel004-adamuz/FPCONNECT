// Rutas de autenticación
import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validate, schemas } from '../middlewares/validation.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario (Alumno, Centro, Empresa)
 * @access  Public
 */
router.post(
  '/register',
  validate(schemas.register),
  authController.register
);

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario
 * @access  Public
 */
router.post(
  '/login',
  validate(schemas.login),
  authController.login
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refrescar JWT token
 * @access  Public
 */
router.post('/refresh-token', authController.refreshToken);
router.post('/refresh', authController.refreshToken);

/**
 * @route   POST /api/auth/recovery/challenge
 * @desc    Obtener pregunta de recuperación por email
 * @access  Public
 */
router.post(
  '/recovery/challenge',
  validate(schemas.recoveryChallenge),
  authController.getRecoveryChallenge
);

/**
 * @route   POST /api/auth/recovery/reset
 * @desc    Restablecer contraseña usando respuesta de recuperación
 * @access  Public
 */
router.post(
  '/recovery/reset',
  validate(schemas.recoveryReset),
  authController.resetPasswordWithRecovery
);

/**
 * @route   POST /api/auth/recovery/configure
 * @desc    Configurar/actualizar recuperación personalizada
 * @access  Private
 */
router.post(
  '/recovery/configure',
  authMiddleware,
  validate(schemas.recoveryConfigure),
  authController.configureRecovery
);

/**
 * @route   GET /api/auth/me
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get('/me', authMiddleware, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout del usuario
 * @access  Private
 */
router.post('/logout', authMiddleware, authController.logout);

export default router;
