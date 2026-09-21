const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017/multiplayer_game_platform';

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });

    console.log(`MongoDB connected: ${mongoUri}`);
    return mongoose;
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    throw error;
  }
}

process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

module.exports = {
  connectDatabase,
  mongoose
};
