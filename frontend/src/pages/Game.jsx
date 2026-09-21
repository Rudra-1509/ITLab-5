import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../socket/socket';
import roomApi from '../services/roomApi';
import GameBoard from '../components/GameBoard';
import PlayerCard from '../components/PlayerCard';
import {
  CopyIcon,
  CheckIcon,
  ArrowLeftIcon,
  TrophyIcon,
  RefreshIcon,
  GamepadIcon,
} from '../components/Icons';
import { getErrorMessage } from '../services/api';

export default function Game() {
  const { roomId } = useParams();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Core Game State
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentTurn, setCurrentTurn] = useState('X');
  const [status, setStatus] = useState('WAITING'); // WAITING, IN_PROGRESS, COMPLETED
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [gameOverResult, setGameOverResult] = useState(null); // { result: 'WIN'|'DRAW', winnerId, winnerSymbol }
  const [opponentLeft, setOpponentLeft] = useState(false);

  // UI / Connection state
  const [loading, setLoading] = useState(true);
  const [gameError, setGameError] = useState(null);
  const [copied, setCopied] = useState(false);
  const socketRef = useRef(null);

  // Identify self and opponent
  const selfPlayer = players.find((p) => p.userId === user?.id);
  const mySymbol = selfPlayer?.symbol || null;
  const isMyTurn = status === 'IN_PROGRESS' && currentTurn === mySymbol && !gameOverResult;
  const opponentPlayer = players.find((p) => p.userId !== user?.id);

  const playerX = players.find((p) => p.symbol === 'X');
  const playerO = players.find((p) => p.symbol === 'O');

  /**
   * Fetch initial room state from REST API
   */
  const loadRoomState = useCallback(async () => {
    try {
      const response = await roomApi.getRoomById(roomId);
      const room = response.data;
      if (room) {
        setBoard(room.board || Array(9).fill(null));
        setCurrentTurn(room.currentTurn || 'X');
        setStatus(room.status || 'WAITING');
        setPlayers(room.players || []);
        if (room.winner) {
          setWinner(room.winner);
          setStatus('COMPLETED');
        }
      }
    } catch (err) {
      console.warn('REST getRoomById fallback note:', err);
      // Don't override if socket manages state
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  /**
   * Initialize Socket.IO connection & event listeners
   */
  useEffect(() => {
    loadRoomState();

    const socket = getSocket();
    socketRef.current = socket;

    // Join the room
    const token = localStorage.getItem('token');
    socket.emit('join_room', { roomId, token });

    // 1. Listen for room_joined (immediate snapshot confirmation)
    const handleRoomJoined = (data) => {
      console.log('⚡ [Socket Event: room_joined]:', data);
      if (data.room) {
        setBoard(data.room.board || Array(9).fill(null));
        setCurrentTurn(data.room.currentTurn || 'X');
        setStatus(data.room.status || 'WAITING');
        setPlayers(data.room.players || []);
      }
    };

    // 2. Listen for player_joined (opponent enters)
    const handlePlayerJoined = (data) => {
      console.log('⚡ [Socket Event: player_joined]:', data);
      if (data.players) {
        setPlayers(data.players);
      }
      setOpponentLeft(false);
    };

    // 3. Listen for game_started (both players ready)
    const handleGameStarted = (data) => {
      console.log('⚡ [Socket Event: game_started]:', data);
      setStatus('IN_PROGRESS');
      if (data.players) setPlayers(data.players);
      if (data.currentTurn) setCurrentTurn(data.currentTurn);
      if (data.board) setBoard(data.board);
      setGameOverResult(null);
      setWinningLine(null);
      setGameError(null);
      setOpponentLeft(false);
    };

    // 4. Listen for move_made (authoritative server move)
    const handleMoveMade = (data) => {
      console.log('⚡ [Socket Event: move_made]:', data);
      if (data.board) setBoard(data.board);
      if (data.nextTurn) setCurrentTurn(data.nextTurn);
      setGameError(null);
    };

    // 5. Listen for turn_changed
    const handleTurnChanged = (data) => {
      console.log('⚡ [Socket Event: turn_changed]:', data);
      if (data.currentTurn) setCurrentTurn(data.currentTurn);
    };

    // 6. Listen for game_over
    const handleGameOver = (data) => {
      console.log('⚡ [Socket Event: game_over]:', data);
      setStatus('COMPLETED');
      setGameOverResult(data);
      if (data.board) setBoard(data.board);
      if (data.winnerSymbol) setWinner(data.winnerSymbol);
      if (data.winningLine) setWinningLine(data.winningLine);

      // Refresh user balance / score after match completes
      setTimeout(() => {
        refreshUser();
      }, 1000);
    };

    // 7. Listen for player_left
    const handlePlayerLeft = (data) => {
      console.log('⚡ [Socket Event: player_left]:', data);
      if (data.userId !== user?.id) {
        setOpponentLeft(true);
        // Refresh room data
        loadRoomState();
      }
    };

    // 8. Listen for game_error
    const handleGameError = (err) => {
      console.warn('⚠️ [Socket Event: game_error]:', err);
      const msg = err.message || (typeof err === 'string' ? err : 'Action rejected by server');
      setGameError(msg);
      // Auto-clear transient errors after 4 seconds
      setTimeout(() => {
        setGameError(null);
      }, 4000);
    };

    socket.on('room_joined', handleRoomJoined);
    socket.on('player_joined', handlePlayerJoined);
    socket.on('game_started', handleGameStarted);
    socket.on('move_made', handleMoveMade);
    socket.on('turn_changed', handleTurnChanged);
    socket.on('game_over', handleGameOver);
    socket.on('player_left', handlePlayerLeft);
    socket.on('game_error', handleGameError);

    return () => {
      socket.emit('leave_room', { roomId });
      socket.off('room_joined', handleRoomJoined);
      socket.off('player_joined', handlePlayerJoined);
      socket.off('game_started', handleGameStarted);
      socket.off('move_made', handleMoveMade);
      socket.off('turn_changed', handleTurnChanged);
      socket.off('game_over', handleGameOver);
      socket.off('player_left', handlePlayerLeft);
      socket.off('game_error', handleGameError);
    };
  }, [roomId, loadRoomState, refreshUser, user?.id]);

  /**
   * Handle user cell click
   */
  const handleCellClick = (position) => {
    if (!socketRef.current) return;
    if (!isMyTurn) {
      setGameError("It is not your turn!");
      return;
    }
    if (board[position] !== null) {
      setGameError("This position is already occupied.");
      return;
    }

    setGameError(null);

    // Emit make_move event to authoritative backend
    socketRef.current.emit('make_move', {
      roomId,
      position,
    });
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Determine game over headline
  const isWinner = gameOverResult && gameOverResult.result === 'WIN' && gameOverResult.winnerId === user?.id;
  const isLoser = gameOverResult && gameOverResult.result === 'WIN' && gameOverResult.winnerId !== user?.id;
  const isDraw = gameOverResult && gameOverResult.result === 'DRAW';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between gap-3 mb-6 bg-slate-900/60 border border-slate-800 p-3 sm:p-4 rounded-2xl backdrop-blur-md">
        <Link
          to="/rooms"
          className="flex items-center space-x-1.5 text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-800 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Exit to Rooms</span>
        </Link>

        {/* Room ID Badge & Copy Button */}
        <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs uppercase font-bold text-slate-400">Room:</span>
          <span className="text-xs font-mono font-bold text-indigo-300 max-w-[120px] sm:max-w-none truncate">
            {roomId}
          </span>
          <button
            onClick={copyRoomLink}
            title="Copy Room ID"
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            {copied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-400" /> : <CopyIcon className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Status Pill */}
        <div
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            status === 'WAITING'
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse'
              : status === 'IN_PROGRESS'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }`}
        >
          {status === 'WAITING' ? 'Waiting for Player 2' : status === 'IN_PROGRESS' ? 'Match Live' : 'Match Ended'}
        </div>
      </div>

      {/* Opponent Left Notice */}
      {opponentLeft && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚠️</span>
            <span className="text-sm font-semibold">Your opponent has left the game.</span>
          </div>
          <button
            onClick={() => navigate('/rooms')}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Return to Rooms
          </button>
        </div>
      )}

      {/* Game Error Notice */}
      {gameError && (
        <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm font-medium flex items-center justify-between shadow-lg shadow-rose-500/5 animate-shake">
          <div className="flex items-center space-x-2">
            <span className="text-base">🚫</span>
            <span>{gameError}</span>
          </div>
          <button onClick={() => setGameError(null)} className="text-rose-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* Matchup Header: Player X vs Player O */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <PlayerCard
          player={playerX}
          symbol="X"
          isCurrentTurn={status === 'IN_PROGRESS' && currentTurn === 'X'}
          isSelf={playerX?.userId === user?.id}
        />
        <PlayerCard
          player={playerO}
          symbol="O"
          isCurrentTurn={status === 'IN_PROGRESS' && currentTurn === 'O'}
          isSelf={playerO?.userId === user?.id}
        />
      </div>

      {/* Status & Turn Banner */}
      <div className="text-center mb-6">
        {status === 'WAITING' ? (
          <div className="py-3 px-4 rounded-2xl bg-slate-900/60 border border-amber-500/30 inline-flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span className="text-sm font-semibold text-amber-300">
              Waiting for opponent to join...
            </span>
            <span className="text-xs text-slate-400">
              (Share Room ID with another computer)
            </span>
          </div>
        ) : status === 'IN_PROGRESS' ? (
          <div
            className={`py-3 px-6 rounded-2xl inline-flex items-center justify-center space-x-2.5 transition-all shadow-md ${
              isMyTurn
                ? 'bg-gradient-to-r from-indigo-900/60 to-cyan-900/60 border border-indigo-500/50 text-white'
                : 'bg-slate-900/80 border border-slate-800 text-slate-300'
            }`}
          >
            <span className="text-lg">{isMyTurn ? '🎯' : '⏳'}</span>
            <span className="text-sm font-bold tracking-wide">
              {isMyTurn
                ? `Your Turn (${mySymbol}) — Click an open cell!`
                : `Waiting for ${opponentPlayer ? opponentPlayer.username : 'Opponent'}'s move (${currentTurn})...`}
            </span>
          </div>
        ) : (
          <div className="py-2.5 px-5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 text-sm font-semibold inline-block">
            Game has concluded
          </div>
        )}

        {/* You Are indicator */}
        {mySymbol && (
          <p className="mt-2 text-xs font-semibold text-slate-400">
            You are playing as <span className={mySymbol === 'X' ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>{mySymbol}</span>
          </p>
        )}
      </div>

      {/* The Authoritative 3x3 Tic-Tac-Toe Game Board */}
      <div className="relative mb-8">
        <GameBoard
          board={board}
          onCellClick={handleCellClick}
          disabled={status !== 'IN_PROGRESS' || !isMyTurn}
          isMyTurn={isMyTurn}
          mySymbol={mySymbol}
          winningLine={winningLine}
        />
      </div>

      {/* Game Over Modal / Card */}
      {gameOverResult && (
        <div className="mt-6 rounded-3xl bg-slate-900/95 border-2 border-indigo-500/50 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-center max-w-md mx-auto animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/20 text-3xl">
            {isWinner ? '🎉' : isDraw ? '🤝' : '🏁'}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
            {isWinner ? 'You Won! 🎉' : isDraw ? 'Game Draw' : 'Opponent Won'}
          </h2>

          <p className="text-sm text-slate-300 mb-6">
            {isWinner
              ? 'Outstanding moves! You earned +20 credits.'
              : isDraw
              ? 'Tied game! Both players receive +10 credits.'
              : 'Better luck next match! You receive +2 credits.'}
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/rooms')}
              className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all"
            >
              Back to Rooms
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all"
            >
              View Statistics
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
