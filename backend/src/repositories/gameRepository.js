/**
 * Game Repository Interface & Implementation
 * Manages game definition records.
 */
const { DEFAULT_TIC_TAC_TOE_GAME } = require('../models/types');

class GameRepository {
  constructor() {
    this.games = new Map();
    // Seed default Tic-Tac-Toe
    this.games.set(DEFAULT_TIC_TAC_TOE_GAME.id, { ...DEFAULT_TIC_TAC_TOE_GAME });
  }

  async findAll() {
    return Array.from(this.games.values()).map(g => ({ ...g }));
  }

  async findById(id) {
    const game = this.games.get(id);
    return game ? { ...game } : null;
  }

  async findByGameType(gameType) {
    for (const game of this.games.values()) {
      if (game.gameType === gameType) {
        return { ...game };
      }
    }
    return null;
  }

  async create(gameData) {
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
