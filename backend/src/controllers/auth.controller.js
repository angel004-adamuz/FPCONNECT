// Controlador de autenticación
import authService from '../services/auth.service.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logger from '../config/logger.js';

export const authController = {
  // POST /auth/register
  register: asyncHandler(async (req, res) => {
    const userData = req.body;

    const result = await authService.register(userData);

    logger.info(`📋 Registro exitoso para ${userData.email}`);

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: result,
    });
  }),

  // POST /auth/login
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    logger.info(`🔐 Login exitoso para ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: result,
    });
  }),

  // POST /auth/refresh-token
  refreshToken: asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token requerido',
      });
    }

    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      success: true,
      message: 'Token refrescado exitosamente',
      data: result,
    });
  }),

  // POST /auth/recovery/challenge
  getRecoveryChallenge: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const result = await authService.getRecoveryChallenge(email);

    res.status(200).json({
      success: true,
      message: result.hasChallenge
        ? 'Pregunta de recuperación encontrada'
        : 'No se pudo preparar la recuperación para este usuario',
      data: result,
    });
  }),

  // POST /auth/recovery/reset
  resetPasswordWithRecovery: asyncHandler(async (req, res) => {
    const { email, recoveryAnswer, newPassword } = req.body;

    await authService.resetPasswordWithRecovery({
      email,
      recoveryAnswer,
      newPassword,
    });

    logger.info(`🔁 Contraseña restablecida por recuperación para ${email}`);

    res.status(200).json({
      success: true,
      message: 'Contraseña restablecida correctamente',
    });
  }),

  // POST /auth/recovery/configure
  configureRecovery: asyncHandler(async (req, res) => {
    const { recoveryQuestion, recoveryAnswer } = req.body;

    await authService.configureRecovery(req.userId, {
      recoveryQuestion,
      recoveryAnswer,
    });

    logger.info(`🔐 Recuperación personalizada configurada para ${req.userId}`);

    res.status(200).json({
      success: true,
      message: 'Sistema de recuperación configurado',
    });
  }),

  // GET /auth/me
  getMe: asyncHandler(async (req, res) => {
    const user = await authService.getUserById(req.userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  }),

  // POST /auth/logout
  logout: asyncHandler(async (req, res) => {
    // En un futuro: invalidar el token en una lista negra (blacklist)
    logger.info(`👋 Logout para usuario ${req.userId}`);

    res.status(200).json({
      success: true,
      message: 'Logout exitoso',
    });
  }),
};

export default authController;
