/**
 * Socket.IO Real-Time Game Handlers
 */
const roomService = require('../services/roomService');
const userRepository = require('../repositories/userRepository');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Resolves user from socket or incoming payload
 */
async function resolveUser(socket, payload) {
  if (socket.user) {
    return socket.user;
  }

  const token = payload?.token || socket.handshake?.auth?.token || socket.handshake?.query?.token;
  if (token) {
    try {
      const cleanToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
      const decoded = jwt.verify(cleanToken, config.jwt.secret);
      const user = await userRepository.findById(decoded.id);
      if (user) {
        const { passwordHash, ...safeUser } = user;
        socket.user = safeUser;
        return safeUser;
      }
    } catch (err) {
      console.warn('[Socket] Token verification failed:', err.message);
    }
  }

  // Fallback: If user passed userId directly
  if (payload?.userId) {
    const user = await userRepository.findById(payload.userId);
    if (user) {
      const { passwordHash, ...safeUser } = user;
      socket.user = safeUser;
      return safeUser;
    }
  }

  return null;
}

function setupGameSocket(io, socket) {
  console.log(`[Socket] Client connected: ${socket.id}`);

  /**
   * Client Event: join_room
   * Payload: { roomId: "...", token?: "..." }
   */
  socket.on('join_room', async (data = {}) => {
    try {
      const { roomId } = data;
      if (!roomId) {
        return socket.emit('game_error', {
          code: 'INVALID_PAYLOAD',
          message: 'roomId is required to join a room'
        });
      }

      const user = await resolveUser(socket, data);
      if (!user) {
        return socket.emit('game_error', {
          code: 'UNAUTHORIZED',
          message: 'Authentication required to join room'
        });
      }

      let room = await roomService.getRoomById(roomId);
      const isAlreadyInRoom = room.players.some(p => p.userId === user.id);

      if (!isAlreadyInRoom && room.status === 'WAITING') {
        // Automatically join player 2 to room
        room = await roomService.joinRoom(roomId, user);
      }

      // Join Socket.IO room channel
      socket.join(roomId);
      socket.currentRoomId = roomId;

      const playerInfo = room.players.find(p => p.userId === user.id) || {
        userId: user.id,
        username: user.username,
        symbol: null
      };

      console.log(`[Socket] User ${user.username} (${user.id}) joined room channel ${roomId}`);

      // Broadcast to other players in the room
      socket.to(roomId).emit('player_joined', {
        roomId,
        player: playerInfo,
        players: room.players
      });

      // Send confirmation to joining client with current full state
      socket.emit('room_joined', {
        roomId,
        player: playerInfo,
        room
      });

      // If room is now in progress (2 players), notify all players that game started
      if (room.status === 'IN_PROGRESS') {
        io.to(roomId).emit('game_started', {
          roomId,
          players: room.players,
          currentTurn: room.currentTurn,
          board: room.board
        });
      }
    } catch (err) {
      console.error('[Socket] join_room error:', err);
      socket.emit('game_error', {
        code: err.code || 'ROOM_ERROR',
        message: err.message || 'Failed to join room'
      });
    }
  });

  /**
   * Client Event: make_move
   * Payload: { roomId: "...", position: 0-8 }
   */
  socket.on('make_move', async (data = {}) => {
    try {
      const { roomId, position } = data;
      if (!roomId || position === undefined) {
        return socket.emit('game_error', {
          code: 'INVALID_PAYLOAD',
          message: 'roomId and position (0-8) are required'
        });
      }

      const user = await resolveUser(socket, data);
      if (!user) {
        return socket.emit('game_error', {
          code: 'UNAUTHORIZED',
          message: 'Authentication required to make a move'
        });
      }

      // Execute authoritative move on server
      const result = await roomService.executeMove(roomId, user.id, position);
      const { room, gameState, move } = result;

      // Broadcast move to all room members
      io.to(roomId).emit('move_made', {
        roomId,
        playerId: move.playerId,
        symbol: move.symbol,
        position: move.position,
        board: room.board,
        nextTurn: room.currentTurn
      });

      // Check if game has reached a terminal state
      if (gameState.status === 'WIN') {
        console.log(`[Socket] Room ${roomId} game over: Winner ${user.username} (${move.symbol})`);
        io.to(roomId).emit('game_over', {
          roomId,
          result: 'WIN',
          winnerId: user.id,
          winnerSymbol: move.symbol,
          winningLine: gameState.winningLine,
          board: room.board
        });
      } else if (gameState.status === 'DRAW') {
        console.log(`[Socket] Room ${roomId} game over: DRAW`);
        io.to(roomId).emit('game_over', {
          roomId,
          result: 'DRAW',
          winnerId: null,
          winnerSymbol: null,
          board: room.board
        });
      } else {
        // Game continues -> announce turn change
        io.to(roomId).emit('turn_changed', {
          roomId,
          currentTurn: room.currentTurn
        });
      }
    } catch (err) {
      console.warn('[Socket] make_move rejected:', err.message);
      socket.emit('game_error', {
        code: err.code || 'INVALID_MOVE',
        message: err.message || 'Invalid move'
      });
    }
  });

  /**
   * Client Event: leave_room
   * Payload: { roomId: "..." }
   */
  socket.on('leave_room', async (data = {}) => {
    try {
      const roomId = data.roomId || socket.currentRoomId;
      if (!roomId) return;

      const user = await resolveUser(socket, data);
      if (user) {
        socket.to(roomId).emit('player_left', {
          roomId,
          userId: user.id,
          username: user.username
        });
      }

      socket.leave(roomId);
      socket.currentRoomId = null;
    } catch (err) {
      console.error('[Socket] leave_room error:', err);
    }
  });

  /**
   * Client Disconnect
   */
  socket.on('disconnect', async () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
    if (socket.currentRoomId && socket.user) {
      try {
        socket.to(socket.currentRoomId).emit('player_left', {
          roomId: socket.currentRoomId,
          userId: socket.user.id,
          username: socket.user.username
        });
      } catch (err) {
        // Ignore disconnect cleanup errors
      }
    }
  });
}

module.exports = { setupGameSocket };
