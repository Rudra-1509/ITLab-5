const Room = require('../models/Room');

const defaultBoard = () => Array(9).fill(null);

class RoomRepository {
  async createRoom(data) {
    const payload = {
      id: data.id || `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      roomId: data.roomId || `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      gameId: data.gameId,
      gameType: data.gameType || 'TIC_TAC_TOE',
      creatorId: data.creatorId,
      players: data.players || [],
      status: data.status || 'WAITING',
      board: data.board || defaultBoard(),
      currentTurn: data.currentTurn || 'X',
      winnerId: data.winnerId ?? null,
      winnerSymbol: data.winnerSymbol ?? null
    };

    const room = await Room.create(payload);
    return room.toObject();
  }

  async findById(roomId) {
    if (!roomId) return null;
    const room = await Room.findOne({ $or: [{ id: roomId }, { roomId }] }).lean();
    return room ? this.serialize(room) : null;
  }

  async findWaitingRooms(gameType) {
    const filter = { status: 'WAITING' };
    if (gameType) filter.gameType = String(gameType).toUpperCase().trim();

    const rooms = await Room.find(filter).sort({ createdAt: -1 }).lean();
    return rooms.map(room => this.serialize(room));
  }

  async joinRoom(roomId, player) {
    const room = await Room.findOne({ $or: [{ id: roomId }, { roomId }] });
    if (!room) return null;

    if (room.players.length >= 2) {
      return room.toObject();
    }

    const existingPlayer = room.players.some(entry => entry.userId === player.userId);
    if (existingPlayer) {
      return room.toObject();
    }

    room.players.push({
      userId: player.userId,
      username: player.username,
      symbol: player.symbol,
      joinedAt: new Date()
    });

    if (room.players.length >= 2) {
      room.status = 'IN_PROGRESS';
    }

    await room.save();
    return room.toObject();
  }

  async updateRoom(roomId, data) {
    const room = await Room.findOneAndUpdate(
      { $or: [{ id: roomId }, { roomId }] },
      { $set: data },
      { new: true }
    ).lean();

    return room ? this.serialize(room) : null;
  }

  async updateBoard(roomId, board) {
    const room = await Room.findOneAndUpdate(
      { $or: [{ id: roomId }, { roomId }] },
      { $set: { board, updatedAt: new Date() } },
      { new: true }
    ).lean();

    return room ? this.serialize(room) : null;
  }

  async updateTurn(roomId, turn) {
    const room = await Room.findOneAndUpdate(
      { $or: [{ id: roomId }, { roomId }] },
      { $set: { currentTurn: turn, updatedAt: new Date() } },
      { new: true }
    ).lean();

    return room ? this.serialize(room) : null;
  }

  async completeRoom(roomId, result) {
    const room = await Room.findOneAndUpdate(
      { $or: [{ id: roomId }, { roomId }] },
      {
        $set: {
          status: 'COMPLETED',
          winnerId: result?.winnerId ?? null,
          winnerSymbol: result?.winnerSymbol ?? null,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).lean();

    return room ? this.serialize(room) : null;
  }

  async deleteRoom(roomId) {
    const result = await Room.deleteOne({ $or: [{ id: roomId }, { roomId }] });
    return result.deletedCount > 0;
  }

  async findAll(filter = {}) {
    const rooms = await Room.find(filter).sort({ createdAt: -1 }).lean();
    return rooms.map(room => this.serialize(room));
  }

  serialize(room) {
    if (!room) return null;
    const serialized = { ...room };
    if (serialized.id === undefined && serialized._id) {
      serialized.id = serialized._id.toString();
    }
    delete serialized._id;
    delete serialized.__v;
    return serialized;
  }
}

module.exports = new RoomRepository();
