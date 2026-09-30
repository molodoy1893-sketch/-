import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Brain, Loader2 } from 'lucide-react';
import { askAICoach, CoachStatsContext } from '../utils/aiCoach.ts';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface AICoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  statsContext: CoachStatsContext;
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
}

export const AICoachModal: React.FC<AICoachModalProps> = ({
  isOpen,
  onClose,
  statsContext,
  initialPrompt,
  onClearInitialPrompt
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Приветствую, атлет! Я — **CYBER_COACH v5.0** на базе нейросетевого ядра Gemini. Моя база адаптирована под ваши биометрические параметры: **36 лет, 169 см, 72 кг**.\n\nЯ умею составлять и менять программы тренировок под любые цели: **Масса, Максимальная сила, Рельеф/Сушка** или **Здоровье суставов 36+**.\n\nЗадайте любой вопрос или напишите ваши пожелания к тренировке!'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const hasTriggeredInitialPrompt = useRef<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (isOpen && initialPrompt && !hasTriggeredInitialPrompt.current) {
      hasTriggeredInitialPrompt.current = true;
      handleSend(initialPrompt);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [isOpen, initialPrompt]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setIsLoading(true);

    try {
      const response = await askAICoach(query, statsContext);
      setMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Сбой нейросети: проверьте сетевое подключение. Используйте базовые биомеханические ориентиры для гипертрофии.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: '🏋️ Силовой сплит 5x5', text: 'Составь для меня жесткий силовой 3-дневный сплит 5x5 с базовыми движениями для максимального роста силы.' },
    { label: '🔥 Сушка и рельеф 72 кг', text: 'Как скорректировать сплит и БЖУ при весе 72 кг, чтобы просушиться до вен без потери мышечной массы?' },
    { label: '🛡️ Тренировки без боли в суставах', text: 'Какие упражнения исключить или заменить при хрусте/дискомфорте в плечах и пояснице в возрасте 36 лет?' },
    { label: '🥩 Расчет калорий и белка', text: 'Распиши точный рацион белков, жиров и углеводов (в граммах) для набора сухой массы при весе 72 кг.' }
  ];

  const formatText = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="text-purple-300 font-bold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="cyber-glass cyber-border rounded-3xl max-w-xl w-full p-4 sm:p-6 shadow-2xl flex flex-col gap-3.5 max-h-[92vh] cyber-glow-ai">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-purple-500/30 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/25 border border-purple-400/50 flex items-center justify-center text-purple-300 shadow-md">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-purple-100 font-mono-tech tracking-wider flex items-center gap-2">
                CYBER_COACH // ИИ ТРЕНЕР
                <span className="text-xs bg-purple-900/80 border border-purple-400/50 px-2 py-0.5 rounded text-purple-200 font-mono-tech">
                  GEMINI
                </span>
              </h3>
              <p className="text-xs text-purple-300/80 font-mono-tech">
                Профиль: 36 лет · 169 см · 72 кг
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-purple-300 p-2 transition rounded-xl hover:bg-slate-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick prompt chips */}
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip.text)}
              disabled={isLoading}
              className="text-xs bg-purple-950/70 hover:bg-purple-900/90 text-purple-200 border border-purple-500/40 hover:border-purple-300 px-2.5 py-1.5 rounded-xl font-mono-tech transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-3 h-3 text-purple-400 flex-shrink-0" />
              <span>{chip.label}</span>
            </button>
          ))}
        </div>

        {/* Chat message scroll area */}
        <div className="bg-slate-950/90 border border-purple-500/30 rounded-2xl p-4 sm:p-5 h-72 sm:h-84 overflow-y-auto space-y-3.5 text-xs sm:text-sm">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] p-4 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                  msg.role === 'user'
                    ? 'bg-purple-950/90 border border-purple-500/60 text-purple-100 shadow-md font-mono-tech'
                    : 'bg-slate-900/95 border border-purple-500/35 text-slate-100 shadow-md font-sans text-sm'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 text-purple-400 font-bold mb-2 text-xs font-mono-tech">
                    <Brain className="w-4 h-4" />
                    <span>CYBER_COACH:</span>
                  </div>
                )}
                {formatText(msg.text)}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 border border-purple-500/40 text-purple-300 p-3.5 rounded-2xl text-xs sm:text-sm font-mono-tech flex items-center gap-2.5">
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                <span>ГЕНЕРАЦИЯ И АНАЛИЗ ПРОГРАММЫ...</span>
              </div>
            </div>
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Задайте ваш вопрос или цель..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 text-sm font-mono-tech text-purple-100 px-4 py-3 rounded-xl border border-purple-500/40 focus:outline-none focus:border-purple-400 placeholder:text-slate-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold font-mono-tech transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-600/30 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">ОТПРАВИТЬ</span>
          </button>
        </div>

        <div className="flex justify-end pt-1 border-t border-purple-500/20">
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
