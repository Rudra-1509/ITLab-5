/**
 * Analytics Controller
 */
const analyticsService = require('../services/analyticsService');
const { sendSuccess } = require('../utils/apiResponse');

class AnalyticsController {
  async getMyAnalytics(req, res, next) {
    try {
      const stats = await analyticsService.getMyAnalytics(req.user.id);
      return sendSuccess(res, stats, 200);
    } catch (error) {
      next(error);
    }
  }

  async getLeaderboard(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const leaderboard = await analyticsService.getLeaderboard(limit);
      return sendSuccess(res, leaderboard, 200);
    } catch (error) {
      next(error);
    }
  }

  async getPlatformStats(req, res, next) {
    try {
      const stats = await analyticsService.getPlatformStats();
      return sendSuccess(res, stats, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
