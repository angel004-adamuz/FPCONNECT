// Controlador de Posts
import postService from '../services/post.service.js';
import { asyncHandler } from '../middlewares/errorHandler.js';
import logger from '../config/logger.js';

export const postController = {
  // POST /api/posts
  createPost: asyncHandler(async (req, res) => {
    const { content, imageUrl, visibility } = req.body;

    const post = await postService.createPost(req.userId, {
      content,
      imageUrl,
      visibility,
    });

    res.status(201).json({
      success: true,
      message: 'Post creado exitosamente',
      data: post,
    });
  }),

  // GET /api/posts (Feed)
  getFeed: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await postService.getFeed(req.userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Feed obtenido',
      data: result,
    });
  }),

  // GET /api/posts/:id
  getPost: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const post = await postService.getPostById(id, req.userId);

    res.status(200).json({
      success: true,
      data: post,
    });
  }),

  // GET /api/posts/user/:userId
  getUserPosts: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const result = await postService.getUserPosts(userId, page, limit);

    res.status(200).json({
      success: true,
      message: 'Posts del usuario obtenidos',
      data: result,
    });
  }),

  // PUT /api/posts/:id
  updatePost: asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { content, imageUrl, visibility } = req.body;

    const updatedPost = await postService.updatePost(id, req.userId, {
      content,
      imageUrl,
      visibility,
    });

    res.status(200).json({
      success: true,
      message: 'Post actualizado',
      data: updatedPost,
    });
  }),

  // DELETE /api/posts/:id
  deletePost: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await postService.deletePost(id, req.userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),

  // POST /api/posts/:id/like
  likePost: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await postService.likePost(id, req.userId, req.app.get('io'));

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),

  // DELETE /api/posts/:id/like
  unlikePost: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await postService.unlikePost(id, req.userId);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  }),

  // GET /api/posts/search/:term
  searchPosts: asyncHandler(async (req, res) => {
    const { term } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const result = await postService.searchPosts(term, limit, offset);

    res.status(200).json({
      success: true,
      message: 'Búsqueda de posts realizada',
      data: result,
    });
  }),
};

export default postController;
