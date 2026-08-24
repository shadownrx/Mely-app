import React from 'react';
import { TabType } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { NotificationBell } from './NotificationBell';

interface TopAppBarProps {
  currentTab: TabType;
  walletBalance: number;
  onTabChange: (tab: TabType) => void;
  onOpenMenu: () => void;
  customTitle?: string;
  customSubtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  walletBalance,
  onTabChange,
  onOpenMenu,
  customTitle,
  customSubtitle,
  showBackButton = false,
  onBack,
}) => {
  const { theme, isLight, toggleTheme } = useTheme();

  return (
    <header
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
      className={`fixed top-0 w-full z-50 transition-colors duration-200 border-b backdrop-blur-md ${
        isLight
          ? 'bg-white/95 border-[#ffe4e6] shadow-sm'
          : 'bg-[#0d070a]/90 border-[#e11d48]/20 shadow-lg'
      }`}
    >
      <div className="flex justify-between items-center h-16 px-3 max-w-[440px] mx-auto gap-2">
        {/* Left Action (Back or Menu) */}
        {showBackButton ? (
          <Button
            id="top-back-btn"
            variant="ghost"
            size="icon"
            onClick={() => {
              sounds.playClick();
              onBack?.();
            }}
            className={`rounded-full transition-colors ${
              isLight
                ? 'text-[#0f172a] hover:text-[#e11d48] hover:bg-[#fff1f3]'
                : 'text-[#fda4af] hover:text-[#e11d48] hover:bg-white/5'
            }`}
            aria-label="Volver"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Button>
        ) : (
          <Button
            id="top-menu-btn"
            variant="ghost"
            size="icon"
            onClick={() => {
              sounds.playClick();
              onOpenMenu();
            }}
            className={`rounded-full transition-colors ${
              isLight
                ? 'text-[#0f172a] hover:text-[#e11d48] hover:bg-[#fff1f3]'
                : 'text-[#fda4af] hover:text-[#e11d48] hover:bg-white/5'
            }`}
            aria-label="Menú principal"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </Button>
        )}

        {/* Brand Center */}
        <div
          className="flex flex-col items-center justify-center cursor-pointer select-none"
          onClick={() => onTabChange('descubrir')}
        >
          <h1
            className={`font-headline-md text-[21px] tracking-[0.25em] uppercase font-black transition-all ${
              isLight
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#ff4d67] via-[#e11d48] to-[#fb7185] drop-shadow-sm'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-[#fb7185] via-[#e11d48] to-[#fda4af] drop-shadow-[0_2px_10px_rgba(225,29,72,0.3)]'
            }`}
          >
            {customTitle || 'MELY'}
          </h1>
          {customSubtitle && (
            <span
              className={`font-label-caps text-[8px] tracking-widest uppercase -mt-0.5 font-bold ${
                isLight ? 'text-[#ff4d67]' : 'text-[#fca5a5]/80'
              }`}
            >
              {customSubtitle}
            </span>
          )}
        </div>

        {/* Right Actions: Notifications, Theme Selector & Wallet Balance */}
        <div className="flex items-center gap-1.5">
          <NotificationBell />

          {/* Direct Theme Switcher Button */}
          <Button
            id="theme-direct-toggle-btn"
            variant="outline"
            size="sm"
            onClick={() => {
              sounds.playClick();
              toggleTheme();
            }}
            title={
              isLight
                ? 'Cambiar a modo Obsidiana & Cereza'
                : 'Cambiar a modo Blanco & Coral'
            }
            className={`px-2 py-1 h-8 rounded-2xl flex items-center gap-1 font-label-caps text-[10px] font-bold uppercase transition-all duration-200 tactile-btn border active:scale-95 ${
              isLight
                ? 'bg-[#fff1f3] text-[#e11d48] border-[#fecdd3] hover:bg-[#ffe4e6] shadow-sm'
                : 'bg-[#1c0b11] text-[#fda4af] border-[#e11d48]/40 hover:text-white'
            }`}
          >
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isLight ? 'wb_sunny' : 'dark_mode'}
            </span>
            <span className="hidden sm:inline text-[9px] tracking-wider">
              {isLight ? 'Coral' : 'Noir'}
            </span>
          </Button>

          {/* Wallet Balance */}
          <Button
            id="top-wallet-btn"
            variant="outline"
            size="sm"
            onClick={() => {
              sounds.playCoins();
              onTabChange('tienda');
            }}
            className={`relative h-8 px-2.5 rounded-2xl active:scale-95 flex items-center gap-1.5 group border transition-all duration-200 ${
              isLight
                ? 'bg-[#ffffff] text-[#0f172a] border-[#fecdd3] hover:border-[#e11d48] shadow-sm'
                : 'bg-[#1c0b11] text-[#fda4af] hover:text-[#fb7185] border-[#e11d48]/30 shadow-md'
            }`}
            aria-label="Tienda y saldo Mely Coins"
            title="Ver Tienda & Monedas"
          >
            <span
              className="material-symbols-outlined text-[18px] text-[#e11d48] group-hover:scale-110 transition-transform"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              monetization_on
            </span>
            <span
              className={`font-meta-data text-[11px] font-bold px-0.5 ${
                isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'
              }`}
            >
              {walletBalance.toLocaleString()}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
};
