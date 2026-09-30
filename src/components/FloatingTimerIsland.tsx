import React, { useEffect } from 'react';
import { Zap, Plus, X, Volume2, VolumeX, ChevronUp } from 'lucide-react';
import { playCountdownTick, playTimerEnd } from '../utils/audio.ts';

interface FloatingTimerIslandProps {
  timeLeft: number;
  initialTime: number;
  isActive: boolean;
  soundEnabled: boolean;
  onAdjustTimer: (seconds: number) => void;
  onSetTimer: (seconds: number) => void;
  onStopTimer: () => void;
  onToggleSound: () => void;
}

export const FloatingTimerIsland: React.FC<FloatingTimerIslandProps> = ({
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
  const progressRatio = initialTime > 0 ? Math.max(0, Math.min(1, timeLeft / initialTime)) : 0;

  // SVG circle calculation
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-slate-950/95 border-2 border-cyan-400/80 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-3 cyber-glow">
        {/* Left: Animated Radial Progress + Countdown */}
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 flex items-center justify-center flex-shrink-0">
            <svg className="w-11 h-11 transform -rotate-90">
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="22"
                cy="22"
                r={radius}
                className="text-cyan-400 transition-all duration-1000 ease-linear"
                strokeWidth="3.5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <Zap className="w-4 h-4 text-cyan-300 absolute animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono-tech uppercase font-bold text-cyan-400 tracking-wider">
                ОТДЫХ МЕЖДУ ПОДХОДАМИ
              </span>
              <button
                onClick={onToggleSound}
                className="text-slate-400 hover:text-cyan-300 p-0.5 rounded transition"
              >
                {soundEnabled ? <Volume2 className="w-3 h-3 text-cyan-400" /> : <VolumeX className="w-3 h-3 text-slate-500" />}
              </button>
            </div>
            <span className="text-xl sm:text-2xl font-black text-white font-mono-tech tracking-wider">
              {mins}:{secs}
            </span>
          </div>
        </div>

        {/* Right: Quick actions (+15s & Skip) */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onAdjustTimer(15)}
            className="px-2.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 text-xs font-mono-tech font-bold rounded-xl transition active:scale-95 flex items-center gap-0.5"
          >
            <Plus className="w-3.5 h-3.5" /> 15с
          </button>
          <button
            onClick={onStopTimer}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono-tech font-bold rounded-xl transition active:scale-95 flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
