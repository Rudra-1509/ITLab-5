const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  host: process.env.HOST || '0.0.0.0',
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_project5_college_demo_2024',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  scoring: {
    participation: parseInt(process.env.SCORING_PARTICIPATION || '5', 10),
    win: parseInt(process.env.SCORING_WIN || '20', 10),
    draw: parseInt(process.env.SCORING_DRAW || '10', 10),
    loss: parseInt(process.env.SCORING_LOSS || '2', 10)
  }
};

module.exports = config;
