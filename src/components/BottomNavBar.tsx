import React from 'react';
import { Dumbbell, Bot, TrendingUp, Disc, Sliders } from 'lucide-react';

export type ActiveTab = 'workout' | 'coach' | 'analytics' | 'plates' | 'profile';

interface BottomNavBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  completedSetsCount: number;
  totalSetsCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onSelectTab,
  completedSetsCount,
  totalSetsCount
}) => {
  const tabs = [
    {
      id: 'workout' as ActiveTab,
      label: 'Тренировка',
      icon: Dumbbell,
      badge: completedSetsCount > 0 ? `${completedSetsCount}/${totalSetsCount}` : null
    },
    {
      id: 'coach' as ActiveTab,
      label: 'ИИ Коуч',
      icon: Bot,
      highlight: true
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Прогресс',
      icon: TrendingUp
    },
    {
      id: 'plates' as ActiveTab,
      label: 'Блины',
      icon: Disc
    },
    {
      id: 'profile' as ActiveTab,
      label: 'Профиль',
      icon: Sliders
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#030712]/92 backdrop-blur-2xl border-t border-cyan-500/25 px-2 py-1.5 sm:py-2">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative active:scale-90 min-h-[48px] ${
                isActive
                  ? 'text-cyan-400 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.5px] drop-shadow-[0_0_8px_#00f0ff]' : 'stroke-[1.8px]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-3 text-[9px] font-mono-tech font-extrabold bg-cyan-500 text-slate-950 px-1 py-0.2 rounded-full shadow-sm">
                    {tab.badge}
                  </span>
                )}
                {tab.highlight && !isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-500 animate-pulse shadow-[0_0_6px_#a855f7]" />
                )}
              </div>
              <span
                className={`text-[10px] sm:text-[11px] font-mono-tech mt-1 tracking-tight truncate max-w-[64px] ${
                  isActive ? 'font-extrabold text-cyan-300' : 'text-slate-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="w-4 h-0.5 bg-cyan-400 rounded-full mt-0.5 shadow-[0_0_6px_#00f0ff]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
