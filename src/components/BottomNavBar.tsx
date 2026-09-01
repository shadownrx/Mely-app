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
      id: 'tienda',
      label: 'Tienda',
      icon: 'local_mall',
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: 'person',
    },
  ];

  return (
    // Envoltorio fixed con inset:0 puro (sin cálculos) que sí cubre el viewport real de forma
    // confiable, y centra el nav adentro con flexbox — en vez de depender de left/right +
    // margin:auto sobre el propio elemento fixed, que en la práctica seguía saliendo
    // descentrado en algunos navegadores móviles aunque la matemática fuera correcta.
    <div
      style={{
        paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
        paddingLeft: '0.75rem',
        paddingRight: '0.75rem',
      }}
      className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none"
    >
      <nav
        id="bottom-navigation-bar"
        className={`pointer-events-auto w-full max-w-[416px] rounded-[28px] border liquid-glass transition-colors duration-300 ${
          isLight
            ? 'bg-white/75 border-white/60 shadow-elevation-lg'
            : 'bg-[#0d070a]/65 border-white/10 shadow-elevation-lg'
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
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-elevation-md transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-tr from-[#e11d48] via-[#f43f5e] to-[#fb7185] text-white ring-4 ring-[#e11d48]/25 scale-110 shadow-[#e11d48]/40'
                      : isLight
                      ? 'bg-gradient-to-tr from-[#fff1f3] to-white text-[#e11d48] border-2 border-[#fecdd3] hover:scale-105 shadow-elevation-md'
                      : 'bg-gradient-to-tr from-[#220d17] to-[#14080e] text-[#fda4af] border-2 border-[#e11d48]/50 hover:scale-105 shadow-elevation-md'
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

          // Regular Tabs (Descubrir, Citas, Mensajes, Perfil) — el ícono vive en su propia
          // pastilla circular (como el botón central de Match, pero más chico) en vez de
          // resaltar todo el bloque ícono+label con una caja rectangular.
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
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-1.5 min-w-[56px] focus:outline-none"
            >
              <span className="relative flex items-center justify-center w-10 h-10 rounded-full">
                {/* Pastilla circular que se desliza entre tabs (layoutId compartido: motion
                    la anima automáticamente de una posición a otra). */}
                {isActive && (
                  <motion.div
                    layoutId="bottomNavActivePill"
                    layout="position"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#e11d48] via-[#f43f5e] to-[#fb7185] shadow-elevation-sm"
                  />
                )}

                {/* Badge for Notifications / Pending Counts */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 z-10 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white ring-2 animate-pulseGlow ${
                      isLight ? 'bg-[#e11d48] ring-white' : 'bg-[#e11d48] ring-[#0d070a]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* Tab Icon or Profile Avatar */}
                {tab.id === 'perfil' && userAvatar ? (
                  <span
                    className={`relative z-10 w-6 h-6 rounded-full overflow-hidden transition-all p-0.5 border ${
                      isActive
                        ? 'border-white/80'
                        : isLight
                        ? 'border-gray-300'
                        : 'border-[#fda4af]/40'
                    }`}
                  >
                    <img
                      src={userAvatar}
                      alt="Perfil"
                      referrerPolicy="no-referrer"
                      className="w-full h-full rounded-full object-cover"
                    />
                  </span>
                ) : (
                  <span
                    className={`relative z-10 material-symbols-outlined text-[21px] transition-colors ${
                      isActive ? 'text-white' : isLight ? 'text-[#64748b]' : 'text-[#fda4af]'
                    }`}
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {tab.icon}
                  </span>
                )}
              </span>
              <span
                className={`font-label-caps text-[9px] tracking-wider uppercase font-medium transition-colors ${
                  isActive
                    ? isLight
                      ? 'text-[#e11d48] font-bold'
                      : 'text-[#fb7185] font-bold'
                    : isLight
                    ? 'text-[#64748b]'
                    : 'text-[#fda4af] opacity-65'
                }`}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
      </nav>
    </div>
  );
};
