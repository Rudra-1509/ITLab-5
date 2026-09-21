import React, { useState } from 'react';
import { CopyIcon, CheckIcon, GamepadIcon, UserIcon } from './Icons';

export default function RoomCard({ room, currentUserId, onJoin, joining = false }) {
  const [copied, setCopied] = useState(false);

  const isCreator = room.creatorId === currentUserId;
  const isMember = room.players?.some((p) => p.userId === currentUserId);
  const playerCount = room.players?.length || 0;
  const isWaiting = room.status === 'WAITING';
  const isInProgress = room.status === 'IN_PROGRESS';
  const isCompleted = room.status === 'COMPLETED';

  // Creator display name
  const creatorPlayer = room.players?.find((p) => p.userId === room.creatorId);
  const creatorName = creatorPlayer ? creatorPlayer.username : `Host (${room.creatorId?.substring(0, 6)}...)`;

  const copyRoomId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition-all duration-200 backdrop-blur-sm flex flex-col justify-between group">
      <div>
        {/* Header: Game Type & Status Pill */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <GamepadIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-slate-200">
              {room.gameType === 'TIC_TAC_TOE' ? 'Tic-Tac-Toe' : room.gameType}
            </span>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isWaiting
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                : isInProgress
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {room.status}
          </span>
        </div>

        {/* Room ID with quick copy */}
        <div className="flex items-center justify-between bg-slate-950/60 rounded-xl px-3 py-2 border border-slate-800/60 mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 uppercase font-semibold">Room:</span>
            <span className="font-mono text-sm font-bold text-indigo-300 truncate max-w-[170px]">
              {room.id}
            </span>
          </div>
          <button
            type="button"
            onClick={copyRoomId}
            title="Copy Room ID"
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            {copied ? <CheckIcon className="w-4 h-4 text-emerald-400" /> : <CopyIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Room Info */}
        <div className="space-y-1.5 text-xs text-slate-300 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5" /> Creator:
            </span>
            <span className="font-semibold text-slate-200 truncate max-w-[130px]">
              {creatorName} {isCreator && <span className="text-indigo-400">(You)</span>}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400">Players:</span>
            <span className="font-semibold text-slate-200">
              {playerCount} / 2
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div>
        {isMember ? (
          <button
            type="button"
            onClick={() => onJoin(room.id)}
            disabled={joining}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center space-x-2"
          >
            <span>{isInProgress ? 'Resume Game' : 'Enter Room'}</span>
          </button>
        ) : isWaiting ? (
          <button
            type="button"
            onClick={() => onJoin(room.id)}
            disabled={joining}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center space-x-2"
          >
            <span>Join Game</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 text-slate-500 font-semibold text-sm cursor-not-allowed border border-slate-700/50"
          >
            {isInProgress ? 'Match In Progress' : 'Match Ended'}
          </button>
        )}
      </div>
    </div>
  );
}
