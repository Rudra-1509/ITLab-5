import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import roomApi from '../services/roomApi';
import RoomCard from '../components/RoomCard';
import { PlusIcon, RefreshIcon, GamepadIcon } from '../components/Icons';
import { getErrorMessage } from '../services/api';

export default function Rooms() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, WAITING, IN_PROGRESS, COMPLETED
  const [creating, setCreating] = useState(false);
  const [joiningId, setJoiningId] = useState(null);
  const [error, setError] = useState('');

  const fetchRooms = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError('');
    try {
      // Fetch all rooms, or by filter if specific
      const statusParam = filter === 'ALL' ? undefined : filter;
      const response = await roomApi.getRooms(statusParam);
      setRooms(response.data || []);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setError(getErrorMessage(err));
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [filter]);

  // Initial load and periodic refresh for live multiplayer discovery
  useEffect(() => {
    fetchRooms(true);
    const interval = setInterval(() => {
      fetchRooms(false);
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleCreateRoom = async () => {
    setError('');
    setCreating(true);
    try {
      const response = await roomApi.createRoom('TIC_TAC_TOE');
      const room = response.data;
      if (room?.id) {
        navigate(`/game/${room.id}`);
      }
    } catch (err) {
      console.error('Create room error:', err);
      setError(getErrorMessage(err));
      setCreating(false);
    }
  };

  const handleJoinRoom = async (roomId) => {
    setError('');
    setJoiningId(roomId);
    try {
      // Call POST /api/rooms/:roomId/join
      await roomApi.joinRoom(roomId);
      navigate(`/game/${roomId}`);
    } catch (err) {
      console.warn('Join room error or already joined:', err?.response?.data || err.message);
      // If error is because player is already in room or already in progress, navigate to game
      navigate(`/game/${roomId}`);
    } finally {
      setJoiningId(null);
    }
  };

  const filteredRooms = rooms.filter((r) => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-bold text-indigo-400 mb-1">
            <GamepadIcon className="w-4 h-4" />
            <span>Multiplayer Lobby</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Game Rooms
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Join an open Tic-Tac-Toe match or create your own room.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => fetchRooms(true)}
            title="Refresh Rooms"
            className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all shadow-md"
          >
            <RefreshIcon className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={handleCreateRoom}
            disabled={creating}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-60"
          >
            {creating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <PlusIcon className="w-4 h-4" />
            )}
            <span>{creating ? 'Creating...' : 'Create Tic-Tac-Toe Room'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-400 font-bold ml-4">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
        {[
          { id: 'ALL', label: 'All Rooms' },
          { id: 'WAITING', label: 'Waiting for Players' },
          { id: 'IN_PROGRESS', label: 'In Progress' },
          { id: 'COMPLETED', label: 'Completed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              filter === tab.id
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Room Grid */}
      {loading && rooms.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-sm text-slate-400 font-medium">Scanning for active rooms on network...</p>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="py-16 px-4 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-4 text-slate-500">
            <GamepadIcon className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No Rooms Available</h3>
          <p className="text-xs text-slate-400 mb-5">
            {filter === 'WAITING'
              ? 'There are currently no waiting rooms. Create one to challenge another player!'
              : 'No rooms match the selected filter.'}
          </p>
          <button
            onClick={handleCreateRoom}
            disabled={creating}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md transition-all inline-flex items-center space-x-2"
          >
            <PlusIcon className="w-4 h-4" />
            <span>Create New Room</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              currentUserId={user?.id}
              onJoin={handleJoinRoom}
              joining={joiningId === room.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
