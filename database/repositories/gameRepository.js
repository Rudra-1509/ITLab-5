const Game = require('../models/Game');

class GameRepository {
  async createGame(data) {
    const payload = {
      id: data.id || `game_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: data.name,
      description: data.description || '',
      gameType: data.gameType,
      rules: data.rules || [],
      winningConditions: data.winningConditions || [],
      maxPlayers: data.maxPlayers || 2,
      scoringPolicy: {
        participation: data.scoringPolicy?.participation ?? 5,
        win: data.scoringPolicy?.win ?? 20,
        draw: data.scoringPolicy?.draw ?? 10,
        loss: data.scoringPolicy?.loss ?? 2
      },
      createdBy: data.createdBy || 'system'
    };

    const game = await Game.create(payload);
    return game.toObject();
  }

  async create(data) {
    return this.createGame(data);
  }

  async findById(id) {
    if (!id) return null;
    const game = await Game.findOne({ id }).lean();
    return game ? this.serialize(game) : null;
  }

  async findByType(gameType) {
    if (!gameType) return null;
    const game = await Game.findOne({ gameType: String(gameType).toUpperCase().trim() }).lean();
    return game ? this.serialize(game) : null;
  }

  async findByGameType(gameType) {
    return this.findByType(gameType);
  }

  async findAll() {
    const games = await Game.find({}).sort({ createdAt: -1 }).lean();
    return games.map(game => this.serialize(game));
  }

  async updateGame(id, data) {
    const game = await Game.findOneAndUpdate(
      { id },
      data,
      { new: true }
    ).lean();

    return game ? this.serialize(game) : null;
  }

  serialize(game) {
    if (!game) return null;
    const serialized = { ...game };
    if (serialized.id === undefined && serialized._id) {
      serialized.id = serialized._id.toString();
    }
    delete serialized._id;
    delete serialized.__v;
    return serialized;
  }
}

module.exports = new GameRepository();
