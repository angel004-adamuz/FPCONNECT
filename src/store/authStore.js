import { create } from 'zustand';
import { authService } from '../services';

/**
 * Store de autenticación con Zustand
 * Maneja:
 * - Login/Register
 * - Logout
 * - Refresh token automático
 * - Persistencia en localStorage
 */
export const useAuthStore = create((set, get) => ({
  // Estado
  user: null,
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  isLoading: false,
  isInitializing: true,
  error: null,
  isAuthenticated: !!localStorage.getItem('token'),

  // Acciones
  /**
   * Login de usuario
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      const { user: authUser, token, refreshToken } = response.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      const meResponse = await authService.getMe();
      const user = meResponse.data?.user || authUser;

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isInitializing: false,
        isLoading: false,
      });

      return response;
    } catch (error) {
      const message = error.message || 'Error al iniciar sesión';
      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Registro de usuario
   */
  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(userData);
      const { user: authUser, token, refreshToken } = response.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      const meResponse = await authService.getMe();
      const user = meResponse.data?.user || authUser;

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isInitializing: false,
        isLoading: false,
      });

      return response;
    } catch (error) {
      let message = error.message || 'Error al registrarse';

      // Interpretar errores de validación del backend si existen
      if (error.data?.errors && Array.isArray(error.data.errors)) {
        const validationMessages = error.data.errors.map(err => {
          if (err.field === 'recoveryQuestion') return 'La pregunta de seguridad debe tener al menos 8 caracteres';
          if (err.field === 'recoveryAnswer') return 'La respuesta debe tener al menos 2 caracteres';
          if (err.field === 'password') return 'La contraseña debe tener al menos 8 caracteres';
          if (err.field === 'firstName') return 'El nombre es obligatorio';
          if (err.field === 'lastName') return 'El apellido es obligatorio';
          return err.message; 
        });
        message = validationMessages.join(' • ');
      }

      set({
        error: message,
        isLoading: false,
      });
      throw error;
    }
  },

  /**
   * Obtener datos del usuario actual
   */
  fetchMe: async () => {
    set({ isLoading: true });
    try {
      const response = await authService.getMe();
      const { user } = response.data;

      set({
        user,
        isLoading: false,
      });

      return response;
    } catch (error) {
      // Si el error es 401, el token es inválido
      if (error.status === 401) {
        get().logout();
      }
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    try {
      await authService.logout();
    } catch (error) {
      // Ignorar error de logout
      console.warn('Error al hacer logout:', error);
    }

    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitializing: false,
      error: null,
    });
  },

  /**
   * Refresh token
   */
  refreshAccessToken: async () => {
    const { refreshToken } = get();
    if (!refreshToken) return;

    try {
      const response = await authService.refreshToken(refreshToken);
      const { token, refreshToken: newRefreshToken } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);

      set({
        token,
        refreshToken: newRefreshToken,
      });

      return response;
    } catch (error) {
      // Si el refresh falla, hacer logout
      get().logout();
      throw error;
    }
  },

  /**
   * Limpiar error
   */
  clearError: () => set({ error: null }),

  /**
   * Inicializador desde localStorage (llamar en mount de App)
   */
  initialize: async () => {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');

    if (token && refreshToken) {
      set({ token, refreshToken, isInitializing: true });

      try {
        const response = await authService.getMe();
        const user = response.data?.user || response.data;

        set({
          user,
          token: localStorage.getItem('token'),
          refreshToken: localStorage.getItem('refreshToken'),
          isAuthenticated: true,
          isInitializing: false,
          error: null,
        });
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');

        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitializing: false,
          error: null,
        });
      }
      return;
    }

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitializing: false,
    });
  },
}));
