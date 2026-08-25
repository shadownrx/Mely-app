import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useShop, usePurchase } from '../hooks/useShop';
import { useCoinPacks, useRecharge, useRedeemCode, useWallet, useWalletHistory } from '../hooks/useWallet';
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
};

const CONTEXTUAL_ITEMS = new Set(['SUPER_INVITE', 'REACTIVATE_MATCH']);
const CONTEXTUAL_HINT: Record<string, string> = {
  SUPER_INVITE: 'Se usa desde Descubrir, al enviar una invitación destacada.',
  REACTIVATE_MATCH: 'Se usa desde Matches, sobre un match inactivo.',
};

export const StoreView: React.FC = () => {
  const { isLight } = useTheme();
  const { user } = useAuth();
  const { data: shopItems = [], isLoading: isLoadingShop } = useShop();
  const { data: wallet } = useWallet();
  const { data: history } = useWalletHistory();
  const { data: coinPacks = [] } = useCoinPacks();
  const purchase = usePurchase();
  const recharge = useRecharge();
  const redeemCode = useRedeemCode();

  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [receipt, setReceipt] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  const walletBalance = wallet?.balance ?? 0;
  const membershipTier = user?.membership.tier ?? 'STANDARD';

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
          <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${isLight ? 'bg-white border-[#fecdd3] shadow-sm' : 'bg-[#090406]/95 border-[#e11d48]/30 shadow-inner'}`}>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] flex items-center justify-center text-white shadow-lg shadow-[#e11d48]/25">
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

      {isLoadingShop && shopItems.length === 0 && (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      )}

      {/* MEMBERSHIPS */}
      {memberships.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h3 className={`font-label-caps text-[11px] uppercase font-bold tracking-wider px-1 ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
            Membresías
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {memberships.map((item) => {
              const presentation = ITEM_PRESENTATION[item.key] ?? { icon: 'workspace_premium', color: '#e11d48' };
              const isCurrent = membershipTier === item.key.replace('MEMBERSHIP_', '');
              return (
                <div key={item.key} className={`relative rounded-2xl p-4 flex items-center justify-between gap-3 border ${cardClass} ${isCurrent ? 'ring-2 ring-[#e11d48]' : ''}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${presentation.color}20`, color: presentation.color }}
                    >
                      <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>{presentation.icon}</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className={`font-headline-md text-[14px] font-bold truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{item.name}</h4>
                      <p className={`text-[11px] leading-snug ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>{item.description}</p>
                    </div>
                  </div>
                  <Button
                    variant={isCurrent ? 'secondary' : 'cherry'}
                    size="sm"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedItem(item);
                    }}
                    disabled={isCurrent}
                    className="shrink-0 rounded-xl"
                  >
                    {isCurrent ? 'Activa' : `${item.price} coins`}
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* BOOSTS */}
      {boosts.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h3 className={`font-label-caps text-[11px] uppercase font-bold tracking-wider px-1 ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
            Poderes
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {boosts.map((item) => {
              const presentation = ITEM_PRESENTATION[item.key] ?? { icon: 'bolt', color: '#e11d48' };
              return (
                <div key={item.key} className={`rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 border ${cardClass}`}>
                  <div>
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-2"
                      style={{ backgroundColor: `${presentation.color}20`, color: presentation.color }}
                    >
                      <span className="material-symbols-outlined text-[20px]">{presentation.icon}</span>
                    </div>
                    <h4 className={`font-headline-md text-[13px] font-bold leading-snug ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{item.name}</h4>
                    <p className={`text-[10.5px] leading-snug mt-0.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>{item.description}</p>
                  </div>
                  <Button
                    variant="cherry"
                    size="sm"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedItem(item);
                    }}
                    className="h-auto px-2.5 py-1.5 rounded-xl text-[9.5px] tracking-wider"
                  >
                    {item.price} coins
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* CONTEXTUAL ITEMS (informational only) */}
      {contextual.length > 0 && (
        <section className="flex flex-col gap-2">
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
        </section>
      )}

      {/* COIN PACKS (demo) */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className={`font-label-caps text-[11px] uppercase font-bold tracking-wider ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
            Monedas Mely
          </h3>
          <span className="font-label-caps text-[8.5px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            MODO DEMO · SIN COBRO REAL
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {coinPacks.map((pack) => (
            <Button
              key={pack.key}
              variant="outline"
              onClick={() => handleRecharge(pack.key)}
              disabled={recharge.isPending}
              className={`h-auto rounded-2xl p-3 flex-col items-center gap-1 normal-case font-normal tracking-normal ${cardClass}`}
            >
              <span className="material-symbols-outlined text-[22px] text-[#e11d48]" style={{ fontVariationSettings: "'FILL' 1" }}>toll</span>
              <span className={`font-headline-md text-[15px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{pack.coins.toLocaleString()}</span>
              <span className={`text-[9px] text-center ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>{pack.label}</span>
            </Button>
          ))}
        </div>
      </section>

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
            {history.entries.slice(0, 6).map((entry) => (
              <div key={entry.id} className="p-3 flex items-center justify-between text-[11px]">
                <span className={isLight ? 'text-[#475569]' : 'text-[#fda4af]/80'}>{entry.reason}</span>
                <span className={`font-mono font-bold ${entry.direction === 'CREDIT' ? 'text-emerald-500' : 'text-[#e11d48]'}`}>
                  {entry.direction === 'CREDIT' ? '+' : '-'}{entry.amount}
                </span>
              </div>
            ))}
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
    </div>
  );
};
