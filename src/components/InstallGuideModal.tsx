import React, { useState } from 'react';
import { Smartphone, X, Copy, Check, QrCode, Download, ShieldCheck, WifiOff, Globe, Cloud, Sparkles, ExternalLink } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  appUrl: string;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadingHtml, setDownloadingHtml] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [activeTab, setActiveTab] = useState<'netlify' | 'file' | 'dev'>('netlify');

  if (!isOpen) return null;

  const devUrl = 'https://ais-dev-yv3cvkfmzmc5ryuzm7ldaj-928759620860.europe-west2.run.app';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(devUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadStandalone = async () => {
    try {
      setDownloadingHtml(true);
      const res = await fetch('/cyber_fit_standalone.html');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'CYBER_FIT_offline.html';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open('/cyber_fit_standalone.html', '_blank');
    } finally {
      setDownloadingHtml(false);
    }
  };

  const handleDownloadNetlifyZip = () => {
    setDownloadingZip(true);
    const a = document.createElement('a');
    a.href = '/cyber_fit_netlify_deploy.zip';
    a.download = 'cyber_fit_netlify_deploy.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => setDownloadingZip(false), 1500);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(devUrl)}&bgcolor=3-7-18&color=0-240-255`;

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="cyber-glass cyber-border rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[94vh] cyber-glow">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-cyan-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/25 border border-cyan-400/50 flex items-center justify-center text-cyan-300">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-mono-tech tracking-wider">
                ЗАПУСК & РАЗВЕРТЫВАНИЕ
              </h3>
              <p className="text-xs text-cyan-400 font-mono-tech">
                NETLIFY // ОФЛАЙН-ФАЙЛ // PWA
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
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950/90 rounded-2xl border border-cyan-500/35 font-mono-tech text-xs">
          <button
            onClick={() => setActiveTab('netlify')}
            className={`py-2 px-1 rounded-xl transition font-bold flex items-center justify-center gap-1 ${
              activeTab === 'netlify'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                : 'text-slate-300 hover:text-cyan-200'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" /> NETLIFY
          </button>
          <button
            onClick={() => setActiveTab('file')}
            className={`py-2 px-1 rounded-xl transition font-bold flex items-center justify-center gap-1 ${
              activeTab === 'file'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                : 'text-slate-300 hover:text-cyan-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" /> .HTML ФАЙЛ
          </button>
          <button
            onClick={() => setActiveTab('dev')}
            className={`py-2 px-1 rounded-xl transition font-bold flex items-center justify-center gap-1 ${
              activeTab === 'dev'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30 font-black'
                : 'text-slate-300 hover:text-cyan-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" /> ССЫЛКА DEV
          </button>
        </div>

        <div className="overflow-y-auto pr-1 max-h-[64vh] space-y-3.5">
          {/* TAB 1: NETLIFY (BEST PERMANENT CLOUD HOSTING) */}
          {activeTab === 'netlify' && (
            <div className="space-y-3 font-sans">
              <div className="bg-gradient-to-r from-cyan-950/90 to-slate-900 border-2 border-cyan-400/60 p-4 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-cyan-400 text-slate-950 font-black px-2 py-0.5 rounded font-mono-tech">
                    NETLIFY DROP
                  </span>
                  <span className="text-xs text-cyan-300 font-bold font-mono-tech">
                    РАЗВЕРТЫВАНИЕ ЗА 30 СЕКУНД
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Я уже полностью скомпилировал продакшн-версию и упаковал её в готовый ZIP-архив с конфигурацией <code className="text-cyan-300">netlify.toml</code>:
                </p>

                <button
                  onClick={handleDownloadNetlifyZip}
                  disabled={downloadingZip}
                  className="py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono-tech font-black text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingZip ? 'СКАЧИВАНИЕ...' : 'СКАЧАТЬ АРХИВ ДЛЯ NETLIFY (ZIP)'}</span>
                </button>
              </div>

              {/* Step by step Netlify instructions */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2.5 text-xs text-slate-200">
                <strong className="text-cyan-300 font-mono-tech text-xs sm:text-sm block">
                  3 простых шага для публикации:
                </strong>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold flex-shrink-0 font-mono-tech text-xs">1</span>
                    <p>
                      Скачайте ZIP-архив кнопкой выше и перейдите на страницу <a href="https://app.netlify.com/drop" target="_blank" rel="noreferrer" className="text-cyan-300 font-bold underline inline-flex items-center gap-0.5">app.netlify.com/drop <ExternalLink className="w-3 h-3" /></a> (бесплатно, регистрация по кнопке через GitHub/Google/Email).
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold flex-shrink-0 font-mono-tech text-xs">2</span>
                    <p>
                      Перетащите скачанный файл <code className="text-cyan-300">cyber_fit_netlify_deploy.zip</code> прямо в окно на сайте Netlify.
                    </p>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold flex-shrink-0 font-mono-tech text-xs">3</span>
                    <p>
                      Через 5 секунд Netlify выдаст вам <strong>постоянную публичную ссылку</strong> вида <code className="text-cyan-300 font-bold">https://ваш-сайт.netlify.app</code>. Открывайте её на телефоне и жмите <strong>«Установить на телефон»</strong>!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDALONE OFFLINE HTML FILE */}
          {activeTab === 'file' && (
            <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border-2 border-emerald-500/60 p-4 rounded-2xl flex flex-col gap-3 font-sans shadow-lg shadow-emerald-950/40">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500 text-slate-950 font-black px-2 py-0.5 rounded font-mono-tech">
                  БЕЗ ИНТЕРНЕТА
                </span>
                <span className="text-xs text-emerald-300 font-bold font-mono-tech">
                  100% АВТОНОМНЫЙ ФАЙЛ
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-100 leading-relaxed">
                Скачайте файл <strong className="text-emerald-300 font-mono-tech">CYBER_FIT_offline.html</strong> (все стили, звуки, тренировки и код уже встроены в 1 файл):
              </p>

              <button
                onClick={handleDownloadStandalone}
                disabled={downloadingHtml}
                className="py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-mono-tech font-black text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{downloadingHtml ? 'ФОРМИРОВАНИЕ...' : 'СКАЧАТЬ ФАЙЛ ДЛЯ ТЕЛЕФОНА (.HTML)'}</span>
              </button>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30 text-xs text-slate-300 space-y-1">
                <p>1. Скачайте файл и отправьте в <strong>Telegram (в «Избранное»)</strong> или WhatsApp.</p>
                <p>2. На телефоне откройте файл в браузере (Safari / Chrome).</p>
                <p>3. Нажмите <strong>«На экран Домой»</strong> — и запускайте с рабочего стола телефона!</p>
              </div>
            </div>
          )}

          {/* TAB 3: DEV LINK */}
          {activeTab === 'dev' && (
            <div className="bg-slate-900/90 border border-cyan-500/40 p-4 rounded-2xl flex flex-col gap-3 font-sans">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-cyan-600 text-slate-950 font-black px-2 py-0.5 rounded font-mono-tech">
                  DEV-СЕРВЕР
                </span>
                <span className="text-xs text-cyan-300 font-bold font-mono-tech">
                  ПРЯМАЯ ССЫЛКА СРЕДЫ РАЗРАБОТКИ
                </span>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-xl border border-cyan-500/30 font-mono-tech">
                <input
                  type="text"
                  readOnly
                  value={devUrl}
                  className="bg-transparent text-xs text-cyan-200 flex-1 outline-none select-all truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-lg transition flex items-center gap-1.5 flex-shrink-0 active:scale-95"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'СКОПИРОВАНО' : 'КОПИРОВАТЬ'}</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <div className="w-24 h-24 bg-[#030712] border border-cyan-500/40 rounded-xl p-1 flex items-center justify-center flex-shrink-0 shadow-md">
                  <img
                    src={qrUrl}
                    alt="QR Code"
                    className="w-full h-full object-contain rounded-lg"
                  />
                </div>
                <div className="text-xs text-slate-300 space-y-1">
                  <p className="font-bold text-cyan-300 font-mono-tech flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" /> Наведите камеру смартфона
                  </p>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    ⚠️ На телефоне нужно войти под вашей почтой Google (<strong>molodoy1893@gmail.com</strong>), так как облачный сервер защищен авторизацией владельца.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-cyan-500/20">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-xs sm:text-sm bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black rounded-xl transition font-mono-tech shadow-md shadow-cyan-600/30"
          >
            ЗАКРЫТЬ
          </button>
        </div>
      </div>
    </div>
  );
};
