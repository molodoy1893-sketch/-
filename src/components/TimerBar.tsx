import React, { useEffect } from 'react';
import { Zap, Plus, X, Volume2, VolumeX } from 'lucide-react';
import { playCountdownTick, playTimerEnd } from '../utils/audio.ts';

interface TimerBarProps {
  timeLeft: number;
  initialTime: number;
  isActive: boolean;
  soundEnabled: boolean;
  onAdjustTimer: (seconds: number) => void;
  onSetTimer: (seconds: number) => void;
  onStopTimer: () => void;
  onToggleSound: () => void;
}

export const TimerBar: React.FC<TimerBarProps> = ({
  timeLeft,
  initialTime,
  isActive,
  soundEnabled,
  onAdjustTimer,
  onSetTimer,
  onStopTimer,
  onToggleSound
}) => {
  useEffect(() => {
    if (!isActive) return;

    if (timeLeft === 3 || timeLeft === 2) {
      playCountdownTick(false, soundEnabled);
    } else if (timeLeft === 1) {
      playCountdownTick(true, soundEnabled);
    } else if (timeLeft === 0) {
      playTimerEnd(soundEnabled);
    }
  }, [timeLeft, isActive, soundEnabled]);

  if (!isActive) return null;

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const progressPct = initialTime > 0 ? Math.max(0, Math.min(100, (timeLeft / initialTime) * 100)) : 0;

  return (
    <div className="bg-gradient-to-r from-cyan-950/95 via-indigo-950/95 to-slate-900 border-2 border-cyan-400/80 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 backdrop-blur-xl cyber-glow animate-in slide-in-from-top-4 duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Main Countdown Display */}
        <div className="flex items-center gap-3.5 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/25 border border-cyan-400/60 flex items-center justify-center text-cyan-300 flex-shrink-0 animate-pulse shadow-md shadow-cyan-500/20">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-mono-tech font-bold text-cyan-300 uppercase tracking-widest">
                ОТДЫХ МЕЖДУ ПОДХОДАМИ
              </h4>
              <button
                onClick={onToggleSound}
                title={soundEnabled ? "Звук включен" : "Звук выключен"}
                className="text-cyan-400/80 hover:text-cyan-200 p-1 rounded-lg transition"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-300" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono-tech tracking-wider drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                {mins}:{secs}
              </span>
              <span className="text-xs text-slate-400 font-mono-tech">
                осталось отдыхать
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions (+15s / Skip) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => onAdjustTimer(15)}
            className="flex-1 sm:flex-none text-xs sm:text-sm bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-100 border border-cyan-400/50 px-3.5 py-2.5 rounded-xl font-bold transition font-mono-tech flex items-center justify-center gap-1 active:scale-95 shadow-sm"
          >
            <Plus className="w-4 h-4" /> 15 сек
          </button>
          <button
            onClick={onStopTimer}
            className="flex-1 sm:flex-none text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 px-4 py-2.5 rounded-xl font-bold transition font-mono-tech flex items-center justify-center gap-1 active:scale-95 shadow-sm"
          >
            <X className="w-4 h-4" /> ПРОПУСТИТЬ
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-cyan-500/30">
        <div
          className="bg-gradient-to-r from-cyan-400 to-indigo-400 h-full transition-all duration-1000 shadow-[0_0_8px_#00f0ff]"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Rest Presets Selector */}
      <div className="flex items-center gap-2 pt-1 overflow-x-auto text-xs font-mono-tech">
        <span className="text-slate-400 text-[11px] whitespace-nowrap">Установить:</span>
        {[30, 45, 60, 90, 120, 180].map(sec => (
          <button
            key={sec}
            onClick={() => onSetTimer(sec)}
            className={`px-2.5 py-1 rounded-lg font-bold transition whitespace-nowrap active:scale-95 ${
              initialTime === sec
                ? 'bg-cyan-500 text-slate-950 font-black'
                : 'bg-slate-900 text-slate-300 hover:text-cyan-200 border border-slate-800'
            }`}
          >
            {sec >= 60 ? `${sec / 60} мин` : `${sec}с`}
          </button>
        ))}
      </div>
    </div>
  );
};
