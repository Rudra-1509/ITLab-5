/**
 * Core Data Models & Shape Definitions
 */

const ROOM_STATUS = {
  WAITING: 'WAITING',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

const GAME_TYPES = {
  TIC_TAC_TOE: 'TIC_TAC_TOE'
};

const DEFAULT_TIC_TAC_TOE_GAME = {
  id: 'game-tictactoe-001',
  name: 'Tic-Tac-Toe',
  description: 'Classic two-player Tic-Tac-Toe',
  gameType: GAME_TYPES.TIC_TAC_TOE,
  rules: [
    'Two players participate',
    'Players alternate turns',
    'First player to get three in a row wins'
  ],
  winningConditions: [
    'ROW',
    'COLUMN',
    'DIAGONAL'
  ],
  maxPlayers: 2,
  scoringPolicy: {
    participation: 5,
    win: 20,
    draw: 10,
    loss: 2
  }
};

module.exports = {
  ROOM_STATUS,
  GAME_TYPES,
  DEFAULT_TIC_TAC_TOE_GAME
};
