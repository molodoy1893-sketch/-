import React, { useState, useEffect, useRef } from 'react';
import { allPrograms } from './data/programsData.ts';
import { ExerciseState, SessionHistoryItem, AppState, ProgramGoal } from './types.ts';
import { AlternativesModal } from './components/AlternativesModal.tsx';
import { AICoachModal } from './components/AICoachModal.tsx';
import { AnalyticsModal } from './components/AnalyticsModal.tsx';
import { BackupModal } from './components/BackupModal.tsx';
import { PlateCalculatorModal } from './components/PlateCalculatorModal.tsx';
import { InstallGuideModal } from './components/InstallGuideModal.tsx';
import { ProgramSelectorModal } from './components/ProgramSelectorModal.tsx';
import { BottomNavBar, ActiveTab } from './components/BottomNavBar.tsx';
import { FloatingTimerIsland } from './components/FloatingTimerIsland.tsx';
import { ProfileView } from './components/ProfileView.tsx';
import {
  playSetComplete,
  playLaserClick,
  playTimerEnd
} from './utils/audio.ts';
import {
  Zap,
  Check,
  RotateCcw,
  Copy,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Target,
  ChevronRight
} from 'lucide-react';

const STORAGE_KEY = 'cyber_fit_state_v50';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ActiveTab>('workout');
  const [currentProgramId, setCurrentProgramId] = useState<ProgramGoal>('mass');
  const [currentDayId, setCurrentDayId] = useState<number>(1);
  const [userState, setUserState] = useState<Record<string, ExerciseState>>({});
  const [sessionHistory, setSessionHistory] = useState<SessionHistoryItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals state
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isProgramSelectorOpen, setIsProgramSelectorOpen] = useState(false);
  const [altModalData, setAltModalData] = useState<{ dayId: number; exIdx: number } | null>(null);
  const [coachInitialPrompt, setCoachInitialPrompt] = useState<string | null>(null);

  // Expanded technique accordion state
  const [expandedTechnique, setExpandedTechnique] = useState<Record<string, boolean>>({});

  // Timer state
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [initialTimerDuration, setInitialTimerDuration] = useState(0);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Active Program and Days
  const activeProgram = allPrograms[currentProgramId] || allPrograms.mass;
  const activeWorkoutData = activeProgram.days;
  const activeDay = activeWorkoutData.find(d => d.id === currentDayId) || activeWorkoutData[0];

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.currentProgramId && allPrograms[parsed.currentProgramId as ProgramGoal]) {
          setCurrentProgramId(parsed.currentProgramId as ProgramGoal);
        }
        if (parsed.userState) setUserState(parsed.userState);
        if (parsed.sessionHistory) setSessionHistory(parsed.sessionHistory);
        if (parsed.soundEnabled !== undefined) setSoundEnabled(parsed.soundEnabled);
      } else {
        const oldSaved = localStorage.getItem('cyber_fit_state_v45');
        if (oldSaved) {
          const oldParsed = JSON.parse(oldSaved);
          if (oldParsed.userState) setUserState(oldParsed.userState);
          if (oldParsed.sessionHistory) setSessionHistory(oldParsed.sessionHistory);
        }
      }
    } catch (e) {
      console.warn('Failed to load state from localStorage:', e);
    }
  }, []);

  // Save state to localStorage whenever changes occur
  useEffect(() => {
    try {
      const fullState: AppState = {
        currentProgramId,
        userState,
        sessionHistory,
        soundEnabled
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fullState));
    } catch (e) {
      console.warn('Failed to save state to localStorage:', e);
    }
  }, [currentProgramId, userState, sessionHistory, soundEnabled]);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Timer management
  const startTimer = (seconds: number) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimeLeft(seconds);
    setInitialTimerDuration(seconds);
    setTimerActive(true);

    timerIntervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          setTimerActive(false);
          showToast("ОТДЫХ ЗАВЕРШЕН! ГОТОВНОСТЬ К СЛЕДУЮЩЕМУ ПОДХОДУ.");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const adjustTimer = (delta: number) => {
    setTimeLeft(prev => Math.max(0, prev + delta));
  };

  const setTimerExact = (seconds: number) => {
    startTimer(seconds);
    showToast(`ТАЙМЕР УСТАНОВЛЕН НА ${seconds} СЕК`);
  };

  const stopTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerActive(false);
  };

  // Switch workout day
  const handleSwitchDay = (id: number) => {
    playLaserClick(soundEnabled);
    setCurrentDayId(id);
  };

  // Switch workout program (Mass, Strength, Relief, Longevity)
  const handleSelectProgram = (programId: ProgramGoal) => {
    playLaserClick(soundEnabled);
    setCurrentProgramId(programId);
    setCurrentDayId(1);
    stopTimer();
    const newProg = allPrograms[programId];
    showToast(`ПРОГРАММА АКТИВИРОВАНА: ${newProg.shortTitle}`);
  };

  // Open AI Coach with custom generated prompt
  const handleOpenAICoachWithPrompt = (prompt: string) => {
    setCoachInitialPrompt(prompt);
    setCurrentTab('coach');
  };

  // Update Weight or Reps
  const handleUpdateSet = (dayId: number, exIdx: number, setIdx: number, field: 'weight' | 'reps', val: string) => {
    const key = `prog_${currentProgramId}_day_${dayId}_ex_${exIdx}`;
    const exData = activeWorkoutData.find(d => d.id === dayId)!.exercises[exIdx];

    setUserState(prev => {
      const currentEx = prev[key] || {
        sets: Array(exData.sets).fill(null).map(() => ({ weight: '', reps: '', completed: false }))
      };
      const updatedSets = [...currentEx.sets];
      updatedSets[setIdx] = {
        ...updatedSets[setIdx],
        [field]: val
      };
      return {
        ...prev,
        [key]: {
          ...currentEx,
          sets: updatedSets
        }
      };
    });
  };

  // Stepper: Increment/Decrement weight with tactile button
  const handleStepWeight = (dayId: number, exIdx: number, setIdx: number, delta: number) => {
    const key = `prog_${currentProgramId}_day_${dayId}_ex_${exIdx}`;
    const currentEx = userState[key];
    const currentVal = parseFloat(currentEx?.sets?.[setIdx]?.weight || '0') || 0;
    const newVal = Math.max(0, Math.round((currentVal + delta) * 10) / 10);
    handleUpdateSet(dayId, exIdx, setIdx, 'weight', newVal > 0 ? newVal.toString() : '');
  };

  // Copy Weight of Set 1 to all other sets in this exercise
  const handleCopyWeightToAllSets = (dayId: number, exIdx: number) => {
    const key = `prog_${currentProgramId}_day_${dayId}_ex_${exIdx}`;
    const currentEx = userState[key];
    const firstWeight = currentEx?.sets?.[0]?.weight;
    if (!firstWeight) {
      showToast("Сначала введите вес в первом подходе (П1).");
      return;
    }

    const exData = activeWorkoutData.find(d => d.id === dayId)!.exercises[exIdx];

    setUserState(prev => {
      const ex = prev[key] || {
        sets: Array(exData.sets).fill(null).map(() => ({ weight: '', reps: '', completed: false }))
      };
      const updatedSets = ex.sets.map(s => ({
        ...s,
        weight: firstWeight
      }));
      return {
        ...prev,
        [key]: {
          ...ex,
          sets: updatedSets
        }
      };
    });
    showToast(`Вес ${firstWeight} кг скопирован во все подходы!`);
  };

  // Auto-fill from previous session record
  const handleFillFromPreviousSession = (dayId: number, exIdx: number, prevWeight: number) => {
    const key = `prog_${currentProgramId}_day_${dayId}_ex_${exIdx}`;
    const exData = activeWorkoutData.find(d => d.id === dayId)!.exercises[exIdx];

    setUserState(prev => {
      const ex = prev[key] || {
        sets: Array(exData.sets).fill(null).map(() => ({ weight: '', reps: '', completed: false }))
      };
      const updatedSets = ex.sets.map(s => ({
        ...s,
        weight: prevWeight.toString()
      }));
      return {
        ...prev,
        [key]: {
          ...ex,
          sets: updatedSets
        }
      };
    });
    showToast(`Заполнен прошлый вес: ${prevWeight} кг!`);
  };

  // Toggle set completion and launch rest timer
  const handleToggleSetCompletion = (dayId: number, exIdx: number, setIdx: number, restSec: number) => {
    const key = `prog_${currentProgramId}_day_${dayId}_ex_${exIdx}`;
    const exData = activeWorkoutData.find(d => d.id === dayId)!.exercises[exIdx];

    setUserState(prev => {
      const currentEx = prev[key] || {
        sets: Array(exData.sets).fill(null).map(() => ({ weight: '', reps: '', completed: false }))
      };
      const updatedSets = [...currentEx.sets];
      const currentCompleted = updatedSets[setIdx]?.completed || false;
      const willBeCompleted = !currentCompleted;

      updatedSets[setIdx] = {
        ...updatedSets[setIdx],
        completed: willBeCompleted
      };

      if (willBeCompleted) {
        playSetComplete(soundEnabled);
        startTimer(restSec);
        showToast("ПОДХОД ЗАСИФРИРОВАН. ЗАПУСК ТАЙМЕРА.");
      }

      return {
        ...prev,
        [key]: {
          ...currentEx,
          sets: updatedSets
        }
      };
    });
  };

  // Choose alternative exercise
  const handleSelectAlternative = (altName: string, altDesc: string, usesTwoDumbbells: boolean, isOriginal: boolean) => {
    if (!altModalData) return;
    const { dayId, exIdx } = altModalData;
    const key = `prog_${currentProgramId}_day_${dayId}_ex_${exIdx}`;
    const exData = activeWorkoutData.find(d => d.id === dayId)!.exercises[exIdx];

    setUserState(prev => {
      const current = prev[key] || {
        sets: Array(exData.sets).fill(null).map(() => ({ weight: '', reps: '', completed: false }))
      };
      return {
        ...prev,
        [key]: {
          ...current,
          name: isOriginal ? null : altName,
          desc: isOriginal ? null : altDesc,
          usesTwoDumbbells: usesTwoDumbbells
        }
      };
    });

    setAltModalData(null);
    showToast("УПРАЖНЕНИЕ ЗАМЕНЕНО!");
  };

  // Toggle technique accordion
  const toggleTechnique = (key: string) => {
    setExpandedTechnique(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Calculate overall session statistics for active program
  let totalVolume = 0;
  let totalSetsCount = 0;
  let completedSetsCount = 0;

  activeWorkoutData.forEach(day => {
    day.exercises.forEach((ex, idx) => {
      totalSetsCount += ex.sets;
      const key = `prog_${currentProgramId}_day_${day.id}_ex_${idx}`;
      const state = userState[key];
      const isPair = state?.usesTwoDumbbells !== undefined ? state.usesTwoDumbbells : ex.usesTwoDumbbells;

      if (state?.sets) {
        state.sets.forEach(set => {
          if (set.completed) {
            completedSetsCount++;
            const w = parseFloat(set.weight) || 0;
            const r = parseInt(set.reps) || 0;
            totalVolume += w * (isPair ? 2 : 1) * r;
          }
        });
      }
    });
  });

  const overallProgressPct = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  // Save session into history log
  const handleFinishAndSaveSession = () => {
    if (completedSetsCount === 0) {
      showToast("ВНИМАНИЕ: Сначала отметьте выполненные подходы.");
      return;
    }

    const today = new Date();
    const dateFormatted = today.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const exerciseRecords = activeWorkoutData.flatMap(d =>
      d.exercises.map((ex, idx) => {
        const key = `prog_${currentProgramId}_day_${d.id}_ex_${idx}`;
        const exState = userState[key];
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
    );

    const newHistoryItem: SessionHistoryItem = {
      id: 'session_' + Date.now(),
      date: dateFormatted,
      timestamp: Date.now(),
      dayId: activeDay.id,
      dayName: `${activeProgram.shortTitle} · ${activeDay.name} (${activeDay.subtitle})`,
      totalVolumeKg: totalVolume,
      completedSets: completedSetsCount,
      totalSets: totalSetsCount,
      exerciseRecords
    };

    setSessionHistory(prev => [newHistoryItem, ...prev]);
    showToast("СЕССИЯ УСПЕШНО ЗАФИКСИРОВАНА В ИСТОРИИ!");
    playTimerEnd(soundEnabled);
  };

  // Reset active session
  const handleResetProgress = () => {
    if (window.confirm("Сбросить текущие отметки подходов этой программы? (История журнала сохранится)")) {
      setUserState(prev => {
        const cleaned = { ...prev };
        Object.keys(cleaned).forEach(k => {
          if (k.startsWith(`prog_${currentProgramId}_`)) {
            delete cleaned[k];
          }
        });
        return cleaned;
      });
      stopTimer();
      showToast("СИСТЕМА СБРОШЕНА. НАЧАЛО НОВОГО ЦИКЛА.");
    }
  };

  // Restore imported backup state
  const handleRestoreState = (restored: AppState) => {
    if (restored.currentProgramId && allPrograms[restored.currentProgramId]) {
      setCurrentProgramId(restored.currentProgramId);
    }
    setUserState(restored.userState || {});
    setSessionHistory(restored.sessionHistory || []);
    if (restored.soundEnabled !== undefined) setSoundEnabled(restored.soundEnabled);
  };

  // 1RM calculation (Epley formula)
  const calculate1RM = (weightStr: string, repsStr: string): number | null => {
    const w = parseFloat(weightStr);
    const r = parseInt(repsStr);
    if (!w || !r || r < 1) return null;
    if (r === 1) return w;
    return Math.round(w * (1 + r / 30) * 10) / 10;
  };

  // Find previous max weight for an exercise from session history
  const getPreviousSessionRecord = (exerciseName: string) => {
    for (const session of sessionHistory) {
      const match = session.exerciseRecords.find(r => r.exerciseName === exerciseName);
      if (match && match.maxWeight > 0) {
        return match;
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col antialiased selection:bg-cyan-500 selection:text-black font-sans pb-24">
      {/* MODERN REFINED TOP BAR */}
      <header className="sticky top-0 z-30 bg-[#030712]/92 backdrop-blur-2xl border-b border-cyan-500/25 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          {/* Brand Wordmark (Zero-Pill Compliant) */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/30 flex-shrink-0">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <span className="text-base font-black tracking-wider text-white font-mono-tech block leading-none">
                CYBER_FIT
              </span>
              <span className="text-[11px] text-cyan-400 font-mono-tech tracking-tight">
                36 ЛЕТ · 72 КГ · {activeProgram.shortTitle}
              </span>
            </div>
          </div>

          {/* Right Slot: Workout Progress Indicator + Sound */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSoundEnabled(prev => !prev);
                showToast(!soundEnabled ? "Звуковые эффекты включены" : "Звуковые эффекты выключены");
              }}
              title={soundEnabled ? "Звук включен" : "Звук выключен"}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={() => setCurrentTab('analytics')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-mono-tech text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
              <span>{overallProgressPct}%</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow max-w-xl w-full mx-auto px-4 py-4 space-y-4">
        {/* TAB 1: WORKOUT */}
        {currentTab === 'workout' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* PROGRAM SELECTOR TRIGGER BANNER */}
            <button
              onClick={() => setIsProgramSelectorOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-cyan-500/40 hover:border-cyan-300 shadow-lg transition active:scale-[0.99] group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/30 transition">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono-tech text-cyan-400 font-bold uppercase tracking-wider">
                      АКТИВНАЯ ЦЕЛЬ:
                    </span>
                    <span className="text-[10px] bg-cyan-950/80 text-cyan-200 border border-cyan-500/30 px-2 py-0.2 rounded font-mono-tech font-bold">
                      {activeProgram.intensity}
                    </span>
                  </div>
                  <span className="text-sm sm:text-base font-black text-white font-mono-tech block">
                    {activeProgram.title}
                  </span>
                  <span className="text-xs text-slate-400 block font-sans">
                    {activeProgram.repsRange} · {activeProgram.setsDefault} · Отдых {activeProgram.restDefault}с
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-cyan-400 font-mono-tech font-bold flex-shrink-0">
                <span>СМЕНИТЬ</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>

            {/* Days Segmented Switcher */}
            <nav className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
              {activeWorkoutData.map(day => {
                const isActive = day.id === currentDayId;
                return (
                  <button
                    key={day.id}
                    onClick={() => handleSwitchDay(day.id)}
                    className={`py-2 px-1 rounded-xl font-mono-tech transition-all flex flex-col items-center justify-center active:scale-95 ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 font-black shadow-md shadow-cyan-500/25'
                        : 'text-slate-400 hover:text-slate-200 font-bold'
                    }`}
                  >
                    <span className="text-xs sm:text-sm">{day.name}</span>
                    <span className="text-[10px] opacity-90">{day.subtitle}</span>
                  </button>
                );
              })}
            </nav>

            {/* Active Day Meta Header */}
            <div className="bg-gradient-to-r from-slate-900/95 via-indigo-950/30 to-slate-900 border border-cyan-500/30 rounded-2xl p-4 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono-tech text-cyan-400 font-bold tracking-wider block">
                  ДЕНЬ {activeDay.id} ПРОТОКОЛА
                </span>
                <h2 className="text-base sm:text-lg font-black text-white font-mono-tech">
                  {activeDay.name}: {activeDay.subtitle}
                </h2>
                <p className="text-xs text-slate-300 font-medium mt-0.5">
                  Фокус: {activeDay.focus}
                </p>
              </div>
              <button
                onClick={handleFinishAndSaveSession}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-mono-tech font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 active:scale-95 flex-shrink-0"
              >
                <Check className="w-3.5 h-3.5" />
                <span>СОХРАНИТЬ</span>
              </button>
            </div>

            {/* Exercises Cards Feed */}
            <div className="space-y-4">
              {activeDay.exercises.map((ex, exIdx) => {
                const stateKey = `prog_${currentProgramId}_day_${currentDayId}_ex_${exIdx}`;
                const exState = userState[stateKey];
                const currentName = exState?.name || ex.name;
                const currentDesc = exState?.desc || ex.desc;
                const isPair = exState?.usesTwoDumbbells !== undefined
                  ? exState.usesTwoDumbbells
                  : ex.usesTwoDumbbells;

                const sets = exState?.sets || Array(ex.sets).fill(null).map(() => ({ weight: '', reps: '', completed: false }));
                const allCompleted = sets.every(s => s.completed);
                const prevRecord = getPreviousSessionRecord(currentName);
                const isTechniqueOpen = expandedTechnique[stateKey] ?? false;

                return (
                  <div
                    key={ex.id}
                    className={`bg-slate-900/90 border rounded-2xl p-4 shadow-md transition-all flex flex-col gap-3 ${
                      allCompleted
                        ? 'border-emerald-500/70 bg-emerald-950/20'
                        : 'border-slate-800'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono-tech font-extrabold text-xs text-cyan-300 flex-shrink-0 mt-0.5">
                          0{exIdx + 1}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-white text-sm sm:text-base leading-snug font-mono-tech">
                            {currentName}
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-sans mt-0.5">
                            <span>{ex.target}</span>
                            {isPair && (
                              <>
                                <span aria-hidden="true" className="text-cyan-400">·</span>
                                <span className="text-fuchsia-300 font-semibold font-mono-tech text-[11px]">
                                  2 гантели (х2)
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setAltModalData({ dayId: currentDayId, exIdx })}
                        className="text-xs bg-slate-950 hover:bg-cyan-950 text-cyan-300 px-2.5 py-1.5 rounded-lg border border-slate-800 transition flex items-center gap-1 font-bold font-mono-tech flex-shrink-0 active:scale-95"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>ЗАМЕНА</span>
                      </button>
                    </div>

                    {/* Previous record hint if available */}
                    {prevRecord && (
                      <div className="bg-slate-950/80 border border-indigo-500/30 px-3 py-1.5 rounded-xl flex items-center justify-between text-xs font-mono-tech">
                        <span className="text-indigo-300">
                          Прошлый раз: <strong className="text-white">{prevRecord.maxWeight} кг</strong>
                        </span>
                        <button
                          onClick={() => handleFillFromPreviousSession(currentDayId, exIdx, prevRecord.maxWeight)}
                          className="text-[11px] text-cyan-400 hover:underline font-bold flex items-center gap-1"
                        >
                          <Copy className="w-3 h-3" /> Повторить
                        </button>
                      </div>
                    )}

                    {/* Target Parameters Bar */}
                    <div className="flex items-center justify-between bg-slate-950/90 px-3 py-2 rounded-xl border border-slate-800/80 text-xs font-mono-tech">
                      <span className="text-slate-300">
                        {ex.sets} подх. × {ex.reps}
                      </span>
                      <span className="text-cyan-300 font-bold">
                        Отдых: {ex.restSec} сек
                      </span>
                      {sets[0]?.weight && (
                        <button
                          onClick={() => handleCopyWeightToAllSets(currentDayId, exIdx)}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                        >
                          <Copy className="w-2.5 h-2.5" /> Копир. П1
                        </button>
                      )}
                    </div>

                    {/* Modern Sets Table with Steppers */}
                    <div className="space-y-2">
                      {sets.map((setObj, setIdx) => {
                        const estimated1RM = calculate1RM(setObj.weight, setObj.reps);
                        return (
                          <div
                            key={setIdx}
                            className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                              setObj.completed
                                ? 'border-emerald-500/60 bg-emerald-950/35'
                                : 'border-slate-800/90 bg-slate-950/80'
                            }`}
                          >
                            <span className="text-xs font-mono-tech font-bold text-cyan-300 w-7 flex-shrink-0 text-center">
                              П{setIdx + 1}
                            </span>

                            {/* Weight Stepper & Input */}
                            <div className="flex-1 flex items-center bg-slate-900 border border-slate-800 rounded-xl overflow-hidden focus-within:border-cyan-400">
                              <button
                                onClick={() => handleStepWeight(currentDayId, exIdx, setIdx, -2.5)}
                                className="px-2 py-2 text-slate-400 hover:text-cyan-300 active:scale-90"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <input
                                type="number"
                                step="0.5"
                                value={setObj.weight}
                                onChange={e => handleUpdateSet(currentDayId, exIdx, setIdx, 'weight', e.target.value)}
                                placeholder="вес"
                                className="w-full text-center bg-transparent text-sm font-mono-tech text-white font-bold py-2 outline-none placeholder:text-slate-600"
                              />
                              <button
                                onClick={() => handleStepWeight(currentDayId, exIdx, setIdx, 2.5)}
                                className="px-2 py-2 text-slate-400 hover:text-cyan-300 active:scale-90"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Reps Input */}
                            <div className="w-16 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden focus-within:border-cyan-400">
                              <input
                                type="number"
                                value={setObj.reps}
                                onChange={e => handleUpdateSet(currentDayId, exIdx, setIdx, 'reps', e.target.value)}
                                placeholder="повт"
                                className="w-full text-center bg-transparent text-sm font-mono-tech text-white font-bold py-2 outline-none placeholder:text-slate-600"
                              />
                            </div>

                            {/* Complete Button */}
                            <button
                              onClick={() => handleToggleSetCompletion(currentDayId, exIdx, setIdx, ex.restSec)}
                              className={`h-10 px-3.5 rounded-xl font-mono-tech font-black text-xs transition uppercase tracking-wider flex items-center justify-center flex-shrink-0 active:scale-95 ${
                                setObj.completed
                                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                                  : 'bg-slate-900 hover:bg-cyan-950 text-cyan-200 border border-slate-700'
                              }`}
                            >
                              {setObj.completed ? <Check className="w-4 h-4 stroke-[3px]" /> : 'ГОТОВО'}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Technique Accordion Toggle */}
                    <div className="pt-1 border-t border-slate-800/80">
                      <button
                        onClick={() => toggleTechnique(stateKey)}
                        className="w-full flex items-center justify-between text-xs text-slate-400 hover:text-cyan-300 transition py-1"
                      >
                        <span className="font-mono-tech font-semibold">ТЕХНИКА ВЫПОЛНЕНИЯ</span>
                        {isTechniqueOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {isTechniqueOpen && (
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans pt-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 animate-in fade-in duration-200">
                          {currentDesc}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: AI COACH DEDICATED VIEW */}
        {currentTab === 'coach' && (
          <div className="animate-in fade-in duration-200">
            <AICoachModal
              isOpen={true}
              onClose={() => setCurrentTab('workout')}
              initialPrompt={coachInitialPrompt}
              onClearInitialPrompt={() => setCoachInitialPrompt(null)}
              statsContext={{
                totalTonnage: totalVolume,
                completedSets: completedSetsCount,
                totalSets: totalSetsCount,
                activeDayName: `${activeProgram.shortTitle} · ${activeDay.name} (${activeDay.subtitle})`
              }}
            />
          </div>
        )}

        {/* TAB 3: ANALYTICS & PROGRESS VIEW */}
        {currentTab === 'analytics' && (
          <div className="animate-in fade-in duration-200">
            <AnalyticsModal
              isOpen={true}
              onClose={() => setCurrentTab('workout')}
              workoutData={activeWorkoutData}
              userState={userState}
              sessionHistory={sessionHistory}
              onFinishAndSaveSession={handleFinishAndSaveSession}
              onOpenBackup={() => setIsBackupOpen(true)}
            />
          </div>
        )}

        {/* TAB 4: PLATES CALCULATOR VIEW */}
        {currentTab === 'plates' && (
          <div className="animate-in fade-in duration-200">
            <PlateCalculatorModal
              isOpen={true}
              onClose={() => setCurrentTab('workout')}
            />
          </div>
        )}

        {/* TAB 5: ATHLETE PROFILE & SETTINGS */}
        {currentTab === 'profile' && (
          <ProfileView
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(prev => !prev)}
            onOpenBackup={() => setIsBackupOpen(true)}
            onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
            onResetProgress={handleResetProgress}
            totalVolume={totalVolume}
            completedSetsCount={completedSetsCount}
            currentProgramTitle={activeProgram.title}
            onOpenProgramSelector={() => setIsProgramSelectorOpen(true)}
          />
        )}
      </main>

      {/* FLOATING REST TIMER DYNAMIC ISLAND */}
      <FloatingTimerIsland
        timeLeft={timeLeft}
        initialTime={initialTimerDuration}
        isActive={timerActive}
        soundEnabled={soundEnabled}
        onAdjustTimer={adjustTimer}
        onSetTimer={setTimerExact}
        onStopTimer={stopTimer}
        onToggleSound={() => setSoundEnabled(prev => !prev)}
      />

      {/* MODERN FIXED BOTTOM NAV BAR */}
      <BottomNavBar
        activeTab={currentTab}
        onSelectTab={setCurrentTab}
        completedSetsCount={completedSetsCount}
        totalSetsCount={totalSetsCount}
      />

      {/* PROGRAM SELECTOR MODAL */}
      <ProgramSelectorModal
        isOpen={isProgramSelectorOpen}
        onClose={() => setIsProgramSelectorOpen(false)}
        currentProgramId={currentProgramId}
        onSelectProgram={handleSelectProgram}
        onOpenAICoachWithPrompt={handleOpenAICoachWithPrompt}
      />

      {/* BACKUP MODAL */}
      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        currentState={{
          currentProgramId,
          userState,
          sessionHistory,
          soundEnabled
        }}
        onRestoreState={handleRestoreState}
        onShowToast={showToast}
      />

      {/* INSTALL GUIDE MODAL */}
      <InstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
        appUrl={typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-yv3cvkfmzmc5ryuzm7ldaj-928759620860.europe-west2.run.app'}
      />

      {/* ALTERNATIVES MODAL */}
      {altModalData && (
        <AlternativesModal
          isOpen={true}
          dayId={altModalData.dayId}
          exIdx={altModalData.exIdx}
          workoutData={activeWorkoutData}
          onSelectAlternative={handleSelectAlternative}
          onClose={() => setAltModalData(null)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-4 right-4 max-w-sm mx-auto bg-slate-900 border border-cyan-500/60 text-cyan-100 text-xs sm:text-sm px-4 py-2.5 rounded-2xl shadow-2xl z-50 flex items-center justify-center gap-2 font-mono-tech font-bold animate-in slide-in-from-top-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
