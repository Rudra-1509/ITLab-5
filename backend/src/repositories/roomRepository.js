/**
 * Room Repository Interface & Implementation
 * Manages game rooms and board state.
 */
const { ROOM_STATUS } = require('../models/types');

class RoomRepository {
  constructor() {
    this.rooms = new Map();
  }

  async create(roomData) {
    const now = new Date().toISOString();
    const id = roomData.id || `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const room = {
      id,
      gameId: roomData.gameId,
      gameType: roomData.gameType || 'TIC_TAC_TOE',
      creatorId: roomData.creatorId,
      players: roomData.players ? [...roomData.players] : [],
      status: roomData.status || ROOM_STATUS.WAITING,
      board: roomData.board ? [...roomData.board] : Array(9).fill(null),
      currentTurn: roomData.currentTurn || 'X',
      winner: roomData.winner !== undefined ? roomData.winner : null,
      createdAt: roomData.createdAt || now,
      updatedAt: roomData.updatedAt || now
    };

    this.rooms.set(id, room);
    return { ...room };
  }

  async findById(id) {
    const room = this.rooms.get(id);
    return room ? JSON.parse(JSON.stringify(room)) : null;
  }

  async findWaitingRooms() {
    const waiting = [];
    for (const room of this.rooms.values()) {
      if (room.status === ROOM_STATUS.WAITING) {
        waiting.push(JSON.parse(JSON.stringify(room)));
      }
    }
    return waiting;
  }

  async findAll(filter = {}) {
    let result = Array.from(this.rooms.values());
    if (filter.status) {
      result = result.filter(r => r.status === filter.status);
    }
    if (filter.gameType) {
      result = result.filter(r => r.gameType === filter.gameType);
    }
    return result.map(r => JSON.parse(JSON.stringify(r)));
  }

  async update(id, updateData) {
    const room = this.rooms.get(id);
    if (!room) return null;

    const updatedRoom = {
      ...room,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    this.rooms.set(id, updatedRoom);
    return JSON.parse(JSON.stringify(updatedRoom));
  }

  async delete(id) {
    return this.rooms.delete(id);
  }

  async clear() {
    this.rooms.clear();
  }
}

module.exports = new RoomRepository();
