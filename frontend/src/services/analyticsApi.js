import api from './api';

export const analyticsApi = {
  /**
   * Get current authenticated user statistics
   * GET /api/analytics/me
   */
  async getMyAnalytics() {
    const response = await api.get('/analytics/me');
    return response.data; // { success: true, data: { totalGames, wins, losses, draws, winRate, credits } }
  },

  /**
   * Get leaderboard ranked by credits
   * GET /api/analytics/leaderboard
   */
  async getLeaderboard(limit = 20) {
    const response = await api.get('/analytics/leaderboard', {
      params: { limit },
    });
    return response.data; // { success: true, data: [ { id, username, credits, wins, totalGames }, ... ] }
  },

  /**
   * Get platform-wide statistics
   * GET /api/analytics/games
   */
  async getPlatformStats() {
    const response = await api.get('/analytics/games');
    return response.data; // { success: true, data: { totalPlayers, totalGamesPlayed, activeRooms, ... } }
  },

  /**
   * Get authenticated user match history
   * GET /api/games/history
   */
  async getGameHistory() {
    const response = await api.get('/games/history');
    return response.data; // { success: true, data: [ { id, gameId, gameType, roomId, opponents, result, creditsAwarded, startedAt, completedAt }, ... ] }
  },
};

export default analyticsApi;
