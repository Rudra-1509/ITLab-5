/**
 * Game Definition and History Controller
 */
const gameService = require('../services/gameService');
const { sendSuccess } = require('../utils/apiResponse');

class GameController {
  async getAllGames(req, res, next) {
    try {
      const games = await gameService.getAllGames();
      return sendSuccess(res, games, 200);
    } catch (error) {
      next(error);
    }
  }

  async getGameById(req, res, next) {
    try {
      const game = await gameService.getGameById(req.params.gameId);
      return sendSuccess(res, game, 200);
    } catch (error) {
      next(error);
    }
  }

  async createGame(req, res, next) {
    try {
      const createdGame = await gameService.createGame(req.body);
      return sendSuccess(res, createdGame, 201);
    } catch (error) {
      next(error);
    }
  }

  async getHistory(req, res, next) {
    try {
      const history = await gameService.getUserGameHistory(req.user.id);
      return sendSuccess(res, history, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new GameController();
