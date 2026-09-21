import React from 'react';

export default function ScoreCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'default',
}) {
  const variantStyles = {
    default: {
      bg: 'bg-slate-900/80',
      border: 'border-slate-800',
      glow: 'hover:border-slate-700',
      text: 'text-white',
      iconBg: 'bg-slate-800 text-slate-300',
    },
    primary: {
      bg: 'bg-indigo-950/40',
      border: 'border-indigo-500/30',
      glow: 'hover:border-indigo-500/60 shadow-indigo-500/5',
      text: 'text-indigo-400',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
    },
    success: {
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-500/30',
      glow: 'hover:border-emerald-500/60 shadow-emerald-500/5',
      text: 'text-emerald-400',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    danger: {
      bg: 'bg-rose-950/40',
      border: 'border-rose-500/30',
      glow: 'hover:border-rose-500/60 shadow-rose-500/5',
      text: 'text-rose-400',
      iconBg: 'bg-rose-500/20 text-rose-400',
    },
    warning: {
      bg: 'bg-amber-950/40',
      border: 'border-amber-500/30',
      glow: 'hover:border-amber-500/60 shadow-amber-500/5',
      text: 'text-amber-400',
      iconBg: 'bg-amber-500/20 text-amber-400',
    },
    cyan: {
      bg: 'bg-cyan-950/40',
      border: 'border-cyan-500/30',
      glow: 'hover:border-cyan-500/60 shadow-cyan-500/5',
      text: 'text-cyan-400',
      iconBg: 'bg-cyan-500/20 text-cyan-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`relative p-5 rounded-2xl border ${style.bg} ${style.border} ${style.glow} shadow-xl backdrop-blur-sm transition-all duration-200 group`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${style.iconBg} shadow-inner`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className={`text-3xl font-extrabold tracking-tight ${style.text}`}>
          {value}
        </div>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
