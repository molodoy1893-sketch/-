import React, { useState } from 'react';
import { ProgramGoal, ProgramProtocol } from '../types.ts';
import { allPrograms } from '../data/programsData.ts';
import { X, Check, Flame, Dumbbell, Shield, Zap, Sparkles, ArrowRight, Clock, Target } from 'lucide-react';

interface ProgramSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProgramId: ProgramGoal;
  onSelectProgram: (programId: ProgramGoal) => void;
  onOpenAICoachWithPrompt?: (prompt: string) => void;
}

export const ProgramSelectorModal: React.FC<ProgramSelectorModalProps> = ({
  isOpen,
  onClose,
  currentProgramId,
  onSelectProgram,
  onOpenAICoachWithPrompt
}) => {
  const [selectedId, setSelectedId] = useState<ProgramGoal>(currentProgramId);
  const [customGoalText, setCustomGoalText] = useState('');

  if (!isOpen) return null;

  const programsList: { goal: ProgramGoal; icon: React.ReactNode; color: string }[] = [
    {
      goal: 'mass',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
      color: 'border-cyan-500/50 hover:border-cyan-400'
    },
    {
      goal: 'strength',
      icon: <Dumbbell className="w-5 h-5 text-amber-400" />,
      color: 'border-amber-500/50 hover:border-amber-400'
    },
    {
      goal: 'relief',
      icon: <Flame className="w-5 h-5 text-rose-400" />,
      color: 'border-rose-500/50 hover:border-rose-400'
    },
    {
      goal: 'longevity',
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      color: 'border-emerald-500/50 hover:border-emerald-400'
    }
  ];

  const handleApply = (id: ProgramGoal) => {
    onSelectProgram(id);
    onClose();
  };

  const handleAskAICustom = () => {
    if (!customGoalText.trim()) return;
    onClose();
    if (onOpenAICoachWithPrompt) {
      onOpenAICoachWithPrompt(`Составь мне индивидуальный сплит тренировок под следующий запрос: "${customGoalText.trim()}". Учти мои параметры: 36 лет, 169 см, 72 кг.`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="cyber-glass cyber-border rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[94vh] cyber-glow">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/25 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-mono-tech tracking-wider">
                ПОДБОР ПРОГРАММЫ ПОД ЦЕЛЬ
              </h3>
              <p className="text-xs text-cyan-400 font-mono-tech">
                АВТОМАТИЧЕСКИЙ ВЫБОР УПРАЖНЕНИЙ И ТЕМПА
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

        <div className="space-y-3.5 overflow-y-auto pr-1 max-h-[66vh] font-sans">
          <p className="text-xs sm:text-sm text-slate-200 leading-normal">
            Выберите направление — программа автоматически перестроит упражнения, целевые подходы, диапазон повторов и таймер отдыха:
          </p>

          {/* 4 Protocol Cards */}
          <div className="space-y-3">
            {programsList.map(({ goal, icon, color }) => {
              const prog = allPrograms[goal];
              const isCurrent = currentProgramId === goal;
              const isSelected = selectedId === goal;

              return (
                <div
                  key={goal}
                  onClick={() => setSelectedId(goal)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-2.5 relative ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-400 shadow-lg shadow-cyan-950/60'
                      : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Title & Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center flex-shrink-0">
                        {icon}
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-white font-mono-tech flex items-center gap-2">
                          {prog.title}
                          {isCurrent && (
                            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2 py-0.2 rounded-full font-bold">
                              АКТИВНА
                            </span>
                          )}
                        </h4>
                        <span className="text-xs text-slate-400 block font-sans">
                          {prog.tagline}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition ${
                          isSelected
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950'
                            : 'border-slate-700 bg-slate-900'
                        }`}
                      >
                        {isSelected && <Check className="w-4 h-4 stroke-[3px]" />}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {prog.description}
                  </p>

                  {/* Specs Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center font-mono-tech text-xs">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">ПОВТОРЫ</span>
                      <strong className="text-white font-bold text-xs">{prog.repsRange}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">ОБЪЕМ</span>
                      <strong className="text-white font-bold text-xs">{prog.setsDefault}</strong>
                    </div>
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">ОТДЫХ</span>
                      <strong className="text-cyan-300 font-bold text-xs">{prog.restDefault} сек</strong>
                    </div>
                  </div>

                  {/* One-tap Apply button if selected */}
                  {isSelected && !isCurrent && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApply(goal);
                      }}
                      className="mt-1 w-full py-2.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black font-mono-tech text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/25 active:scale-95"
                    >
                      <span>АКТИВИРОВАТЬ ЭТУ ПРОГРАММУ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* AI Custom Prompt Box */}
          <div className="bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/40 p-4 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <strong className="text-xs font-mono-tech text-purple-200 uppercase tracking-wider">
                Индивидуальный подбор через ИИ (Gemini)
              </strong>
            </div>
            <p className="text-xs text-slate-300 leading-normal">
              Хотите персональную вариацию? Опишите ваши ограничения (например: «Болит плечо, исключи жим штанги» или «Хочу 2 раза в неделю упор на руки»):
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customGoalText}
                onChange={e => setCustomGoalText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAskAICustom();
                }}
                placeholder="Ваш индивидуальный запрос..."
                className="flex-1 bg-slate-950 text-xs font-mono-tech text-white px-3 py-2 rounded-xl border border-purple-500/40 focus:outline-none focus:border-purple-300 placeholder:text-slate-500"
              />
              <button
                onClick={handleAskAICustom}
                disabled={!customGoalText.trim()}
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono-tech font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-1 shadow-sm active:scale-95 flex-shrink-0"
              >
                <span>ПОДОБРАТЬ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-cyan-500/20">
          <span className="text-[11px] text-slate-400 font-mono-tech">
            Выбрано: {allPrograms[selectedId].shortTitle}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold transition border border-slate-700 font-mono-tech"
            >
              ОТМЕНА
            </button>
            <button
              onClick={() => handleApply(selectedId)}
              className="px-5 py-2 text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition font-mono-tech shadow-md shadow-cyan-500/25 active:scale-95"
            >
              ПРИМЕНИТЬ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
