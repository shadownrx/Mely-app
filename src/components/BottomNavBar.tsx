import React from 'react';
import { motion } from 'motion/react';
import { TabType } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface BottomNavBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  unreadMessagesCount: number;
  newLikesCount: number;
  userAvatar?: string;
}

// Barra chata de 5 tabs (Descubrir / Me gusta / Tienda / Chats / Perfil), pegada al
// borde inferior. La Tienda volvió a la navegación principal con el mismo peso visual
// que el resto (sin botón flotante ni destacado extra): ícono + label, y el trazo rosa
// sobre una píldora translúcida cuando está activa. Citas, Matches y Ajustes siguen
// viviendo en el menú hamburguesa.
export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onTabChange,
  unreadMessagesCount,
  newLikesCount,
  userAvatar,
}) => {
  const { isLight } = useTheme();

  const tabs: {
    id: TabType;
    label: string;
    icon: string;
    badge?: number;
  }[] = [
    {
      id: 'descubrir',
      label: 'Descubrir',
      icon: 'explore',
    },
    {
      id: 'likes',
      label: 'Me gusta',
      icon: 'favorite',
      badge: newLikesCount,
    },
    {
      id: 'tienda',
      label: 'Tienda',
      icon: 'local_mall',
    },
    {
      id: 'mensajes',
      label: 'Chats',
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
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: isLight ? '#FCF9F2' : 'var(--midnight-950)',
        borderTop: `1px solid ${isLight ? 'rgba(22,34,59,0.08)' : 'var(--hairline)'}`,
      }}
      className="fixed inset-x-0 bottom-0 z-50"
    >
      <div className="flex justify-around items-stretch w-full max-w-[440px] md:max-w-[560px] min-[1280px]:max-w-[600px] mx-auto h-[78px] pb-[14px]">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                sounds.playClick();
                onTabChange(tab.id);
              }}
              className="flex flex-col items-center justify-center gap-1 flex-1 min-w-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]/50"
            >
              <span className="relative flex items-center justify-center w-10 h-7 rounded-[var(--radius-pill)]">
                {isActive && (
                  <motion.div
                    layoutId="bottomNavActivePill"
                    layout="position"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-[var(--radius-pill)]"
                    style={{
                      background: 'rgba(255, 107, 158, 0.14)',
                      border: '1px solid var(--coral-500)',
                    }}
                  />
                )}

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1 z-10 min-w-[16px] h-4 px-1 rounded-[var(--radius-pill)] text-[9px] font-bold flex items-center justify-center text-white ring-2"
                    style={{ background: 'var(--coral-600)', ringColor: isLight ? '#FCF9F2' : 'var(--midnight-950)' } as React.CSSProperties}
                  >
                    {tab.badge}
                  </span>
                )}

                {tab.id === 'perfil' && userAvatar ? (
                  <span
                    className="relative z-10 w-6 h-6 rounded-[var(--radius-pill)] overflow-hidden transition-all p-0.5 border"
                    style={{ borderColor: isActive ? 'var(--coral-500)' : isLight ? 'rgba(22,34,59,0.15)' : 'var(--hairline-strong)' }}
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
                    className="relative z-10 material-symbols-outlined text-[21px] transition-colors"
                    style={{
                      color: isActive ? 'var(--coral-500)' : isLight ? 'var(--text-on-light-muted)' : 'var(--text-secondary)',
                      fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                    }}
                  >
                    {tab.icon}
                  </span>
                )}
              </span>
              <span
                className="font-label-caps text-[9px] tracking-wider uppercase font-medium transition-colors"
                style={{
                  color: isActive ? 'var(--coral-500)' : isLight ? 'var(--text-on-light-muted)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                }}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
