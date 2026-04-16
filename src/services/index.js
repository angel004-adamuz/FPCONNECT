import apiClient from './api';

/**
 * Servicios de Autenticación
 */
export const authService = {
  /**
   * Registrar nuevo usuario
   */
  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  },

  /**
   * Login de usuario
   */
  login: async (email, password) => {
    return apiClient.post('/auth/login', { email, password });
  },

  /**
   * Obtener datos del usuario actual
   */
  getMe: async () => {
    return apiClient.get('/auth/me');
  },

  /**
   * Refresh token
   */
  refreshToken: async (refreshToken) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  /**
   * Obtener pregunta de recuperación por email
   */
  getRecoveryChallenge: async (email) => {
    return apiClient.post('/auth/recovery/challenge', { email });
  },

  /**
   * Restablecer contraseña mediante recuperación personalizada
   */
  resetPasswordWithRecovery: async ({ email, recoveryAnswer, newPassword }) => {
    return apiClient.post('/auth/recovery/reset', {
      email,
      recoveryAnswer,
      newPassword,
    });
  },

  /**
   * Configurar pregunta/respuesta de recuperación (usuario autenticado)
   */
  configureRecovery: async ({ recoveryQuestion, recoveryAnswer }) => {
    return apiClient.post('/auth/recovery/configure', {
      recoveryQuestion,
      recoveryAnswer,
    });
  },

  /**
   * Logout
   */
  logout: async () => {
    return apiClient.post('/auth/logout');
  },
};

/**
 * Servicios de Posts
 */
export const postsService = {
  /**
   * Obtener feed del usuario
   */
  getFeed: async (page = 1, limit = 10) => {
    return apiClient.get('/posts', {
      params: { page, limit },
    });
  },

  /**
   * Crear nuevo post
   */
  createPost: async (content, visibility = 'PUBLIC') => {
    return apiClient.post('/posts', {
      content,
      visibility,
    });
  },

  /**
   * Obtener un post específico
   */
  getPost: async (postId) => {
    return apiClient.get(`/posts/${postId}`);
  },

  /**
   * Obtener posts de un usuario
   */
  getUserPosts: async (userId, page = 1, limit = 10) => {
    return apiClient.get(`/posts/user/${userId}`, {
      params: { page, limit },
    });
  },

  /**
   * Actualizar post
   */
  updatePost: async (postId, content, visibility) => {
    return apiClient.put(`/posts/${postId}`, {
      content,
      visibility,
    });
  },

  /**
   * Eliminar post
   */
  deletePost: async (postId) => {
    return apiClient.delete(`/posts/${postId}`);
  },

  /**
   * Like en un post
   */
  likePost: async (postId) => {
    return apiClient.post(`/posts/${postId}/like`);
  },

  /**
   * Unlike en un post
   */
  unlikePost: async (postId) => {
    return apiClient.delete(`/posts/${postId}/like`);
  },

  /**
   * Buscar posts
   */
  searchPosts: async (query, page = 1, limit = 10) => {
    return apiClient.get('/posts/search', {
      params: { query, page, limit },
    });
  },
};

/**
 * Servicios de Comentarios
 */
export const commentsService = {
  /**
   * Crear comentario
   */
  createComment: async (postId, content) => {
    return apiClient.post(`/posts/${postId}/comments`, { content });
  },

  /**
   * Obtener comentarios de un post
   */
  getComments: async (postId, page = 1, limit = 10) => {
    return apiClient.get(`/posts/${postId}/comments`, {
      params: { page, limit },
    });
  },

  /**
   * Actualizar comentario
   */
  updateComment: async (postId, commentId, content) => {
    return apiClient.put(`/posts/${postId}/comments/${commentId}`, { content });
  },

  /**
   * Eliminar comentario
   */
  deleteComment: async (postId, commentId) => {
    return apiClient.delete(`/posts/${postId}/comments/${commentId}`);
  },

  /**
   * Like en comentario
   */
  likeComment: async (postId, commentId) => {
    return apiClient.post(`/posts/${postId}/comments/${commentId}/like`);
  },

  /**
   * Unlike en comentario
   */
  unlikeComment: async (postId, commentId) => {
    return apiClient.delete(`/posts/${postId}/comments/${commentId}/like`);
  },
};

/**
 * Servicios de Conexiones (Follows)
 */
export const connectionsService = {
  /**
   * Seguir a un usuario
   */
  followUser: async (userId) => {
    return apiClient.post(`/connections/${userId}/follow`);
  },

  /**
   * Dejar de seguir a un usuario
   */
  unfollowUser: async (userId) => {
    return apiClient.delete(`/connections/${userId}/follow`);
  },

  /**
   * Obtener estado de conexión con un usuario
   */
  getConnectionStatus: async (userId) => {
    return apiClient.get(`/connections/${userId}/status`);
  },

  /**
   * Obtener mis seguidores
   */
  getFollowers: async (page = 1, limit = 10) => {
    return apiClient.get('/connections/followers', {
      params: { page, limit },
    });
  },

  /**
   * Obtener usuarios que sigo
   */
  getFollowing: async (page = 1, limit = 10) => {
    return apiClient.get('/connections/following', {
      params: { page, limit },
    });
  },

  /**
   * Obtener recomendaciones de usuarios
   */
  getRecommendations: async (limit = 10) => {
    return apiClient.get('/connections/recommendations', {
      params: { limit },
    });
  },

  /**
   * Bloquear usuario
   */
  blockUser: async (userId) => {
    return apiClient.post(`/connections/${userId}/block`);
  },

  /**
   * Desbloquear usuario
   */
  unblockUser: async (userId) => {
    return apiClient.delete(`/connections/${userId}/block`);
  },
};

/**
 * Servicios de Usuarios
 */
export const usersService = {
  /**
   * Obtener centro vinculado del alumno autenticado
   */
  getMyLinkedCenter: async () => {
    return apiClient.get('/users/me/linked-center');
  },

  /**
   * Vincular alumno autenticado a un centro
   */
  linkMeToCenter: async (centerId) => {
    return apiClient.post(`/users/me/link-center/${centerId}`);
  },

  /**
   * Desvincular alumno autenticado de su centro
   */
  unlinkMeFromCenter: async () => {
    return apiClient.delete('/users/me/link-center');
  },

  /**
   * Obtener perfil público de un usuario
   */
  getProfile: async (userId) => {
    return apiClient.get(`/users/${userId}`);
  },

  /**
   * Actualizar mi perfil
   */
  updateProfile: async (updates) => {
    return apiClient.put('/users/profile', updates);
  },

  /**
   * Buscar usuarios
   */
  searchUsers: async (query, page = 1, limit = 10, role = null) => {
    return apiClient.get(`/users/search/${query}`, {
      params: { page, limit, role },
    });
  },

  /**
   * Obtener estadísticas del usuario actual
   */
  getStats: async () => {
    return apiClient.get('/users/stats');
  },
};
