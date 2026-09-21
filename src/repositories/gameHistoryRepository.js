/**
 * Game History Repository Interface & Implementation
 * Stores completed match history for users.
 */

class GameHistoryRepository {
  constructor() {
    this.history = [];
  }

  async create(record) {
    const historyItem = {
      id: record.id || `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      gameId: record.gameId,
      gameType: record.gameType || 'TIC_TAC_TOE',
      roomId: record.roomId,
      userId: record.userId,
      opponents: record.opponents || [],
      result: record.result, // 'WIN', 'LOSS', 'DRAW'
      creditsAwarded: record.creditsAwarded || 0,
      startedAt: record.startedAt || new Date().toISOString(),
      completedAt: record.completedAt || new Date().toISOString()
    };

    this.history.push(historyItem);
    return { ...historyItem };
  }

  async findByUserId(userId) {
    return this.history
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .map(item => ({ ...item }));
  }

  async countTotalGames() {
    // Unique room matches completed
    const uniqueRooms = new Set(this.history.map(h => h.roomId));
    return uniqueRooms.size;
  }

  async clear() {
    this.history = [];
  }
}

module.exports = new GameHistoryRepository();
