/**
 * Game Definition and History Routes
 */
const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const { authenticate, optionalAuthenticate } = require('../middleware/authMiddleware');

router.get('/', optionalAuthenticate, gameController.getAllGames);
router.get('/history', authenticate, gameController.getHistory);
router.get('/:gameId', optionalAuthenticate, gameController.getGameById);
router.post('/', authenticate, gameController.createGame);

module.exports = router;
