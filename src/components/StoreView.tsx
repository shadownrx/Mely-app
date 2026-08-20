import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { StoreItem, Profile } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface StoreViewProps {
  walletBalance: number;
  user: Profile;
  onBuyItem: (item: StoreItem, paymentMethod: 'coins' | 'money') => void;
  onQuickRecharge: (pts: number, price: string, name: string) => void;
}

export const STORE_ITEMS: StoreItem[] = [
  // FEATURED VIP & POWER-UPS
  {
    id: 'membership-mely-rose',
    name: 'Mely Rose VIP',
    category: 'vip',
    priceCoins: 1400,
    priceMoney: '$12.99 / mes',
    badge: '👑 SUSCRIPCIÓN TOP',
    popular: true,
    description: 'La experiencia de citas intencionales más exclusiva con beneficios continuos ilimitados.',
    icon: 'favorite',
    highlightColor: '#fb7185',
    perks: [
      'Likes y swipes ilimitados sin restricciones',
      '5 Super Sparks semanales incluidos',
      '1 Radar Boost gratis al mes (10x visibilidad)',
      'Modo Incógnito (solo te ven a quienes diste like)',
      'Ver a todas las personas que te likearon',
    ],
  },
  {
    id: 'membership-cherry-founder',
    name: 'Black Cherry Founder',
    category: 'vip',
    priceCoins: 3800,
    priceMoney: '$34.99 vitalicio',
    badge: '✨ PASE VITALICIO',
    description: 'Membresía vitalicia con acceso a eventos y degustaciones exclusivas en Buenos Aires.',
    icon: 'workspace_premium',
    highlightColor: '#e11d48',
    perks: [
      'Pase permanente sin pagos mensuales',
      'Acceso a Encuentros Culturales Mely',
      'Pasaporte Global (cambiá tu ciudad cuando viajes)',
      'Sello distintivo en tu perfil',
      'Soporte prioritario y concierge',
    ],
  },
  {
    id: 'boost-radar-30',
    name: 'Radar Boost (30 min)',
    category: 'boosts',
    priceCoins: 300,
    priceMoney: '$2.49',
    badge: '⚡ 10x VISTAS',
    popular: true,
    description: 'Multiplica x10 la visibilidad de tu pasaporte en Palermo, Recoleta y San Telmo durante 30 minutos.',
    icon: 'bolt',
    highlightColor: '#e11d48',
    perks: [
      'Prioridad absoluta en el radar de descubrimientos',
      'Notificación sutil a perfiles afines cercanos',
      'Efecto aura brillante alrededor de tu foto',
    ],
  },
  {
    id: 'sparks-pack-5',
    name: 'Pack 5 Super Sparks',
    category: 'boosts',
    priceCoins: 450,
    priceMoney: '$3.99',
    badge: '★ DIRECT TO INBOX',
    description: 'Enviá una nota personalizada antes de hacer match para capturar su atención al instante.',
    icon: 'star',
    highlightColor: '#ffd700',
    perks: [
      'Mensaje directo prioritario antes del match',
      'Marco luminoso en su bandeja de entrada',
      '3x más tasa de respuesta garantizada',
    ],
  },
  {
    id: 'likes-reveal-filter',
    name: 'Revelador de Likes',
    category: 'boosts',
    priceCoins: 500,
    priceMoney: '$4.49',
    badge: '👁️ MATCH INSTANTÁNEO',
    description: 'Descubrí quiénes ya te likearon para hacer match de inmediato sin esperar.',
    icon: 'visibility',
    highlightColor: '#fda4af',
    perks: [
      'Desbloquea la cuadrícula de perfiles interesados',
      'Match directo con un solo toque',
      'Actualización en tiempo real con alertas',
    ],
  },
  {
    id: 'rewind-pass-unlimited',
    name: 'Rewind Ilimitado 24h',
    category: 'boosts',
    priceCoins: 250,
    priceMoney: '$1.99',
    badge: '↺ 24 HORAS',
    description: '¿Deslizaste por error? Recuperá todos los perfiles que quieras durante 24 horas.',
    icon: 'replay',
    highlightColor: '#fb7185',
    perks: [
      'Deshacer swipes ilimitado',
      'Botón ↺ activo en todas tus sesiones',
      'Historial de perfiles recientes accesible',
    ],
  },
  {
    id: 'vip-stamp-badge',
    name: 'Sello Verificado VIP',
    category: 'boosts',
    priceCoins: 600,
    priceMoney: '$4.99',
    badge: '🎖️ INSIGNIA OFICIAL',
    description: 'Insignia oficial de verificación física y digital para máxima confianza y autenticidad.',
    icon: 'verified',
    highlightColor: '#e11d48',
    perks: [
      'Tilde oficial de autenticidad en tu pasaporte',
      'Prioridad de algoritmo en búsquedas intencionales',
      'Insignia de reputación verificada',
    ],
  },

  // COIN PACKS
  {
    id: 'pack-coins-300',
    name: 'Pack Inicial 300',
    category: 'coins',
    priceMoney: '$2.99',
    badge: 'BÁSICO',
    description: '300 Mely Coins para desbloquear chats inmediatos, boosts y sellos.',
    icon: 'toll',
    highlightColor: '#fb7185',
  },
  {
    id: 'pack-coins-800',
    name: 'Pack Popular 800',
    category: 'coins',
    priceMoney: '$6.99',
    badge: '🔥 MÁS VENDIDO',
    popular: true,
    description: '750 Coins + 50 de Regalo. Ideal para citas y Super Sparks.',
    icon: 'paid',
    highlightColor: '#e11d48',
  },
  {
    id: 'pack-coins-2000',
    name: 'Pack Élite 2,000',
    category: 'coins',
    priceMoney: '$14.99',
    badge: '+25% EXTRA',
    description: '1,750 Coins + 250 Bonus. Perfecto para canjear pases y experiencias.',
    icon: 'savings',
    highlightColor: '#f43f5e',
  },
  {
    id: 'pack-coins-4500',
    name: 'Bóveda Founder 4,500',
    category: 'coins',
    priceMoney: '$29.99',
    badge: '💎 MÁXIMO AHORRO',
    description: '4,000 Coins + 500 Bonus + Insignia dorada en tu pasaporte.',
    icon: 'diamond',
    highlightColor: '#ffd700',
  },

  // DATE PASSES & EXPERIENCES (INDIVIDUAL LAUNCH PASSES)
  {
    id: 'exp-coffee-pass',
    name: 'Pase Café de Especialidad',
    category: 'experiences',
    priceCoins: 850,
    priceMoney: '$7.50',
    badge: '☕ DEGUSTACIÓN',
    description: 'Pase de bienvenida canjeable por café de especialidad y pastelería en cafeterías de CABA.',
    icon: 'local_cafe',
    highlightColor: '#ffb59c',
    perks: ['Válido en cafeterías de Palermo & Recoleta', 'Código QR seguro de bienvenida', 'Vigencia de 90 días'],
  },
  {
    id: 'exp-vermut-pass',
    name: 'Pase Vermut & Platito',
    category: 'experiences',
    priceCoins: 1600,
    priceMoney: '$13.99',
    badge: '🍷 BODEGÓN',
    description: 'Pase de bienvenida para vermut artesanal de grifo y platito en bodegones de Chacarita.',
    icon: 'wine_bar',
    highlightColor: '#e11d48',
    popular: true,
    perks: ['Canje directo con código seguro', 'Espacio preferencial', 'Válido de jueves a domingo'],
  },
  {
    id: 'exp-art-pass',
    name: 'Pase Galería de Arte',
    category: 'experiences',
    priceCoins: 1200,
    priceMoney: '$10.50',
    badge: '🎨 CULTURA',
    description: 'Entrada individual para recorrido en galerías de arte con copa de bienvenida.',
    icon: 'palette',
    highlightColor: '#f43f5e',
    perks: ['Entrada electrónica directa', 'Acceso a salas de exposición', 'Experiencia cultural'],
  },
];

// FEATURED HIGHLIGHT ITEMS FOR THE TINDER DECK
const FEATURED_DECK_ITEMS = STORE_ITEMS.filter((item) =>
  ['membership-mely-rose', 'boost-radar-30', 'sparks-pack-5', 'membership-cherry-founder', 'exp-vermut-pass'].includes(item.id)
);

export const StoreView: React.FC<StoreViewProps> = ({
  walletBalance,
  user,
  onBuyItem,
  onQuickRecharge,
}) => {
  const { isLight } = useTheme();

  // Navigation inside Store: Tinder Showcase Deck vs Full Grid Catalog
  const [storeMode, setStoreMode] = useState<'deck' | 'catalog'>('deck');
  const [activeDeckIndex, setActiveDeckIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'boosts' | 'coins' | 'vip' | 'experiences'>('all');
  
  // Selection and Modal State
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<StoreItem | null>(null);
  const [paymentType, setPaymentType] = useState<'coins' | 'money'>('coins');
  const [previewSimulatorItem, setPreviewSimulatorItem] = useState<StoreItem | null>(null);
  const [purchaseReceipt, setPurchaseReceipt] = useState<{ item: StoreItem; date: string; method: string } | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // Active user boost status
  const [activeBoost] = useState<{ name: string; remainingMinutes: number } | null>({
    name: 'Radar Boost Palermo',
    remainingMinutes: 24,
  });

  const categories = [
    { id: 'all', label: 'Todo', icon: 'apps' },
    { id: 'boosts', label: 'Boosts & Poderes', icon: 'bolt' },
    { id: 'vip', label: 'Membresías VIP', icon: 'workspace_premium' },
    { id: 'coins', label: 'Monedas Mely', icon: 'toll' },
    { id: 'experiences', label: 'Citas & Pases', icon: 'local_activity' },
  ];

  const filteredItems = STORE_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (item.badge && item.badge.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenPurchaseModal = (item: StoreItem) => {
    sounds.playClick();
    setSelectedItemForPurchase(item);
    if (item.priceCoins && walletBalance >= item.priceCoins) {
      setPaymentType('coins');
    } else if (item.priceMoney) {
      setPaymentType('money');
    } else {
      setPaymentType('coins');
    }
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#ff4d67', '#fb7185', '#ffd700', '#ffffff'],
      });
    } catch {
      // safe fallback
    }
  };

  const handleConfirmPurchase = () => {
    if (!selectedItemForPurchase) return;

    if (paymentType === 'coins' && selectedItemForPurchase.priceCoins) {
      if (walletBalance < selectedItemForPurchase.priceCoins) {
        sounds.playClick();
        alert('No tienes suficientes Mely Coins. Puedes recargar tu bóveda o pagar directamente.');
        return;
      }
    }

    sounds.playCoins();
    triggerCelebration();

    const itemBought = selectedItemForPurchase;
    onBuyItem(itemBought, paymentType);

    setSelectedItemForPurchase(null);
    setPurchaseReceipt({
      item: itemBought,
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      method: paymentType === 'coins' ? `${itemBought.priceCoins} Mely Coins` : (itemBought.priceMoney || '$4.99'),
    });
  };

  const currentDeckItem = FEATURED_DECK_ITEMS[activeDeckIndex];

  return (
    <div className="flex flex-col gap-5 pb-12 animate-fadeIn max-w-[440px] mx-auto">
      {/* TOP VAULT & BALANCE BAR */}
      <section
        className={`relative overflow-hidden rounded-3xl p-5 transition-all duration-200 border ${
          isLight
            ? 'bg-gradient-to-br from-white via-[#fff5f6] to-[#ffe4e6]/30 border-[#fecdd3] shadow-[0_4px_20px_rgba(255,77,103,0.08)]'
            : 'bg-gradient-to-br from-[#1c0b11] via-[#12070a] to-[#0a0507] border-[#e11d48]/40 shadow-[0_0_30px_rgba(225,29,72,0.18)]'
        }`}
      >
        {/* Glow Spheres */}
        <div
          className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none ${
            isLight ? 'bg-[#ff4d67]/10' : 'bg-[#e11d48]/25'
          }`}
        />
        <div
          className={`absolute -bottom-10 -left-10 w-36 h-36 rounded-full blur-2xl pointer-events-none ${
            isLight ? 'bg-[#fb7185]/10' : 'bg-[#fb7185]/20'
          }`}
        />

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="material-symbols-outlined text-[#e11d48] text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_mall
                </span>
                <span
                  className={`font-label-caps text-[10px] uppercase tracking-widest font-bold ${
                    isLight ? 'text-[#ff4d67]' : 'text-[#fb7185]'
                  }`}
                >
                  TIENDA & BENEFICIOS MELY
                </span>
              </div>
              <h2
                className={`font-headline-md text-[22px] font-bold tracking-tight ${
                  isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                }`}
              >
                Bóveda de Poderes
              </h2>
            </div>

            {/* Active Boost Pill */}
            {activeBoost && (
              <div
                className={`flex flex-col items-end px-3 py-1.5 rounded-2xl border shadow-sm ${
                  isLight
                    ? 'bg-[#fff1f3] border-[#fecdd3]'
                    : 'bg-[#2a0c15]/90 border-[#e11d48]/50'
                }`}
              >
                <span className="flex items-center gap-1.5 text-[#e11d48] font-label-caps text-[9px] uppercase font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-ping" />
                  BOOST ACTIVO
                </span>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                  }`}
                >
                  {activeBoost.remainingMinutes}m restantes
                </span>
              </div>
            )}
          </div>

          {/* Balance Bar with Quick Actions */}
          <div
            className={`flex items-center justify-between p-3.5 rounded-2xl border ${
              isLight
                ? 'bg-white border-[#fecdd3] shadow-sm'
                : 'bg-[#090406]/95 border-[#e11d48]/30 shadow-inner'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] flex items-center justify-center text-white shadow-lg shadow-[#e11d48]/25">
                <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  monetization_on
                </span>
              </div>
              <div>
                <span
                  className={`font-label-caps text-[9px] uppercase tracking-wider block font-bold ${
                    isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'
                  }`}
                >
                  TU SALDO DISPONIBLE
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`font-headline-md text-[22px] font-bold ${
                      isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                    }`}
                  >
                    {walletBalance.toLocaleString()}
                  </span>
                  <span className="font-meta-data text-[10px] text-[#e11d48] font-bold">
                    COINS
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Recharge Button */}
            <button
              onClick={() => {
                sounds.playCoins();
                onQuickRecharge(800, '$6.99', 'Pack Popular 800');
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#ff4d67] hover:brightness-105 text-white font-label-caps text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 tactile-btn shadow-md shadow-[#e11d48]/30 border border-white/20 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              <span>Recargar</span>
            </button>
          </div>
        </div>
      </section>

      {/* TINDER-STYLE VIEW TOGGLE: Showcase Deck vs Full Catalog */}
      <div
        className={`flex items-center p-1 rounded-2xl border ${
          isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-[#150a0e] border-[#e11d48]/30'
        }`}
      >
        <button
          onClick={() => {
            sounds.playClick();
            setStoreMode('deck');
          }}
          className={`flex-1 py-2 rounded-xl font-label-caps text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all ${
            storeMode === 'deck'
              ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white shadow-md shadow-[#e11d48]/30'
              : isLight
              ? 'text-[#64748b] hover:text-[#0f172a]'
              : 'text-[#fda4af]/70 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">style</span>
          <span>Tinder Showcase</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setStoreMode('catalog');
          }}
          className={`flex-1 py-2 rounded-xl font-label-caps text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all ${
            storeMode === 'catalog'
              ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white shadow-md shadow-[#e11d48]/30'
              : isLight
              ? 'text-[#64748b] hover:text-[#0f172a]'
              : 'text-[#fda4af]/70 hover:text-white'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">grid_view</span>
          <span>Catálogo Completo</span>
        </button>
      </div>

      {/* MODE 1: TINDER SHOWCASE DECK CARDS */}
      {storeMode === 'deck' && currentDeckItem && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          <div
            className={`relative rounded-3xl p-5 border-2 shadow-xl overflow-hidden transition-all duration-200 ${
              isLight
                ? 'bg-gradient-to-b from-white via-[#fff9fa] to-[#fff1f3] border-[#fecdd3] text-[#0f172a] shadow-[0_10px_30px_rgba(255,77,103,0.1)]'
                : 'bg-gradient-to-b from-[#1f0c14] via-[#14080d] to-[#0a0507] border-[#e11d48]/50 text-white shadow-[0_10px_35px_rgba(225,29,72,0.25)]'
            }`}
          >
            {/* Top Badge & Category */}
            <div className="flex justify-between items-center mb-3">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[9px] font-bold uppercase tracking-widest shadow-md">
                {currentDeckItem.badge || 'DESTACADO'}
              </span>

              <span
                className={`font-meta-data text-[10px] ${
                  isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'
                }`}
              >
                {activeDeckIndex + 1} de {FEATURED_DECK_ITEMS.length}
              </span>
            </div>

            {/* Main Feature Visual & Icon */}
            <div className="flex items-center gap-4 my-2">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 shrink-0"
                style={{
                  backgroundColor: currentDeckItem.highlightColor ? `${currentDeckItem.highlightColor}25` : '#e11d4825',
                  color: currentDeckItem.highlightColor || '#e11d48',
                  boxShadow: `0 0 25px ${currentDeckItem.highlightColor || '#e11d48'}30`,
                }}
              >
                <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {currentDeckItem.icon}
                </span>
              </div>

              <div>
                <h3
                  className={`font-headline-md text-[20px] font-bold leading-tight ${
                    isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                  }`}
                >
                  {currentDeckItem.name}
                </h3>
                <span className="font-label-caps text-[10px] text-[#e11d48] uppercase tracking-wider block font-bold">
                  {currentDeckItem.category === 'vip'
                    ? 'Membresía VIP'
                    : currentDeckItem.category === 'boosts'
                    ? 'Power-up Especial'
                    : 'Pase Exclusivo'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p
              className={`font-body-sm text-[13px] leading-relaxed my-3 ${
                isLight ? 'text-[#334155]' : 'text-[#fce7eb]/90'
              }`}
            >
              {currentDeckItem.description}
            </p>

            {/* Perks Checklist */}
            {currentDeckItem.perks && currentDeckItem.perks.length > 0 && (
              <div
                className={`space-y-2 my-4 p-3.5 rounded-2xl border ${
                  isLight
                    ? 'bg-white border-[#fecdd3] shadow-sm'
                    : 'bg-[#0c0508]/90 border-[#e11d48]/20 shadow-inner'
                }`}
              >
                <span
                  className={`font-label-caps text-[9px] uppercase tracking-wider block font-bold ${
                    isLight ? 'text-[#e11d48]' : 'text-[#fda4af]/70'
                  }`}
                >
                  BENEFICIOS INCLUIDOS:
                </span>
                {currentDeckItem.perks.map((perk, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2 text-[12px] ${
                      isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                    }`}
                  >
                    <span
                      className="material-symbols-outlined text-[16px] text-[#e11d48] shrink-0 mt-0.5"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Price & Action Buttons */}
            <div
              className={`pt-3 border-t flex items-center justify-between gap-3 mt-2 ${
                isLight ? 'border-[#ffe4e6]' : 'border-[#e11d48]/30'
              }`}
            >
              <div className="flex flex-col">
                <span
                  className={`font-label-caps text-[9px] uppercase font-bold ${
                    isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'
                  }`}
                >
                  INVERSIÓN
                </span>
                <div className="flex items-center gap-1.5">
                  {currentDeckItem.priceCoins ? (
                    <div className="flex items-center gap-1">
                      <span
                        className="material-symbols-outlined text-[18px] text-[#e11d48]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        monetization_on
                      </span>
                      <span
                        className={`font-headline-md text-[20px] font-bold ${
                          isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                        }`}
                      >
                        {currentDeckItem.priceCoins.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span
                      className={`font-headline-md text-[20px] font-bold ${
                        isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                      }`}
                    >
                      {currentDeckItem.priceMoney}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Live Simulator Preview Button */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    setPreviewSimulatorItem(currentDeckItem);
                  }}
                  className={`p-2.5 rounded-xl border tactile-btn transition-colors ${
                    isLight
                      ? 'bg-[#fff1f3] border-[#fecdd3] text-[#e11d48] hover:bg-[#ffe4e6]'
                      : 'bg-[#200c14] border-[#e11d48]/40 text-[#fda4af] hover:text-white'
                  }`}
                  title="Ver simulador en vivo"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                </button>

                {/* Primary Buy Button */}
                <button
                  onClick={() => handleOpenPurchaseModal(currentDeckItem)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[11px] font-bold uppercase tracking-wider tactile-btn shadow-lg shadow-[#e11d48]/30 hover:brightness-105 flex items-center gap-1.5 active:scale-95"
                >
                  <span>Obtener Ahora</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          {/* Swipe / Navigation Deck Controls */}
          <div className="flex items-center justify-between px-2">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveDeckIndex((prev) => (prev > 0 ? prev - 1 : FEATURED_DECK_ITEMS.length - 1));
              }}
              className={`w-10 h-10 rounded-full border flex items-center justify-center tactile-btn shadow-md ${
                isLight
                  ? 'bg-white border-[#fecdd3] text-[#0f172a] hover:bg-[#fff1f3]'
                  : 'bg-[#180b10] border-[#e11d48]/40 text-[#fda4af] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {FEATURED_DECK_ITEMS.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveDeckIndex(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeDeckIndex
                      ? 'w-6 bg-gradient-to-r from-[#e11d48] to-[#ff4d67]'
                      : isLight
                      ? 'w-2 bg-[#fecdd3] hover:bg-[#ff4d67]'
                      : 'w-2 bg-[#2a0e18] hover:bg-[#e11d48]/50'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveDeckIndex((prev) => (prev < FEATURED_DECK_ITEMS.length - 1 ? prev + 1 : 0));
              }}
              className={`w-10 h-10 rounded-full border flex items-center justify-center tactile-btn shadow-md ${
                isLight
                  ? 'bg-white border-[#fecdd3] text-[#0f172a] hover:bg-[#fff1f3]'
                  : 'bg-[#180b10] border-[#e11d48]/40 text-[#fda4af] hover:text-white'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: COMPLETE CATALOG VIEW WITH SEARCH & CATEGORIES */}
      {storeMode === 'catalog' && (
        <div className="flex flex-col gap-4 animate-fadeIn">
          {/* Search Bar */}
          <div className="relative">
            <span
              className={`material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] ${
                isLight ? 'text-[#64748b]' : 'text-[#fda4af]/50'
              }`}
            >
              search
            </span>
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar perks, boosts, membresías, café..."
              className={`w-full border rounded-2xl pl-10 pr-9 py-2.5 font-body-sm text-[13px] focus:outline-none transition-colors ${
                isLight
                  ? 'bg-white border-[#fecdd3] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#e11d48]'
                  : 'bg-[#150a0e] border-[#e11d48]/30 text-[#fff1f2] placeholder:text-[#fda4af]/40 focus:border-[#e11d48]'
              }`}
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                  isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#fda4af]/50 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          {/* Category Carousel Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedCategory(cat.id as any);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-label-caps text-[10px] uppercase tracking-wider font-bold whitespace-nowrap transition-all tactile-btn shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white shadow-lg shadow-[#e11d48]/30 border border-white/20'
                      : isLight
                      ? 'bg-white text-[#475569] border border-[#fecdd3] hover:border-[#e11d48] hover:text-[#0f172a]'
                      : 'bg-[#180b10] text-[#fda4af]/70 border border-[#e11d48]/20 hover:border-[#e11d48]/50 hover:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Items Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {filteredItems.map((item) => {
              const isAffordable = item.priceCoins ? walletBalance >= item.priceCoins : false;

              return (
                <div
                  key={item.id}
                  className={`relative rounded-2xl p-4 flex flex-col justify-between transition-all duration-200 group border ${
                    isLight
                      ? item.popular
                        ? 'bg-gradient-to-b from-[#fff5f6] to-white border-[#e11d48] shadow-md'
                        : 'bg-white border-[#fecdd3] hover:border-[#e11d48] shadow-sm'
                      : item.popular
                      ? 'bg-gradient-to-b from-[#240c16] via-[#16080e] to-[#0d0508] border-[#e11d48]/70 shadow-[0_0_20px_rgba(225,29,72,0.2)]'
                      : 'bg-[#150a0e] border-[#e11d48]/25 hover:border-[#e11d48]/60 shadow-md'
                  }`}
                >
                  {/* Badge */}
                  {item.badge && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[8px] font-bold tracking-widest uppercase shadow-md">
                        {item.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Item Icon & Title */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shrink-0 border border-white/10"
                        style={{
                          backgroundColor: item.highlightColor ? `${item.highlightColor}20` : '#e11d4820',
                          color: item.highlightColor || '#e11d48',
                        }}
                      >
                        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {item.icon}
                        </span>
                      </div>

                      <div className="min-w-0 pr-12">
                        <h4
                          className={`font-headline-md text-[15px] font-bold leading-snug truncate ${
                            isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                          }`}
                        >
                          {item.name}
                        </h4>
                        <span
                          className={`font-label-caps text-[9px] uppercase tracking-wider block ${
                            isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'
                          }`}
                        >
                          {item.category === 'coins'
                            ? 'Monedas'
                            : item.category === 'boosts'
                            ? 'Power-up'
                            : item.category === 'vip'
                            ? 'Membresía'
                            : 'Pase Especial'}
                        </span>
                      </div>
                    </div>

                    <p
                      className={`font-body-sm text-[12px] leading-relaxed mb-3 ${
                        isLight ? 'text-[#475569]' : 'text-[#fce7eb]/80'
                      }`}
                    >
                      {item.description}
                    </p>

                    {/* Perks list */}
                    {item.perks && item.perks.length > 0 && (
                      <div
                        className={`space-y-1 mb-3 p-2.5 rounded-xl border ${
                          isLight
                            ? 'bg-[#fff5f6] border-[#fecdd3]'
                            : 'bg-[#0a0406]/90 border-white/5'
                        }`}
                      >
                        {item.perks.slice(0, 2).map((perk, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 text-[10.5px] ${
                              isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px] text-[#e11d48]">check_circle</span>
                            <span className="truncate">{perk}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price and CTA */}
                  <div
                    className={`pt-3 border-t flex items-center justify-between gap-2 mt-auto ${
                      isLight ? 'border-[#ffe4e6]' : 'border-white/5'
                    }`}
                  >
                    <div className="flex flex-col">
                      {item.priceCoins && (
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px] text-[#e11d48]">monetization_on</span>
                          <span
                            className={`font-headline-md text-[15px] font-bold ${
                              isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                            }`}
                          >
                            {item.priceCoins.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {item.priceMoney && (
                        <span
                          className={`font-meta-data text-[10.5px] ${
                            isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'
                          }`}
                        >
                          {item.priceMoney}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setPreviewSimulatorItem(item);
                        }}
                        className={`p-1.5 rounded-xl border ${
                          isLight
                            ? 'bg-[#fff1f3] border-[#fecdd3] text-[#e11d48] hover:bg-[#ffe4e6]'
                            : 'bg-[#200c14] hover:bg-[#30121e] text-[#fda4af] hover:text-white border-[#e11d48]/30'
                        }`}
                        title="Ver Preview"
                      >
                        <span className="material-symbols-outlined text-[16px]">visibility</span>
                      </button>

                      <button
                        onClick={() => handleOpenPurchaseModal(item)}
                        className={`px-3 py-1.5 rounded-xl font-label-caps text-[9.5px] font-bold tracking-wider uppercase flex items-center gap-1 tactile-btn shadow-md transition-all ${
                          item.popular
                            ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white hover:brightness-105 shadow-[#e11d48]/30'
                            : isAffordable
                            ? isLight
                              ? 'bg-[#fff1f3] border border-[#e11d48] text-[#e11d48] hover:bg-[#ffe4e6]'
                              : 'bg-[#2b0d18] hover:bg-[#3d1323] border border-[#e11d48]/50 text-[#fda4af]'
                            : 'bg-[#e11d48] text-white hover:bg-[#be123c]'
                        }`}
                      >
                        <span>{item.category === 'coins' ? 'Comprar' : 'Canjear'}</span>
                        <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* QUICK GUARANTEE TICKET STUB */}
      <div
        className={`p-4 rounded-2xl border border-dashed flex items-center justify-between shadow-sm ${
          isLight
            ? 'bg-[#fff5f6] border-[#fecdd3]'
            : 'bg-[#14080d] border-[#e11d48]/40 shadow-md'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
              isLight
                ? 'bg-white text-[#e11d48] border-[#fecdd3]'
                : 'bg-[#e11d48]/20 text-[#fb7185] border-[#e11d48]/40'
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">verified_user</span>
          </div>
          <div>
            <span
              className={`font-headline-md text-[13px] font-bold block ${
                isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
              }`}
            >
              Garantía de Intencionalidad Mely
            </span>
            <span
              className={`font-body-sm text-[11px] block ${
                isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'
              }`}
            >
              Tus compras activan perks instantáneos con máxima privacidad.
            </span>
          </div>
        </div>
      </div>

      {/* LIVE SIMULATOR MODAL */}
      {previewSimulatorItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div
            className={`border rounded-3xl w-full max-w-[380px] overflow-hidden shadow-2xl relative ${
              isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#160a0f] border-[#e11d48]/50'
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b flex justify-between items-center ${
                isLight
                  ? 'bg-[#fff1f3] border-[#fecdd3]'
                  : 'bg-gradient-to-r from-[#2a0c16] to-[#160a0f] border-[#e11d48]/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e11d48] text-[20px]">smart_display</span>
                <h3
                  className={`font-headline-md text-[15px] font-bold ${
                    isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                  }`}
                >
                  Simulador de Efecto en Vivo
                </h3>
              </div>
              <button
                onClick={() => setPreviewSimulatorItem(null)}
                className={`p-1 ${isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#fda4af]/70 hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Live Interactive Simulator Content */}
            <div className="p-5 flex flex-col gap-4">
              <div
                className={`relative rounded-2xl overflow-hidden border p-4 flex flex-col items-center justify-center text-center min-h-[220px] ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3]'
                    : 'bg-[#0a0507] border-[#e11d48]/40'
                }`}
              >
                {/* Radar Boost Simulation */}
                {previewSimulatorItem.category === 'boosts' && previewSimulatorItem.id.includes('radar') && (
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`relative w-28 h-28 rounded-full border-2 border-[#e11d48] flex items-center justify-center ${
                        isLight ? 'bg-white' : 'bg-[#1e0a13]'
                      }`}
                    >
                      <div className="absolute inset-0 rounded-full bg-[#e11d48]/20 animate-ping" />
                      <div className="absolute inset-2 rounded-full border border-[#ff4d67]/60 animate-pulse" />
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-16 h-16 rounded-full object-cover z-10 border-2 border-white"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-[#e11d48] text-white font-label-caps text-[8px] font-bold uppercase z-20">
                        ⚡ 10X VISTAS
                      </span>
                    </div>
                    <p
                      className={`font-body-sm text-[12px] font-medium mt-2 ${
                        isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                      }`}
                    >
                      Tu perfil aparece primero en Palermo, Recoleta y San Telmo.
                    </p>
                  </div>
                )}

                {/* Super Spark Simulation */}
                {previewSimulatorItem.id.includes('spark') && (
                  <div className="w-full flex flex-col gap-2.5">
                    <div
                      className={`p-3 rounded-2xl border-2 border-[#ffd700] text-left shadow-md ${
                        isLight
                          ? 'bg-white'
                          : 'bg-gradient-to-r from-[#2b1604] to-[#1a0a10]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="material-symbols-outlined text-[#ffd700] text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        <span className="font-label-caps text-[9px] text-[#e11d48] font-bold uppercase">
                          SUPER SPARK DE {user.name.split(' ')[0]}
                        </span>
                      </div>
                      <p
                        className={`font-body-sm text-[12px] italic ${
                          isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                        }`}
                      >
                        "¡Hola! Vi que te encanta el café filtrado en Palermo. Me encantaría compartir una mesa."
                      </p>
                    </div>
                    <span className={`text-[10.5px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                      Llega directo a su pantalla principal antes de hacer match.
                    </span>
                  </div>
                )}

                {/* VIP Membership / Pass Simulation */}
                {(previewSimulatorItem.category === 'vip' || previewSimulatorItem.id.includes('stamp')) && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#e11d48] via-[#ff4d67] to-[#ffd700] p-1 shadow-lg">
                      <div
                        className={`w-full h-full rounded-xl flex flex-col items-center justify-center ${
                          isLight ? 'bg-white text-[#0f172a]' : 'bg-[#12060a] text-white'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[32px] text-[#e11d48]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                        <span className="font-label-caps text-[8px] font-bold text-[#e11d48] uppercase">
                          VIP PASSPORT
                        </span>
                      </div>
                    </div>
                    <p
                      className={`font-body-sm text-[12px] ${
                        isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                      }`}
                    >
                      Sello distintivo visible para todas las conexiones intencionales.
                    </p>
                  </div>
                )}

                {/* Experience / Pass Simulation */}
                {previewSimulatorItem.category === 'experiences' && (
                  <div
                    className={`w-full p-3 rounded-2xl border border-dashed border-[#e11d48] flex items-center justify-between text-left ${
                      isLight ? 'bg-white' : 'bg-[#14080e]'
                    }`}
                  >
                    <div>
                      <span className="font-label-caps text-[8.5px] text-[#e11d48] uppercase block font-bold">
                        PASE DIGITAL AUTORIZADO
                      </span>
                      <h5
                        className={`font-headline-md text-[14px] font-bold ${
                          isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                        }`}
                      >
                        {previewSimulatorItem.name}
                      </h5>
                      <span className={`font-meta-data text-[10px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                        Canjeable con Código QR
                      </span>
                    </div>
                    <div className="w-12 h-12 bg-white border border-[#fecdd3] p-1 rounded-lg flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#e11d48] text-[30px]">qr_code_2</span>
                    </div>
                  </div>
                )}

                {/* Default Fallback */}
                {previewSimulatorItem.category === 'coins' && (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] flex items-center justify-center text-white shadow-xl">
                      <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        monetization_on
                      </span>
                    </div>
                    <h5
                      className={`font-headline-md text-[16px] font-bold ${
                        isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                      }`}
                    >
                      {previewSimulatorItem.name}
                    </h5>
                    <p className={`text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
                      Acreditación inmediata en tu balance de Mely Coins.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setPreviewSimulatorItem(null)}
                  className={`py-2.5 rounded-xl border font-label-caps text-[10px] font-bold uppercase ${
                    isLight
                      ? 'border-[#fecdd3] bg-white text-[#475569] hover:bg-[#fff1f3]'
                      : 'border-white/10 bg-[#160a0f] text-[#fda4af] hover:bg-white/5'
                  }`}
                >
                  Cerrar
                </button>

                <button
                  onClick={() => {
                    const it = previewSimulatorItem;
                    setPreviewSimulatorItem(null);
                    handleOpenPurchaseModal(it);
                  }}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] font-bold uppercase tactile-btn shadow-md hover:brightness-105 flex items-center justify-center gap-1"
                >
                  <span>Obtener</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PURCHASE / EXCHANGE CONFIRMATION MODAL */}
      {selectedItemForPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div
            className={`border rounded-3xl w-full max-w-[390px] overflow-hidden shadow-2xl relative ${
              isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#170a0f] border-[#e11d48]/50'
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b flex justify-between items-center ${
                isLight
                  ? 'bg-[#fff1f3] border-[#fecdd3]'
                  : 'bg-gradient-to-r from-[#2b0c16] to-[#170a0f] border-[#e11d48]/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#e11d48] text-[22px]">shopping_bag</span>
                <h3
                  className={`font-headline-md text-[16px] font-bold ${
                    isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                  }`}
                >
                  Confirmar Adquisición
                </h3>
              </div>
              <button
                onClick={() => setSelectedItemForPurchase(null)}
                className={`p-1 ${isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#fda4af]/70 hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 flex flex-col gap-4">
              {/* Item Summary Card */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${
                  isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0e0508] border-[#e11d48]/30'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 border border-white/10"
                  style={{
                    backgroundColor: selectedItemForPurchase.highlightColor
                      ? `${selectedItemForPurchase.highlightColor}30`
                      : '#e11d4830',
                    color: selectedItemForPurchase.highlightColor || '#e11d48',
                  }}
                >
                  <span className="material-symbols-outlined text-[26px]">
                    {selectedItemForPurchase.icon}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <span
                    className={`font-label-caps text-[8.5px] uppercase font-bold block ${
                      isLight ? 'text-[#e11d48]' : 'text-[#fda4af]/70'
                    }`}
                  >
                    SELECCIONADO
                  </span>
                  <h4
                    className={`font-headline-md text-[16px] font-bold truncate ${
                      isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                    }`}
                  >
                    {selectedItemForPurchase.name}
                  </h4>
                  <p className={`text-[11px] truncate ${isLight ? 'text-[#64748b]' : 'text-[#fca5a5]/80'}`}>
                    {selectedItemForPurchase.description}
                  </p>
                </div>
              </div>

              {/* Payment Method Selector */}
              {selectedItemForPurchase.category !== 'coins' && selectedItemForPurchase.priceCoins && (
                <div>
                  <span
                    className={`font-label-caps text-[10px] uppercase block mb-2 font-bold ${
                      isLight ? 'text-[#0f172a]' : 'text-[#fda4af]/80'
                    }`}
                  >
                    Elige Método de Pago
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Option 1: Coins */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setPaymentType('coins');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                        paymentType === 'coins'
                          ? isLight
                            ? 'bg-[#fff1f3] border-[#e11d48] text-[#e11d48] shadow-md font-bold'
                            : 'bg-[#2b0c16] border-[#e11d48] text-white shadow-lg shadow-[#e11d48]/30'
                          : isLight
                          ? 'bg-white border-[#fecdd3] text-[#64748b] hover:bg-[#fff5f6]'
                          : 'bg-[#110609] border-white/10 text-[#fda4af]/60 hover:border-white/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#e11d48]">monetization_on</span>
                      <span className="font-headline-md text-[14px] font-bold">
                        {selectedItemForPurchase.priceCoins} Coins
                      </span>
                      <span className={`text-[9px] font-meta-data ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
                        Saldo: {walletBalance}
                      </span>
                    </button>

                    {/* Option 2: Money */}
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setPaymentType('money');
                      }}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                        paymentType === 'money'
                          ? isLight
                            ? 'bg-[#fff1f3] border-[#e11d48] text-[#e11d48] shadow-md font-bold'
                            : 'bg-[#2b0c16] border-[#e11d48] text-white shadow-lg shadow-[#e11d48]/30'
                          : isLight
                          ? 'bg-white border-[#fecdd3] text-[#64748b] hover:bg-[#fff5f6]'
                          : 'bg-[#110609] border-white/10 text-[#fda4af]/60 hover:border-white/20'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px] text-[#e11d48]">credit_card</span>
                      <span className="font-headline-md text-[14px] font-bold">
                        {selectedItemForPurchase.priceMoney || '$4.99'}
                      </span>
                      <span className={`text-[9px] font-meta-data ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
                        Tarjeta / Apple Pay
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Price Calculation Info */}
              <div
                className={`p-3 rounded-xl border flex justify-between items-center text-[12px] ${
                  isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0e0508] border-[#e11d48]/20'
                }`}
              >
                <span className={isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}>Total a Pagar:</span>
                <span className="font-headline-md text-[16px] font-bold text-[#e11d48]">
                  {paymentType === 'coins' && selectedItemForPurchase.priceCoins
                    ? `${selectedItemForPurchase.priceCoins} Mely Coins`
                    : selectedItemForPurchase.priceMoney || '$4.99 USD'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItemForPurchase(null)}
                  className={`py-2.5 rounded-xl border font-label-caps text-[10px] font-bold uppercase ${
                    isLight
                      ? 'border-[#fecdd3] bg-white text-[#475569] hover:bg-[#fff1f3]'
                      : 'border-white/10 bg-[#160a0f] text-[#fda4af] hover:bg-white/5'
                  }`}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPurchase}
                  className="py-2.5 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] font-bold uppercase tactile-btn shadow-lg shadow-[#e11d48]/30 hover:brightness-105 flex items-center justify-center gap-1 active:scale-95"
                >
                  <span>Confirmar</span>
                  <span className="material-symbols-outlined text-[15px]">done</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSTANT RECEIPT TICKET MODAL */}
      {purchaseReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div
            className={`border-2 rounded-3xl w-full max-w-[380px] overflow-hidden shadow-2xl relative text-center p-6 flex flex-col items-center gap-4 ${
              isLight ? 'bg-white border-[#e11d48]' : 'bg-[#170a0f] border-[#e11d48]/60'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] flex items-center justify-center text-white shadow-xl">
              <span className="material-symbols-outlined text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
            </div>

            <div>
              <span className="font-label-caps text-[10px] text-[#e11d48] uppercase tracking-widest font-bold block">
                ¡ACTIVACIÓN EXITOSA!
              </span>
              <h3
                className={`font-headline-md text-[20px] font-bold mt-1 ${
                  isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
                }`}
              >
                {purchaseReceipt.item.name}
              </h3>
              <p className={`font-body-sm text-[12px] mt-1 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
                Tu beneficio ya está disponible en tu cuenta y pasaporte.
              </p>
            </div>

            {/* Receipt Stub */}
            <div
              className={`w-full p-3.5 rounded-2xl border border-dashed text-left text-[11px] font-meta-data space-y-1.5 ${
                isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0d0508] border-[#e11d48]/40'
              }`}
            >
              <div className="flex justify-between">
                <span className={isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}>HORA:</span>
                <span className={`font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  {purchaseReceipt.date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}>MÉTODO:</span>
                <span className="text-[#e11d48] font-bold">{purchaseReceipt.method}</span>
              </div>
              <div className="flex justify-between">
                <span className={isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}>ESTADO:</span>
                <span className="text-[#10b981] font-bold">ACTIVO</span>
              </div>
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setPurchaseReceipt(null);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[11px] font-bold uppercase tracking-wider tactile-btn shadow-lg shadow-[#e11d48]/30 hover:brightness-105 active:scale-95"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
