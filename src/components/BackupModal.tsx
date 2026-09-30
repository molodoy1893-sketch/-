import React, { useState } from 'react';
import { AppState } from '../types.ts';
import { Download, Upload, X, FileJson, Check } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: AppState;
  onRestoreState: (restored: AppState) => void;
  onShowToast: (msg: string) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  currentState,
  onRestoreState,
  onShowToast
}) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<AppState | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentState, null, 2));
      const downloadAnchor = document.createElement('a');
      const today = new Date().toISOString().split('T')[0];
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `cyber_fit_backup_${today}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      onShowToast("РЕЗЕРВНАЯ КОПИЯ УСПЕШНО СКАЧАНА (JSON)");
    } catch {
      onShowToast("ОШИБКА ПРИ ЭКСПОРТЕ ФАЙЛА");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed && (parsed.userState || parsed.sessionHistory)) {
          const validatedState: AppState = {
            userState: parsed.userState || {},
            sessionHistory: Array.isArray(parsed.sessionHistory) ? parsed.sessionHistory : [],
            soundEnabled: parsed.soundEnabled ?? true
          };
          setParsedData(validatedState);
          setImportStatus(`Успешно распознано: ${Object.keys(validatedState.userState).length} упражнений, ${validatedState.sessionHistory.length} сессий в истории.`);
        } else {
          setImportStatus("Ошибка: неверный формат файла бэкапа CYBER_FIT.");
          setParsedData(null);
        }
      } catch {
        setImportStatus("Ошибка чтения JSON-файла. Убедитесь в корректности формата.");
        setParsedData(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmRestore = () => {
    if (!parsedData) return;
    onRestoreState(parsedData);
    onShowToast("СИСТЕМА УСПЕШНО ВОССТАНОВЛЕНА ИЗ БЭКАПА!");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="cyber-glass cyber-border rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] cyber-glow">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/25 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-mono-tech tracking-wider">
                РЕЗЕРВНОЕ КОПИРОВАНИЕ // JSON
              </h3>
              <p className="text-xs text-cyan-400 font-mono-tech">
                ЭКСПОРТ & ИМПОРТ ПРОГРЕССА
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

        {/* Export Card */}
        <div className="bg-slate-900/90 border border-cyan-500/35 p-4 rounded-2xl flex flex-col gap-3 font-mono-tech">
          <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Download className="w-4 h-4 text-cyan-400" />
            1. ЭКСПОРТ ДАННЫХ В ФАЙЛ
          </span>
          <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
            Скачайте резервную копию всех текущих весов, подходов и журнала тренировок на устройство.
          </p>
          <button
            onClick={handleExport}
            className="py-3 px-4 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/30 font-mono-tech active:scale-95"
          >
            <Download className="w-4 h-4" />
            СКАЧАТЬ JSON БЭКАП
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-slate-900/90 border border-cyan-500/35 p-4 rounded-2xl flex flex-col gap-3 font-mono-tech">
          <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            2. ИМПОРТ И ВОССТАНОВЛЕНИЕ
          </span>
          <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
            Выберите ранее сохраненный файл <code className="text-cyan-300 font-bold">.json</code> для переноса тренировок на новое устройство.
          </p>

          <label className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-xl p-4 text-center cursor-pointer bg-slate-950/70 hover:bg-cyan-950/30 transition flex flex-col items-center justify-center gap-2">
            <Upload className="w-6 h-6 text-cyan-400" />
            <span className="text-xs sm:text-sm text-cyan-300 font-bold">Нажмите для выбора файла .json</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          {importStatus && (
            <div className={`p-3 rounded-xl text-xs sm:text-sm font-mono-tech ${
              parsedData ? 'bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 font-semibold' : 'bg-rose-950/60 border border-rose-500/60 text-rose-300'
            }`}>
              {importStatus}
            </div>
          )}

          {parsedData && (
            <button
              onClick={handleConfirmRestore}
              className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 font-mono-tech active:scale-95"
            >
              <Check className="w-4 h-4" />
              ПРИМЕНИТЬ И ВОССТАНОВИТЬ
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-1 border-t border-cyan-500/20">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold transition border border-slate-700 font-mono-tech"
          >
            ЗАКРЫТЬ
          </button>
        </div>
      </div>
    </div>
  );
};
