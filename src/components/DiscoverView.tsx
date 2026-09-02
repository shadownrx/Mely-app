import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { Profile } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { LocationPrompt } from './LocationPrompt';

interface DiscoverViewProps {
  profiles: Profile[];
  isLoading?: boolean;
  onLike: (profile: Profile) => void;
  onPass: (profile: Profile) => void;
  onSuperLike: (profile: Profile) => void;
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
  onOpenVerifiedSpots?: () => void;
  onReload?: () => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  profiles,
  isLoading = false,
  onLike,
  onPass,
  onSuperLike,
  onOpenFilters,
  activeFiltersCount = 0,
  onOpenVerifiedSpots,
  onReload,
}) => {
  const { isLight } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionState, setActionState] = useState<'liked' | 'passed' | 'starred' | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showFullNotebook, setShowFullNotebook] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [unblurredCards, setUnblurredCards] = useState<Record<string, boolean>>({});

  // Mazo local, append-only: cada swipe dispara un refetch de /discover (para traer perfiles
  // nuevos), pero esa respuesta ya no incluye al que acabás de reaccionar — si indexáramos
  // directo sobre `profiles`, la posición actual pasaría a apuntar a otra persona y se salteaba
  // el siguiente perfil. Acá los nuevos se van agregando al final sin reordenar ni sacar nada.
  const [deck, setDeck] = useState<Profile[]>(profiles);
  const seenIds = useRef<Set<string>>(new Set(profiles.map((p) => p.id)));

  useEffect(() => {
    const fresh = profiles.filter((p) => !seenIds.current.has(p.id));
    if (fresh.length === 0) return;
    fresh.forEach((p) => seenIds.current.add(p.id));
    setDeck((prev) => [...prev, ...fresh]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  // Motion values for gesture physics
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Transform drag distance into smooth rotation & opacity indicators
  const rotate = useTransform(dragX, [-220, 220], [-18, 18]);
  const likeOpacity = useTransform(dragX, [30, 140], [0, 1]);
  const passOpacity = useTransform(dragX, [-30, -140], [0, 1]);
  const superLikeOpacity = useTransform(dragY, [-30, -120], [0, 1]);

  const currentProfile = deck[currentIndex];
  const nextProfile = deck[currentIndex + 1];

  if (isLoading && deck.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <div className="w-full min-h-[560px] rounded-3xl overflow-hidden flex flex-col gap-3 p-0">
          <Skeleton className="h-[380px] w-full rounded-none" />
          <div className="p-5 flex flex-col gap-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-1.5">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-14 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex flex-col gap-4">
      <LocationPrompt />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center justify-center py-20 px-6 text-center"
      >
        <div
          className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center text-[#e11d48] mb-4 ${
            isLight ? 'border-[#fecdd3] bg-white shadow-elevation-sm' : 'border-[#57423b] bg-[#140b0f]'
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
          disabled={isLoading}
          onClick={() => {
            sounds.playClick();
            onReload?.();
          }}
          className="px-6 py-2.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[11px] tracking-widest font-bold rounded-full tactile-btn hover:opacity-95 shadow-elevation-md shadow-[#e11d48]/25 disabled:opacity-60"
        >
          {isLoading ? 'BUSCANDO NUEVOS PERFILES…' : 'BUSCAR NUEVOS PERFILES'}
        </Button>
      </motion.div>
      </div>
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
      {/* Minimal top chrome — TopAppBar already shows the page title, this is just the filter icons */}
      <div className="flex justify-end items-center px-1">

        <div className="flex items-center gap-1.5">
          {onOpenVerifiedSpots && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenVerifiedSpots();
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isLight ? 'bg-[#f2f2f4] text-[#0f172a] hover:bg-[#e7e7ea]' : 'bg-white/8 text-[#fff1f2] hover:bg-white/14'
              }`}
              title="Rincones & Beneficios"
              aria-label="Rincones & Beneficios"
            >
              <span className="material-symbols-outlined text-[16px]">storefront</span>
            </button>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              setIsBlindMode(!isBlindMode);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isBlindMode
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                : isLight
                ? 'bg-[#f2f2f4] text-[#0f172a] hover:bg-[#e7e7ea]'
                : 'bg-white/8 text-[#fff1f2] hover:bg-white/14'
            }`}
            title="Modo Cita a Ciegas"
            aria-label="Modo Cita a Ciegas"
          >
            <span className="material-symbols-outlined text-[16px]">{isBlindMode ? 'visibility' : 'visibility_off'}</span>
          </button>

          {onOpenFilters && (
            <button
              onClick={() => {
                sounds.playClick();
                onOpenFilters();
              }}
              className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                activeFiltersCount > 0
                  ? 'bg-[#e11d48] text-white'
                  : isLight
                  ? 'bg-[#f2f2f4] text-[#0f172a] hover:bg-[#e7e7ea]'
                  : 'bg-white/8 text-[#fff1f2] hover:bg-white/14'
              }`}
              title="Filtros"
              aria-label="Filtros"
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

      <LocationPrompt />

      {/* Card Deck Container */}
      <div className="relative w-full min-h-[560px]">
        {/* Next Card in Background (Smooth Depth Stack) */}
        {nextProfile && (
          <div
            className={`absolute inset-0 rounded-3xl border overflow-hidden pointer-events-none transition-transform duration-300 shadow-elevation-sm ${
              isLight ? 'bg-white border-[#fecdd3]/60' : 'bg-[#140b0f] border-[#e11d48]/20'
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
              className={`rounded-3xl border overflow-hidden relative shadow-elevation-lg transition-shadow duration-300 ${
                isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
              }`}
            >
              {/* Dynamic Live Stamp Indicators on Drag */}
              {/* Sin backdrop-blur acá: con el fondo ya 80-85% opaco el blur aportaba poco
                  visualmente, pero recalcularlo en cada frame del drag (junto con la opacity
                  que sigue en vivo al gesto) es la combinación que más dispara el glitch de
                  Chrome Android que deja "pegado" un frame viejo (reportado por usuarios). */}
              {/* LIKE Stamp (Drag Right) */}
              <motion.div
                style={{ opacity: likeOpacity }}
                className="absolute top-8 left-6 z-30 pointer-events-none -rotate-12 border-3 border-emerald-500 bg-emerald-950/80 text-emerald-300 px-4 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.4)]"
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
                className="absolute top-8 right-6 z-30 pointer-events-none rotate-12 border-3 border-rose-500 bg-rose-950/80 text-rose-300 px-4 py-1.5 rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.4)]"
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
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none border-3 border-amber-400 bg-amber-950/85 text-amber-300 px-5 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(251,191,36,0.5)]"
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

              {/* Instant Action Feedback on Button Click */}
              {actionState === 'liked' && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] flex items-center justify-center shadow-[0_10px_30px_rgba(225,29,72,0.5)]">
                    <span className="material-symbols-outlined text-[40px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </div>
                </div>
              )}

              {actionState === 'passed' && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
                  <div className="w-24 h-24 rounded-full bg-white/15 border border-white/30 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[36px] text-white">close</span>
                  </div>
                </div>
              )}

              {actionState === 'starred' && (
                <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 backdrop-blur-[2px]">
                  <div className="w-24 h-24 rounded-full bg-amber-400 flex items-center justify-center shadow-[0_10px_30px_rgba(251,191,36,0.5)]">
                    <span className="material-symbols-outlined text-[36px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
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
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 mb-2 shadow-elevation-md animate-pulse">
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
                      className="mt-3 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[9px] uppercase font-bold tracking-wider shadow-elevation-md hover:scale-105 transition-transform flex items-center gap-1.5"
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

                {/* Photo progress segments, top */}
                {currentProfile.photos.length > 1 && (
                  <div className="absolute top-3 inset-x-4 flex gap-1.5 z-20 pointer-events-none">
                    {currentProfile.photos.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          idx === galleryIndex ? 'bg-white/90' : 'bg-white/35'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Primary Name & Intro Overlay — name/verified/location/bio-teaser directly on the photo, no separate white panel by default */}
                <div className="absolute bottom-4 left-5 right-5 z-20 flex justify-between items-end">
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="flex items-center gap-2">
                      <h2 className="font-headline-md text-[27px] font-extrabold text-white tracking-tight drop-shadow-xs truncate">
                        {currentProfile.displayName}, {currentProfile.age}
                      </h2>
                      {currentProfile.badges.trusted && (
                        <span className="material-symbols-outlined text-[20px] text-sky-400 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      )}
                    </div>
                    <p className="text-[13.5px] text-white/90 flex items-center gap-1 mt-1.5">
                      <span className="material-symbols-outlined text-[13px] text-[#ff4d67]">location_on</span>
                      {currentProfile.city} • {currentProfile.distance}
                    </p>
                    {currentProfile.bio && (
                      <p className="text-[13.5px] text-white/80 mt-1.5 truncate">{currentProfile.bio}</p>
                    )}
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      sounds.playClick();
                      setShowFullNotebook(!showFullNotebook);
                    }}
                    className="p-2.5 bg-black/60 text-white hover:bg-black/80 rounded-full border border-white/30 backdrop-blur-xs shadow-elevation-md transition-colors"
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

              {/* Everything below lives behind the expand chevron — by default the card is just
                  the photo + actions, matching the restrained direction. Nothing here is lost,
                  it's one tap away instead of always competing for space. */}
              <AnimatePresence>
                {showFullNotebook && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className={`p-5 flex flex-col gap-4 ${isLight ? 'bg-white' : 'bg-[#140b0f]'}`}>
                      {currentProfile.bio && (
                        <p className={`text-[14px] leading-relaxed ${isLight ? 'text-[#334155]' : 'text-[#fce7eb]/90'}`}>
                          {currentProfile.bio}
                        </p>
                      )}

                      {currentProfile.audioBio && (
                        <div
                          className={`p-3.5 rounded-2xl flex items-center gap-3 transition-all ${
                            isLight ? 'bg-[#fff1f3]' : 'bg-[#1c0c13]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px] text-[#e11d48] shrink-0">mic</span>
                          <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] font-bold text-[#e11d48] block mb-1">Audio-bio</span>
                            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                            <audio controls preload="none" className="w-full h-8" src={currentProfile.audioBio.url} />
                          </div>
                        </div>
                      )}

                      {currentProfile.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {currentProfile.interests.map((interest) => (
                            <Badge
                              key={interest.id}
                              variant="outline"
                              className={`text-[11px] px-2.5 py-1 rounded-full border-0 ${
                                isLight ? 'bg-[#fff1f3] text-[#e11d48] font-bold' : 'bg-[#1c0c12] text-[#fda4af]'
                              }`}
                            >
                              {interest.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {currentProfile.prompts.map((prompt, pIdx) => (
                        <motion.div
                          key={pIdx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: pIdx * 0.08 }}
                          className={`p-3.5 rounded-2xl ${isLight ? 'bg-[#fff5f6]' : 'bg-[#0e070a]'}`}
                        >
                          <span className="text-[11px] font-bold text-[#e11d48] block mb-1">{prompt.question}</span>
                          <p className={`text-[13px] ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{prompt.answer}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action row: small–big–small, the familiar Tinder/Bumble/Hinge rhythm. Rewind
                  sits further out and subdued so it doesn't compete with the 3 main actions. */}
              <div className="pt-4 pb-2 flex items-center justify-center gap-4">
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
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    currentIndex === 0
                      ? 'opacity-30 cursor-not-allowed text-slate-400 dark:text-white/30'
                      : isLight
                      ? 'text-slate-400 hover:text-[#e11d48]'
                      : 'text-white/40 hover:text-[#fb7185]'
                  }`}
                  title="Deshacer"
                  aria-label="Deshacer perfil"
                >
                  <span className="material-symbols-outlined text-[18px]">replay</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  id="btn-discover-pass"
                  onClick={() => triggerAction('passed')}
                  className={`w-[46px] h-[46px] rounded-full flex items-center justify-center shadow-elevation-sm transition-colors ${
                    isLight ? 'bg-white text-[#f43f5e]' : 'bg-[#17101390] text-[#fb7185]'
                  }`}
                  title="Pasar"
                  aria-label="Pasar perfil"
                >
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  id="btn-discover-stamp-like"
                  onClick={() => triggerAction('liked')}
                  className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#e11d48] to-[#ff4d67] text-white flex items-center justify-center shadow-[0_10px_22px_-6px_rgba(225,29,72,0.55)] transition-all"
                  title="Me gusta"
                  aria-label="Me gusta y conectar"
                >
                  <span className="material-symbols-outlined text-[27px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  id="btn-discover-superlike"
                  onClick={() => triggerAction('starred')}
                  className={`w-[46px] h-[46px] rounded-full flex items-center justify-center shadow-elevation-sm transition-colors ${
                    isLight ? 'bg-white text-[#3b82f6]' : 'bg-[#17101390] text-[#60a5fa]'
                  }`}
                  title="Super Spark"
                  aria-label="Super Like"
                >
                  <span className="material-symbols-outlined text-[21px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    star
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
