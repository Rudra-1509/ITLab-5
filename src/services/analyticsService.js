/**
 * Analytics Service
 * Provides performance metrics, leaderboards, and aggregate game stats.
 */
const analyticsRepository = require('../repositories/analyticsRepository');
const { ApiError } = require('../utils/apiResponse');

class AnalyticsService {
  async getMyAnalytics(userId) {
    const stats = await analyticsRepository.getUserStats(userId);
    if (!stats) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User statistics not found');
    }
    return stats;
  }

  async getLeaderboard(limit = 20) {
    return analyticsRepository.getLeaderboard(limit);
  }

  async getPlatformStats() {
    return analyticsRepository.getPlatformStats();
  }
}

module.exports = new AnalyticsService();
