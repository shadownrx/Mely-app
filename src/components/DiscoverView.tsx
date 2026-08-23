import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { Profile } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';

interface DiscoverViewProps {
  profiles: Profile[];
  onLike: (profile: Profile) => void;
  onPass: (profile: Profile) => void;
  onSuperLike: (profile: Profile) => void;
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
  onOpenVerifiedSpots?: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  profiles,
  onLike,
  onPass,
  onSuperLike,
  onOpenFilters,
  activeFiltersCount = 0,
  onOpenVerifiedSpots,
}) => {
  const { isLight } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionState, setActionState] = useState<'liked' | 'passed' | 'starred' | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showFullNotebook, setShowFullNotebook] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [unblurredCards, setUnblurredCards] = useState<Record<string, boolean>>({});

  // Motion values for gesture physics
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Transform drag distance into smooth rotation & opacity indicators
  const rotate = useTransform(dragX, [-220, 220], [-18, 18]);
  const likeOpacity = useTransform(dragX, [30, 140], [0, 1]);
  const passOpacity = useTransform(dragX, [-30, -140], [0, 1]);
  const superLikeOpacity = useTransform(dragY, [-30, -120], [0, 1]);

  const currentProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  if (!currentProfile) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center py-20 px-6 text-center"
      >
        <div
          className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center text-[#e11d48] mb-4 ${
            isLight ? 'border-[#fecdd3] bg-white shadow-sm' : 'border-[#57423b] bg-[#140b0f]'
          }`}
        >
          <span className="material-symbols-outlined text-[36px]">auto_stories</span>
        </div>
        <h2 className={`font-headline-md text-[22px] mb-2 font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#e6e1df]'}`}>
          Has explorado todos los perfiles de hoy
        </h2>
        <p className={`font-body-sm text-[14px] max-w-xs mb-6 ${isLight ? 'text-[#64748b]' : 'text-[#dec0b6]/80'}`}>
          Nuevas conexiones intencionales y cuadernos editoriales se sincronizan cada medianoche.
        </p>
        <Button
          onClick={() => {
            sounds.playClick();
            setCurrentIndex(0);
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[11px] tracking-widest font-bold rounded-full tactile-btn hover:opacity-95 shadow-md shadow-[#e11d48]/25"
        >
          REABRIR CUADERNO DE PERFILES
        </Button>
      </motion.div>
    );
  }

  const triggerAction = (type: 'liked' | 'passed' | 'starred') => {
    setActionState(type);
    setExitDirection(type === 'liked' ? 'right' : type === 'passed' ? 'left' : 'up');

    if (type === 'liked') {
      sounds.playStamp();
      onLike(currentProfile);
    } else if (type === 'starred') {
      sounds.playCoins();
      onSuperLike(currentProfile);
    } else {
      sounds.playClick();
      onPass(currentProfile);
    }

    setTimeout(() => {
      setActionState(null);
      setExitDirection(null);
      setGalleryIndex(0);
      setShowFullNotebook(false);
      dragX.set(0);
      dragY.set(0);
      setCurrentIndex((prev) => prev + 1);
    }, 320);
  };

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 100;
    const velocityThreshold = 400;

    if (info.offset.x > threshold || info.velocity.x > velocityThreshold) {
      triggerAction('liked');
    } else if (info.offset.x < -threshold || info.velocity.x < -velocityThreshold) {
      triggerAction('passed');
    } else if (info.offset.y < -threshold || info.velocity.y < -velocityThreshold) {
      triggerAction('starred');
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-8 select-none">
      {/* Top Header Tag & Controls */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-pulseGlow" />
          <Badge
            variant="outline"
            className={`font-label-caps text-[10px] uppercase tracking-widest font-bold border-0 px-0 ${
              isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'
            }`}
          >
            Curaduría MELY
          </Badge>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Verified Spots Button */}
          {onOpenVerifiedSpots && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenVerifiedSpots();
              }}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-label-caps uppercase font-bold flex items-center gap-1 border transition-all ${
                isLight
                  ? 'bg-white border-[#fecdd3] text-[#e11d48] hover:bg-[#fff1f3]'
                  : 'bg-[#1a0c13] border-[#e11d48]/30 text-[#fda4af] hover:border-[#e11d48]/60'
              }`}
              title="Ver Rincones & Beneficios Asociados"
            >
              <span className="material-symbols-outlined text-[13px]">storefront</span>
              <span className="hidden sm:inline">Rincones</span>
            </button>
          )}

          {/* Blind Mode Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              setIsBlindMode(!isBlindMode);
            }}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-label-caps uppercase font-bold flex items-center gap-1 border transition-all ${
              isBlindMode
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-sm'
                : isLight
                ? 'bg-white border-[#fecdd3] text-[#64748b] hover:text-[#e11d48]'
                : 'bg-[#1a0c13] border-white/10 text-[#fda4af]/70 hover:text-white'
            }`}
            title="Modo Cita a Ciegas: Revela primero la mente y la voz"
          >
            <span className="material-symbols-outlined text-[13px]">
              {isBlindMode ? 'visibility' : 'visibility_off'}
            </span>
            <span>{isBlindMode ? 'Ciegas ON' : 'Ciegas'}</span>
          </button>

          {/* Radar Filters Button */}
          {onOpenFilters && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenFilters();
              }}
              className={`p-1.5 rounded-xl border flex items-center gap-1 transition-all relative ${
                activeFiltersCount > 0
                  ? 'bg-[#e11d48] text-white border-[#e11d48]'
                  : isLight
                  ? 'bg-white border-[#fecdd3] text-[#64748b] hover:text-[#e11d48]'
                  : 'bg-[#1a0c13] border-[#e11d48]/30 text-[#fda4af]'
              }`}
              title="Filtros del Radar"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 text-black font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Card Deck Container */}
      <div className="relative w-full min-h-[560px]">
        {/* Next Card in Background (Smooth Depth Stack) */}
        {nextProfile && (
          <div
            className={`absolute inset-0 rounded-3xl border overflow-hidden pointer-events-none transition-transform duration-300 ${
              isLight
                ? 'bg-white border-[#fecdd3]/60 shadow-md'
                : 'bg-[#140b0f] border-[#e11d48]/20 shadow-lg'
            }`}
            style={{
              transform: 'scale(0.95) translateY(12px)',
              opacity: 0.7,
              zIndex: 1,
            }}
          >
            <div className="relative h-[360px] w-full bg-[#0b0507] overflow-hidden">
              <img
                src={nextProfile.photos[0]?.url}
                alt={nextProfile.displayName}
                className="w-full h-full object-cover filter blur-[0.5px]"
                referrerPolicy="no-referrer"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${
                  isLight ? 'from-black/75 via-black/20 to-transparent' : 'from-[#140b0f] via-black/30 to-transparent'
                }`}
              />
              <div className="absolute bottom-4 left-5 right-5">
                <h3 className="font-headline-md text-[22px] font-bold text-white">
                  {nextProfile.displayName}, {nextProfile.age}
                </h3>
              </div>
            </div>
          </div>
        )}

        {/* Active Forefront Card with Physics Drag Gestures */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`card-${currentProfile.id}`}
            style={{ x: dragX, y: dragY, rotate, zIndex: 10 }}
            drag={!exitDirection}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{
              x: exitDirection === 'right' ? 380 : exitDirection === 'left' ? -380 : 0,
              y: exitDirection === 'up' ? -380 : 0,
              opacity: 0,
              rotate: exitDirection === 'right' ? 22 : exitDirection === 'left' ? -22 : 0,
              scale: 0.9,
              transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
            }}
            transition={{
              type: 'spring',
              stiffness: 340,
              damping: 26,
            }}
            className="w-full touch-pan-y cursor-grab active:cursor-grabbing"
          >
            <Card
              className={`rounded-3xl border overflow-hidden relative shadow-2xl transition-shadow duration-300 ${
                isLight
                  ? 'bg-white border-[#fecdd3] shadow-[0_12px_35px_rgba(225,29,72,0.09)]'
                  : 'bg-[#140b0f] border-[#e11d48]/30 shadow-[0_0_35px_rgba(225,29,72,0.18)]'
              }`}
            >
              {/* Security Tint Overlay */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none z-10"
                style={{
                  backgroundImage: 'radial-gradient(#e11d48 1px, transparent 1px)',
                  backgroundSize: '10px 10px',
                }}
              />

              {/* Dynamic Live Stamp Indicators on Drag */}
              {/* LIKE Stamp (Drag Right) */}
              <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute top-8 left-6 z-30 pointer-events-none -rotate-12 border-3 border-emerald-500 bg-emerald-950/80 backdrop-blur-xs text-emerald-300 px-4 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                  <span className="font-label-caps text-[12px] tracking-widest font-black uppercase">
                    CONECTAR
                  </span>
                </div>
              </motion.div>

              {/* PASS Stamp (Drag Left) */}
              <motion.div
                style={{ opacity: passOpacity }}
                className="absolute top-8 right-6 z-30 pointer-events-none rotate-12 border-3 border-rose-500 bg-rose-950/80 backdrop-blur-xs text-rose-300 px-4 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.4)]"
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                  <span className="font-label-caps text-[12px] tracking-widest font-black uppercase">
                    PASAR
                  </span>
                </div>
              </motion.div>

              {/* SUPER LIKE Stamp (Drag Up) */}
              <motion.div
                style={{ opacity: superLikeOpacity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none border-3 border-amber-400 bg-amber-950/85 backdrop-blur-xs text-amber-300 px-5 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.5)]"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                  <span className="font-label-caps text-[13px] tracking-widest font-black uppercase">
                    SUPER SPARK
                  </span>
                </div>
              </motion.div>

              {/* Instant Action Stamps Overlays on Button Click */}
              {actionState === 'liked' && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                  <div
                    className="w-40 h-40 rounded-full border-4 border-[#e11d48] text-[#ff4d67] bg-[#0e070a]/95 flex flex-col items-center justify-center stamp-ink ink-stamp-pressed shadow-[0_0_40px_rgba(225,29,72,0.6)]"
                    style={{ transform: 'rotate(-10deg)' }}
                  >
                    <span className="material-symbols-outlined text-[48px] text-[#e11d48]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                    <span className="font-label-caps text-[12px] tracking-widest font-bold text-white">
                      SELLO CONEXIÓN
                    </span>
                  </div>
                </div>
              )}

              {actionState === 'passed' && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                  <div
                    className="w-36 h-36 rounded-full border-4 border-[#881337] text-[#fda4af] bg-[#0e070a]/95 flex flex-col items-center justify-center stamp-ink ink-stamp-pressed shadow-2xl"
                    style={{ transform: 'rotate(8deg)' }}
                  >
                    <span className="material-symbols-outlined text-[44px] text-[#e11d48]">close</span>
                    <span className="font-label-caps text-[11px] tracking-widest font-bold text-white">
                      ARCHIVADO
                    </span>
                  </div>
                </div>
              )}

              {actionState === 'starred' && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                  <div
                    className="w-36 h-36 rounded-full border-4 border-[#ffd700] text-[#ffd700] bg-[#0e070a]/95 flex flex-col items-center justify-center stamp-ink ink-stamp-pressed shadow-2xl"
                    style={{ transform: 'rotate(5deg)' }}
                  >
                    <span className="material-symbols-outlined text-[44px] text-[#ffd700]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    <span className="font-label-caps text-[11px] tracking-widest font-bold text-white">
                      SUPER SPARK
                    </span>
                  </div>
                </div>
              )}

              {/* Photography Canvas */}
              <div className="relative h-[380px] w-full bg-[#0b0507] overflow-hidden group">
                <img
                  src={currentProfile.photos[galleryIndex]?.url || currentProfile.photos[0]?.url}
                  alt={currentProfile.displayName}
                  className={`w-full h-full object-cover select-none transition-all duration-700 ${
                    isBlindMode && !unblurredCards[currentProfile.id]
                      ? 'filter blur-2xl scale-110'
                      : 'group-hover:scale-105'
                  }`}
                  referrerPolicy="no-referrer"
                  draggable={false}
                />

                {/* Blind Mode Overlay if blurred */}
                {isBlindMode && !unblurredCards[currentProfile.id] && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-md">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 mb-2 shadow-lg animate-pulse">
                      <span className="material-symbols-outlined text-[26px]">visibility_off</span>
                    </div>
                    <span className="font-label-caps text-[10px] uppercase tracking-widest text-amber-300 font-bold">
                      CITA A CIEGAS MELY
                    </span>
                    <p className="font-body-sm text-[12px] text-white/90 mt-1 max-w-[240px] leading-snug">
                      {currentProfile.blindPrompt?.teaser || 'Conoce primero su voz y reflexiones antes de descubrir la mirada.'}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playSpark();
                        setUnblurredCards((prev) => ({ ...prev, [currentProfile.id]: true }));
                      }}
                      className="mt-3 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[9px] uppercase font-bold tracking-wider shadow-md hover:scale-105 transition-transform flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[13px]">sparkles</span>
                      Revelar Mirada
                    </button>
                  </div>
                )}

                {/* Left/Right Photo Tap Zones */}
                {(!isBlindMode || unblurredCards[currentProfile.id]) && currentProfile.photos.length > 1 && (
                  <div className="absolute inset-0 z-10 flex">
                    <div
                      className="w-1/2 h-full cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (galleryIndex > 0) {
                          sounds.playClick();
                          setGalleryIndex((prev) => prev - 1);
                        }
                      }}
                      title="Foto anterior"
                    />
                    <div
                      className="w-1/2 h-full cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (galleryIndex < currentProfile.photos.length - 1) {
                          sounds.playClick();
                          setGalleryIndex((prev) => prev + 1);
                        }
                      }}
                      title="Foto siguiente"
                    />
                  </div>
                )}

                {/* Vignette & Gradient */}
                <div
                  className={`absolute inset-0 pointer-events-none bg-gradient-to-t ${
                    isLight
                      ? 'from-black/80 via-black/25 to-transparent'
                      : 'from-[#140b0f] via-[#140b0f]/30 to-transparent'
                  }`}
                />

                {/* Photo Pagination Bars */}
                {currentProfile.photos.length > 1 && (
                  <div className="absolute top-3 inset-x-4 flex gap-1.5 z-20 pointer-events-none">
                    {currentProfile.photos.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          idx === galleryIndex ? 'bg-[#ff4d67] shadow-xs' : 'bg-white/40'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Badges on Photo */}
                <div className="absolute top-7 left-4 z-20 flex gap-2 pointer-events-none">
                  <Badge className="font-label-caps text-[9px] uppercase tracking-wider bg-black/75 text-[#fda4af] px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-xs font-bold">
                    {currentProfile.membership.tierLabel}
                  </Badge>
                  {currentProfile.badges.trusted && (
                    <Badge className="font-meta-data text-[9px] bg-black/75 text-white px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1 backdrop-blur-xs font-bold">
                      <span className="material-symbols-outlined text-[12px] text-[#e11d48]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      Confianza verificada
                    </Badge>
                  )}
                </div>

                {/* Primary Name & Intro Overlay */}
                <div className="absolute bottom-4 left-5 right-5 z-20 flex justify-between items-end">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-baseline gap-2">
                      <h2 className="font-headline-md text-[26px] font-bold text-white tracking-tight drop-shadow-xs truncate">
                        {currentProfile.displayName}
                      </h2>
                      <span className="font-meta-data text-[18px] text-white/90 font-light">
                        {currentProfile.age}
                      </span>
                    </div>
                    <p className="font-body-sm text-[13px] text-[#fca5a5] opacity-95 mt-0.5 font-medium truncate">
                      {currentProfile.lookingForLabel}
                    </p>
                    <p className="font-meta-data text-[11px] text-white/80 flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-[13px] text-[#ff4d67]">location_on</span>
                      {currentProfile.city} • {currentProfile.distance}
                    </p>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      setShowFullNotebook(!showFullNotebook);
                    }}
                    className="p-2.5 bg-black/60 text-white hover:bg-black/80 rounded-full border border-white/30 backdrop-blur-xs shadow-md transition-colors"
                    title="Abrir cuaderno de memorias"
                  >
                    <motion.span
                      animate={{ rotate: showFullNotebook ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="material-symbols-outlined text-[20px] block"
                    >
                      expand_more
                    </motion.span>
                  </motion.button>
                </div>
              </div>

              {/* Bio & Details Notebook Area */}
              <div className={`p-5 flex flex-col gap-4 ${isLight ? 'bg-white' : 'bg-[#140b0f]'}`}>
                <p
                  className={`font-body-sm text-[14px] leading-relaxed italic border-l-2 border-[#e11d48] pl-3 ${
                    isLight ? 'text-[#334155]' : 'text-[#fce7eb]/90'
                  }`}
                >
                  "{currentProfile.bio}"
                </p>

                {/* Audio Bio Player Widget */}
                {currentProfile.audioBio && (
                  <div
                    className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                      isLight
                        ? 'bg-[#fff1f3] border-[#fecdd3]'
                        : 'bg-[#1c0c13] border-[#e11d48]/30 shadow-inner'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px] text-[#e11d48] shrink-0">mic</span>
                    <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                      <span className="font-label-caps text-[9px] uppercase font-bold text-[#e11d48] block mb-1">
                        Audio-bio
                      </span>
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <audio controls preload="none" className="w-full h-8" src={currentProfile.audioBio.url} />
                    </div>
                  </div>
                )}

                {/* Interests Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {currentProfile.interests.map((interest) => (
                    <Badge
                      key={interest.id}
                      variant="outline"
                      className={`font-label-caps text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full border transition-all ${
                        isLight
                          ? 'bg-[#fff1f3] text-[#e11d48] border-[#fecdd3] font-bold hover:bg-[#ffe4e6]'
                          : 'bg-[#1c0c12] text-[#fda4af] border-[#e11d48]/20 hover:border-[#e11d48]/40'
                      }`}
                    >
                      {interest.name}
                    </Badge>
                  ))}
                </div>

                {/* Expanded Prompts with Fluid Spring Animation */}
                <AnimatePresence>
                  {showFullNotebook && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className={`flex flex-col gap-3 pt-3 border-t ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
                        {currentProfile.prompts.map((prompt, pIdx) => (
                          <motion.div
                            key={pIdx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: pIdx * 0.08 }}
                            className={`p-3.5 rounded-2xl border ${
                              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0e070a] border-[#e11d48]/20'
                            }`}
                          >
                            <span className="font-label-caps text-[10px] text-[#e11d48] block mb-1 uppercase font-bold">
                              {prompt.question}
                            </span>
                            <p className={`font-body-sm text-[13px] ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                              {prompt.answer}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Ticket Perforation & Stub Metadata */}
                <div
                  className={`border-t pt-4 perforation-line flex justify-between items-center text-[10.5px] font-meta-data ${
                    isLight ? 'border-[#fecdd3] text-[#64748b]' : 'border-[#e11d48]/20 text-[#fda4af]/70'
                  }`}
                >
                  <span>PASAPORTE: {currentProfile.membership.tierLabel}</span>
                  <span>{currentProfile.lastActive}</span>
                </div>
              </div>

              {/* Tactile Action Controls Bar */}
              <div
                className={`p-4 border-t flex items-center justify-between px-6 ${
                  isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-[#0d0609] border-[#e11d48]/20'
                }`}
              >
                {/* Rewind button */}
                <motion.button
                  whileHover={{ scale: currentIndex > 0 ? 1.08 : 1 }}
                  whileTap={{ scale: currentIndex > 0 ? 0.92 : 1 }}
                  id="btn-discover-rewind"
                  onClick={() => {
                    if (currentIndex > 0) {
                      sounds.playClick();
                      setCurrentIndex((prev) => prev - 1);
                    }
                  }}
                  disabled={currentIndex === 0}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center transition-colors shadow-xs ${
                    currentIndex === 0
                      ? isLight
                        ? 'opacity-30 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
                        : 'opacity-30 cursor-not-allowed bg-[#140a0e] text-[#fda4af]/40 border-white/10'
                      : isLight
                      ? 'bg-white text-[#64748b] hover:text-[#e11d48] border-[#fecdd3]'
                      : 'bg-[#1c0c12] text-[#fda4af] hover:text-[#fb7185] border-white/10'
                  }`}
                  title="Deshacer"
                  aria-label="Deshacer perfil"
                >
                  <span className="material-symbols-outlined text-[20px]">replay</span>
                </motion.button>

                {/* Pass button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  id="btn-discover-pass"
                  onClick={() => triggerAction('passed')}
                  className={`w-13 h-13 rounded-full border flex items-center justify-center shadow-md transition-colors ${
                    isLight
                      ? 'border-red-200 bg-white text-red-500 hover:bg-red-50'
                      : 'border-[#881337] bg-[#1a080e] text-[#fb7185] hover:bg-[#881337]/30'
                  }`}
                  title="Pasar"
                  aria-label="Pasar perfil"
                >
                  <span className="material-symbols-outlined text-[26px]">close</span>
                </motion.button>

                {/* Super Like Star button */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  id="btn-discover-superlike"
                  onClick={() => triggerAction('starred')}
                  className={`w-11 h-11 rounded-full border flex items-center justify-center shadow-xs transition-colors ${
                    isLight
                      ? 'border-amber-200 bg-white text-amber-500 hover:bg-amber-50'
                      : 'border-[#fb7185]/40 bg-[#1c0c12] text-[#ffd700] hover:bg-[#ffd700]/15'
                  }`}
                  title="Super Spark"
                  aria-label="Super Like"
                >
                  <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
                  </span>
                </motion.button>

                {/* Like / Stamp button (Coral / Rose Gradient) */}
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  id="btn-discover-stamp-like"
                  onClick={() => triggerAction('liked')}
                  className="w-13 h-13 rounded-full border border-[#e11d48] bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] text-white flex items-center justify-center shadow-[0_0_22px_rgba(225,29,72,0.45)] transition-all"
                  title="Me gusta"
                  aria-label="Me gusta y conectar"
                >
                  <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </motion.button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
