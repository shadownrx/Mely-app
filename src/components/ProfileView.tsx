import React, { useState } from 'react';
import { Profile, Stamp, Transaction } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Switch } from './ui/switch';

interface ProfileViewProps {
  user: Profile;
  stamps: Stamp[];
  transactions: Transaction[];
  walletBalance: number;
  onBuyPack: (pts: number, price: string, name: string) => void;
  onSelectStamp: (stamp: Stamp) => void;
  onOpenSettings: (type: 'personal' | 'security' | 'preferences') => void;
  onOpenFullSettings?: () => void;
  onOpenStore?: () => void;
  onToggleDiscovery: (enabled: boolean) => void;
  discoveryEnabled: boolean;
  onSignOut: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  stamps,
  transactions,
  walletBalance,
  onBuyPack,
  onSelectStamp,
  onOpenSettings,
  onOpenFullSettings,
  onOpenStore,
  onToggleDiscovery,
  discoveryEnabled,
  onSignOut,
}) => {
  const { isLight } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<'passport_vault' | 'settings'>('passport_vault');
  const unlockedStampsCount = stamps.filter((s) => s.unlocked).length;
  const progressPercent = Math.min(100, Math.round((unlockedStampsCount / stamps.length) * 100));

  return (
    <div className="flex flex-col gap-6 pb-6 animate-fadeIn">
      {/* Profile Hero Ticket */}
      <section
        className={`rounded-3xl p-6 border relative overflow-hidden flex flex-col items-center ticket-edge-bottom shadow-2xl ${
          isLight
            ? 'bg-white border-[#fecdd3] shadow-[0_10px_30px_rgba(225,29,72,0.08)]'
            : 'bg-[#140b0f] border-[#e11d48]/30 shadow-2xl'
        }`}
      >
        {/* Security Tint Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#e11d48 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* View Switcher Pill */}
        <div
          className={`flex items-center gap-1 p-1 rounded-full border mb-5 relative z-10 ${
            isLight
              ? 'bg-[#fff5f6] border-[#fecdd3]'
              : 'bg-[#0b0507]/90 border-[#e11d48]/30'
          }`}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('passport_vault');
            }}
            className={`px-3.5 py-1.5 h-auto rounded-full font-label-caps text-[10px] tracking-wider uppercase transition-all ${
              activeSubTab === 'passport_vault'
                ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold shadow-md shadow-[#e11d48]/30 hover:text-white'
                : isLight
                ? 'text-[#64748b] hover:text-[#0f172a]'
                : 'text-[#fda4af] opacity-70 hover:opacity-100'
            }`}
          >
            Pasaporte & Bóveda
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              sounds.playClick();
              setActiveSubTab('settings');
            }}
            className={`px-3.5 py-1.5 h-auto rounded-full font-label-caps text-[10px] tracking-wider uppercase transition-all ${
              activeSubTab === 'settings'
                ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold shadow-md shadow-[#e11d48]/30 hover:text-white'
                : isLight
                ? 'text-[#64748b] hover:text-[#0f172a]'
                : 'text-[#fda4af] opacity-70 hover:opacity-100'
            }`}
          >
            Ajustes de Cuenta
          </Button>
        </div>

        {/* Profile Avatar */}
        <div
          className={`relative w-24 h-24 rounded-full overflow-hidden mb-3 border-2 p-1 shadow-md ${
            isLight
              ? 'border-[#e11d48] bg-[#fff5f6]'
              : 'border-[#e11d48] bg-[#0b0507] shadow-[0_0_20px_rgba(225,29,72,0.35)]'
          }`}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-full h-full object-cover rounded-full"
            referrerPolicy="no-referrer"
          />
        </div>

        <h2 className={`font-headline-md text-[24px] font-bold mb-0.5 tracking-tight text-center ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
          {user.name}
        </h2>
        <p className="font-meta-data text-[11px] text-[#e11d48] uppercase tracking-widest mb-6 font-bold">
          {user.membership}
        </p>

        {/* Quick Stats Ticket Perforation Line */}
        <div
          className={`flex justify-between items-center w-full border-t pt-5 perforation-line ${
            isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/30'
          }`}
        >
          <div className="flex flex-col items-center flex-1">
            <span className={`font-label-caps text-[10px] uppercase tracking-wider mb-0.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
              Passport
            </span>
            <span className="font-body-sm text-[13px] font-bold text-[#e11d48]">
              {user.passType}
            </span>
          </div>

          <div className={`h-7 w-px ${isLight ? 'bg-[#fecdd3]' : 'bg-[#e11d48]/30'}`} />

          <div className="flex flex-col items-center flex-1">
            <span className={`font-label-caps text-[10px] uppercase tracking-wider mb-0.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
              Wallet
            </span>
            <span className={`font-body-sm text-[13px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              {walletBalance.toLocaleString()} PTS
            </span>
          </div>

          <div className={`h-7 w-px ${isLight ? 'bg-[#fecdd3]' : 'bg-[#e11d48]/30'}`} />

          <div className="flex flex-col items-center flex-1">
            <span className={`font-label-caps text-[10px] uppercase tracking-wider mb-0.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
              Joined
            </span>
            <span className={`font-meta-data text-[12px] ${isLight ? 'text-[#334155]' : 'text-[#fce7eb]'}`}>
              {user.joined}
            </span>
          </div>
        </div>
      </section>

      {activeSubTab === 'passport_vault' ? (
        <>
          {/* SECTION: PASSPORT */}
          <section className="flex flex-col gap-4 relative">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <h2 className={`font-headline-md text-[22px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  Pasaporte de Conexiones
                </h2>
                <span className={`font-meta-data text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
                  {unlockedStampsCount} de {stamps.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex-1 h-2 rounded-full overflow-hidden border ${isLight ? 'bg-gray-100 border-[#fecdd3]' : 'bg-[#1c0b12] border-[#e11d48]/20'}`}>
                  <div
                    className="h-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Stamps Grid Container */}
            <div
              className={`p-5 rounded-3xl border grid grid-cols-3 gap-4 sm:gap-6 ${
                isLight
                  ? 'bg-white border-[#fecdd3] shadow-sm'
                  : 'bg-[#0b0507] border-[#e11d48]/25 shadow-[inset_0_4px_24px_rgba(0,0,0,0.8)]'
              }`}
            >
              {stamps.map((stamp) => {
                if (stamp.unlocked) {
                  return (
                    <button
                      key={stamp.id}
                      id={`stamp-btn-${stamp.id}`}
                      onClick={() => {
                        sounds.playStamp();
                        onSelectStamp(stamp);
                      }}
                      className="flex flex-col items-center gap-2 group focus:outline-none"
                      title={`Ver recuerdo de ${stamp.title}`}
                    >
                      <div
                        className={`w-16 h-16 rounded-full border-2 text-[#e11d48] flex items-center justify-center stamp-ink relative group-hover:scale-105 transition-transform ${
                          isLight
                            ? 'border-[#e11d48] bg-[#fff5f6] shadow-sm'
                            : 'border-[#e11d48] bg-[#1c0c13]/80 shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                        }`}
                        style={{
                          transform: `rotate(${stamp.rotation}deg)`,
                        }}
                      >
                        <div className="absolute inset-1 border border-[#e11d48]/30 rounded-full" />
                        <span
                          className="material-symbols-outlined text-[26px] text-[#e11d48]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {stamp.iconName}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className={`font-label-caps text-[10px] block uppercase tracking-wider font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                          {stamp.title}
                        </span>
                        <span className={`font-meta-data text-[9px] block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                          {stamp.date}
                        </span>
                      </div>
                    </button>
                  );
                }

                // Locked stamp slot
                return (
                  <button
                    key={stamp.id}
                    id={`stamp-btn-locked-${stamp.id}`}
                    onClick={() => {
                      sounds.playClick();
                      onSelectStamp(stamp);
                    }}
                    className="flex flex-col items-center gap-2 opacity-40 hover:opacity-75 transition-opacity focus:outline-none"
                    title="Sello bloqueado"
                  >
                    <div
                      className={`w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center ${
                        isLight
                          ? 'border-[#fecdd3] text-[#64748b] bg-gray-50'
                          : 'border-[#e11d48]/40 text-[#fda4af] bg-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[22px]">lock</span>
                    </div>
                    <div className="text-center">
                      <span className={`font-label-caps text-[9px] block uppercase tracking-wider ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]'}`}>
                        {stamp.title}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* SECTION: WALLET (Bóveda Personal) */}
          <section className="flex flex-col gap-4 relative mt-2">
            <div className="flex justify-between items-center">
              <h2 className={`font-headline-md text-[22px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                Bóveda Personal
              </h2>
              <span className="font-label-caps text-[9px] text-[#e11d48] bg-[#fff1f3] px-2.5 py-0.5 rounded-full border border-[#fecdd3] uppercase font-bold">
                PTS Mely
              </span>
            </div>

            {/* Balance Card */}
            <div
              className={`rounded-3xl p-6 border relative overflow-hidden shadow-2xl ${
                isLight
                  ? 'bg-gradient-to-br from-white to-[#fff5f6] border-[#fecdd3]'
                  : 'bg-gradient-to-br from-[#1c0d13] to-[#10070a] border-[#e11d48]/35'
              }`}
            >
              <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#e11d48]/15 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col items-center text-center gap-1.5 relative z-10">
                <span className={`font-label-caps text-[11px] tracking-widest uppercase font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]'}`}>
                  BALANCE ACTUAL
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span
                    className="material-symbols-outlined text-[#e11d48] text-[36px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    monetization_on
                  </span>
                  <span className={`font-display-lg text-[36px] leading-[42px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#fb7185] to-[#fff1f2]'}`}>
                    {walletBalance.toLocaleString()}
                  </span>
                </div>
                <span className={`font-meta-data text-[10px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                  Equivalente a ${(walletBalance / 100).toFixed(2)} USD en beneficios
                </span>

                {onOpenStore && (
                  <Button
                    size="sm"
                    onClick={() => {
                      sounds.playClick();
                      onOpenStore();
                    }}
                    className="mt-2.5 h-8 px-4 rounded-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10.5px] uppercase font-bold tracking-wider shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">local_mall</span>
                    <span>Explorar Tienda & Perks</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Coin Packs */}
            <div className="grid grid-cols-2 gap-3.5">
              {/* Option 1: 500 pts */}
              <button
                id="buy-pack-500"
                onClick={() => {
                  sounds.playCoins();
                  onBuyPack(500, '$4.99', 'Pack Esencial');
                }}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border transition-all active:translate-y-0.5 group focus:outline-none shadow-sm ${
                  isLight
                    ? 'bg-white border-[#fecdd3] hover:bg-[#fff5f6] hover:border-[#e11d48]'
                    : 'bg-[#140b0f] border-[#e11d48]/25 hover:bg-[#1f0e16] hover:border-[#e11d48]/60'
                }`}
              >
                <span className="material-symbols-outlined text-[#e11d48] text-[26px] group-hover:scale-110 transition-transform">
                  toll
                </span>
                <span className={`font-headline-md text-[18px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  500
                </span>
                <span className="font-meta-data text-[12px] text-[#e11d48] font-bold">
                  $4.99
                </span>
              </button>

              {/* Option 2: 1,200 pts */}
              <button
                id="buy-pack-1200"
                onClick={() => {
                  sounds.playCoins();
                  onBuyPack(1200, '$9.99', 'Pack Popular');
                }}
                className={`flex flex-col items-center gap-1.5 p-4 rounded-2xl border relative overflow-hidden transition-all active:translate-y-0.5 group focus:outline-none shadow-md ${
                  isLight
                    ? 'bg-white border-[#e11d48] hover:bg-[#fff5f6]'
                    : 'bg-[#140b0f] border-[#e11d48] hover:bg-[#1f0e16]'
                }`}
              >
                <div className="absolute top-0 w-full bg-[#e11d48] text-white font-label-caps text-[8px] py-0.5 text-center uppercase tracking-widest font-bold">
                  Popular
                </div>
                <span
                  className="material-symbols-outlined text-[#e11d48] text-[28px] mt-2 group-hover:scale-110 transition-transform"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  paid
                </span>
                <span className={`font-headline-md text-[18px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  1,200
                </span>
                <span className="font-meta-data text-[12px] text-[#e11d48] font-bold">
                  $9.99
                </span>
              </button>
            </div>

            {/* Transaction History (Receipt Style) */}
            <div
              className={`rounded-2xl p-5 font-meta-data text-[11px] border relative shadow-lg ${
                isLight
                  ? 'bg-white text-[#0f172a] border-[#fecdd3]'
                  : 'bg-[#0b0507] text-[#fce7eb] border-[#e11d48]/25'
              }`}
            >
              <div className="flex flex-col gap-3.5">
                <div className={`text-center border-b border-dashed pb-3 mb-1 ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/30'}`}>
                  <span className={`block text-[13px] font-bold tracking-widest uppercase ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                    === RECIBO ===
                  </span>
                  <span className="block text-[#e11d48] text-[10px] uppercase font-bold">
                    HISTORIAL DE TRANSACCIONES
                  </span>
                  <span className={`block text-[9px] ${isLight ? 'text-gray-400' : 'text-[#fda4af]/60'}`}>
                    Terminal: MELY-049 • ID: {user.id.slice(0, 8)}
                  </span>
                </div>

                {/* Receipt Items */}
                {transactions.map((tx) => {
                  const isPositive = tx.amount > 0;
                  return (
                    <div
                      key={tx.id}
                      className={`flex justify-between items-end border-b border-dotted pb-1.5 ${
                        isLight ? 'border-gray-200' : 'border-[#e11d48]/20'
                      }`}
                    >
                      <div className="max-w-[70%]">
                        <span className={`block font-medium leading-tight ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                          {tx.description}
                        </span>
                        <span className={`text-[9px] block mt-0.5 ${isLight ? 'text-gray-400' : 'text-[#fda4af]/60'}`}>
                          {tx.date}
                        </span>
                      </div>
                      <span
                        className={`font-bold font-meta-data text-[12px] ${
                          isPositive ? 'text-[#10b981]' : 'text-[#e11d48]'
                        }`}
                      >
                        {isPositive ? `+ ${tx.amount}` : `- ${Math.abs(tx.amount)}`}
                      </span>
                    </div>
                  );
                })}

                <div className={`mt-2 text-center text-[9px] tracking-wider ${isLight ? 'text-gray-400' : 'text-[#fda4af]/60'}`}>
                  *** FIN DEL REPORTE ***
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        /* Settings Groups */
        <section className="flex flex-col gap-5">
          {/* Full Settings Panel Launcher */}
          <div
            className={`p-4 rounded-3xl border shadow-lg flex items-center justify-between ${
              isLight
                ? 'bg-[#fff5f6] border-[#fecdd3]'
                : 'bg-gradient-to-r from-[#1c0d13] to-[#14080d] border-[#e11d48]/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e11d48]/15 border border-[#e11d48]/30 text-[#e11d48] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">settings</span>
              </div>
              <div>
                <span className={`font-headline-md text-[14px] font-bold block ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  Panel Completo de Ajustes
                </span>
                <span className={`font-meta-data text-[10px] block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                  Temas, criptografía, cupones, audio háptico y filtros
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenFullSettings?.();
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white rounded-xl font-label-caps text-[9px] uppercase font-bold tactile-btn shadow-md hover:opacity-90 flex items-center gap-1"
            >
              <span>Abrir</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Account Section */}
          <div className="flex flex-col gap-3">
            <h3 className={`font-label-caps text-[10px] uppercase tracking-widest border-b pb-1.5 font-bold ${isLight ? 'text-[#e11d48] border-[#fecdd3]' : 'text-[#fda4af] border-[#e11d48]/20'}`}>
              Account
            </h3>
            <div
              className={`rounded-2xl border divide-y overflow-hidden shadow-md ${
                isLight
                  ? 'bg-white border-[#fecdd3] divide-gray-100'
                  : 'bg-[#140b0f] border-[#e11d48]/25 divide-[#e11d48]/15'
              }`}
            >
              <button
                id="btn-personal-info"
                onClick={() => {
                  sounds.playClick();
                  onOpenSettings('personal');
                }}
                className={`w-full flex items-center justify-between p-4 transition-colors text-left focus:outline-none ${
                  isLight ? 'hover:bg-[#fff5f6]' : 'hover:bg-white/5'
                }`}
              >
                <div className={`flex items-center gap-3 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  <span className="material-symbols-outlined text-[20px] text-[#e11d48]">
                    person
                  </span>
                  <span className="font-body-sm text-[14px]">
                    Personal Information
                  </span>
                </div>
                <span className={`material-symbols-outlined text-[18px] ${isLight ? 'text-gray-400' : 'text-[#fda4af]/50'}`}>
                  chevron_right
                </span>
              </button>

              <button
                id="btn-security-privacy"
                onClick={() => {
                  sounds.playClick();
                  onOpenSettings('security');
                }}
                className={`w-full flex items-center justify-between p-4 transition-colors text-left focus:outline-none ${
                  isLight ? 'hover:bg-[#fff5f6]' : 'hover:bg-white/5'
                }`}
              >
                <div className={`flex items-center gap-3 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  <span className="material-symbols-outlined text-[20px] text-[#e11d48]">
                    lock
                  </span>
                  <span className="font-body-sm text-[14px]">
                    Security & Privacy
                  </span>
                </div>
                <span className={`material-symbols-outlined text-[18px] ${isLight ? 'text-gray-400' : 'text-[#fda4af]/50'}`}>
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* Discovery Section */}
          <div className="flex flex-col gap-3">
            <h3 className={`font-label-caps text-[10px] uppercase tracking-widest border-b pb-1.5 font-bold ${isLight ? 'text-[#e11d48] border-[#fecdd3]' : 'text-[#fda4af] border-[#e11d48]/20'}`}>
              Discovery
            </h3>
            <div
              className={`rounded-2xl border divide-y overflow-hidden shadow-md ${
                isLight
                  ? 'bg-white border-[#fecdd3] divide-gray-100'
                  : 'bg-[#140b0f] border-[#e11d48]/25 divide-[#e11d48]/15'
              }`}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex flex-col pr-4">
                  <span className={`font-body-sm text-[14px] font-medium mb-0.5 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                    Show me on MELY
                  </span>
                  <span className={`font-meta-data text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                    Allow others to find your profile
                  </span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={discoveryEnabled}
                    onChange={(e) => {
                      sounds.playClick();
                      onToggleDiscovery(e.target.checked);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6 bg-gray-200 dark:bg-[#2a1019] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e11d48] peer-checked:after:border-white shadow-inner" />
                </label>
              </div>

              <button
                id="btn-discovery-prefs"
                onClick={() => {
                  sounds.playClick();
                  onOpenSettings('preferences');
                }}
                className={`w-full flex items-center justify-between p-4 transition-colors text-left focus:outline-none ${
                  isLight ? 'hover:bg-[#fff5f6]' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`font-body-sm text-[14px] font-medium mb-0.5 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                    Discovery Preferences
                  </span>
                  <span className="font-meta-data text-[11px] text-[#e11d48]">
                    Global filters active (25-35 yrs • 15 km)
                  </span>
                </div>
                <span className={`material-symbols-outlined text-[18px] ${isLight ? 'text-gray-400' : 'text-[#fda4af]/50'}`}>
                  chevron_right
                </span>
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-2">
            <button
              id="btn-sign-out"
              onClick={() => {
                sounds.playClick();
                onSignOut();
              }}
              className="w-full py-3.5 text-center border border-[#e11d48]/40 rounded-2xl text-[#e11d48] font-body-sm text-[14px] font-bold hover:bg-[#e11d48]/10 transition-colors tactile-btn active:translate-y-0.5 focus:outline-none"
            >
              Cerrar Sesión (Sign Out)
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
