import React from 'react';
import { WorkoutDay } from '../types.ts';
import { X, Sparkles, RotateCcw } from 'lucide-react';

interface AlternativesModalProps {
  isOpen: boolean;
  dayId: number;
  exIdx: number;
  workoutData: WorkoutDay[];
  onSelectAlternative: (altName: string, altDesc: string, usesTwoDumbbells: boolean, isOriginal: boolean) => void;
  onClose: () => void;
}

export const AlternativesModal: React.FC<AlternativesModalProps> = ({
  isOpen,
  dayId,
  exIdx,
  workoutData,
  onSelectAlternative,
  onClose
}) => {
  if (!isOpen) return null;

  const currentDay = workoutData.find(d => d.id === dayId);
  const exercise = currentDay?.exercises[exIdx];
  if (!exercise) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="cyber-glass cyber-border rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-2xl flex flex-col gap-4 max-h-[90vh] cyber-glow">
        <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-mono-tech tracking-wider">
                ЗАМЕНА УПРАЖНЕНИЯ
              </h3>
              <p className="text-xs text-cyan-400 font-mono-tech">
                ВЫБОР АЛЬТЕРНАТИВНОГО ДВИЖЕНИЯ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-cyan-300 p-2 transition rounded-xl hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-200 leading-normal">
          Если снаряд или тренажер занят, выберите альтернативу. Описание техники и расчет гантелей обновятся автоматически:
        </p>

        <div className="space-y-3 overflow-y-auto pr-1 max-h-[58vh]">
          {/* Default base exercise */}
          <div
            onClick={() => onSelectAlternative(exercise.name, exercise.desc, exercise.usesTwoDumbbells, true)}
            className="p-4 bg-slate-900 hover:bg-cyan-950/70 border border-cyan-500/40 rounded-2xl cursor-pointer transition flex items-center justify-between shadow-sm group"
          >
            <div className="flex items-center gap-3">
              <span className="text-amber-400 text-lg">⭐</span>
              <div>
                <strong className="text-sm sm:text-base text-cyan-200 font-mono-tech block font-bold">
                  {exercise.name}
                </strong>
                <span className="text-xs text-slate-300">Базовый вариант протокола</span>
              </div>
            </div>
            <span className="text-xs text-cyan-400 font-mono-tech flex items-center gap-1 group-hover:underline font-bold">
              <RotateCcw className="w-4 h-4" /> СБРОСИТЬ
            </span>
          </div>

          {/* Alternatives list */}
          {exercise.alternatives.map((alt, i) => (
            <div
              key={i}
              onClick={() => onSelectAlternative(alt.name, alt.desc, alt.usesTwoDumbbells, false)}
              className="p-4 bg-slate-900/80 hover:bg-cyan-950/50 border border-slate-700/80 hover:border-cyan-500/60 rounded-2xl cursor-pointer transition flex flex-col gap-2 shadow-sm"
            >
              <div className="flex justify-between items-start gap-2">
                <strong className="text-sm sm:text-base text-white font-mono-tech font-bold">
                  {alt.name}
                </strong>
                {alt.usesTwoDumbbells && (
                  <span className="text-xs text-fuchsia-300 bg-fuchsia-950/70 border border-fuchsia-500/40 px-2.5 py-0.5 rounded-full font-mono-tech font-semibold whitespace-nowrap">
                    ⚡ 2 гантели
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {alt.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-end pt-2 border-t border-cyan-500/30">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl font-bold transition border border-slate-700 font-mono-tech"
          >
            ЗАКРЫТЬ
          </button>
        </div>
      </div>
    </div>
  );
};
