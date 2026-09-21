import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import analyticsApi from '../services/analyticsApi';
import { HistoryIcon, RefreshIcon, GamepadIcon, CoinsIcon } from '../components/Icons';
import { getErrorMessage } from '../services/api';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await analyticsApi.getGameHistory();
      setHistory(response.data || []);
    } catch (err) {
      console.error('Failed to fetch game history:', err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-bold text-cyan-400 mb-1">
            <HistoryIcon className="w-4 h-4" />
            <span>Match Records</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Game History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Audit logs of all your multiplayer matches and rewards.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          title="Refresh History"
          className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all shadow-md self-start sm:self-auto flex items-center space-x-2"
        >
          <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span className="text-xs font-semibold">Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* History List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm">
        {loading && history.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-slate-400 font-medium">Fetching match records...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center text-slate-400 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-slate-600">
              <HistoryIcon className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No Matches Played Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5">
              Jump into an online room to play your first Tic-Tac-Toe match!
            </p>
            <Link
              to="/rooms"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center space-x-2"
            >
              <GamepadIcon className="w-4 h-4" />
              <span>Browse Rooms</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] uppercase tracking-wider font-bold text-slate-400">
                  <th className="py-4 px-6">Game</th>
                  <th className="py-4 px-6">Opponent</th>
                  <th className="py-4 px-6 text-center">Result</th>
                  <th className="py-4 px-6 text-center">Credits Awarded</th>
                  <th className="py-4 px-6 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-sm">
                {history.map((record) => {
                  const isWin = record.result === 'WIN';
                  const isLoss = record.result === 'LOSS';
                  const isDraw = record.result === 'DRAW';

                  // Format opponent
                  const opponentDisplay =
                    record.opponents && record.opponents.length > 0
                      ? `Player (${record.opponents[0].substring(0, 8)}...)`
                      : 'Opponent';

                  return (
                    <tr
                      key={record.id}
                      className="hover:bg-slate-800/40 transition-colors duration-150"
                    >
                      {/* Game */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-black">
                            XO
                          </div>
                          <div>
                            <span className="font-bold text-white block">
                              {record.gameType === 'TIC_TAC_TOE' ? 'Tic-Tac-Toe' : record.gameType}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              Room: {record.roomId ? record.roomId.substring(0, 12) + '...' : '—'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Opponent */}
                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-300">
                          {opponentDisplay}
                        </span>
                      </td>

                      {/* Result */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            isWin
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : isLoss
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                          }`}
                        >
                          {record.result}
                        </span>
                      </td>

                      {/* Credits Awarded */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`font-mono font-bold text-xs inline-flex items-center space-x-1 ${
                            isWin
                              ? 'text-emerald-400'
                              : isDraw
                              ? 'text-cyan-400'
                              : 'text-slate-400'
                          }`}
                        >
                          <span>+{record.creditsAwarded ?? 0}</span>
                          <span className="text-[10px] uppercase font-bold text-amber-500">CR</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-right text-xs text-slate-400 font-medium">
                        {formatDate(record.completedAt || record.startedAt)}
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
