/**
 * Game Catalog and History Service
 * Allows retrieving game definitions, registering new ones, and fetching match histories.
 */
const gameRepository = require('../repositories/gameRepository');
const gameHistoryRepository = require('../repositories/gameHistoryRepository');
const eventBus = require('../events/eventBus');
const EVENT_TYPES = require('../events/eventTypes');
const { ApiError } = require('../utils/apiResponse');

class GameService {
  async getAllGames() {
    return gameRepository.findAll();
  }

  async getGameById(id) {
    const game = await gameRepository.findById(id);
    if (!game) {
      throw new ApiError(404, 'GAME_NOT_FOUND', `Game with ID ${id} not found`);
    }
    return game;
  }

  async createGame(gameData) {
    if (!gameData.name || !gameData.gameType) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Game name and gameType are required');
    }

    const createdGame = await gameRepository.create(gameData);

    eventBus.emit(EVENT_TYPES.GAME_CREATED, {
      gameId: createdGame.id,
      name: createdGame.name,
      gameType: createdGame.gameType
    });

    return createdGame;
  }

  async getUserGameHistory(userId) {
    return gameHistoryRepository.findByUserId(userId);
  }
}

module.exports = new GameService();
