/**
 * Authentication Service
 * Handles user registration, authentication, JWT tokens, and password hashing.
 */
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const userRepository = require('../repositories/userRepository');
const eventBus = require('../events/eventBus');
const EVENT_TYPES = require('../events/eventTypes');
const { ApiError } = require('../utils/apiResponse');

class AuthService {
  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  async register({ username, email, password }) {
    if (!username || !email || !password) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Username, email and password are required');
    }

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      throw new ApiError(409, 'USER_EXISTS', 'A user with this email already exists');
    }

    const existingUsername = await userRepository.findByUsername(username);
    if (existingUsername) {
      throw new ApiError(409, 'USERNAME_TAKEN', 'This username is already taken');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await userRepository.create({
      username,
      email,
      passwordHash,
      credits: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      totalGames: 0
    });

    const token = this.generateToken(user);

    eventBus.emit(EVENT_TYPES.USER_REGISTERED, {
      userId: user.id,
      username: user.username,
      email: user.email
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        credits: user.credits,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws
      },
      token
    };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'Email and password are required');
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new ApiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        credits: user.credits,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws
      },
      token
    };
  }

  async getMe(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        credits: user.credits,
        wins: user.wins,
        losses: user.losses,
        draws: user.draws
      }
    };
  }
}

module.exports = new AuthService();
