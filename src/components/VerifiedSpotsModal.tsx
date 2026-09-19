import React, { useState } from 'react';
import { motion } from 'motion/react';
import { VerifiedSpot } from '../types';
import { VERIFIED_SPOTS } from '../data/mockData';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';

interface VerifiedSpotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSpotToPropose?: (spot: VerifiedSpot) => void;
}

export const VerifiedSpotsModal: React.FC<VerifiedSpotsModalProps> = ({
  isOpen,
  onClose,
  onSelectSpotToPropose,
}) => {
  const { isLight } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSpot, setSelectedSpot] = useState<VerifiedSpot | null>(null);

  const categories = [
    { id: 'all', label: 'Todos los Rincones', icon: 'explore' },
    { id: 'cafe', label: 'Café & Tostadores', icon: 'coffee' },
    { id: 'cocktail', label: 'Speakeasies & Tragos', icon: 'local_bar' },
    { id: 'wine', label: 'Vinos & Bodegones', icon: 'wine_bar' },
    { id: 'books', label: 'Libros & Cultura', icon: 'menu_book' },
  ];

  const filteredSpots = selectedCategory === 'all'
    ? VERIFIED_SPOTS
    : VERIFIED_SPOTS.filter((s) => s.category === selectedCategory);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={`w-[calc(100%-1.5rem)] max-w-[440px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden ${
          isLight ? 'bg-[#fcf9f2]' : 'bg-[#0f1a2e]'
        }`}
      >
        {/* Modal Header */}
        <DialogHeader
          className={`p-4 sm:p-5 border-b flex-row items-center shrink-0 space-y-0 ${
            isLight ? 'bg-white border-[#ffe3d3]' : 'bg-[#131f36] border-[#f16b48]/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-gradient-to-tr from-[#f16b48] to-[#ff8a65] flex items-center justify-center text-white shadow-elevation-md shadow-[#f16b48]/30">
              <span className="material-symbols-outlined text-[20px]">storefront</span>
            </div>
            <div>
              <span className="font-label-caps text-[9px] uppercase tracking-widest text-[#f16b48] font-bold block">
                LUGARES ASOCIADOS & BENEFICIOS
              </span>
              <h2 className={`font-headline-md text-[18px] font-bold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                Rincones de Citas MELY
              </h2>
            </div>
          </div>
        </DialogHeader>

        {/* Category Pills Bar */}
        <div
          className={`p-2.5 border-b flex gap-1.5 overflow-x-auto no-scrollbar shrink-0 ${
            isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#0a1120] border-[#f16b48]/20'
          }`}
        >
          {categories.map((cat) => {
            const isCatActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-xl font-label-caps text-[10px] uppercase font-bold tracking-wider whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isCatActive
                    ? 'bg-gradient-to-r from-[#f16b48] to-[#ff8a65] text-white shadow-elevation-sm scale-102'
                    : isLight
                    ? 'bg-white border border-[#ffe3d3] text-[#2e5570] hover:text-[#f16b48]'
                    : 'bg-[#131f36] border border-[#f16b48]/30 text-[#ffb295]/70 hover:text-[#ffb295]'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Spots Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 no-scrollbar">
          {filteredSpots.map((spot) => (
            <motion.div
              key={spot.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-[var(--radius-lg)] overflow-hidden shadow-elevation-sm transition-all duration-200 ${
                isLight
                  ? 'bg-white border-[#ffe3d3] hover:border-[#f16b48]/50 hover:shadow-elevation-md'
                  : 'bg-[#131f36] border-[#f16b48]/30 hover:border-[#f16b48]/60 hover:shadow-[0_4px_20px_rgba(225,29,72,0.15)]'
              }`}
            >
              {/* Photo & Badge */}
              <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                {/* Rating badge */}
                <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-[var(--radius-pill)] flex items-center gap-1 border border-white/20">
                  <span className="material-symbols-outlined text-[12px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span className="font-mono text-[11px] font-bold text-white">{spot.rating}</span>
                </div>

                {/* Neighborhood badge */}
                <div className="absolute top-2.5 left-2.5 bg-[#f16b48]/90 text-white font-label-caps text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md shadow-elevation-sm">
                  {spot.neighborhood}
                </div>

                {/* Name on image */}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <h3 className="font-headline-md text-[16px] font-bold text-white leading-snug drop-shadow-sm">
                    {spot.name}
                  </h3>
                  <p className="font-body-sm text-[11px] text-white/80 flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[12px] text-[#ffb295]">location_on</span>
                    {spot.address}
                  </p>
                </div>
              </div>

              {/* Content Body */}
              <div className="p-3.5 flex flex-col gap-2.5">
                {/* MELY Perk Banner */}
                <div
                  className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                    isLight
                      ? 'bg-[#fcf9f2] border-[#ffe3d3] text-[#f16b48]'
                      : 'bg-[#17233d] border-[#f16b48]/40 text-[#ffb295]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px] text-[#f16b48] shrink-0">
                    loyalty
                  </span>
                  <span className="font-body-sm text-[11px] font-bold leading-tight">
                    {spot.melyPerk}
                  </span>
                </div>

                {/* Vibe & Stamp Preview */}
                <div className="flex items-center justify-between text-[11px] px-0.5">
                  <span className={`font-body-sm italic ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/80'}`}>
                    “{spot.vibe}”
                  </span>
                  <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                    {spot.averagePrice}
                  </span>
                </div>

                {/* Action button: Proponer cita */}
                <div className="pt-2 border-t border-dashed flex justify-between items-center gap-2 border-slate-200 dark:border-slate-800">
                  <span className={`font-meta-data text-[10px] ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/70'}`}>
                    🕒 {spot.recommendedTime}
                  </span>

                  <Button
                    size="sm"
                    onClick={() => {
                      sounds.playStamp();
                      if (onSelectSpotToPropose) {
                        onSelectSpotToPropose(spot);
                      }
                      onClose();
                    }}
                    className="bg-gradient-to-r from-[#f16b48] to-[#ff8a65] hover:opacity-95 text-white font-label-caps text-[10px] tracking-wider font-bold rounded-xl px-3 py-1.5 h-auto tactile-btn shadow-elevation-sm shadow-[#f16b48]/20"
                  >
                    <span className="material-symbols-outlined text-[13px] mr-1">send</span>
                    PROPONER CITA AQUÍ
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
