const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../backend/.env') });

const { connectDatabase } = require('../config/database');
const Game = require('../models/Game');
const User = require('../models/User');

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

const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const DEMO_USERS = [
  {
    id: 'usr_demo_alice',
    username: 'Alice',
    email: 'player1@example.com',
    passwordHash: DEMO_PASSWORD_HASH,
    credits: 100,
    totalGames: 8,
    wins: 5,
    losses: 2,
    draws: 1
  },
  {
    id: 'usr_demo_bob',
    username: 'Bob',
    email: 'player2@example.com',
    passwordHash: DEMO_PASSWORD_HASH,
    credits: 80,
    totalGames: 8,
    wins: 4,
    losses: 3,
    draws: 1
  }
];

async function seedDatabase() {
  await connectDatabase();

  // Seed Game
  const existingGame = await Game.findOne({ gameType: 'TIC_TAC_TOE' }).lean();
  if (!existingGame) {
    const createdGame = await Game.create(TIC_TAC_TOE_GAME);
    console.log('✅ Seeded Tic-Tac-Toe game definition:', createdGame.name);
  } else {
    console.log('ℹ️  Tic-Tac-Toe game definition already seeded.');
  }

  // Seed Demo Users
  for (const demoUser of DEMO_USERS) {
    const existing = await User.findOne({ email: demoUser.email }).lean();
    if (!existing) {
      await User.create(demoUser);
      console.log(`✅ Seeded demo user: ${demoUser.username} (${demoUser.email})`);
    } else {
      console.log(`ℹ️  Demo user already exists: ${demoUser.username} (${demoUser.email})`);
    }
  }
}

seedDatabase()
  .then(() => {
    console.log('🎉 Database seeding complete.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });
