import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GamepadIcon,
  TrophyIcon,
  ChartBarIcon,
  HistoryIcon,
  LogoutIcon,
  CoinsIcon,
} from './Icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: GamepadIcon },
    { to: '/rooms', label: 'Game Rooms', icon: GamepadIcon },
    { to: '/leaderboard', label: 'Leaderboard', icon: TrophyIcon },
    { to: '/analytics', label: 'Analytics', icon: ChartBarIcon },
    { to: '/history', label: 'Match History', icon: HistoryIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/dashboard" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <span className="text-xl font-black text-white tracking-tighter">X/O</span>
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                  NexusArena
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Multiplayer
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center space-x-1.5 ${
                    active
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side: Credits + User Profile + Logout */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Credits badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-semibold shadow-inner">
              <CoinsIcon className="w-4 h-4 text-amber-400" />
              <span>{user?.credits ?? 0}</span>
              <span className="text-xs text-amber-500/80 uppercase font-bold">CR</span>
            </div>

            {/* User chip */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/80">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white text-xs uppercase shadow">
                {user?.username ? user.username.charAt(0) : 'U'}
              </div>
              <span className="text-sm font-semibold text-slate-200 truncate max-w-[110px]">
                {user?.username || 'Player'}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all duration-150"
            >
              <LogoutIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile menu hamburger button */}
          <div className="flex md:hidden items-center space-x-2">
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <CoinsIcon className="w-3.5 h-3.5" />
              <span>{user?.credits ?? 0}</span>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{user?.username}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center space-x-1"
            >
              <LogoutIcon className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>

          {navLinks.map((link) => {
            const active = isActive(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
