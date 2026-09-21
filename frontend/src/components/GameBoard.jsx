import React from 'react';

/**
 * Authoritative 3x3 Tic-Tac-Toe Board
 *
 * Cell Positions:
 * 0 | 1 | 2
 * 3 | 4 | 5
 * 6 | 7 | 8
 */
export default function GameBoard({
  board = Array(9).fill(null),
  onCellClick,
  disabled = false,
  isMyTurn = false,
  mySymbol = null,
  winningLine = null,
}) {
  return (
    <div className="w-full max-w-[360px] sm:max-w-[420px] aspect-square mx-auto">
      <div className="w-full h-full p-3 sm:p-4 rounded-3xl bg-slate-900/90 border-2 border-slate-800 shadow-2xl backdrop-blur-xl grid grid-cols-3 gap-2.5 sm:gap-3.5">
        {board.map((cell, index) => {
          const isWinningCell = winningLine && winningLine.includes(index);
          const isOccupied = cell !== null;
          const isInteractive = !disabled && isMyTurn && !isOccupied;

          return (
            <button
              key={index}
              type="button"
              onClick={() => {
                if (isInteractive && onCellClick) {
                  onCellClick(index);
                }
              }}
              disabled={!isInteractive}
              aria-label={`Cell ${index} ${cell ? `filled with ${cell}` : 'empty'}`}
              className={`relative rounded-2xl flex items-center justify-center transition-all duration-200 select-none overflow-hidden ${
                // Winning line highlight
                isWinningCell
                  ? 'bg-gradient-to-br from-amber-500/30 to-emerald-500/30 border-2 border-amber-400/90 shadow-lg shadow-amber-500/20 scale-[1.03]'
                  : isOccupied
                  ? 'bg-slate-950/80 border border-slate-800/80 shadow-inner'
                  : isInteractive
                  ? 'bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 hover:border-indigo-500/50 hover:scale-[0.98] active:scale-95 cursor-pointer group'
                  : 'bg-slate-950/40 border border-slate-900/80 cursor-not-allowed opacity-75'
              }`}
            >
              {/* Ghost preview of user's symbol on hover */}
              {isInteractive && mySymbol && (
                <span
                  className={`absolute font-black text-4xl sm:text-5xl opacity-0 group-hover:opacity-20 transition-opacity duration-150 ${
                    mySymbol === 'X' ? 'text-cyan-400' : 'text-rose-400'
                  }`}
                >
                  {mySymbol}
                </span>
              )}

              {/* Render Mark */}
              {cell === 'X' && (
                <span className="font-black text-5xl sm:text-6xl text-cyan-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] transform animate-in zoom-in-75 duration-200">
                  X
                </span>
              )}

              {cell === 'O' && (
                <span className="font-black text-5xl sm:text-6xl text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.5)] transform animate-in zoom-in-75 duration-200">
                  O
                </span>
              )}

              {/* Subtle cell index hint for demo verification */}
              <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-700/50 pointer-events-none select-none">
                {index}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
