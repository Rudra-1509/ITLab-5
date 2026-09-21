const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { connectDatabase } = require('../config/database');
const Game = require('../models/Game');

const TIC_TAC_TOE_GAME = {
  id: 'game-tictactoe-001',
  name: 'Tic-Tac-Toe',
  description: 'Classic two-player Tic-Tac-Toe',
  gameType: 'TIC_TAC_TOE',
  rules: [
    'Two players participate',
    'Players alternate turns',
    'First player to get three in a row wins'
  ],
  winningConditions: ['ROW', 'COLUMN', 'DIAGONAL'],
  maxPlayers: 2,
  scoringPolicy: {
    participation: 5,
    win: 20,
    draw: 10,
    loss: 2
  },
  createdBy: 'system'
};

async function seedGames() {
  await connectDatabase();

  const existingGame = await Game.findOne({ gameType: 'TIC_TAC_TOE' }).lean();
  if (existingGame) {
    console.log('Tic-Tac-Toe seed already exists.');
    return existingGame;
  }

  const createdGame = await Game.create(TIC_TAC_TOE_GAME);
  console.log('Seeded Tic-Tac-Toe game definition:', createdGame.toObject());
  return createdGame.toObject();
}

seedGames()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
