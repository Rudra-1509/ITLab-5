/**
 * Analytics Repository Interface & Implementation
 * Aggregates statistics for players, leaderboards, and the overall platform.
 */
const userRepository = require('./userRepository');
const roomRepository = require('./roomRepository');
const gameHistoryRepository = require('./gameHistoryRepository');

class AnalyticsRepository {
  async getUserStats(userId) {
    const user = await userRepository.findById(userId);
    if (!user) return null;

    const totalGames = user.totalGames || 0;
    const wins = user.wins || 0;
    const losses = user.losses || 0;
    const draws = user.draws || 0;
    const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

    return {
      totalGames,
      wins,
      losses,
      draws,
      winRate,
      credits: user.credits || 0
    };
  }

  async getLeaderboard(limit = 20) {
    const allUsers = await userRepository.findAll();
    return allUsers
      .sort((a, b) => (b.credits || 0) - (a.credits || 0) || (b.wins || 0) - (a.wins || 0))
      .slice(0, limit)
      .map(u => ({
        id: u.id,
        username: u.username,
        credits: u.credits || 0,
        wins: u.wins || 0,
        totalGames: u.totalGames || 0
      }));
  }

  async getPlatformStats() {
    const allUsers = await userRepository.findAll();
    const allRooms = await roomRepository.findAll();
    const totalGames = await gameHistoryRepository.countTotalGames();

    const activeRooms = allRooms.filter(r => r.status === 'IN_PROGRESS' || r.status === 'WAITING').length;

    return {
      totalPlayers: allUsers.length,
      totalGamesPlayed: totalGames,
      activeRooms,
      totalRoomsCreated: allRooms.length
    };
  }
}

module.exports = new AnalyticsRepository();
