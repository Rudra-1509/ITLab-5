import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import analyticsApi from '../services/analyticsApi';
import roomApi from '../services/roomApi';
import ScoreCard from '../components/ScoreCard';
import {
  CoinsIcon,
  GamepadIcon,
  TrophyIcon,
  ChartBarIcon,
  HistoryIcon,
  LogoutIcon,
  PlusIcon,
  ArrowRightIcon,
  RefreshIcon,
} from '../components/Icons';
import { getErrorMessage } from '../services/api';

export default function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [quickRoomId, setQuickRoomId] = useState('');
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    setError('');
    try {
      const [analyticsRes] = await Promise.all([
        analyticsApi.getMyAnalytics(),
        refreshUser(),
      ]);
      setAnalytics(analyticsRes?.data || null);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateGame = async () => {
    setError('');
    setCreatingRoom(true);
    try {
      const response = await roomApi.createRoom('TIC_TAC_TOE');
      const room = response?.data;
      if (room && room.id) {
        navigate(`/game/${room.id}`);
      } else {
        throw new Error('Room created but ID was missing');
      }
    } catch (err) {
      console.error('Failed to create room:', err);
      setError(getErrorMessage(err));
      setCreatingRoom(false);
    }
  };

  const handleQuickJoin = async (e) => {
    e.preventDefault();
    if (!quickRoomId.trim()) return;

    setError('');
    setJoiningRoom(true);
    const roomId = quickRoomId.trim();

    try {
      await roomApi.joinRoom(roomId);
      navigate(`/game/${roomId}`);
    } catch (err) {
      // If error says already in room or room is in progress, attempt navigating directly
      console.warn('Quick join note:', err?.response?.data || err.message);
      if (err?.response?.status === 400 && err?.response?.data?.error?.code === 'ROOM_FULL') {
        setError('Room is already full.');
        setJoiningRoom(false);
      } else {
        // Navigate to room anyway so socket can try to reconnect or view
        navigate(`/game/${roomId}`);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Combine user stats with fallback
  const totalGames = analytics?.totalGames ?? user?.totalGames ?? 0;
  const wins = analytics?.wins ?? user?.wins ?? 0;
  const losses = analytics?.losses ?? user?.losses ?? 0;
  const draws = analytics?.draws ?? user?.draws ?? 0;
  const winRate = analytics?.winRate ?? (totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0);
  const credits = analytics?.credits ?? user?.credits ?? 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 p-6 sm:p-8 mb-8 shadow-2xl overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Multiplayer Tic-Tac-Toe Arena</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{user?.username || 'Player'}</span>! 👋
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Host a new room on your LAN or join a friend's room to compete in real-time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCreateGame}
              disabled={creatingRoom}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-60"
            >
              {creatingRoom ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PlusIcon className="w-4 h-4" />
              )}
              <span>{creatingRoom ? 'Creating Room...' : 'Create Game'}</span>
            </button>

            <button
              onClick={() => navigate('/rooms')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center space-x-2 active:scale-95"
            >
              <GamepadIcon className="w-4 h-4 text-indigo-400" />
              <span>Join Game / Rooms</span>
            </button>

            <button
              onClick={loadData}
              title="Refresh Stats"
              className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all"
            >
              <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Stats Cards Grid */}
      <div className="mb-8">
        <h2 className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-4 flex items-center gap-2">
          <ChartBarIcon className="w-4 h-4 text-indigo-400" />
          <span>Player Overview & Balance</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <ScoreCard
            title="Credits"
            value={credits}
            subtitle="+20 Win / +10 Draw"
            icon={CoinsIcon}
            variant="warning"
          />
          <ScoreCard
            title="Total Games"
            value={totalGames}
            subtitle="Matches Played"
            icon={GamepadIcon}
            variant="primary"
          />
          <ScoreCard
            title="Wins"
            value={wins}
            subtitle="Victories"
            icon={TrophyIcon}
            variant="success"
          />
          <ScoreCard
            title="Losses"
            value={losses}
            subtitle="Defeats"
            icon={ChartBarIcon}
            variant="danger"
          />
          <ScoreCard
            title="Draws"
            value={draws}
            subtitle="Tied Matches"
            icon={ChartBarIcon}
            variant="cyan"
          />
          <ScoreCard
            title="Win Rate"
            value={`${winRate}%`}
            subtitle="Success Ratio"
            icon={TrophyIcon}
            variant="default"
          />
        </div>
      </div>

      {/* Quick Join by Code + Navigation Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Join Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <h3 className="text-base font-bold text-white mb-1.5 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Direct Room Code Join</span>
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            Enter the Room ID shared by another computer to jump directly into the match.
          </p>

          <form onSubmit={handleQuickJoin} className="space-y-3">
            <input
              type="text"
              value={quickRoomId}
              onChange={(e) => setQuickRoomId(e.target.value)}
              placeholder="e.g. room_17269... or ABC123"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={joiningRoom || !quickRoomId.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition-all shadow-md shadow-cyan-600/20 disabled:opacity-50 flex items-center justify-center space-x-1.5"
            >
              <span>{joiningRoom ? 'Joining...' : 'Enter Game Room'}</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Navigation Quick Links */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
          <h3 className="text-base font-bold text-white mb-1.5">Platform Features</h3>
          <p className="text-xs text-slate-400 mb-4">Explore leaderboards, match histories, and analytics</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/leaderboard')}
              className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <TrophyIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    Leaderboard
                  </h4>
                  <p className="text-xs text-slate-400">View top players by credit</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navigate('/analytics')}
              className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                  <ChartBarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    Analytics
                  </h4>
                  <p className="text-xs text-slate-400">Detailed Win/Loss Breakdown</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navigate('/history')}
              className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/40 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <HistoryIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                    Match History
                  </h4>
                  <p className="text-xs text-slate-400">Review past Tic-Tac-Toe games</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={handleLogout}
              className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-red-950/30 border border-slate-700/60 hover:border-red-500/40 text-left transition-all group flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-500/20 text-red-400">
                  <LogoutIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                    Sign Out
                  </h4>
                  <p className="text-xs text-slate-400">End current session</p>
                </div>
              </div>
              <ArrowRightIcon className="w-4 h-4 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
