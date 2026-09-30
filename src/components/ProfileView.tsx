import React from 'react';
import { User, Volume2, VolumeX, FileJson, RotateCcw, Smartphone, Cloud, Download, ShieldCheck, Flame, Scale, Activity, Target, ChevronRight } from 'lucide-react';
import { AppState } from '../types.ts';

interface ProfileViewProps {
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenBackup: () => void;
  onOpenInstallGuide: () => void;
  onResetProgress: () => void;
  totalVolume: number;
  completedSetsCount: number;
  currentProgramTitle: string;
  onOpenProgramSelector: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  soundEnabled,
  onToggleSound,
  onOpenBackup,
  onOpenInstallGuide,
  onResetProgress,
  totalVolume,
  completedSetsCount,
  currentProgramTitle,
  onOpenProgramSelector
}) => {
  return (
    <div className="space-y-4 max-w-xl mx-auto animate-in fade-in duration-200">
      {/* Athlete Header Card */}
      <div className="bg-gradient-to-br from-slate-900/95 via-indigo-950/40 to-slate-900 border border-cyan-500/35 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-fuchsia-600 p-0.5 shadow-lg shadow-cyan-500/30 flex-shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-300">
              <User className="w-7 h-7" />
            </div>
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-white font-mono-tech tracking-wide">
              АТЛЕТ // CYBER_FIT
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-300 font-sans mt-0.5">
              <span>36 лет</span>
              <span aria-hidden="true" className="text-cyan-400">·</span>
              <span>169 см</span>
              <span aria-hidden="true" className="text-cyan-400">·</span>
              <span className="font-bold text-cyan-300 font-mono-tech">72 кг</span>
            </div>
            <span className="inline-block mt-1 text-[11px] text-cyan-400 font-mono-tech font-semibold">
              🎯 Активный протокол: {currentProgramTitle}
            </span>
          </div>
        </div>

        {/* Biometric Quick Stats */}
        <div className="grid grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-slate-800 text-center font-mono-tech">
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-[10px] text-slate-400 block font-medium">ТОННАЖ ЦИКЛА</span>
            <strong className="text-sm sm:text-base font-black text-cyan-300">
              {totalVolume.toLocaleString()} кг
            </strong>
          </div>
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-[10px] text-slate-400 block font-medium">ПОДХОДОВ</span>
            <strong className="text-sm sm:text-base font-black text-emerald-400">
              {completedSetsCount}
            </strong>
          </div>
          <div className="bg-slate-950/70 p-2.5 rounded-xl border border-cyan-500/20">
            <span className="text-[10px] text-slate-400 block font-medium">СПЛИТ</span>
            <strong className="text-sm sm:text-base font-black text-white">
              3 ДНЯ
            </strong>
          </div>
        </div>
      </div>

      {/* Program Selector Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-mono-tech font-bold text-slate-300 uppercase tracking-wider">
          Выбор программы & Цели
        </h3>

        <button
          onClick={onOpenProgramSelector}
          className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-cyan-950/80 to-slate-950 rounded-2xl border border-cyan-500/40 hover:border-cyan-300 transition text-left active:scale-[0.99] shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-cyan-400 font-mono-tech font-bold block">
                ТЕКУЩАЯ ПРОГРАММА:
              </span>
              <span className="text-sm sm:text-base font-bold text-white block">
                {currentProgramTitle}
              </span>
              <span className="text-xs text-slate-400">
                Нажмите для переключения (Масса, Сила, Рельеф, Суставы 36+)
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-cyan-400" />
        </button>
      </div>

      {/* Preferences & Audio */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-mono-tech font-bold text-slate-300 uppercase tracking-wider">
          Настройки интерфейса & звука
        </h3>

        <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Звуковые кибер-эффекты
              </span>
              <span className="text-xs text-slate-400">
                Синтезатор отсчета таймера и завершения подходов
              </span>
            </div>
          </div>
          <button
            onClick={onToggleSound}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
              soundEnabled ? 'bg-cyan-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-slate-950 transition-transform ${
                soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Data Management & Backup */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-mono-tech font-bold text-slate-300 uppercase tracking-wider">
          Управление данными & Бэкап
        </h3>

        <button
          onClick={onOpenBackup}
          className="w-full flex items-center justify-between p-3.5 bg-slate-950/80 hover:bg-slate-950 rounded-2xl border border-cyan-500/30 transition text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Резервная копия (JSON)
              </span>
              <span className="text-xs text-slate-400">
                Экспорт и импорт всех весов и истории на новое устройство
              </span>
            </div>
          </div>
          <span className="text-xs text-cyan-400 font-mono-tech font-bold">ОТКРЫТЬ</span>
        </button>

        <button
          onClick={onResetProgress}
          className="w-full flex items-center justify-between p-3.5 bg-slate-950/80 hover:bg-rose-950/20 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Сброс активных отметок
              </span>
              <span className="text-xs text-slate-400">
                Очистить текущие галочки подходов для нового круга (журнал сохранится)
              </span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono-tech">СБРОСИТЬ</span>
        </button>
      </div>

      {/* Deployment & Phone Launch */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 space-y-3">
        <h3 className="text-xs font-mono-tech font-bold text-slate-300 uppercase tracking-wider">
          Установка & Netlify
        </h3>

        <button
          onClick={onOpenInstallGuide}
          className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 hover:from-cyan-950/90 rounded-2xl border border-cyan-500/40 transition text-left active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-white block">
                Установка на телефон и Netlify
              </span>
              <span className="text-xs text-slate-300">
                Инструкция, QR-код, ZIP-архив и автономный HTML-файл
              </span>
            </div>
          </div>
          <span className="text-xs text-cyan-300 font-mono-tech font-bold">ОТКРЫТЬ</span>
        </button>
      </div>
    </div>
  );
};
