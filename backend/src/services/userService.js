/**
 * User Service
 * Manages user queries and statistics.
 */
const userRepository = require('../repositories/userRepository');

class UserService {
  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) return null;
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }

  async getUserByEmail(email) {
    return userRepository.findByEmail(email);
  }

  async updateUserStats(id, statsUpdate) {
    const updated = await userRepository.updateStats(id, statsUpdate);
    if (!updated) return null;
    const { passwordHash, ...safeUser } = updated;
    return safeUser;
  }
}

module.exports = new UserService();
