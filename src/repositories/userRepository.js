/**
 * User Repository Interface & In-Memory Implementation
 * Developer 3 (Database) can implement database persistence here (e.g. MongoDB/PostgreSQL).
 */

class UserRepository {
  constructor() {
    this.users = new Map();
  }

  async create(userData) {
    const now = new Date().toISOString();
    const user = {
      id: userData.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: userData.username,
      email: userData.email.toLowerCase(),
      passwordHash: userData.passwordHash,
      credits: userData.credits !== undefined ? userData.credits : 0,
      totalGames: userData.totalGames || 0,
      wins: userData.wins || 0,
      losses: userData.losses || 0,
      draws: userData.draws || 0,
      createdAt: userData.createdAt || now,
      updatedAt: userData.updatedAt || now
    };

    this.users.set(user.id, user);
    return { ...user };
  }

  async findById(id) {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async findByEmail(email) {
    if (!email) return null;
    const lowerEmail = email.toLowerCase();
    for (const user of this.users.values()) {
      if (user.email === lowerEmail) {
        return { ...user };
      }
    }
    return null;
  }

  async findByUsername(username) {
    if (!username) return null;
    const lowerUsername = username.toLowerCase();
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === lowerUsername) {
        return { ...user };
      }
    }
    return null;
  }

  async updateStats(id, statsUpdate) {
    const user = this.users.get(id);
    if (!user) return null;

    if (statsUpdate.credits !== undefined) {
      user.credits = (user.credits || 0) + statsUpdate.credits;
      // Prevent negative credits
      if (user.credits < 0) user.credits = 0;
    }
    if (statsUpdate.totalGames !== undefined) {
      user.totalGames = (user.totalGames || 0) + statsUpdate.totalGames;
    }
    if (statsUpdate.wins !== undefined) {
      user.wins = (user.wins || 0) + statsUpdate.wins;
    }
    if (statsUpdate.losses !== undefined) {
      user.losses = (user.losses || 0) + statsUpdate.losses;
    }
    if (statsUpdate.draws !== undefined) {
      user.draws = (user.draws || 0) + statsUpdate.draws;
    }

    user.updatedAt = new Date().toISOString();
    this.users.set(id, user);
    return { ...user };
  }

  async findAll() {
    return Array.from(this.users.values()).map(u => ({ ...u }));
  }

  async clear() {
    this.users.clear();
  }
}

module.exports = new UserRepository();
