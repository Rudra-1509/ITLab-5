/**
 * Authentication Controller
 */
const authService = require('../services/authService');
const { sendSuccess } = require('../utils/apiResponse');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const result = await authService.getMe(req.user.id);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
