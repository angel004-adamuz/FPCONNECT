// Controlador de Conexiones (Follow System)
import connectionService from '../services/connection.service.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logger from '../config/logger.js';

export const connectionController = {
  // GET /api/connections/followers
  getMyFollowers: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await connectionService.getFollowers(req.userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Seguidores obtenidos',
      data: result.followers,
      pagination: result.pagination,
    });
  }),

  // GET /api/connections/following
  getMyFollowing: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await connectionService.getFollowing(req.userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Usuarios seguidos obtenidos',
      data: result.following,
      pagination: result.pagination,
    });
  }),

  // POST /api/connections/:userId/follow
  followUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const result = await connectionService.followUser(req.userId, userId, req.app.get('io'));

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.connection,
    });
  }),

  // DELETE /api/connections/:userId/follow
  unfollowUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const result = await connectionService.unfollowUser(req.userId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),

  // GET /api/users/:userId/followers
  getFollowers: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await connectionService.getFollowers(userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Seguidores obtenidos',
      data: result,
    });
  }),

  // GET /api/users/:userId/following
  getFollowing: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await connectionService.getFollowing(userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Usuarios seguidos obtenidos',
      data: result,
    });
  }),

  // GET /api/connections/:userId/status
  getConnectionStatus: asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const isFollowing = await connectionService.isFollowing(req.userId, userId);
    const stats = await connectionService.getConnectionStats(userId);

    res.status(200).json({
      success: true,
      data: {
        isFollowing,
        ...stats,
      },
    });
  }),

  // POST /api/connections/:userId/block
  blockUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const result = await connectionService.blockUser(req.userId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),

  // DELETE /api/connections/:userId/block
  unblockUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const result = await connectionService.unblockUser(req.userId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),

  // GET /api/connections/recommendations
  getRecommendations: asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;

    const recommendations = await connectionService.getRecommendations(req.userId, limit);

    res.status(200).json({
      success: true,
      message: 'Recomendaciones obtenidas',
      data: recommendations,
    });
  }),
};

export default connectionController;
