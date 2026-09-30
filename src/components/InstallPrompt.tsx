import React, { useState, useEffect } from 'react';
import { Smartphone, X, ArrowUpRight, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  onOpenGuide: () => void;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ onOpenGuide }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode already
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone;
    setIsStandalone(!!standalone);

    if (standalone) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (isStandalone || isDismissed) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      onOpenGuide();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[400px] z-40 bg-slate-900/95 border-2 border-cyan-400/70 rounded-2xl p-3.5 shadow-2xl backdrop-blur-xl cyber-glow flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-3 cursor-pointer" onClick={onOpenGuide}>
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 flex-shrink-0 animate-pulse">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white font-mono-tech flex items-center gap-1.5">
            УСТАНОВИТЬ НА ТЕЛЕФОН
            <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
          </h4>
          <p className="text-[11px] text-cyan-300/90 leading-tight">
            {isIOS ? 'Для iPhone: «Поделиться» → «На экран Домой»' : 'Быстрый запуск с экрана и работа без интернета'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-black font-mono-tech text-xs transition shadow-md active:scale-95 whitespace-nowrap"
        >
          {deferredPrompt ? 'УСТАНОВИТЬ' : 'КАК?'}
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
