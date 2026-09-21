/**
 * Analytics and Leaderboard Routes
 */
const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticate, optionalAuthenticate } = require('../middleware/authMiddleware');

router.get('/me', authenticate, analyticsController.getMyAnalytics);
router.get('/leaderboard', optionalAuthenticate, analyticsController.getLeaderboard);
router.get('/games', optionalAuthenticate, analyticsController.getPlatformStats);

module.exports = router;
