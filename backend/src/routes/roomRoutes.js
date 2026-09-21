/**
 * Room Management Routes
 */
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticate, optionalAuthenticate } = require('../middleware/authMiddleware');
const { validate, createRoomSchema, moveSchema } = require('../middleware/validationMiddleware');

router.post('/', authenticate, validate(createRoomSchema), roomController.createRoom);
router.get('/', optionalAuthenticate, roomController.getRooms);
router.get('/:roomId', optionalAuthenticate, roomController.getRoomById);
router.post('/:roomId/join', authenticate, roomController.joinRoom);
router.post('/:roomId/leave', authenticate, roomController.leaveRoom);
router.post('/:roomId/move', authenticate, validate(moveSchema), roomController.makeMove);

module.exports = router;
