import React, { useState } from 'react';
import { WorkoutDay, ExerciseState, SessionHistoryItem } from '../types.ts';
import { X, TrendingUp, Dumbbell, Calendar, CheckCircle2, BarChart2 } from 'lucide-react';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutData: WorkoutDay[];
  userState: Record<string, ExerciseState>;
  sessionHistory: SessionHistoryItem[];
  onFinishAndSaveSession: () => void;
  onOpenBackup: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  workoutData,
  userState,
  sessionHistory,
  onFinishAndSaveSession,
  onOpenBackup
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'history' | 'charts'>('current');
  const [selectedExerciseForChart, setSelectedExerciseForChart] = useState<string>('all');

  if (!isOpen) return null;

  // Calculate current session stats
  let currentTotalVolume = 0;
  let currentCompletedSets = 0;
  let currentTotalSets = 0;

  const daySummaries = workoutData.map(day => {
    let dayVol = 0;
    let dayDone = 0;
    let dayTotal = 0;

    day.exercises.forEach((ex, idx) => {
      dayTotal += ex.sets;
      currentTotalSets += ex.sets;

      const stateKey = `day_${day.id}_ex_${idx}`;
      const exerciseState = userState[stateKey];
      const isPair = exerciseState?.usesTwoDumbbells !== undefined
        ? exerciseState.usesTwoDumbbells
        : ex.usesTwoDumbbells;

      if (exerciseState?.sets) {
        exerciseState.sets.forEach(set => {
          if (set.completed) {
            currentCompletedSets++;
            dayDone++;
            const w = parseFloat(set.weight) || 0;
            const r = parseInt(set.reps) || 0;
            const multiplier = isPair ? 2 : 1;
            const setVol = w * multiplier * r;
            dayVol += setVol;
            currentTotalVolume += setVol;
          }
        });
      }
    });

    const pct = dayTotal > 0 ? Math.round((dayDone / dayTotal) * 100) : 0;
    return {
      day,
      volume: dayVol,
      done: dayDone,
      total: dayTotal,
      pct
    };
  });

  const overallPct = currentTotalSets > 0 ? Math.round((currentCompletedSets / currentTotalSets) * 100) : 0;

  // Collect distinct exercises from history and workoutData for charting
  const exerciseNamesSet = new Set<string>();
  workoutData.forEach(d => d.exercises.forEach(e => exerciseNamesSet.add(e.name)));
  sessionHistory.forEach(s => s.exerciseRecords.forEach(r => exerciseNamesSet.add(r.exerciseName)));
  const availableExerciseNames = Array.from(exerciseNamesSet);

  // Prepare chart data points
  const chartSessions = [...sessionHistory];
  if (currentCompletedSets > 0) {
    chartSessions.push({
      id: 'current_active',
      date: 'Сегодня (в процессе)',
      timestamp: Date.now(),
      dayId: 0,
      dayName: 'Текущая',
      totalVolumeKg: currentTotalVolume,
      completedSets: currentCompletedSets,
      totalSets: currentTotalSets,
      exerciseRecords: workoutData.flatMap(d =>
        d.exercises.map((ex, idx) => {
          const stateKey = `day_${d.id}_ex_${idx}`;
          const exState = userState[stateKey];
          const isPair = exState?.usesTwoDumbbells !== undefined ? exState.usesTwoDumbbells : ex.usesTwoDumbbells;
          let maxW = 0;
          let vol = 0;
          let done = 0;
          exState?.sets?.forEach(s => {
            if (s.completed) {
              done++;
              const w = parseFloat(s.weight) || 0;
              const r = parseInt(s.reps) || 0;
              if (w > maxW) maxW = w;
              vol += w * (isPair ? 2 : 1) * r;
            }
          });
          return {
            exerciseName: exState?.name || ex.name,
            maxWeight: maxW,
            volumeKg: vol,
            setsDone: done
          };
        }).filter(r => r.setsDone > 0)
      )
    });
  }

  // Render SVG Chart
  const renderProgressionChart = () => {
    if (chartSessions.length === 0) {
      return (
        <div className="bg-slate-900/70 border border-slate-800 p-8 rounded-2xl text-center text-slate-300 font-mono-tech text-sm">
          <TrendingUp className="w-10 h-10 text-cyan-400/60 mx-auto mb-3" />
          <p className="font-bold text-base text-white">Журнал сессий пока пуст</p>
          <p className="text-xs text-slate-400 mt-2 max-w-sm mx-auto">
            Отмечайте выполненные подходы и нажимайте кнопку «Сохранить сессию в историю», чтобы строить точные графики прогресса нагрузок.
          </p>
        </div>
      );
    }

    const isTotalVolume = selectedExerciseForChart === 'all';
    const points = chartSessions.map((session, index) => {
      let val = 0;
      if (isTotalVolume) {
        val = session.totalVolumeKg;
      } else {
        const found = session.exerciseRecords.find(r => r.exerciseName === selectedExerciseForChart);
        val = found ? found.maxWeight : 0;
      }
      return {
        label: session.date,
        value: val,
        index
      };
    });

    const values = points.map(p => p.value);
    const maxVal = Math.max(...values, 10);
    const chartHeight = 180;
    const chartWidth = 480;
    const padding = 40;
    const innerWidth = chartWidth - padding * 2;
    const innerHeight = chartHeight - padding * 2;

    const coordinates = points.map((p, i) => {
      const x = padding + (points.length > 1 ? (i / (points.length - 1)) * innerWidth : innerWidth / 2);
      const y = padding + innerHeight - (p.value / maxVal) * innerHeight;
      return { x, y, ...p };
    });

    const pathData = coordinates.reduce((acc, curr, i) => {
      return i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
    }, '');

    const areaData = coordinates.length > 0
      ? `${pathData} L ${coordinates[coordinates.length - 1].x} ${chartHeight - padding} L ${coordinates[0].x} ${chartHeight - padding} Z`
      : '';

    return (
      <div className="bg-slate-900/95 border border-cyan-500/40 p-4 sm:p-5 rounded-2xl flex flex-col gap-3.5 font-mono-tech">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
          <span className="text-xs sm:text-sm font-bold text-cyan-200 flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-cyan-400" />
            {isTotalVolume ? 'ДИНАМИКА ОБЩЕГО ТОННАЖА (КГ)' : `МАКС. ВЕС (КГ): ${selectedExerciseForChart}`}
          </span>
          <select
            value={selectedExerciseForChart}
            onChange={e => setSelectedExerciseForChart(e.target.value)}
            className="bg-slate-950 text-cyan-200 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs sm:text-sm font-semibold focus:outline-none focus:border-cyan-400"
          >
            <option value="all">⚡ Общий тоннаж (все упражнения)</option>
            {availableExerciseNames.map((name, i) => (
              <option key={i} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* SVG Curve */}
        <div className="relative w-full overflow-x-auto">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-48 overflow-visible">
            <defs>
              <linearGradient id="cyberAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = padding + innerHeight * (1 - ratio);
              const labelVal = Math.round(maxVal * ratio);
              return (
                <g key={idx}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={chartWidth - padding}
                    y2={y}
                    stroke="rgba(0, 240, 255, 0.16)"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    fontWeight="bold"
                    fill="rgba(148, 163, 184, 0.9)"
                  >
                    {labelVal}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area */}
            {areaData && <path d={areaData} fill="url(#cyberAreaGrad)" />}

            {/* Neon Line */}
            {pathData && (
              <path
                d={pathData}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]"
              />
            )}

            {/* Data Dots with Tooltips */}
            {coordinates.map((pt, i) => (
              <g key={i} className="group cursor-pointer">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="6"
                  fill="#030712"
                  stroke="#00f0ff"
                  strokeWidth="3"
                  className="transition-all hover:r-8 hover:fill-cyan-400 drop-shadow-[0_0_8px_#00f0ff]"
                />
                {/* Floating label */}
                <text
                  x={pt.x}
                  y={pt.y - 12}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill="#38bdf8"
                >
                  {pt.value.toLocaleString()} {isTotalVolume ? 'кг' : 'кг'}
                </text>
                {/* Date label at bottom */}
                <text
                  x={pt.x}
                  y={chartHeight - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#cbd5e1"
                >
                  {pt.label.length > 10 ? pt.label.slice(0, 10) : pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="cyber-glass cyber-border rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[94vh] cyber-glow">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/25 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-mono-tech tracking-wider">
                ДАШБОРД ПРОГРЕССА & АНАЛИТИКА
              </h3>
              <p className="text-xs text-cyan-400 font-mono-tech">
                ПРОТОКОЛ: 36 ЛЕТ // 72 КГ // НАБОР МАССЫ
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

        {/* Tab switcher */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/90 rounded-2xl border border-cyan-500/35 font-mono-tech text-xs sm:text-sm">
          <button
            onClick={() => setActiveTab('current')}
            className={`py-2.5 px-1 rounded-xl transition font-bold ${
              activeTab === 'current'
                ? 'bg-cyan-600 text-slate-950 shadow-md shadow-cyan-600/30 font-extrabold'
                : 'text-slate-300 hover:text-cyan-200'
            }`}
          >
            📊 СЕССИЯ
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`py-2.5 px-1 rounded-xl transition font-bold ${
              activeTab === 'charts'
                ? 'bg-cyan-600 text-slate-950 shadow-md shadow-cyan-600/30 font-extrabold'
                : 'text-slate-300 hover:text-cyan-200'
            }`}
          >
            📈 ГРАФИКИ
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2.5 px-1 rounded-xl transition font-bold ${
              activeTab === 'history'
                ? 'bg-cyan-600 text-slate-950 shadow-md shadow-cyan-600/30 font-extrabold'
                : 'text-slate-300 hover:text-cyan-200'
            }`}
          >
            📜 ЖУРНАЛ ({sessionHistory.length})
          </button>
        </div>

        {/* TAB 1: CURRENT WORKOUT STATS */}
        {activeTab === 'current' && (
          <div className="space-y-4 overflow-y-auto pr-1 max-h-[62vh]">
            {/* Visual Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/90 border border-cyan-500/40 p-4 rounded-2xl flex flex-col gap-1.5 cyber-glow">
                <span className="text-xs text-slate-300 font-mono-tech font-semibold uppercase tracking-wider">
                  ОБЩИЙ ТОННАЖ СЕССИИ
                </span>
                <span className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono-tech">
                  {currentTotalVolume.toLocaleString()} кг
                </span>
                <span className="text-xs text-cyan-400 font-mono-tech">
                  ⚡ вес х 2 для парных гантелей
                </span>
              </div>
              <div className="bg-slate-900/90 border border-emerald-500/40 p-4 rounded-2xl flex flex-col gap-1.5">
                <span className="text-xs text-slate-300 font-mono-tech font-semibold uppercase tracking-wider">
                  ВЫПОЛНЕНО ПОДХОДОВ
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono-tech">
                  {currentCompletedSets} / {currentTotalSets}
                </span>
                <span className="text-xs text-emerald-300 font-mono-tech font-bold">
                  Прогресс: {overallPct}%
                </span>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="bg-slate-900/80 border border-cyan-500/30 p-3.5 rounded-2xl space-y-2 font-mono-tech">
              <div className="flex justify-between text-xs sm:text-sm text-slate-200 font-bold">
                <span>ШКАЛА ВЫПОЛНЕНИЯ ПРОТОКОЛА</span>
                <span className="text-cyan-300">{overallPct}%</span>
              </div>
              <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-cyan-500/30">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-500 shadow-[0_0_8px_#10b981]"
                  style={{ width: `${overallPct}%` }}
                />
              </div>
            </div>

            {/* Day Breakdown List */}
            <div className="space-y-2.5">
              <h4 className="text-xs sm:text-sm uppercase font-bold text-slate-200 font-mono-tech tracking-wider">
                Нагрузка по дням протокола
              </h4>
              <div className="space-y-2.5 font-mono-tech text-xs sm:text-sm">
                {daySummaries.map(({ day, volume, done, total, pct }) => (
                  <div
                    key={day.id}
                    className="bg-slate-900/90 border border-cyan-500/30 p-3.5 rounded-xl flex flex-col gap-2 shadow-sm"
                  >
                    <div className="flex justify-between items-center text-sm font-bold">
                      <strong className="text-white">
                        {day.name} ({day.subtitle})
                      </strong>
                      <span className="text-cyan-300 font-extrabold">{volume.toLocaleString()} кг</span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-slate-300">
                      <span>Подходов: {done} / {total}</span>
                      <span className="text-emerald-400 font-bold">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-cyan-500/20">
                      <div
                        className="bg-cyan-400 h-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={onFinishAndSaveSession}
                className="flex-1 py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono-tech font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                СОХРАНИТЬ СЕССИЮ В ИСТОРИЮ
              </button>
              <button
                onClick={onOpenBackup}
                className="py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-mono-tech font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 active:scale-95"
              >
                💾 ЭКСПОРТ / БЭКАП
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: PROGRESSION CHARTS */}
        {activeTab === 'charts' && (
          <div className="space-y-3.5 overflow-y-auto pr-1 max-h-[62vh]">
            <p className="text-xs sm:text-sm text-slate-200">
              График отслеживает прогрессивную перегрузку (Progressive Overload) по сессиям тренировок:
            </p>
            {renderProgressionChart()}
          </div>
        )}

        {/* TAB 3: WORKOUT HISTORY LOG */}
        {activeTab === 'history' && (
          <div className="space-y-3 overflow-y-auto pr-1 max-h-[62vh] font-mono-tech text-xs sm:text-sm">
            {sessionHistory.length === 0 ? (
              <div className="p-8 text-center text-slate-300 bg-slate-900/50 rounded-2xl border border-slate-800">
                <Calendar className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="font-bold text-base text-white">Журнал пока пуст</p>
                <p className="text-xs text-slate-400 mt-1">
                  После завершения тренировки нажмите кнопку «Сохранить сессию в историю».
                </p>
              </div>
            ) : (
              sessionHistory.map(session => (
                <div
                  key={session.id}
                  className="bg-slate-900/90 border border-cyan-500/30 p-4 rounded-2xl flex flex-col gap-2.5 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-bold text-sm">📅 {session.date}</span>
                      <span className="text-xs bg-slate-800 text-slate-200 px-2.5 py-0.5 rounded-md font-semibold">
                        {session.dayName}
                      </span>
                    </div>
                    <span className="text-cyan-300 font-extrabold text-base">
                      {session.totalVolumeKg.toLocaleString()} кг
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 flex justify-between">
                    <span>Подходов: {session.completedSets} / {session.totalSets}</span>
                    <span className="text-emerald-400 font-semibold">
                      {session.exerciseRecords.length} упражнений выполнено
                    </span>
                  </div>
                  {/* Exercises records */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
                    {session.exerciseRecords.slice(0, 6).map((rec, rIdx) => (
                      <div key={rIdx} className="truncate">
                        • {rec.exerciseName.split(' ')[0]}: <span className="text-cyan-300 font-bold">{rec.maxWeight} кг</span> ({rec.setsDone} п.)
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-cyan-500/30">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs sm:text-sm bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-xl font-extrabold transition shadow-lg shadow-cyan-600/30 font-mono-tech"
          >
            ЗАКРЫТЬ
          </button>
        </div>
      </div>
    </div>
  );
};
