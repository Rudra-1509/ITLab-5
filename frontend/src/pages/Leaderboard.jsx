import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import analyticsApi from '../services/analyticsApi';
import { TrophyIcon, CoinsIcon, RefreshIcon, GamepadIcon } from '../components/Icons';
import { getErrorMessage } from '../services/api';

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await analyticsApi.getLeaderboard(50);
      setLeaderboard(response.data || []);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-bold text-amber-400 mb-1">
            <TrophyIcon className="w-4 h-4" />
            <span>Hall of Champions</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Player Leaderboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Global rankings determined authoritatively by platform credits.
          </p>
        </div>

        <button
          onClick={fetchLeaderboard}
          title="Refresh Leaderboard"
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

      {/* Leaderboard Table Container */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
        {loading && leaderboard.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-slate-400 font-medium">Loading rankings from backend...</p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <TrophyIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-300">No players ranked yet.</p>
            <p className="text-xs text-slate-500 mt-1">Complete matches to earn credits and rank up!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  <th className="py-4 px-6 text-center w-20">Rank</th>
                  <th className="py-4 px-6">Player</th>
                  <th className="py-4 px-6 text-center">Credits</th>
                  <th className="py-4 px-6 text-center">Wins</th>
                  <th className="py-4 px-6 text-center">Games Played</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {leaderboard.map((player, index) => {
                  const rank = index + 1;
                  const isCurrentUser = player.id === user?.id || player.username === user?.username;

                  // Medals for top 3
                  let rankDisplay = `#${rank}`;
                  let rankStyle = 'text-slate-400 font-mono font-bold';

                  if (rank === 1) {
                    rankDisplay = '🥇 1st';
                    rankStyle = 'text-amber-400 font-black';
                  } else if (rank === 2) {
                    rankDisplay = '🥈 2nd';
                    rankStyle = 'text-slate-200 font-black';
                  } else if (rank === 3) {
                    rankDisplay = '🥉 3rd';
                    rankStyle = 'text-amber-600 font-black';
                  }

                  return (
                    <tr
                      key={player.id || index}
                      className={`transition-colors duration-150 ${
                        isCurrentUser
                          ? 'bg-indigo-950/40 hover:bg-indigo-950/60'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Rank */}
                      <td className="py-4 px-6 text-center">
                        <span className={`text-sm ${rankStyle}`}>{rankDisplay}</span>
                      </td>

                      {/* Player Username & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase shadow ${
                            rank === 1
                              ? 'bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 font-black ring-2 ring-amber-400/40'
                              : 'bg-slate-800 text-white border border-slate-700'
                          }`}>
                            {player.username?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-white tracking-wide">
                                {player.username}
                              </span>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                  You
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Credits */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-xs">
                          <CoinsIcon className="w-3.5 h-3.5" />
                          <span>{player.credits ?? 0}</span>
                        </div>
                      </td>

                      {/* Wins */}
                      <td className="py-4 px-6 text-center">
                        <span className="font-bold text-emerald-400">
                          {player.wins ?? 0}
                        </span>
                      </td>

                      {/* Games */}
                      <td className="py-4 px-6 text-center text-slate-300 font-semibold">
                        {player.totalGames ?? 0}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
