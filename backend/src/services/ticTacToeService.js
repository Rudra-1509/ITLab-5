/**
 * Pure Tic-Tac-Toe Game Engine
 * Authoritative game rules and state transitions.
 */
const { ApiError } = require('../utils/apiResponse');

const WINNING_COMBINATIONS = [
  [0, 1, 2], // Row 1
  [3, 4, 5], // Row 2
  [6, 7, 8], // Row 3
  [0, 3, 6], // Column 1
  [1, 4, 7], // Column 2
  [2, 5, 8], // Column 3
  [0, 4, 8], // Diagonal 1
  [2, 4, 6]  // Diagonal 2
];

class TicTacToeService {
  /**
   * Initializes a fresh board
   */
  createGame() {
    return {
      board: Array(9).fill(null),
      currentTurn: 'X',
      winner: null,
      winningLine: null,
      isDraw: false
    };
  }

  /**
   * Assigns player symbols ('X' for player 1, 'O' for player 2)
   */
  assignSymbol(existingPlayersCount) {
    if (existingPlayersCount === 0) {
      return 'X';
    } else if (existingPlayersCount === 1) {
      return 'O';
    }
    throw new ApiError(400, 'ROOM_FULL', 'Room already has maximum players');
  }

  /**
   * Validates if a proposed move can be made
   */
  validateMove(board, position, playerSymbol, currentTurn, status) {
    if (status !== 'IN_PROGRESS') {
      throw new ApiError(400, 'GAME_NOT_ACTIVE', 'Game is not in progress');
    }

    if (position === undefined || position === null || !Number.isInteger(position) || position < 0 || position > 8) {
      throw new ApiError(400, 'INVALID_POSITION', 'Position must be an integer between 0 and 8');
    }

    if (playerSymbol !== currentTurn) {
      throw new ApiError(403, 'NOT_YOUR_TURN', `It is not your turn. Current turn: ${currentTurn}`);
    }

    if (board[position] !== null) {
      throw new ApiError(409, 'INVALID_MOVE', 'This position is already occupied');
    }

    return true;
  }

  /**
   * Executes the move on the board copy
   */
  makeMove(board, position, symbol) {
    const newBoard = [...board];
    newBoard[position] = symbol;
    return newBoard;
  }

  /**
   * Checks if a winning line exists
   * Returns { winner: 'X'|'O', winningLine: [i, j, k] } or null
   */
  checkWinner(board) {
    for (const combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          winner: board[a],
          winningLine: combo
        };
      }
    }
    return null;
  }

  /**
   * Checks if the board is completely filled without a winner
   */
  checkDraw(board) {
    const hasEmptyCell = board.some(cell => cell === null);
    const hasWinner = this.checkWinner(board) !== null;
    return !hasEmptyCell && !hasWinner;
  }

  /**
   * Switches turn between 'X' and 'O'
   */
  switchTurn(currentTurn) {
    return currentTurn === 'X' ? 'O' : 'X';
  }

  /**
   * Returns full summary of board state
   */
  getGameState(board) {
    const winResult = this.checkWinner(board);
    if (winResult) {
      return {
        status: 'WIN',
        winner: winResult.winner,
        winningLine: winResult.winningLine
      };
    }

    if (this.checkDraw(board)) {
      return {
        status: 'DRAW',
        winner: null,
        winningLine: null
      };
    }

    return {
      status: 'IN_PROGRESS',
      winner: null,
      winningLine: null
    };
  }
}

module.exports = new TicTacToeService();
