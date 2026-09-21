const databaseGameHistoryRepository = require('../../database/repositories/gameHistoryRepository');

class GameHistoryRepository {
  async createHistory(data) {
    return databaseGameHistoryRepository.createHistory(data);
  }

  async create(record) {
    return databaseGameHistoryRepository.createHistory(record);
  }

  async findByUserId(userId) {
    return databaseGameHistoryRepository.findByUserId(userId);
  }

  async findByRoomId(roomId) {
    return databaseGameHistoryRepository.findByRoomId(roomId);
  }

  async findRecentGames(limit) {
    return databaseGameHistoryRepository.findRecentGames(limit);
  }

  async countTotalGames() {
    return databaseGameHistoryRepository.countTotalGames();
  }
}

module.exports = new GameHistoryRepository();
