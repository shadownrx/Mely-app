import React from 'react';
import { motion } from 'motion/react';
import { TabType } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface BottomNavBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadMessagesCount: number;
  pendingDatesCount: number;
  userAvatar?: string;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  unreadMessagesCount,
  pendingDatesCount,
  userAvatar,
}) => {
  const { isLight } = useTheme();

  // 5 Main Tabs with MATCH in the Center
  const tabs: {
    id: TabType;
    label: string;
    icon: string;
    badge?: number;
    isCenter?: boolean;
  }[] = [
    {
      id: 'descubrir',
      label: 'Descubrir',
      icon: 'explore',
    },
    {
      id: 'citas',
      label: 'Citas',
      icon: 'event_available',
      badge: pendingDatesCount,
    },
    {
      id: 'matches',
      label: 'Match',
      icon: 'favorite',
      isCenter: true,
    },
    {
      id: 'mensajes',
      label: 'Mensajes',
      icon: 'chat_bubble',
      badge: unreadMessagesCount,
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: 'person',
    },
  ];

  return (
    <nav
      id="bottom-navigation-bar"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      className={`fixed bottom-0 w-full z-50 max-w-[440px] left-1/2 -translate-x-1/2 border-t backdrop-blur-xl transition-colors duration-300 ${
        isLight
          ? 'bg-white/95 border-[#ffe4e6] shadow-[0_-4px_25px_rgba(225,29,72,0.08)]'
          : 'bg-[#0d070a]/95 border-[#e11d48]/20 shadow-2xl'
      }`}
    >
      <div className="flex justify-around items-center py-1.5 px-2 w-full max-w-full">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          // Special Center Hero Button (MATCH)
          if (tab.isCenter) {
            return (
              <motion.button
                key={tab.id}
                id={`nav-btn-${tab.id}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  sounds.playHeart();
                  onTabChange(tab.id);
                }}
                className="group relative flex flex-col items-center justify-center -mt-4 focus:outline-none"
                title="Ver tus Matches y Conexiones"
              >
                {/* Elevated Circular Action */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#e11d48] via-[#f43f5e] to-[#fb7185] text-white ring-4 ring-[#e11d48]/25 scale-110 shadow-[#e11d48]/40'
                      : isLight
                      ? 'bg-gradient-to-tr from-[#fff1f3] to-white text-[#e11d48] border-2 border-[#fecdd3] hover:scale-105 shadow-md'
                      : 'bg-gradient-to-tr from-[#220d17] to-[#14080e] text-[#fda4af] border-2 border-[#e11d48]/50 hover:scale-105 shadow-lg'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[24px] transition-transform ${
                      isActive ? 'animate-pulse' : 'group-hover:scale-110'
                    }`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    favorite
                  </span>
                </div>

                <span
                  className={`font-label-caps text-[9px] tracking-wider uppercase font-bold mt-0.5 transition-colors ${
                    isActive
                      ? 'text-[#e11d48]'
                      : isLight
                      ? 'text-[#64748b] group-hover:text-[#e11d48]'
                      : 'text-[#fda4af]/70 group-hover:text-[#fda4af]'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          }

          // Regular Tabs (Descubrir, Citas, Mensajes, Perfil)
          return (
            <motion.button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                sounds.playClick();
                onTabChange(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-colors duration-200 relative min-w-[56px] ${
                isActive
                  ? isLight
                    ? 'text-[#e11d48] font-bold'
                    : 'text-[#fb7185] font-bold'
                  : isLight
                  ? 'text-[#64748b] hover:text-[#e11d48] hover:bg-[#fff1f3]/50'
                  : 'text-[#fda4af] opacity-65 hover:opacity-100 hover:bg-white/5'
              }`}
            >
              {/* Pastilla que se desliza entre tabs (layoutId compartido: motion la anima
                  automáticamente de una posición a otra en vez de aparecer/desaparecer). */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavActivePill"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  className={`absolute inset-0 rounded-xl border shadow-elevation-sm ${
                    isLight
                      ? 'bg-[#fff1f3] border-[#fecdd3]'
                      : 'bg-gradient-to-b from-[#2a0e16] to-[#16080d] border-[#e11d48]/40'
                  }`}
                />
              )}

              {/* Badge for Notifications / Pending Counts */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`absolute top-0 right-2 z-10 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white ring-2 animate-pulseGlow ${
                    isLight ? 'bg-[#e11d48] ring-white' : 'bg-[#e11d48] ring-[#0d070a]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}

              {/* Tab Icon or Profile Avatar */}
              {tab.id === 'perfil' && userAvatar ? (
                <div
                  className={`relative z-10 w-[23px] h-[23px] rounded-full overflow-hidden mb-0.5 transition-all p-0.5 border ${
                    isActive
                      ? 'border-[#e11d48] ring-2 ring-[#e11d48]/40 scale-105'
                      : isLight
                      ? 'border-gray-300 group-hover:border-[#e11d48]'
                      : 'border-[#fda4af]/40 group-hover:border-[#fda4af]'
                  }`}
                >
                  <img
                    src={userAvatar}
                    alt="Perfil"
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              ) : (
                <span
                  className={`relative z-10 material-symbols-outlined text-[22px] mb-0.5 ${
                    isActive ? 'text-[#e11d48]' : ''
                  }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>
              )}
              <span className="relative z-10 font-label-caps text-[9px] tracking-wider uppercase font-medium">
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
