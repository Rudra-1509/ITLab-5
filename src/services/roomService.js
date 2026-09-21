/**
 * Room Management Service
 * Handles room lifecycle, player joining/leaving, and gameplay moves.
 */
const roomRepository = require('../repositories/roomRepository');
const gameRepository = require('../repositories/gameRepository');
const ticTacToeService = require('./ticTacToeService');
const eventBus = require('../events/eventBus');
const EVENT_TYPES = require('../events/eventTypes');
const { ROOM_STATUS, DEFAULT_TIC_TAC_TOE_GAME } = require('../models/types');
const { ApiError } = require('../utils/apiResponse');

class RoomService {
  /**
   * Create a new game room
   */
  async createRoom(creatorUser, gameId = DEFAULT_TIC_TAC_TOE_GAME.id) {
    let game = await gameRepository.findById(gameId);
    if (!game) {
      // Default to Tic-Tac-Toe
      game = await gameRepository.findById(DEFAULT_TIC_TAC_TOE_GAME.id);
    }

    const initialBoard = ticTacToeService.createGame();
    const symbol = ticTacToeService.assignSymbol(0); // 'X'

    const roomData = {
      gameId: game.id,
      gameType: game.gameType,
      creatorId: creatorUser.id,
      players: [
        {
          userId: creatorUser.id,
          username: creatorUser.username,
          symbol
        }
      ],
      status: ROOM_STATUS.WAITING,
      board: initialBoard.board,
      currentTurn: 'X',
      winner: null
    };

    const room = await roomRepository.create(roomData);

    eventBus.emit(EVENT_TYPES.ROOM_CREATED, {
      roomId: room.id,
      creatorId: creatorUser.id,
      gameType: room.gameType
    });

    return room;
  }

  /**
   * Get all rooms, optionally filtered by status
   */
  async getRooms(query = {}) {
    return roomRepository.findAll(query);
  }

  /**
   * Get a single room by ID
   */
  async getRoomById(roomId) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new ApiError(404, 'ROOM_NOT_FOUND', `Room with ID ${roomId} not found`);
    }
    return room;
  }

  /**
   * Join an existing room
   */
  async joinRoom(roomId, user) {
    const room = await this.getRoomById(roomId);

    // Check if user is already in the room
    const existingPlayer = room.players.find(p => p.userId === user.id);
    if (existingPlayer) {
      return room; // Rejoining their own room
    }

    if (room.status !== ROOM_STATUS.WAITING) {
      throw new ApiError(400, 'ROOM_NOT_AVAILABLE', 'Room is not waiting for players');
    }

    if (room.players.length >= 2) {
      throw new ApiError(400, 'ROOM_FULL', 'Room is already full');
    }

    const symbol = ticTacToeService.assignSymbol(room.players.length); // 'O'
    const newPlayer = {
      userId: user.id,
      username: user.username,
      symbol
    };

    const updatedPlayers = [...room.players, newPlayer];
    const updateData = {
      players: updatedPlayers,
      status: ROOM_STATUS.IN_PROGRESS
    };

    const updatedRoom = await roomRepository.update(roomId, updateData);

    // Emit event: PLAYER_JOINED
    eventBus.emit(EVENT_TYPES.PLAYER_JOINED, {
      roomId,
      player: newPlayer,
      players: updatedPlayers
    });

    // Emit event: GAME_STARTED
    eventBus.emit(EVENT_TYPES.GAME_STARTED, {
      roomId,
      gameId: room.gameId,
      gameType: room.gameType,
      players: updatedPlayers,
      currentTurn: updatedRoom.currentTurn,
      board: updatedRoom.board
    });

    return updatedRoom;
  }

  /**
   * Player leaves a room
   */
  async leaveRoom(roomId, userId) {
    const room = await this.getRoomById(roomId);
    const playerIndex = room.players.findIndex(p => p.userId === userId);

    if (playerIndex === -1) {
      throw new ApiError(403, 'NOT_IN_ROOM', 'User is not a member of this room');
    }

    const leavingPlayer = room.players[playerIndex];

    if (room.status === ROOM_STATUS.WAITING) {
      // Room creator leaves waiting room -> mark completed
      await roomRepository.update(roomId, {
        status: ROOM_STATUS.COMPLETED
      });
    } else if (room.status === ROOM_STATUS.IN_PROGRESS) {
      // If game was in progress, remaining player wins by forfeit
      const remainingPlayer = room.players.find(p => p.userId !== userId);
      if (remainingPlayer) {
        await roomRepository.update(roomId, {
          status: ROOM_STATUS.COMPLETED,
          winner: remainingPlayer.symbol
        });

        eventBus.emit(EVENT_TYPES.GAME_WON, {
          roomId,
          gameId: room.gameId,
          gameType: room.gameType,
          winnerId: remainingPlayer.userId,
          winnerSymbol: remainingPlayer.symbol,
          loserId: userId,
          startedAt: room.createdAt
        });
      }
    }

    eventBus.emit(EVENT_TYPES.PLAYER_LEFT, {
      roomId,
      userId,
      username: leavingPlayer.username
    });

    return { message: 'Left room successfully' };
  }

  /**
   * Execute a move in the room
   */
  async executeMove(roomId, userId, position) {
    const room = await this.getRoomById(roomId);

    // Find player
    const player = room.players.find(p => p.userId === userId);
    if (!player) {
      throw new ApiError(403, 'NOT_IN_ROOM', 'Player is not in this room');
    }

    // Validate move using ticTacToeService
    ticTacToeService.validateMove(
      room.board,
      position,
      player.symbol,
      room.currentTurn,
      room.status
    );

    // Apply move
    const newBoard = ticTacToeService.makeMove(room.board, position, player.symbol);
    const nextTurn = ticTacToeService.switchTurn(room.currentTurn);
    const gameState = ticTacToeService.getGameState(newBoard);

    let updatedRoom;

    if (gameState.status === 'WIN') {
      const loser = room.players.find(p => p.userId !== userId);
      updatedRoom = await roomRepository.update(roomId, {
        board: newBoard,
        status: ROOM_STATUS.COMPLETED,
        winner: player.symbol
      });

      eventBus.emit(EVENT_TYPES.MOVE_MADE, {
        roomId,
        playerId: userId,
        symbol: player.symbol,
        position,
        board: newBoard,
        nextTurn
      });

      eventBus.emit(EVENT_TYPES.GAME_WON, {
        roomId,
        gameId: room.gameId,
        gameType: room.gameType,
        winnerId: userId,
        winnerSymbol: player.symbol,
        loserId: loser?.userId,
        winningLine: gameState.winningLine,
        board: newBoard,
        startedAt: room.createdAt
      });

    } else if (gameState.status === 'DRAW') {
      updatedRoom = await roomRepository.update(roomId, {
        board: newBoard,
        status: ROOM_STATUS.COMPLETED,
        winner: 'DRAW'
      });

      eventBus.emit(EVENT_TYPES.MOVE_MADE, {
        roomId,
        playerId: userId,
        symbol: player.symbol,
        position,
        board: newBoard,
        nextTurn
      });

      eventBus.emit(EVENT_TYPES.GAME_DRAW, {
        roomId,
        gameId: room.gameId,
        gameType: room.gameType,
        playerIds: room.players.map(p => p.userId),
        board: newBoard,
        startedAt: room.createdAt
      });

    } else {
      // Game continues
      updatedRoom = await roomRepository.update(roomId, {
        board: newBoard,
        currentTurn: nextTurn
      });

      eventBus.emit(EVENT_TYPES.MOVE_MADE, {
        roomId,
        playerId: userId,
        symbol: player.symbol,
        position,
        board: newBoard,
        nextTurn
      });
    }

    return {
      room: updatedRoom,
      gameState,
      move: {
        playerId: userId,
        symbol: player.symbol,
        position,
        nextTurn
      }
    };
  }
}

module.exports = new RoomService();
