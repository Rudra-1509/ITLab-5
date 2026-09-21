import api from './api';

export const roomApi = {
  /**
   * Get all rooms, with optional status filter (e.g. 'WAITING')
   * GET /api/rooms?status=WAITING
   */
  async getRooms(status) {
    const params = status ? { status } : {};
    const response = await api.get('/rooms', { params });
    return response.data; // { success: true, data: [room, ...] }
  },

  /**
   * Get room by ID
   * GET /api/rooms/:roomId
   */
  async getRoomById(roomId) {
    const response = await api.get(`/rooms/${roomId}`);
    return response.data; // { success: true, data: room }
  },

  /**
   * Create a new room
   * POST /api/rooms
   * Body: { gameType: "TIC_TAC_TOE" }
   */
  async createRoom(gameType = 'TIC_TAC_TOE') {
    const response = await api.post('/rooms', {
      gameType,
      gameId: 'game-tictactoe-001',
    });
    return response.data; // { success: true, data: room }
  },

  /**
   * Join an existing room
   * POST /api/rooms/:roomId/join
   */
  async joinRoom(roomId) {
    const response = await api.post(`/rooms/${roomId}/join`);
    return response.data; // { success: true, data: room }
  },

  /**
   * Leave a room
   * POST /api/rooms/:roomId/leave
   */
  async leaveRoom(roomId) {
    const response = await api.post(`/rooms/${roomId}/leave`);
    return response.data; // { success: true, data: { message } }
  },

  /**
   * Make a move (REST endpoint fallback)
   * POST /api/rooms/:roomId/move
   */
  async makeMove(roomId, position) {
    const response = await api.post(`/rooms/${roomId}/move`, { position });
    return response.data;
  },

  /**
   * Fetch game definitions
   * GET /api/games
   */
  async getGames() {
    const response = await api.get('/games');
    return response.data;
  },
};

export default roomApi;
