import React from 'react';
import {
  LayoutDashboard,
  Scale,
  HeartPulse,
  Home,
  Wheat,
  DollarSign,
  BotMessageSquare,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'flocks'
  | 'growth'
  | 'health'
  | 'feed'
  | 'finances'
  | 'ai_advisor';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  alertsCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  alertsCount = 0,
}) => {
  const navItems: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }> = [
    { id: 'dashboard', label: "Vue d'ensemble", icon: LayoutDashboard },
    { id: 'flocks', label: 'Suivi des Lots', icon: Home },
    { id: 'growth', label: 'Pesées & Croissance', icon: Scale },
    { id: 'health', label: 'Santé & Prophylaxie', icon: HeartPulse, badge: alertsCount > 0 ? alertsCount : undefined },
    { id: 'feed', label: 'Aliments & Eau', icon: Wheat },
    { id: 'finances', label: 'Finances & Lots', icon: DollarSign },
    { id: 'ai_advisor', label: 'Assistant IA Élevage', icon: BotMessageSquare },
  ];

  return (
    <nav className="bg-[#F9F7F2] border-b border-[#E9E5D8] px-4 md:px-8 py-2 overflow-x-auto no-print">
      <div className="flex items-center gap-2 min-w-max">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs md:text-sm font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#4A6741] text-[#FDFCF8] shadow-xs'
                  : 'bg-white/60 hover:bg-white text-[#3D4035] hover:text-[#4A6741] border border-[#E9E5D8]/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#D4A373]' : 'text-[#8A8D7C]'}`} />
              <span>{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                    isActive ? 'bg-[#D4A373] text-white' : 'bg-[#FF4B2B] text-white'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
