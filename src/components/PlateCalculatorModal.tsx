import React, { useState } from 'react';
import { Dumbbell, X, Plus, Minus, RotateCcw } from 'lucide-react';

interface PlateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlateCalculatorModal: React.FC<PlateCalculatorModalProps> = ({
  isOpen,
  onClose
}) => {
  const [targetWeight, setTargetWeight] = useState<number>(60);
  const [barWeight, setBarWeight] = useState<number>(20); // standard Olympic barbell 20kg
  const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];

  if (!isOpen) return null;

  // Calculate plates per side
  const weightPerSide = Math.max(0, (targetWeight - barWeight) / 2);
  let remaining = weightPerSide;
  const platesPerSide: { weight: number; count: number }[] = [];

  availablePlates.forEach(plate => {
    if (remaining >= plate) {
      const count = Math.floor(remaining / plate);
      platesPerSide.push({ weight: plate, count });
      remaining = Math.round((remaining - count * plate) * 100) / 100;
    }
  });

  const exactAchievableWeight = barWeight + (weightPerSide - remaining) * 2;

  const quickWeights = [40, 50, 60, 70, 80, 90, 100, 110, 120];

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="cyber-glass cyber-border rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] cyber-glow">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-cyan-200 font-mono-tech tracking-wider">
                КАЛЬКУЛЯТОР БЛИНОВ
              </h3>
              <p className="text-xs text-cyan-400/80 font-mono-tech">
                РАСЧЕТ ВЕСА ДЛЯ ШТАНГИ НА КАЖДУЮ СТОРОНУ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-cyan-300 p-1.5 transition rounded-lg hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Weight Controls */}
        <div className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-2xl flex flex-col items-center gap-3">
          <span className="text-xs font-mono-tech text-slate-300 font-semibold uppercase tracking-wider">
            Целевой рабочий вес штанги
          </span>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTargetWeight(prev => Math.max(barWeight, prev - 2.5))}
              className="w-10 h-10 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center hover:bg-cyan-950/60 active:scale-95 transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <div className="flex items-baseline gap-1 font-mono-tech">
              <span className="text-3xl sm:text-4xl font-black text-white tracking-wider">
                {targetWeight}
              </span>
              <span className="text-cyan-400 font-bold text-base">кг</span>
            </div>
            <button
              onClick={() => setTargetWeight(prev => prev + 2.5)}
              className="w-10 h-10 rounded-xl bg-slate-950 border border-cyan-500/40 text-cyan-300 font-bold flex items-center justify-center hover:bg-cyan-950/60 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap justify-center gap-1.5 pt-1">
            {quickWeights.map(w => (
              <button
                key={w}
                onClick={() => setTargetWeight(w)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono-tech font-bold transition ${
                  targetWeight === w
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-950 text-slate-300 hover:text-cyan-200 border border-slate-800'
                }`}
              >
                {w} кг
              </button>
            ))}
          </div>

          {/* Bar weight toggle */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-800 w-full justify-between text-xs font-mono-tech text-slate-300">
            <span>Гриф:</span>
            <div className="flex gap-1.5">
              {[20, 15, 10].map(bw => (
                <button
                  key={bw}
                  onClick={() => setBarWeight(bw)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    barWeight === bw
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {bw} кг {bw === 20 ? '(Олимпийский)' : ''}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Result: Plates Per Side */}
        <div className="bg-slate-900/80 border border-cyan-500/40 p-4 rounded-2xl flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs font-mono-tech">
            <span className="text-slate-300 font-bold">НА КАЖДУЮ СТОРОНУ ШТАНГИ:</span>
            <span className="text-cyan-300 font-extrabold text-sm">{weightPerSide} кг</span>
          </div>

          {platesPerSide.length === 0 ? (
            <div className="p-3 bg-slate-950/80 rounded-xl text-center text-xs text-slate-400 font-mono-tech">
              Пустой гриф ({barWeight} кг), блины не требуются.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {platesPerSide.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-950 border border-cyan-500/30 rounded-xl flex items-center justify-between font-mono-tech shadow-sm"
                  >
                    <span className="text-white font-bold text-sm">
                      Блин {item.weight} кг
                    </span>
                    <span className="text-cyan-400 bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 rounded-lg text-xs font-extrabold">
                      × {item.count} шт
                    </span>
                  </div>
                ))}
              </div>

              {remaining > 0 && (
                <p className="text-[11px] text-amber-400 font-mono-tech pt-1">
                  ⚠️ Невозможно собрать точно: остаток {remaining * 2} кг (ближайший вес: {exactAchievableWeight} кг).
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1 border-t border-cyan-500/20">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold rounded-xl transition font-mono-tech shadow-md shadow-cyan-600/30"
          >
            ПОНЯТНО
          </button>
        </div>
      </div>
    </div>
  );
};
