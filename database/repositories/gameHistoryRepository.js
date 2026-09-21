const GameHistory = require('../models/GameHistory');

class GameHistoryRepository {
  async createHistory(data = {}) {
    const normalizedPlayers = Array.isArray(data.players) && data.players.length > 0
      ? data.players.map(player => ({
          userId: player.userId,
          username: player.username || '',
          symbol: player.symbol || null
        }))
      : [];

    if (!normalizedPlayers.length && data.userId) {
      normalizedPlayers.push({
        userId: data.userId,
        username: data.username || '',
        symbol: data.symbol || null
      });

      if (Array.isArray(data.opponents)) {
        for (const opponent of data.opponents) {
          normalizedPlayers.push({
            userId: opponent.userId || opponent,
            username: opponent.username || '',
            symbol: opponent.symbol || null
          });
        }
      }
    }

    const payload = {
      id: data.id || `history_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      roomId: data.roomId,
      gameId: data.gameId,
      gameType: data.gameType || 'TIC_TAC_TOE',
      userId: data.userId || null,
      opponents: data.opponents || [],
      creditsAwarded: data.creditsAwarded || 0,
      players: normalizedPlayers,
      winnerId: data.winnerId ?? (data.result === 'WIN' ? data.userId : null),
      result: data.result || 'WIN',
      moves: Array.isArray(data.moves) ? data.moves : [],
      startedAt: data.startedAt || new Date(),
      completedAt: data.completedAt || new Date()
    };

    const history = await GameHistory.create(payload);
    return history.toObject();
  }

  async create(data) {
    return this.createHistory(data);
  }

  async findByUserId(userId) {
    const records = await GameHistory.find({
      $or: [{ 'players.userId': userId }, { userId }]
    }).sort({ completedAt: -1 }).lean();
    return records.map(record => this.serialize(record));
  }

  async findByRoomId(roomId) {
    const record = await GameHistory.findOne({ roomId }).lean();
    return record ? this.serialize(record) : null;
  }

  async findRecentGames(limit = 20) {
    const records = await GameHistory.find({}).sort({ completedAt: -1 }).limit(limit).lean();
    return records.map(record => this.serialize(record));
  }

  async countTotalGames() {
    return GameHistory.countDocuments();
  }

  serialize(record) {
    if (!record) return null;
    const serialized = { ...record };
    if (serialized.id === undefined && serialized._id) {
      serialized.id = serialized._id.toString();
    }
    delete serialized._id;
    delete serialized.__v;
    return serialized;
  }
}

module.exports = new GameHistoryRepository();
