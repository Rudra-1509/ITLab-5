/**
 * Scoring Service
 * Handles credit allocation and player record updates when games conclude.
 */
const config = require('../config/config');
const userRepository = require('../repositories/userRepository');
const gameHistoryRepository = require('../repositories/gameHistoryRepository');
const eventBus = require('../events/eventBus');
const EVENT_TYPES = require('../events/eventTypes');

class ScoringService {
  constructor() {
    this.defaultPolicy = { ...config.scoring };
  }

  getPolicy(customPolicy) {
    return {
      participation: customPolicy?.participation ?? this.defaultPolicy.participation,
      win: customPolicy?.win ?? this.defaultPolicy.win,
      draw: customPolicy?.draw ?? this.defaultPolicy.draw,
      loss: customPolicy?.loss ?? this.defaultPolicy.loss
    };
  }

  /**
   * Process a win/loss result
   */
  async processWin({ roomId, gameId, gameType, winnerId, loserId, customPolicy, startedAt }) {
    const policy = this.getPolicy(customPolicy);
    const completedAt = new Date().toISOString();

    const winnerCredits = policy.win;
    const loserCredits = policy.loss;

    // Update winner
    const updatedWinner = await userRepository.updateStats(winnerId, {
      credits: winnerCredits,
      wins: 1,
      totalGames: 1
    });

    // Update loser
    const updatedLoser = await userRepository.updateStats(loserId, {
      credits: loserCredits,
      losses: 1,
      totalGames: 1
    });

    // Save Game History for Winner
    await gameHistoryRepository.create({
      gameId,
      gameType,
      roomId,
      userId: winnerId,
      opponents: [loserId],
      result: 'WIN',
      creditsAwarded: winnerCredits,
      startedAt,
      completedAt
    });

    // Save Game History for Loser
    await gameHistoryRepository.create({
      gameId,
      gameType,
      roomId,
      userId: loserId,
      opponents: [winnerId],
      result: 'LOSS',
      creditsAwarded: loserCredits,
      startedAt,
      completedAt
    });

    // Emit GAME_COMPLETED event
    eventBus.emit(EVENT_TYPES.GAME_COMPLETED, {
      roomId,
      gameId,
      result: 'WIN',
      winnerId,
      loserId,
      winnerCredits,
      loserCredits,
      completedAt
    });

    return {
      winner: updatedWinner,
      loser: updatedLoser
    };
  }

  /**
   * Process a draw result
   */
  async processDraw({ roomId, gameId, gameType, playerIds, customPolicy, startedAt }) {
    const policy = this.getPolicy(customPolicy);
    const completedAt = new Date().toISOString();
    const drawCredits = policy.draw;

    const updatedPlayers = [];

    for (const playerId of playerIds) {
      const updated = await userRepository.updateStats(playerId, {
        credits: drawCredits,
        draws: 1,
        totalGames: 1
      });
      updatedPlayers.push(updated);

      const opponents = playerIds.filter(id => id !== playerId);
      await gameHistoryRepository.create({
        gameId,
        gameType,
        roomId,
        userId: playerId,
        opponents,
        result: 'DRAW',
        creditsAwarded: drawCredits,
        startedAt,
        completedAt
      });
    }

    eventBus.emit(EVENT_TYPES.GAME_COMPLETED, {
      roomId,
      gameId,
      result: 'DRAW',
      playerIds,
      drawCredits,
      completedAt
    });

    return {
      players: updatedPlayers
    };
  }
}

module.exports = new ScoringService();
