import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useShop, usePurchase } from '../hooks/useShop';
import { useClaimDailyBonus, useCoinPacks, useRecharge, useRedeemCode, useWallet, useWalletHistory } from '../hooks/useWallet';
import { useWhoLikedMe } from '../hooks/useDiscover';
import { WhoLikedYouModal } from './WhoLikedYouModal';
import type { ShopItem } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Skeleton } from './ui/skeleton';

const ITEM_PRESENTATION: Record<string, { icon: string; color: string; badge?: string }> = {
  MEMBERSHIP_PREMIUM: { icon: 'workspace_premium', color: '#e11d48', badge: '👑 MEMBRESÍA' },
  MEMBERSHIP_FOUNDING: { icon: 'military_tech', color: '#ffd700', badge: '✨ VITALICIO' },
  MEMBERSHIP_VIP: { icon: 'diamond', color: '#f43f5e', badge: '💎 VIP' },
  UNDO_PASS: { icon: 'replay', color: '#fb7185' },
  EXTRA_PROFILES: { icon: 'visibility', color: '#fda4af' },
  SUPER_INVITE: { icon: 'star', color: '#ffd700' },
  REACTIVATE_MATCH: { icon: 'favorite', color: '#e11d48' },
  BOOST: { icon: 'bolt', color: '#f59e0b' },
  LIKES_UNLOCK: { icon: 'visibility', color: '#e11d48' },
};

const MOST_POPULAR_KEY = 'MEMBERSHIP_PREMIUM';

// Listas de beneficios por membresía — se mantienen a mano en el frontend (igual que
// ITEM_PRESENTATION) en vez de parsear la descripción del backend, para poder mostrarlas
// como checklist en vez de una sola oración larga.
const MEMBERSHIP_BENEFITS: Record<string, string[]> = {
  MEMBERSHIP_PREMIUM: ['Perfil siempre destacado en Descubrir', '+20 perfiles extra por día', 'Válida 2 días'],
  MEMBERSHIP_FOUNDING: ['Perfil siempre destacado en Descubrir', '+20 perfiles extra por día', 'Para siempre, no vence'],
  MEMBERSHIP_VIP: ['Perfil siempre destacado en Descubrir', 'Prácticamente sin límite diario de perfiles', 'Válida 30 días'],
};

// La duración real de cada membresía difiere entre tiers (Premium: 2 días para
// incentivar recompra frecuente; VIP: 30; Founding: para siempre) — el listShop() del
// backend no expone durationDays, así que se mantiene a mano acá igual que los beneficios.
const MEMBERSHIP_DURATION_LABEL: Record<string, string> = {
  MEMBERSHIP_PREMIUM: '2 días',
  MEMBERSHIP_FOUNDING: 'para siempre',
  MEMBERSHIP_VIP: '30 días',
};

const CONTEXTUAL_ITEMS = new Set(['SUPER_INVITE', 'REACTIVATE_MATCH']);
const CONTEXTUAL_HINT: Record<string, string> = {
  SUPER_INVITE: 'Se usa desde Descubrir, al enviar una invitación destacada.',
  REACTIVATE_MATCH: 'Se usa desde Matches, sobre un match inactivo.',
};

const STORE_TABS = [
  { id: 'membresias', label: 'Membresías', icon: 'workspace_premium' },
  { id: 'poderes', label: 'Poderes', icon: 'bolt' },
  { id: 'coins', label: 'Coins', icon: 'monetization_on' },
] as const;
type StoreTab = (typeof STORE_TABS)[number]['id'];

const tabContentVariants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
} satisfies Variants;

function minutesLeft(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 60000));
}

const REWARD_REASON_LABELS: Record<string, { icon: string; label: string }> = {
  match: { icon: 'favorite', label: 'Nuevo match' },
  conversation: { icon: 'chat_bubble', label: 'Charla iniciada' },
  date_accepted: { icon: 'event_available', label: 'Cita aceptada' },
  date_verified: { icon: 'verified', label: 'Cita verificada' },
  second_date_verified: { icon: 'workspace_premium', label: 'Segunda cita verificada' },
  daily_bonus: { icon: 'today', label: 'Bono diario' },
};

/**
 * El historial de coins venía mostrando el `reason` interno tal cual llega del server
 * (ej: "shop_BOOST", "recharge_PACK_LARGE") en vez de algo legible — y con un ícono de
 * "toll" que no tenía nada que ver con el resto de los íconos de coins/recompensas de
 * la app (monetization_on). Esto arma un ícono + texto en español a partir del reason,
 * reusando el nombre real del ítem de la tienda cuando corresponde.
 */
function describeLedgerReason(reason: string, shopItems: ShopItem[]): { icon: string; label: string } {
  if (reason in REWARD_REASON_LABELS) return REWARD_REASON_LABELS[reason];
  if (reason.startsWith('shop_refund_')) {
    const itemKey = reason.replace('shop_refund_', '');
    const item = shopItems.find((i) => i.key === itemKey);
    return { icon: 'undo', label: `Reembolso · ${item?.name ?? itemKey}` };
  }
  if (reason.startsWith('shop_')) {
    const itemKey = reason.replace('shop_', '');
    const item = shopItems.find((i) => i.key === itemKey);
    return { icon: ITEM_PRESENTATION[itemKey]?.icon ?? 'shopping_bag', label: item?.name ?? itemKey };
  }
  if (reason.startsWith('recharge_')) {
    return { icon: 'monetization_on', label: 'Recarga de coins' };
  }
  if (reason.startsWith('promo_')) {
    return { icon: 'redeem', label: `Código ${reason.replace('promo_', '')}` };
  }
  return { icon: 'receipt_long', label: reason };
}

export const StoreView: React.FC = () => {
  const { isLight } = useTheme();
  const { user, refreshUser } = useAuth();
  const { data: shopItems = [], isLoading: isLoadingShop } = useShop();
  const { data: wallet } = useWallet();
  const { data: history } = useWalletHistory();
  const { data: coinPacks = [] } = useCoinPacks();
  const { data: whoLikedMe } = useWhoLikedMe();
  const purchase = usePurchase();
  const recharge = useRecharge();
  const redeemCode = useRedeemCode();
  const claimDailyBonus = useClaimDailyBonus();

  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [whoLikedOpen, setWhoLikedOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<StoreTab>('membresias');

  const walletBalance = wallet?.balance ?? 0;
  const membershipTier = user?.membership.tier ?? 'STANDARD';
  const boostActiveMinutes = minutesLeft(user?.boostedUntil ?? null);
  const likesUnlockActiveMinutes = minutesLeft(user?.likesUnlockedUntil ?? null);
  const likesAlreadyIncluded = membershipTier !== 'STANDARD';
  const likesUnlockItem = shopItems.find((i) => i.key === 'LIKES_UNLOCK');

  const celebrate = () => {
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#e11d48', '#ff4d67', '#fb7185', '#ffd700', '#ffffff'] });
    } catch {
      // safe fallback
    }
  };

  const memberships = shopItems.filter((i) => i.key.startsWith('MEMBERSHIP_'));
  const boosts = shopItems.filter((i) => !i.key.startsWith('MEMBERSHIP_') && !CONTEXTUAL_ITEMS.has(i.key));
  const contextual = shopItems.filter((i) => CONTEXTUAL_ITEMS.has(i.key));

  const handleConfirmPurchase = () => {
    if (!selectedItem) return;
    setPurchaseError(null);
    sounds.playCoins();
    purchase.mutate(
      { itemKey: selectedItem.key },
      {
        onSuccess: () => {
          celebrate();
          setReceipt(selectedItem.name);
          setSelectedItem(null);
          // Sin esto, membresía/boost/likes quedaban comprados en el server pero la UI
          // (isCurrent, cuenta regresiva de boost, etc.) seguía mostrando el estado viejo
          // hasta el próximo refresh manual — usePurchase invalida react-query, pero
          // AuthContext.user vive aparte y necesita su propio refreshUser().
          refreshUser();
        },
        onError: (err: any) => setPurchaseError(err?.message ?? 'No se pudo completar la compra'),
      },
    );
  };

  const handleRecharge = (packKey: string) => {
    sounds.playCoins();
    recharge.mutate(packKey, {
      onSuccess: (res) => {
        celebrate();
        setReceipt(`+${res.amount} Mely Coins (demo)`);
      },
    });
  };

  const handleClaimDailyBonus = () => {
    if (claimDailyBonus.isPending) return;
    sounds.playCoins();
    claimDailyBonus.mutate(undefined, {
      onSuccess: (res) => {
        celebrate();
        toast.success(`¡Bono diario reclamado! +${res.amount} Mely Coins.`);
      },
      onError: (err: any) => toast.error(err?.message ?? 'No se pudo reclamar el bono'),
    });
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    sounds.playClick();
    redeemCode.mutate(promoCode.trim(), {
      onSuccess: (res) => {
        toast.success(`¡Código canjeado! +${res.amount} Mely Coins.`);
        setPromoCode('');
        celebrate();
      },
      onError: (err: any) => toast.error(err?.message ?? 'Código inválido'),
    });
  };

  const cardClass = isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#150a0e] border-[#e11d48]/25';

  return (
    <div className="flex flex-col gap-5 pb-12 animate-fadeIn max-w-[440px] mx-auto">
      {/* BALANCE BAR */}
      <section
        className={`relative overflow-hidden rounded-3xl p-5 border ${
          isLight
            ? 'bg-gradient-to-br from-white via-[#fff5f6] to-[#ffe4e6]/30 border-[#fecdd3] shadow-[0_4px_20px_rgba(255,77,103,0.08)]'
            : 'bg-gradient-to-br from-[#1c0b11] via-[#12070a] to-[#0a0507] border-[#e11d48]/40 shadow-[0_0_30px_rgba(225,29,72,0.18)]'
        }`}
      >
        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#e11d48] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              local_mall
            </span>
            <span className={`font-label-caps text-[10px] uppercase tracking-widest font-bold ${isLight ? 'text-[#ff4d67]' : 'text-[#fb7185]'}`}>
              TIENDA & BENEFICIOS MELY
            </span>
          </div>
          <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${isLight ? 'bg-white border-[#fecdd3] shadow-elevation-sm' : 'bg-[#090406]/95 border-[#e11d48]/30 shadow-inner'}`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] flex items-center justify-center text-white shadow-elevation-md shadow-[#e11d48]/25">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              </div>
              <div>
                <span className={`font-label-caps text-[9px] uppercase tracking-wider block font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                  TU SALDO DISPONIBLE
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className={`font-headline-md text-[22px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                    {walletBalance.toLocaleString()}
                  </span>
                  <span className="font-meta-data text-[10px] text-[#e11d48] font-bold">COINS</span>
                </div>
              </div>
            </div>
            <span className={`px-2.5 py-1 rounded-xl font-label-caps text-[9px] font-bold uppercase border ${isLight ? 'bg-[#fff1f3] border-[#fecdd3] text-[#e11d48]' : 'bg-[#e11d48]/15 border-[#e11d48]/30 text-[#fb7185]'}`}>
              {user?.membership.tierLabel ?? 'Standard'}
            </span>
          </div>
        </div>
      </section>

      {/* DAILY BONUS */}
      <div
        className={`flex items-center gap-3 p-3.5 rounded-2xl border ${
          wallet?.dailyBonusAvailable
            ? isLight
              ? 'bg-gradient-to-r from-amber-50 to-white border-amber-300'
              : 'bg-gradient-to-r from-amber-500/15 to-[#150a0e] border-amber-400/40'
            : cardClass
        }`}
      >
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 text-white shadow-elevation-md ${
            wallet?.dailyBonusAvailable ? 'bg-gradient-to-tr from-amber-400 to-amber-500' : 'bg-gradient-to-tr from-slate-400 to-slate-500'
          }`}
        >
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            {wallet?.dailyBonusAvailable ? 'today' : 'check_circle'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-headline-md text-[13.5px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
            {wallet?.dailyBonusAvailable ? 'Bono diario disponible' : 'Ya reclamaste tu bono de hoy'}
          </h4>
          <p className={`text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
            {wallet?.dailyBonusAvailable ? 'Entrá todos los días y sumá coins gratis.' : 'Volvé mañana por más.'}
          </p>
        </div>
        <Button
          variant={wallet?.dailyBonusAvailable ? 'cherry' : 'secondary'}
          size="sm"
          disabled={!wallet?.dailyBonusAvailable || claimDailyBonus.isPending}
          onClick={handleClaimDailyBonus}
          className="h-9 px-3.5 rounded-xl text-[10.5px] shrink-0"
        >
          {wallet?.dailyBonusAvailable ? 'Reclamar' : 'Mañana'}
        </Button>
      </div>

      {/* WHO LIKED YOU TEASER */}
      {whoLikedMe && whoLikedMe.count > 0 && (
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setWhoLikedOpen(true);
          }}
          className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-transform active:scale-[0.98] ${
            isLight
              ? 'bg-gradient-to-r from-[#fff1f3] to-white border-[#fecdd3]'
              : 'bg-gradient-to-r from-[#2b0c16] to-[#150a0e] border-[#e11d48]/30'
          }`}
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] flex items-center justify-center text-white shrink-0 shadow-elevation-md">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-headline-md text-[13.5px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              {whoLikedMe.count} {whoLikedMe.count === 1 ? 'persona te dio like' : 'personas te dieron like'}
            </h4>
            <p className={`text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
              {whoLikedMe.unlocked ? 'Tocá para verlas y responder' : 'Tocá para ver quiénes son'}
            </p>
          </div>
          <span className="material-symbols-outlined text-[20px] text-[#e11d48] shrink-0">chevron_right</span>
        </button>
      )}

      {isLoadingShop && shopItems.length === 0 && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}

      {/* TAB BAR — separa membresías/poderes/coins en vez de un scroll larguísimo
          mezclando decisiones muy distintas (una suscripción no es lo mismo que
          recargar coins), como hacen las tiendas de Tinder Gold/Bumble. */}
      {!isLoadingShop && (
        <div className={`flex items-center gap-1 p-1 rounded-2xl ${isLight ? 'bg-[#fff1f3]' : 'bg-[#1a0c13]'}`}>
          {STORE_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                sounds.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex-1 h-9 rounded-xl text-[11.5px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white shadow-elevation-sm'
                  : isLight
                    ? 'text-[#64748b]'
                    : 'text-[#fda4af]/70'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={tabContentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-5"
        >
          {/* MEMBERSHIPS */}
          {activeTab === 'membresias' && memberships.length > 0 && (
            <section className="flex flex-col gap-3.5">
              {memberships.map((item) => {
                const presentation = ITEM_PRESENTATION[item.key] ?? { icon: 'workspace_premium', color: '#e11d48' };
                const isCurrent = membershipTier === item.key.replace('MEMBERSHIP_', '');
                const isFeatured = item.key === MOST_POPULAR_KEY;
                const benefits = MEMBERSHIP_BENEFITS[item.key] ?? [];
                return (
                  <div
                    key={item.key}
                    className={`relative rounded-3xl p-4 flex flex-col gap-3.5 border-2 overflow-hidden ${
                      isCurrent
                        ? 'border-emerald-500'
                        : isFeatured
                          ? 'border-[#e11d48]'
                          : isLight
                            ? 'border-[#fecdd3]'
                            : 'border-[#e11d48]/20'
                    } ${
                      isFeatured && !isCurrent
                        ? isLight
                          ? 'bg-gradient-to-br from-[#fff1f3] to-white'
                          : 'bg-gradient-to-br from-[#2b0c16] to-[#150a0e]'
                        : cardClass
                    }`}
                  >
                    {isCurrent ? (
                      <span className="absolute top-0 right-0 px-3 py-1 rounded-bl-2xl text-[9px] font-bold uppercase tracking-wide bg-emerald-500 text-white flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>Tu plan
                      </span>
                    ) : isFeatured ? (
                      <span className="absolute top-0 right-0 px-3 py-1 rounded-bl-2xl text-[9px] font-bold uppercase tracking-wide bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white">
                        Más popular
                      </span>
                    ) : null}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${presentation.color}20`, color: presentation.color }}
                      >
                        <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>{presentation.icon}</span>
                      </div>
                      <div className="min-w-0">
                        <h4 className={`font-headline-md text-[16px] font-bold truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{item.name}</h4>
                        <span className="text-[11.5px] font-bold text-[#e11d48]">
                          {item.price} coins · {MEMBERSHIP_DURATION_LABEL[item.key] ?? '30 días'}
                        </span>
                        {item.priceUsd != null && (
                          <span className={`block text-[10px] ${isLight ? 'text-[#94a3b8]' : 'text-[#fda4af]/50'}`}>
                            ≈ ${item.priceUsd.toFixed(2)} USD
                          </span>
                        )}
                      </div>
                    </div>
                    <ul className="flex flex-col gap-1.5">
                      {benefits.map((benefit) => (
                        <li key={benefit} className={`flex items-center gap-2 text-[12px] ${isLight ? 'text-[#475569]' : 'text-[#fda4af]/85'}`}>
                          <span className="material-symbols-outlined text-[15px] text-emerald-500 shrink-0">check_circle</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={isCurrent ? 'secondary' : 'cherry'}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedItem(item);
                      }}
                      disabled={isCurrent}
                      className="w-full rounded-xl"
                    >
                      {isCurrent ? 'Tu plan actual' : `Obtener por ${item.price} coins`}
                    </Button>
                  </div>
                );
              })}
            </section>
          )}

          {/* PODERES + contextuales */}
          {activeTab === 'poderes' && (
            <section className="flex flex-col gap-3.5">
              {boosts.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {boosts.map((item) => {
                    const presentation = ITEM_PRESENTATION[item.key] ?? { icon: 'bolt', color: '#e11d48' };
                    const isBoostActive = item.key === 'BOOST' && boostActiveMinutes > 0;
                    const isLikesActive = item.key === 'LIKES_UNLOCK' && (likesAlreadyIncluded || likesUnlockActiveMinutes > 0);
                    const isActive = isBoostActive || isLikesActive;
                    return (
                      <div key={item.key} className={`rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 border ${cardClass}`}>
                        <div>
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                            style={{ backgroundColor: `${presentation.color}20`, color: presentation.color }}
                          >
                            <span className="material-symbols-outlined text-[20px]">{presentation.icon}</span>
                          </div>
                          <h4 className={`font-headline-md text-[13px] font-bold leading-snug ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{item.name}</h4>
                          <p className={`text-[10.5px] leading-snug mt-0.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>{item.description}</p>
                        </div>
                        <Button
                          variant={isActive ? 'secondary' : 'cherry'}
                          size="sm"
                          disabled={isActive}
                          onClick={() => {
                            sounds.playClick();
                            setSelectedItem(item);
                          }}
                          className="h-auto px-2.5 py-1.5 rounded-xl text-[9.5px] tracking-wider"
                        >
                          {isBoostActive
                            ? `Activo · ${boostActiveMinutes}m`
                            : isLikesActive
                              ? likesAlreadyIncluded
                                ? 'Incluido'
                                : `Activo · ${likesUnlockActiveMinutes}m`
                              : `${item.price} coins`}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {contextual.length > 0 && (
                <div className="flex flex-col gap-2">
                  {contextual.map((item) => {
                    const presentation = ITEM_PRESENTATION[item.key] ?? { icon: 'info', color: '#e11d48' };
                    return (
                      <div key={item.key} className={`rounded-2xl p-3 flex items-center gap-3 border border-dashed ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#14080d] border-[#e11d48]/30'}`}>
                        <span className="material-symbols-outlined text-[20px] shrink-0" style={{ color: presentation.color }}>{presentation.icon}</span>
                        <div className="min-w-0">
                          <span className={`font-label-caps text-[10px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                            {item.name} · {item.price} coins
                          </span>
                          <p className={`text-[10.5px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>{CONTEXTUAL_HINT[item.key]}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* COIN PACKS (demo) */}
          {activeTab === 'coins' && (
            <section className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1">
                <h3 className={`font-label-caps text-[11px] uppercase font-bold tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
                  Monedas Mely
                </h3>
                <span className="font-label-caps text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  MODO DEMO · SIN COBRO REAL
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {coinPacks.map((pack, idx) => {
                  const isBiggest = idx === coinPacks.length - 1 && coinPacks.length > 1;
                  return (
                    <div key={pack.key} className={`relative rounded-2xl p-3.5 flex flex-col items-center gap-2 border ${cardClass}`}>
                      {isBiggest && (
                        <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded-full text-[7.5px] font-bold uppercase tracking-wide bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-elevation-sm z-10">
                          Más coins
                        </span>
                      )}
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] flex items-center justify-center text-white shadow-elevation-sm">
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
                      </div>
                      <span className={`font-headline-md text-[16px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{pack.coins.toLocaleString()}</span>
                      <span className={`text-[9.5px] text-center -mt-1.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>{pack.label}</span>
                      <Button
                        variant="cherry"
                        size="sm"
                        onClick={() => handleRecharge(pack.key)}
                        disabled={recharge.isPending}
                        className="w-full h-8 rounded-xl text-[10.5px]"
                      >
                        ${pack.priceUsd.toFixed(2)}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>

      {/* PROMO CODE */}
      <section className={`p-4 rounded-2xl border flex flex-col gap-2.5 ${cardClass}`}>
        <span className={`font-label-caps text-[10px] uppercase font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
          ¿Tenés un código promocional?
        </span>
        <form onSubmit={handleRedeem} className="flex gap-2">
          <Input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Ej: MELY2026"
            className="flex-1 font-mono text-[12px] tracking-wide"
          />
          <Button type="submit" variant="cherry" disabled={redeemCode.isPending} className="rounded-xl">
            Canjear
          </Button>
        </form>
      </section>

      {/* RECENT MOVEMENTS */}
      {history && history.entries.length > 0 && (
        <section className="flex flex-col gap-2">
          <h3 className={`font-label-caps text-[11px] uppercase font-bold tracking-wider px-1 ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
            Movimientos recientes
          </h3>
          <div className={`rounded-2xl border divide-y ${isLight ? 'bg-white border-[#fecdd3] divide-[#fecdd3]' : 'bg-[#150a0e] border-[#e11d48]/25 divide-[#e11d48]/15'}`}>
            {history.entries.slice(0, 6).map((entry) => {
              const described = describeLedgerReason(entry.reason, shopItems);
              return (
                <div key={entry.id} className="p-3 flex items-center gap-2.5 text-[11px]">
                  <span
                    className={`material-symbols-outlined text-[16px] shrink-0 ${entry.direction === 'CREDIT' ? 'text-emerald-500' : 'text-[#e11d48]'}`}
                  >
                    {described.icon}
                  </span>
                  <span className={`flex-1 min-w-0 truncate ${isLight ? 'text-[#475569]' : 'text-[#fda4af]/80'}`}>{described.label}</span>
                  <span className={`font-mono font-bold shrink-0 ${entry.direction === 'CREDIT' ? 'text-emerald-500' : 'text-[#e11d48]'}`}>
                    {entry.direction === 'CREDIT' ? '+' : '-'}{entry.amount}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PURCHASE CONFIRMATION MODAL */}
      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[390px] p-0 gap-0 overflow-hidden">
          {selectedItem && (
            <>
              <DialogHeader className={`p-4 border-b flex-row items-center space-y-0 ${isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-gradient-to-r from-[#2b0c16] to-[#170a0f] border-[#e11d48]/30'}`}>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#e11d48] text-[22px]">shopping_bag</span>
                  <h3 className={`font-headline-md text-[16px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>Confirmar Compra</h3>
                </div>
              </DialogHeader>
              <div className="p-5 flex flex-col gap-4">
                <div className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0e0508] border-[#e11d48]/30'}`}>
                  <div className="min-w-0 flex-1">
                    <h4 className={`font-headline-md text-[16px] font-bold truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{selectedItem.name}</h4>
                    <p className={`text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fca5a5]/80'}`}>{selectedItem.description}</p>
                  </div>
                </div>
                <div className={`p-3 rounded-xl border flex justify-between items-center text-[12px] ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0e0508] border-[#e11d48]/20'}`}>
                  <span className={isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}>Total a pagar:</span>
                  <span className="font-headline-md text-[16px] font-bold text-[#e11d48]">{selectedItem.price} Mely Coins</span>
                </div>
                {walletBalance < selectedItem.price && (
                  <p className="text-[11px] text-[#e11d48] font-bold">No te alcanzan los coins. Recargá desde Monedas Mely.</p>
                )}
                {purchaseError && <p className="text-[11px] text-[#e11d48] font-bold">{purchaseError}</p>}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button type="button" variant="secondary" onClick={() => setSelectedItem(null)}>
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="cherry"
                    onClick={handleConfirmPurchase}
                    disabled={purchase.isPending || walletBalance < selectedItem.price}
                    className="gap-1"
                  >
                    <span>Confirmar</span>
                    <span className="material-symbols-outlined text-[15px]">done</span>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* RECEIPT */}
      <Dialog open={Boolean(receipt)} onOpenChange={(open) => !open && setReceipt(null)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[380px] text-center flex flex-col items-center gap-4 border-2 border-[#e11d48]/60">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] flex items-center justify-center text-white shadow-xl">
            <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
          </div>
          <div>
            <span className="font-label-caps text-[10px] text-[#e11d48] uppercase tracking-widest font-bold block">¡ACTIVACIÓN EXITOSA!</span>
            <h3 className={`font-headline-md text-[18px] font-bold mt-1 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{receipt}</h3>
            <p className={`font-body-sm text-[12px] mt-1 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>Ya está disponible en tu cuenta.</p>
          </div>
          <Button
            variant="cherry"
            onClick={() => {
              sounds.playClick();
              setReceipt(null);
            }}
            className="w-full"
          >
            Continuar
          </Button>
        </DialogContent>
      </Dialog>

      <WhoLikedYouModal
        open={whoLikedOpen}
        onOpenChange={setWhoLikedOpen}
        likesUnlockPrice={likesUnlockItem?.price ?? 60}
      />
    </div>
  );
};
