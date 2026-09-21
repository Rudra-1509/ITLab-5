/**
 * Authentication Middleware
 * Validates JWT in Authorization header and attaches authenticated user to req.user.
 */
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const userRepository = require('../repositories/userRepository');
const { sendError } = require('../utils/apiResponse');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication token is required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return sendError(res, 401, 'UNAUTHORIZED', 'Authentication token is invalid');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return sendError(res, 401, 'TOKEN_EXPIRED', 'Authentication token has expired');
      }
      return sendError(res, 401, 'INVALID_TOKEN', 'Authentication token is invalid');
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      return sendError(res, 401, 'USER_NOT_FOUND', 'User belonging to token no longer exists');
    }

    const { passwordHash, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware: attaches user if token is present, but doesn't block if absent
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        try {
          const decoded = jwt.verify(token, config.jwt.secret);
          const user = await userRepository.findById(decoded.id);
          if (user) {
            const { passwordHash, ...safeUser } = user;
            req.user = safeUser;
          }
        } catch (err) {
          // Ignore token error for optional auth
        }
      }
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authenticate,
  optionalAuthenticate
};
