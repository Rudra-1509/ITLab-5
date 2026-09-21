const databaseGameRepository = require('../../database/repositories/gameRepository');

class GameRepository {
  async createGame(data) {
    return databaseGameRepository.createGame(data);
  }

  async create(gameData) {
    return databaseGameRepository.createGame(gameData);
  }

  async findById(id) {
    return databaseGameRepository.findById(id);
  }

  async findByType(gameType) {
    return databaseGameRepository.findByType(gameType);
  }

  async findByGameType(gameType) {
    return databaseGameRepository.findByType(gameType);
  }

  async findAll() {
    return databaseGameRepository.findAll();
  }

  async updateGame(id, data) {
    return databaseGameRepository.updateGame(id, data);
  }
}

module.exports = new GameRepository();
