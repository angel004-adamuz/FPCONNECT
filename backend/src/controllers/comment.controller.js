// Controlador de Comentarios
import commentService from '../services/comment.service.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logger from '../config/logger.js';

export const commentController = {
  // POST /api/posts/:postId/comments
  createComment: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const { content } = req.body;

    const comment = await commentService.createComment(postId, req.userId, content, req.app.get('io'));

    res.status(201).json({
      success: true,
      message: 'Comentario creado exitosamente',
      data: comment,
    });
  }),

  // GET /api/posts/:postId/comments
  getPostComments: asyncHandler(async (req, res) => {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await commentService.getPostComments(postId, page, limit, req.userId);

    res.status(200).json({
      success: true,
      message: 'Comentarios obtenidos',
      data: result,
    });
  }),

  // PUT /api/comments/:id
  updateComment: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;

    const updatedComment = await commentService.updateComment(id, req.userId, content);

    res.status(200).json({
      success: true,
      message: 'Comentario actualizado',
      data: updatedComment,
    });
  }),

  // DELETE /api/comments/:id
  deleteComment: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await commentService.deleteComment(id, req.userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),

  // POST /api/comments/:id/like
  likeComment: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await commentService.likeComment(id, req.userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),

  // DELETE /api/comments/:id/like
  unlikeComment: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await commentService.unlikeComment(id, req.userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),
};

export default commentController;
