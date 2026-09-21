import api from './api';

export const authApi = {
  /**
   * Register a new player
   * POST /api/auth/register
   * Body: { username, email, password }
   */
  async register(username, email, password) {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data; // { success: true, data: { user, token } }
  },

  /**
   * Login an existing player
   * POST /api/auth/login
   * Body: { email, password }
   */
  async login(email, password) {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    return response.data; // { success: true, data: { user, token } }
  },

  /**
   * Get current authenticated user profile
   * GET /api/auth/me
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data; // { success: true, data: { user } }
  },
};

export default authApi;
