const databaseUserRepository = require('../../database/repositories/userRepository');

class UserRepository {
  async createUser(data) {
    return databaseUserRepository.createUser(data);
  }

  async create(userData) {
    return databaseUserRepository.createUser(userData);
  }

  async findByEmail(email) {
    return databaseUserRepository.findByEmail(email);
  }

  async findByUsername(username) {
    return databaseUserRepository.findByUsername(username);
  }

  async findById(id) {
    return databaseUserRepository.findById(id);
  }

  async updateUser(id, data) {
    return databaseUserRepository.updateUser(id, data);
  }

  async updateStats(id, statsUpdate) {
    return databaseUserRepository.updateStats(id, statsUpdate);
  }

  async incrementCredits(id, amount) {
    return databaseUserRepository.incrementCredits(id, amount);
  }

  async incrementWin(id) {
    return databaseUserRepository.incrementWin(id);
  }

  async incrementLoss(id) {
    return databaseUserRepository.incrementLoss(id);
  }

  async incrementDraw(id) {
    return databaseUserRepository.incrementDraw(id);
  }

  async incrementTotalGames(id) {
    return databaseUserRepository.incrementTotalGames(id);
  }

  async getLeaderboard() {
    return databaseUserRepository.getLeaderboard();
  }

  async findAll() {
    return databaseUserRepository.getLeaderboard();
  }
}

module.exports = new UserRepository();
