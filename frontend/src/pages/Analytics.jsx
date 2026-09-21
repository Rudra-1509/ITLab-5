import React, { useEffect, useState } from 'react';
import analyticsApi from '../services/analyticsApi';
import ScoreCard from '../components/ScoreCard';
import {
  ChartBarIcon,
  TrophyIcon,
  GamepadIcon,
  CoinsIcon,
  RefreshIcon,
} from '../components/Icons';
import { getErrorMessage } from '../services/api';

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const [userRes, platformRes] = await Promise.allSettled([
        analyticsApi.getMyAnalytics(),
        analyticsApi.getPlatformStats(),
      ]);

      if (userRes.status === 'fulfilled') {
        setStats(userRes.value.data);
      } else {
        setError(getErrorMessage(userRes.reason));
      }

      if (platformRes.status === 'fulfilled') {
        setPlatformStats(platformRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const totalGames = stats?.totalGames || 0;
  const wins = stats?.wins || 0;
  const losses = stats?.losses || 0;
  const draws = stats?.draws || 0;
  const winRate = stats?.winRate ?? (totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0);
  const credits = stats?.credits || 0;

  // Visual calculation for Win/Loss/Draw proportions
  const winPct = totalGames > 0 ? (wins / totalGames) * 100 : 0;
  const lossPct = totalGames > 0 ? (losses / totalGames) * 100 : 0;
  const drawPct = totalGames > 0 ? (draws / totalGames) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-bold text-indigo-400 mb-1">
            <ChartBarIcon className="w-4 h-4" />
            <span>Telemetry & Insights</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Detailed breakdown of match outcomes, win ratios, and platform credit accumulation.
          </p>
        </div>

        <button
          onClick={fetchStats}
          title="Refresh Analytics"
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all shadow-md self-start sm:self-auto flex items-center space-x-2"
        >
          <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span className="text-xs font-semibold">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Primary Metric ScoreCards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <ScoreCard
          title="Credits"
          value={credits}
          subtitle="Reward Balance"
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
          subtitle="Match Victories"
          icon={TrophyIcon}
          variant="success"
        />
        <ScoreCard
          title="Losses"
          value={losses}
          subtitle="Match Defeats"
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
          subtitle="Victory Percentage"
          icon={TrophyIcon}
          variant="default"
        />
      </div>

      {/* Visual Analytics Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Outcome Distribution Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm">
          <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            <span>Match Outcome Distribution</span>
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Proportional split of wins, losses, and draws over all completed games.
          </p>

          {totalGames === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Play your first match to view outcome distributions!
            </div>
          ) : (
            <div>
              {/* Segmented Progress Bar */}
              <div className="h-6 w-full rounded-xl bg-slate-950 overflow-hidden flex p-1 gap-1 border border-slate-800 mb-4">
                {wins > 0 && (
                  <div
                    style={{ width: `${winPct}%` }}
                    className="h-full bg-emerald-500 rounded-lg shadow-sm transition-all duration-500 relative group"
                    title={`Wins: ${wins} (${winPct.toFixed(1)}%)`}
                  />
                )}
                {draws > 0 && (
                  <div
                    style={{ width: `${drawPct}%` }}
                    className="h-full bg-cyan-500 rounded-lg shadow-sm transition-all duration-500 relative group"
                    title={`Draws: ${draws} (${drawPct.toFixed(1)}%)`}
                  />
                )}
                {losses > 0 && (
                  <div
                    style={{ width: `${lossPct}%` }}
                    className="h-full bg-rose-500 rounded-lg shadow-sm transition-all duration-500 relative group"
                    title={`Losses: ${losses} (${lossPct.toFixed(1)}%)`}
                  />
                )}
              </div>

              {/* Legend & Exact Statistics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/20">
                  <div className="flex items-center justify-center space-x-1 text-emerald-400 text-xs font-bold uppercase mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Wins</span>
                  </div>
                  <div className="text-xl font-extrabold text-white">{wins}</div>
                  <div className="text-xs text-emerald-400/80 font-semibold">{winPct.toFixed(1)}%</div>
                </div>

                <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20">
                  <div className="flex items-center justify-center space-x-1 text-cyan-400 text-xs font-bold uppercase mb-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span>Draws</span>
                  </div>
                  <div className="text-xl font-extrabold text-white">{draws}</div>
                  <div className="text-xs text-cyan-400/80 font-semibold">{drawPct.toFixed(1)}%</div>
                </div>

                <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/20">
                  <div className="flex items-center justify-center space-x-1 text-rose-400 text-xs font-bold uppercase mb-1">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Losses</span>
                  </div>
                  <div className="text-xl font-extrabold text-white">{losses}</div>
                  <div className="text-xs text-rose-400/80 font-semibold">{lossPct.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Platform Ecosystem Metrics */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Platform Activity Overview</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Global statistics reported across all active game sessions.
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Registered Players</span>
                <span className="text-lg font-extrabold text-white">
                  {platformStats?.totalPlayers ?? '—'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Matches Played</span>
                <span className="text-lg font-extrabold text-indigo-400">
                  {platformStats?.totalGamesPlayed ?? '—'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800">
                <span className="text-xs text-slate-400 uppercase font-semibold">Active Rooms</span>
                <span className="text-lg font-extrabold text-emerald-400">
                  {platformStats?.activeRooms ?? '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 text-center">
            Backend Scoring Policy: +20 Credits for Win · +10 for Draw · +2 for Loss
          </div>
        </div>
      </div>
    </div>
  );
}
