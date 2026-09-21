/**
 * Room Management Controller
 */
const roomService = require('../services/roomService');
const { sendSuccess } = require('../utils/apiResponse');

class RoomController {
  async createRoom(req, res, next) {
    try {
      const room = await roomService.createRoom(req.user, req.body.gameId);
      return sendSuccess(res, room, 201);
    } catch (error) {
      next(error);
    }
  }

  async getRooms(req, res, next) {
    try {
      const rooms = await roomService.getRooms(req.query);
      return sendSuccess(res, rooms, 200);
    } catch (error) {
      next(error);
    }
  }

  async getRoomById(req, res, next) {
    try {
      const room = await roomService.getRoomById(req.params.roomId);
      return sendSuccess(res, room, 200);
    } catch (error) {
      next(error);
    }
  }

  async joinRoom(req, res, next) {
    try {
      const room = await roomService.joinRoom(req.params.roomId, req.user);
      return sendSuccess(res, room, 200);
    } catch (error) {
      next(error);
    }
  }

  async leaveRoom(req, res, next) {
    try {
      const result = await roomService.leaveRoom(req.params.roomId, req.user.id);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async makeMove(req, res, next) {
    try {
      const result = await roomService.executeMove(
        req.params.roomId,
        req.user.id,
        req.body.position
      );
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new RoomController();
