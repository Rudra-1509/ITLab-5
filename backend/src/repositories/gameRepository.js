/**
 * Game Repository Adapter
 * Manages game definition records using MongoDB or in-memory persistence.
 */
const { DEFAULT_TIC_TAC_TOE_GAME } = require('../models/types');
const { isMongoConnected } = require('./dbHelper');

let mongoGameRepo = null;
try {
  mongoGameRepo = require('../../../database/repositories/gameRepository');
} catch (err) {
  mongoGameRepo = null;
}

class GameRepository {
  constructor() {
    this.games = new Map();
    this.games.set(DEFAULT_TIC_TAC_TOE_GAME.id, { ...DEFAULT_TIC_TAC_TOE_GAME });
  }

  async ensureDefaultSeed() {
    if (isMongoConnected() && mongoGameRepo) {
      const existing = await mongoGameRepo.findById(DEFAULT_TIC_TAC_TOE_GAME.id);
      if (!existing) {
        try {
          await mongoGameRepo.create({ ...DEFAULT_TIC_TAC_TOE_GAME });
        } catch (e) {
          // Ignore unique index collision
        }
      }
    }
  }

  async findAll() {
    if (isMongoConnected() && mongoGameRepo) {
      await this.ensureDefaultSeed();
      return mongoGameRepo.findAll();
    }
    return Array.from(this.games.values()).map(g => ({ ...g }));
  }

  async findById(id) {
    if (isMongoConnected() && mongoGameRepo) {
      await this.ensureDefaultSeed();
      return mongoGameRepo.findById(id);
    }
    const game = this.games.get(id);
    return game ? { ...game } : null;
  }

  async findByGameType(gameType) {
    if (isMongoConnected() && mongoGameRepo) {
      await this.ensureDefaultSeed();
      return mongoGameRepo.findByGameType(gameType);
    }
    for (const game of this.games.values()) {
      if (game.gameType === gameType) {
        return { ...game };
      }
    }
    return null;
  }

  async create(gameData) {
    if (isMongoConnected() && mongoGameRepo) {
      return mongoGameRepo.create(gameData);
    }

    const id = gameData.id || `game_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const game = {
      id,
      name: gameData.name,
      description: gameData.description || '',
      gameType: gameData.gameType,
      rules: gameData.rules || [],
      winningConditions: gameData.winningConditions || [],
      maxPlayers: gameData.maxPlayers || 2,
      scoringPolicy: gameData.scoringPolicy || {
        participation: 5,
        win: 20,
        draw: 10,
        loss: 2
      }
    };
    this.games.set(id, game);
    return { ...game };
  }
}

module.exports = new GameRepository();
