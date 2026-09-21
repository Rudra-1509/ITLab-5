const databaseRoomRepository = require('../../database/repositories/roomRepository');

class RoomRepository {
  async createRoom(data) {
    return databaseRoomRepository.createRoom(data);
  }

  async create(roomData) {
    return databaseRoomRepository.createRoom(roomData);
  }

  async findById(roomId) {
    return databaseRoomRepository.findById(roomId);
  }

  async findWaitingRooms(gameType) {
    return databaseRoomRepository.findWaitingRooms(gameType);
  }

  async joinRoom(roomId, player) {
    return databaseRoomRepository.joinRoom(roomId, player);
  }

  async updateRoom(roomId, data) {
    return databaseRoomRepository.updateRoom(roomId, data);
  }

  async update(id, updateData) {
    return databaseRoomRepository.updateRoom(id, updateData);
  }

  async updateBoard(roomId, board) {
    return databaseRoomRepository.updateBoard(roomId, board);
  }

  async updateTurn(roomId, turn) {
    return databaseRoomRepository.updateTurn(roomId, turn);
  }

  async completeRoom(roomId, result) {
    return databaseRoomRepository.completeRoom(roomId, result);
  }

  async deleteRoom(roomId) {
    return databaseRoomRepository.deleteRoom(roomId);
  }

  async delete(id) {
    return databaseRoomRepository.deleteRoom(id);
  }

  async findAll(filter = {}) {
    return databaseRoomRepository.findAll(filter);
  }
}

module.exports = new RoomRepository();
