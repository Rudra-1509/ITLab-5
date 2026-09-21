import React from 'react';

export default function PlayerCard({
  player,
  symbol,
  isCurrentTurn,
  isSelf,
  score,
}) {
  const isX = symbol === 'X';

  return (
    <div
      className={`relative p-4 rounded-2xl border transition-all duration-300 flex items-center space-x-3.5 backdrop-blur-md shadow-xl ${
        isCurrentTurn
          ? isX
            ? 'bg-cyan-950/40 border-cyan-500/80 shadow-cyan-500/20 ring-2 ring-cyan-500/30'
            : 'bg-rose-950/40 border-rose-500/80 shadow-rose-500/20 ring-2 ring-rose-500/30'
          : 'bg-slate-900/80 border-slate-800/90 hover:border-slate-700/80'
      }`}
    >
      {/* Turn indicator glow pill */}
      {isCurrentTurn && (
        <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-black bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-md animate-pulse">
          Current Turn
        </div>
      )}

      {/* Symbol Badge */}
      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-2xl shadow-inner shrink-0 ${
          isX
            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-cyan-500/10'
            : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/10'
        }`}
      >
        {symbol}
      </div>

      {/* Player Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-base font-bold text-white truncate">
            {player ? player.username : 'Waiting...'}
          </span>
          {isSelf && (
            <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
              YOU
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-0.5">
          <span
            className={`w-2 h-2 rounded-full ${
              player ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          <span className="text-xs text-slate-400 font-medium">
            {player ? (isCurrentTurn ? 'Thinking...' : 'Waiting') : 'Slot open'}
          </span>
          {score !== undefined && (
            <span className="text-xs text-slate-400">· {score} cr</span>
          )}
        </div>
      </div>
    </div>
  );
}
