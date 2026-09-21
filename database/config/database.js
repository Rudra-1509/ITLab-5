const mongoose = require('mongoose');
const path = require('path');

// Support loading .env from root or backend directory
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../backend/.env') });

const DEFAULT_MONGODB_URI = 'mongodb://127.0.0.1:27017/multiplayer_game_platform';

async function connectDatabase(customUri = null) {
  const mongoUri = customUri || process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });

    console.log(`[Database] MongoDB connected successfully: ${mongoUri}`);
    return mongoose;
  } catch (error) {
    console.warn(`[Database] MongoDB connection failed (${mongoUri}): ${error.message}`);
    throw error;
  }
}

module.exports = {
  connectDatabase,
  mongoose
};
