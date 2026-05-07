// Rutas de Usuarios
import express from 'express';
import userController from '../controllers/user.controller.js';
import connectionController from '../controllers/connection.controller.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

/**
 * @route   GET /api/users/me/linked-center
 * @desc    Obtener centro vinculado del alumno autenticado
 * @access  Private (ALUMNO)
 */
router.get(
  '/me/linked-center',
  authMiddleware,
  userController.getMyLinkedCenter
);

/**
 * @route   POST /api/users/me/link-center/:centerId
 * @desc    Vincular alumno autenticado a un centro
 * @access  Private (ALUMNO)
 */
router.post(
  '/me/link-center/:centerId',
  authMiddleware,
  userController.linkMeToCenter
);

/**
 * @route   DELETE /api/users/me/link-center
 * @desc    Desvincular alumno autenticado de su centro
 * @access  Private (ALUMNO)
 */
router.delete(
  '/me/link-center',
  authMiddleware,
  userController.unlinkMeFromCenter
);

/**
 * @route   GET /api/users/search/:query
 * @desc    Buscar usuarios
 * @access  Public
 * @query   role=ALUMNO|CENTRO|EMPRESA, limit=20, offset=0
 */
router.get(
  '/search/:query',
  userController.searchUsers
);

/**
 * @route   GET /api/users/:id/stats
 * @desc    Obtener estadísticas de usuario
 * @access  Public
 */
router.get(
  '/:id/stats',
  userController.getUserStats
);

/**
 * @route   GET /api/users/:id/followers
 * @desc    Obtener seguidores de usuario
 * @access  Public
 */
router.get(
  '/:id/followers',
  (req, res, next) => {
    req.params.userId = req.params.id;
    next();
  },
  connectionController.getFollowers
);

/**
 * @route   GET /api/users/:id/following
 * @desc    Obtener usuarios que sigue
 * @access  Public
 */
router.get(
  '/:id/following',
  (req, res, next) => {
    req.params.userId = req.params.id;
    next();
  },
  connectionController.getFollowing
);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener perfil público de usuario
 * @access  Public
 */
router.get(
  '/:id',
  userController.getPublicProfile
);

/**
 * @route   PUT /api/users/profile
 * @desc    Actualizar perfil del usuario autenticado
 * @access  Private
 */
router.put(
  '/profile',
  authMiddleware,
  userController.updateProfile
);

export default router;
