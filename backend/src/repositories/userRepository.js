/**
 * User Repository Adapter
 * Transparently uses MongoDB Mongoose persistence when connected,
 * with fallback to high-performance in-memory datastore.
 * Pre-seeds demo accounts (Alice: player1@example.com, Bob: player2@example.com).
 */
const bcrypt = require('bcryptjs');
const { isMongoConnected } = require('./dbHelper');

let mongoUserRepo = null;
try {
  mongoUserRepo = require('../../../database/repositories/userRepository');
} catch (err) {
  mongoUserRepo = null;
}

const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const DEMO_USERS = [
  {
    id: 'usr_demo_alice',
    username: 'Alice (Demo)',
    email: 'player1@example.com',
    passwordHash: DEMO_PASSWORD_HASH,
    credits: 0,
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  },
  {
    id: 'usr_demo_bob',
    username: 'Bob (Demo)',
    email: 'player2@example.com',
    passwordHash: DEMO_PASSWORD_HASH,
    credits: 0,
    totalGames: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  }
];

class UserRepository {
  constructor() {
    this.users = new Map();
    DEMO_USERS.forEach(u => this.users.set(u.id, { ...u }));
  }

  async ensureDemoUsers() {
    if (isMongoConnected() && mongoUserRepo) {
      for (const demoUser of DEMO_USERS) {
        const existing = await mongoUserRepo.findByEmail(demoUser.email);
        if (!existing) {
          try {
            await mongoUserRepo.create({ ...demoUser });
          } catch (e) {
            // Ignore collision
          }
        }
      }
    }
  }

  async create(userData) {
    if (isMongoConnected() && mongoUserRepo) {
      await this.ensureDemoUsers();
      return mongoUserRepo.create(userData);
    }

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
    if (isMongoConnected() && mongoUserRepo) {
      await this.ensureDemoUsers();
      return mongoUserRepo.findById(id);
    }
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async findByEmail(email) {
    if (!email) return null;
    const cleanEmail = email.toLowerCase().trim();

    if (isMongoConnected() && mongoUserRepo) {
      await this.ensureDemoUsers();
      return mongoUserRepo.findByEmail(cleanEmail);
    }

    for (const user of this.users.values()) {
      if (user.email === cleanEmail) {
        return { ...user };
      }
    }
    return null;
  }

  async findByUsername(username) {
    if (!username) return null;
    const lowerUsername = username.toLowerCase().trim();

    if (isMongoConnected() && mongoUserRepo) {
      await this.ensureDemoUsers();
      return mongoUserRepo.findByUsername(username);
    }

    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === lowerUsername) {
        return { ...user };
      }
    }
    return null;
  }

  async updateStats(id, statsUpdate) {
    if (isMongoConnected() && mongoUserRepo) {
      return mongoUserRepo.updateStats(id, statsUpdate);
    }

    const user = this.users.get(id);
    if (!user) return null;

    if (statsUpdate.credits !== undefined) {
      user.credits = (user.credits || 0) + statsUpdate.credits;
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
    if (isMongoConnected() && mongoUserRepo) {
      await this.ensureDemoUsers();
      return mongoUserRepo.findAll();
    }
    return Array.from(this.users.values()).map(u => ({ ...u }));
  }

  async clear() {
    this.users.clear();
    DEMO_USERS.forEach(u => this.users.set(u.id, { ...u }));
  }
}

module.exports = new UserRepository();
