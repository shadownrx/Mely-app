import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'motion/react';
import { toast } from 'sonner';
import { Profile } from '../types';
import type { DiscoverQuota } from '../lib/api/discover';
import { sounds } from '../utils/audio';
import { computeAffinity } from '../utils/compatibility';
import { INTENTIONS, getIntention } from '../utils/intentions';
import { suggestPlanSpot } from '../utils/planSuggestion';
import { rememberFragment } from '../utils/fragmentContext';
import { ReportBlockSheet } from './ReportBlockSheet';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { LocationPrompt } from './LocationPrompt';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface DiscoverViewProps {
  profiles: Profile[];
  isLoading?: boolean;
  error?: unknown;
  /** Cuota diaria de perfiles (used/bonus/limit/remaining/resetsAt) — ya la devuelve
   * /discover, solo faltaba mostrarla. undefined mientras carga la primera vez. */
  quota?: DiscoverQuota;
  /** Selección editorial del día (/discover/person-of-the-day). null si hoy no hay o
   * si ya se reaccionó. */
  personOfTheDay?: Profile | null;
  onLike: (profile: Profile) => void;
  onPass: (profile: Profile) => void;
  onSuperLike: (profile: Profile) => void;
  onOpenFilters?: () => void;
  activeFiltersCount?: number;
  onOpenVerifiedSpots?: () => void;
  onOpenStore?: () => void;
  onReload?: () => void;
  /** Ids de mis intereses (para explicar la afinidad sin backend nuevo). */
  myInterestIds?: string[];
  /** Pilar 1: intención temporal activa (id de INTENTIONS) o null. */
  intentionId?: string | null;
  onSelectIntention?: (id: string | null) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  profiles,
  isLoading = false,
  error,
  quota,
  personOfTheDay,
  onLike,
  onPass,
  onSuperLike,
  onOpenFilters,
  activeFiltersCount = 0,
  onOpenVerifiedSpots,
  onOpenStore,
  onReload,
  myInterestIds = [],
  intentionId = null,
  onSelectIntention,
}) => {
  const { isLight } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionState, setActionState] = useState<'liked' | 'passed' | 'starred' | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showFullNotebook, setShowFullNotebook] = useState(false);
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | 'up' | null>(null);
  const [isBlindMode, setIsBlindMode] = useState(false);
  const [unblurredCards, setUnblurredCards] = useState<Record<string, boolean>>({});
  const [personOfDayPromoted, setPersonOfDayPromoted] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  /** Fragmento que disparó el último "me gusta" (interés/prompt) — contexto local. */
  const [likedFragment, setLikedFragment] = useState<string | null>(null);
  /** Pista única: reaccionar a un fragmento también es un me gusta. */
  const [hintSeen, setHintSeen] = useState(() => {
    try {
      return localStorage.getItem('mely-fragment-hint-seen') === '1';
    } catch {
      return true;
    }
  });
  const dismissHint = () => {
    setHintSeen(true);
    try {
      localStorage.setItem('mely-fragment-hint-seen', '1');
    } catch {
      /* modo privado: se muestra una vez por sesión */
    }
  };

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

  const quotaExhausted = quota ? quota.remaining <= 0 : false;

  // Tocar el banner de "Persona del día" adelanta ese perfil a la posición actual del
  // mazo (en vez de abrir un modal aparte) para que Me gusta/Pasar/Super Spark ya
  // funcionen sobre ella sin duplicar la lógica de swipe.
  const handleOpenPersonOfDay = () => {
    if (!personOfTheDay || personOfDayPromoted) return;
    sounds.playClick();
    seenIds.current.add(personOfTheDay.id);
    setDeck((prev) => {
      if (prev.some((p) => p.id === personOfTheDay.id)) return prev;
      const next = [...prev];
      next.splice(currentIndex, 0, personOfTheDay);
      return next;
    });
    setPersonOfDayPromoted(true);
  };

  const showPersonOfDayBanner = Boolean(personOfTheDay) && !personOfDayPromoted;

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

  // Datos incómodos: perfiles sin fotos no pueden romper la tarjeta.
  const mainPhotoUrl = currentProfile?.photos[galleryIndex]?.url || currentProfile?.photos[0]?.url || null;

  // Explicador de afinidad: aritmética client-side sobre datos que ya trae el
  // perfil (intereses, verificación, audio, distancia). Sin backend nuevo.
  const affinity = useMemo(
    () => (currentProfile ? computeAffinity(currentProfile, myInterestIds) : null),
    [currentProfile, myInterestIds],
  );

  const intention = getIntention(intentionId);

  // Pilar 2: hipótesis concreta de primera cita por perfil (rincón verificado
  // real + interés real). Null honesto cuando nada matchea: no se inventa.
  const planSuggestion = useMemo(
    () => (currentProfile ? suggestPlanSpot(currentProfile) : null),
    [currentProfile],
  );

  // Ronda 7: el motivo nunca puede quedar vacío. Cadena honesta: señal real →
  // ciudad real → curiosidad honesta (nunca datos inventados).
  const primaryReason = currentProfile
    ? affinity?.signals[0]?.label ??
      (currentProfile.city ? `En ${currentProfile.city}` : 'Historia por descubrir')
    : null;

  // La pista de fragmentos solo existe si hay fragmentos: enseñar una
  // interacción imposible es peor que no enseñar nada.
  const hasFragments =
    currentProfile &&
    (currentProfile.prompts.length > 0 || currentProfile.interests.length > 0 || Boolean(currentProfile.audioBio));

  // Ronda 8: el card revela UNA pieza de historia sin abrir el cuaderno (una
  // pregunta, no la respuesta; una voz, no el audio). Solo lectura: tocar abre
  // la profundidad. Si no hay nada, no hay peek — nunca relleno.
  const storyPeek = currentProfile
    ? currentProfile.prompts.length > 0
      ? {
          icon: 'format_quote',
          text: `“${currentProfile.prompts[0].question}”`,
          hint: 'Tiene una respuesta — tocá para leerla',
        }
      : currentProfile.audioBio
        ? {
            icon: 'mic',
            text: 'Se presentó con su voz',
            hint:
              currentProfile.audioBio.durationSec != null
                ? `Escuchá su audio de ${Math.floor(currentProfile.audioBio.durationSec / 60)}:${String(currentProfile.audioBio.durationSec % 60).padStart(2, '0')}`
                : 'Escuchá su audio',
          }
        : null
    : null;

  // El cuaderno solo se ofrece si tiene algo adentro.
  const hasNotebookContent =
    currentProfile &&
    Boolean(
      currentProfile.bio || currentProfile.audioBio || currentProfile.interests.length > 0 || currentProfile.prompts.length > 0,
    );



  if (error && deck.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <LocationPrompt />
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center justify-center py-20 px-6 text-center"
        >
          <div
            className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center text-[#ec4d86] mb-4 ${
              isLight ? 'bg-white shadow-elevation-sm' : 'bg-[#0f1a2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[36px]">signal_wifi_off</span>
          </div>
          <h2 className={`text-[22px] mb-2 font-bold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
            No pudimos cargar Descubrir
          </h2>
          <p className={`text-[14px] max-w-xs mb-6 ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/80'}`}>
            Revisá tu conexión e intentá de nuevo — tu cupo de hoy sigue intacto.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              sounds.playClick();
              onReload?.();
            }}
            className="px-6 py-2.5 font-label-caps text-[11px] tracking-widest font-bold rounded-full"
          >
            REINTENTAR
          </Button>
        </motion.div>
      </div>
    );
  }

  if (isLoading && deck.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-40" />
        <div className="w-full min-h-[min(560px,68dvh)] rounded-[var(--radius-lg)] overflow-hidden flex flex-col gap-3 p-0">
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

  if (quotaExhausted) {
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
          className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center text-amber-500 mb-4 ${
            isLight ? 'border-amber-200 bg-white shadow-elevation-sm' : 'border-amber-500/40 bg-[#0f1a2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[36px]">bolt</span>
        </div>
        <h2 className={`font-headline-md text-[22px] mb-2 font-bold ${isLight ? 'text-[#16223b]' : 'text-[#5b6478]'}`}>
          Por hoy está bien
        </h2>
        <p className={`font-body-sm text-[14px] max-w-xs mb-6 ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/80'}`}>
          Mañana hay más historias — el cupo vuelve {quota ? new Date(quota.resetsAt).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' }) : 'a la medianoche'}.
          Calidad antes que cantidad: eso también es MELY.
        </p>
        {onOpenStore && (
          <Button
            variant="primary"
            onClick={() => {
              sounds.playClick();
              onOpenStore();
            }}
            className="px-6 py-2.5 font-label-caps text-[11px] tracking-widest font-bold rounded-full"
          >
            AMPLIAR CUPO EN LA TIENDA
          </Button>
        )}
      </motion.div>
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
          className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center text-[#ec4d86] mb-4 ${
            isLight ? 'border-[#ffe0ec] bg-white shadow-elevation-sm' : 'border-[#6e7891] bg-[#0f1a2e]'
          }`}
        >
          <span className="material-symbols-outlined text-[36px]">auto_stories</span>
        </div>
        <h2 className={`font-headline-md text-[22px] mb-2 font-bold ${isLight ? 'text-[#16223b]' : 'text-[#5b6478]'}`}>
          Ya viste todo lo de hoy
        </h2>
        <p className={`font-body-sm text-[14px] max-w-xs mb-6 ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/80'}`}>
          {intentionId
            ? 'Con tu intención activa no queda nadie por ver. Probá pausarla o volver mañana.'
            : 'Mañana hay más historias. Descansar también es parte del ritual.'}
        </p>
        <div className="flex flex-col items-center gap-2.5">
          <Button
            variant="primary"
            disabled={isLoading}
            onClick={() => {
              sounds.playClick();
              onReload?.();
            }}
            className="px-6 py-2.5 font-label-caps text-[11px] tracking-widest font-bold rounded-full disabled:opacity-60"
          >
            {isLoading ? 'BUSCANDO…' : 'BUSCAR DE NUEVO'}
          </Button>
          {intentionId && onSelectIntention && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                onSelectIntention(null);
              }}
              className={`text-[12px] font-bold underline underline-offset-4 ${isLight ? 'text-[#ec4d86]' : 'text-[#ffa3c4]'}`}
            >
              Ver sin filtro de intención
            </button>
          )}
        </div>
      </motion.div>
      </div>
    );
  }

  const triggerAction = (type: 'liked' | 'passed' | 'starred') => {
    dismissHint();
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
      setLikedFragment(null);
      dragX.set(0);
      dragY.set(0);
      setCurrentIndex((prev) => prev + 1);
    }, 320);
  };

  /** "Me gusta" nacido de un fragmento concreto (un interés, un prompt). El
   * backend recibe el mismo like de siempre — el contexto vive en la UI y en
   * el toast, y mañana puede persistirse como {fragment} sin romper el contrato. */
  const likeFromFragment = (fragmentLabel: string) => {
    if (!currentProfile || actionState) return;
    dismissHint();
    setLikedFragment(fragmentLabel);
    // Pilar 3: el contexto viaja con el perfil hacia el match y el plan.
    rememberFragment(currentProfile.id, fragmentLabel);
    toast.success(`Te gustó: ${fragmentLabel}`, {
      description: `${currentProfile.displayName} va a ver que algo concreto te llamó la atención.`,
    });
    triggerAction('liked');
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
      <div className="flex items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <p className="section-kicker">Descubrir</p>
          <h2 className={`mt-1 text-[22px] font-bold tracking-tight ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
            Una conexión a la vez
          </h2>
          <p className={`mt-1 max-w-[250px] text-[12px] leading-relaxed ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/70'}`}>
            Conocé la historia antes de decidir si hay chispa.
          </p>
          {quota && (
            <div
              className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                quotaExhausted
                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-300'
                  : isLight
                  ? 'bg-[#efe7d8] text-[#5b6478]'
                  : 'bg-white/8 text-[#a9b2c9]'
              }`}
              title={`Se renueva ${new Date(quota.resetsAt).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })}`}
            >
              <span className="material-symbols-outlined text-[13px]">bolt</span>
              {quotaExhausted
                ? 'Por hoy está bien'
                : `${quota.remaining} ${quota.remaining === 1 ? 'historia' : 'historias'} hoy`}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Rincones & Beneficios, Modo Cita a Ciegas y Filtros son funcionalidad real que
              antes vivía como 3 íconos sueltos compitiendo con la card — el mockup aprobado
              (Discover.dc.html) solo deja un ícono de ajustes en la cabecera. Se mantiene todo,
              pero re-acomodado detrás de un único trigger colapsado; un puntito coral avisa
              cuando hay algo activo (cita a ciegas o filtros) sin ocupar más espacio visual. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={() => sounds.playClick()}
                className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  isLight ? 'bg-[#efe7d8] text-[#16223b] hover:bg-[#efe7d8]' : 'bg-white/8 text-[#f5f1e8] hover:bg-white/14'
                }`}
                title="Más opciones de Descubrir"
                aria-label="Más opciones de Descubrir"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                {(isBlindMode || activeFiltersCount > 0) && (
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#ec4d86] border-2 border-[var(--midnight-900)]" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Opciones de Descubrir</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {onOpenVerifiedSpots && (
                <DropdownMenuItem
                  onClick={() => {
                    sounds.playClick();
                    onOpenVerifiedSpots();
                  }}
                  className="gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#ec4d86]">storefront</span>
                  Rincones & Beneficios
                </DropdownMenuItem>
              )}
              <DropdownMenuCheckboxItem
                checked={isBlindMode}
                onCheckedChange={() => {
                  sounds.playClick();
                  setIsBlindMode(!isBlindMode);
                }}
                onSelect={(e) => e.preventDefault()}
                className="gap-2"
              >
                <span className="material-symbols-outlined text-[16px] text-[#ec4d86]">
                  {isBlindMode ? 'visibility' : 'visibility_off'}
                </span>
                Modo Cita a Ciegas
              </DropdownMenuCheckboxItem>
              {onOpenFilters && (
                <DropdownMenuItem
                  onClick={() => {
                    sounds.playClick();
                    onOpenFilters();
                  }}
                  className="gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#ec4d86]">tune</span>
                  <span className="flex-1">Filtros</span>
                  {activeFiltersCount > 0 && (
                    <span className="w-4 h-4 bg-[#ec4d86] text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </DropdownMenuItem>
              )}
              {currentProfile && (
                <DropdownMenuItem
                  onClick={() => {
                    sounds.playClick();
                    setIsReportOpen(true);
                  }}
                  className="gap-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#ec4d86]">flag</span>
                  <span className="flex-1">Reportar o bloquear</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Pilar 1: la intención manda. Ritual semanal en un tap — declara qué
          querés esta semana y el descubrimiento se ordena alrededor de eso. */}
      {onSelectIntention && (
        <div>
          <div
            className="flex gap-1.5 overflow-x-auto no-scrollbar px-1 -mx-1 py-0.5"
            role="group"
            aria-label="Intención de la semana"
          >
            {INTENTIONS.map((item) => {
              const active = intentionId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onSelectIntention(active ? null : item.id);
                  }}
                  aria-pressed={active}
                  title={item.blurb}
                  className={`shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border-[1.5px] text-[12px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                    active
                      ? 'bg-gradient-to-r from-[#ec4d86] to-[#ff6b9e] border-transparent text-white shadow-elevation-md'
                      : isLight
                        ? 'bg-white border-[rgba(22,34,59,0.14)] text-[#5b6478]'
                        : 'bg-white/5 border-white/10 text-[#a9b2c9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>
          <AnimatePresence mode="wait">
            <motion.p
              key={intentionId ?? 'none'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`mt-1.5 px-1 text-[11px] leading-snug ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/70'}`}
              aria-live="polite"
            >
              {intention
                ? `Tu intención: ${intention.label.toLowerCase()} — ${intention.blurb}. Queda guardada hasta que la cambies.`
                : '¿Qué querés estos días? Elegí una intención y te mostramos personas en esa sintonía.'}
            </motion.p>
          </AnimatePresence>
        </div>
      )}

      <LocationPrompt />

      {showPersonOfDayBanner && personOfTheDay && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={handleOpenPersonOfDay}
          className={`flex items-center gap-3 rounded-[var(--radius-md)] border p-2.5 text-left tactile-btn shadow-elevation-sm ${
            isLight ? 'bg-white border-[#ffe0ec]' : 'bg-[#0f1a2e] border-[#ec4d86]/25'
          }`}
        >
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-[#0a1120] flex items-center justify-center">
            {personOfTheDay.photos[0]?.url ? (
              <img
                src={personOfTheDay.photos[0]?.url}
                alt={personOfTheDay.displayName}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="material-symbols-outlined text-[24px] text-white/40" aria-hidden="true">person</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-label-caps text-[9.5px] uppercase font-bold tracking-wider text-[#ec4d86] flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              Persona del día
            </span>
            <p className={`text-[13.5px] font-bold truncate ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
              {personOfTheDay.displayName}, {personOfTheDay.age}
            </p>
            <p className={`text-[11.5px] truncate ${isLight ? 'text-[#5b6478]' : 'text-[#a9b2c9]'}`}>
              Elegida a mano para vos — dale un vistazo antes que el resto.
            </p>
          </div>
          <span className={`material-symbols-outlined text-[18px] shrink-0 ${isLight ? 'text-[#5b6478]' : 'text-[#a9b2c9]'}`}>
            chevron_right
          </span>
        </motion.button>
      )}

      {/* Card Deck Container — en teléfonos chicos la altura se adapta al viewport. */}
      <div className="relative w-full min-h-[min(560px,68dvh)]">
        {/* Next Card in Background (Smooth Depth Stack) */}
        {nextProfile && (
          <div
            className={`absolute inset-0 rounded-[var(--radius-lg)] border overflow-hidden pointer-events-none transition-transform duration-300 shadow-elevation-sm ${
              isLight ? 'bg-white border-[#ffe0ec]/60' : 'bg-[#0f1a2e] border-[#ec4d86]/20'
            }`}
            style={{
              transform: 'scale(0.95) translateY(12px)',
              opacity: 0.7,
              zIndex: 1,
            }}
          >
            <div className="relative h-[360px] w-full bg-[#0a1120] overflow-hidden">
              {nextProfile.photos[0]?.url && (
                <img
                  src={nextProfile.photos[0]?.url}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover filter blur-[0.5px]"
                  referrerPolicy="no-referrer"
                />
              )}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${
                  isLight ? 'from-black/75 via-black/20 to-transparent' : 'from-[#0f1a2e] via-black/30 to-transparent'
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
              className={`rounded-[var(--radius-lg)] border overflow-hidden relative shadow-elevation-lg transition-shadow duration-300 ${
                isLight ? 'bg-white border-[#ffe0ec]' : 'bg-[#0f1a2e] border-[#ec4d86]/30'
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
                className="absolute top-8 left-6 z-30 pointer-events-none -rotate-12 border-2 border-emerald-500 bg-emerald-950/80 text-emerald-300 px-4 py-1.5 rounded-[var(--radius-md)] shadow-elevation-md"
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    favorite
                  </span>
                  <span className="font-label-caps text-[13px] font-black">
                    Me gusta
                  </span>
                </div>
              </motion.div>

              {/* PASS Stamp (Drag Left) */}
              <motion.div
                style={{ opacity: passOpacity }}
                className="absolute top-8 right-6 z-30 pointer-events-none rotate-12 border-2 border-rose-500 bg-rose-950/80 text-rose-300 px-4 py-1.5 rounded-[var(--radius-md)] shadow-elevation-md"
              >
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                  <span className="font-label-caps text-[13px] font-black">
                    Pasar
                  </span>
                </div>
              </motion.div>

              {/* SUPER LIKE Stamp (Drag Up) */}
              <motion.div
                style={{ opacity: superLikeOpacity }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none border-2 border-amber-400 bg-amber-950/85 text-amber-300 px-5 py-2.5 rounded-[var(--radius-md)] shadow-elevation-md"
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
                <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 bg-black/45 backdrop-blur-[2px] px-8 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#ec4d86] to-[#ff6b9e] flex items-center justify-center shadow-elevation-lg">
                    <span className="material-symbols-outlined text-[40px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      favorite
                    </span>
                  </div>
                  {likedFragment && (
                    <p className="text-white text-[13px] font-bold leading-snug animate-fadeIn">
                      Te gustó: {likedFragment}
                    </p>
                  )}
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
                  <div className="w-24 h-24 rounded-full bg-amber-400 flex items-center justify-center shadow-elevation-lg">
                    <span className="material-symbols-outlined text-[36px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                  </div>
                </div>
              )}

              {/* Photography Canvas — altura fluida en viewports bajos. */}
              <div className="relative h-[min(380px,42dvh)] w-full bg-[#0a1120] overflow-hidden group">
                {mainPhotoUrl ? (
                  <img
                    src={mainPhotoUrl}
                    alt={currentProfile.displayName}
                    loading="eager"
                    decoding="async"
                    onError={(e) => {
                      // Imagen rota: se oculta y queda el lienzo midnight con la
                      // info encima, nunca un ícono de imagen rota.
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                    className={`w-full h-full object-cover select-none transition-all duration-700 ${
                      isBlindMode && !unblurredCards[currentProfile.id]
                        ? 'filter blur-2xl scale-110'
                        : 'group-hover:scale-105'
                    }`}
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/40" role="img" aria-label={`Sin fotos: ${currentProfile.displayName}`}>
                    <span className="material-symbols-outlined text-[56px]">person</span>
                    <span className="text-[12px] font-bold">Sin fotos todavía</span>
                  </div>
                )}

                {/* Blind Mode Overlay if blurred */}
                {isBlindMode && !unblurredCards[currentProfile.id] && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/40 backdrop-blur-md">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-300 mb-2 shadow-elevation-md">
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
                      className="mt-3 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#ec4d86] to-[#ff6b9e] text-white font-label-caps text-[9px] uppercase font-bold tracking-wider shadow-elevation-md hover:scale-105 transition-transform flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[13px]">sparkles</span>
                      Revelar Mirada
                    </button>
                  </div>
                )}

                {/* Left/Right Photo Tap Zones — botones reales: navegables por
                    teclado y con nombre para lector de pantalla. */}
                {(!isBlindMode || unblurredCards[currentProfile.id]) && currentProfile.photos.length > 1 && (
                  <div className="absolute inset-0 z-10 flex">
                    <button
                      type="button"
                      className="w-1/2 h-full cursor-pointer focus:outline-none focus-visible:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (galleryIndex > 0) {
                          sounds.playClick();
                          setGalleryIndex((prev) => prev - 1);
                        }
                      }}
                      title="Foto anterior"
                      aria-label={`Foto anterior (${galleryIndex} de ${currentProfile.photos.length})`}
                    />
                    <button
                      type="button"
                      className="w-1/2 h-full cursor-pointer focus:outline-none focus-visible:bg-white/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (galleryIndex < currentProfile.photos.length - 1) {
                          sounds.playClick();
                          setGalleryIndex((prev) => prev + 1);
                        }
                      }}
                      title="Foto siguiente"
                      aria-label={`Foto siguiente (${galleryIndex + 2} de ${currentProfile.photos.length})`}
                    />
                  </div>
                )}

                {/* Vignette & Gradient */}
                <div
                  className={`absolute inset-0 pointer-events-none bg-gradient-to-t ${
                    isLight
                      ? 'from-black/80 via-black/25 to-transparent'
                      : 'from-[#0f1a2e] via-[#0f1a2e]/30 to-transparent'
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
                    {/* Intención primero: qué busca, antes que la foto decida por vos. */}
                    <span className="mb-1.5 inline-flex items-center gap-1 rounded-full bg-black/55 border border-white/25 px-2.5 py-1 text-[10.5px] font-bold text-white backdrop-blur-xs">
                      <span className="material-symbols-outlined text-[12px] text-[#ff6b9e]">explore</span>
                      Busca: {currentProfile.lookingForLabel}
                    </span>
                    <div className="flex items-center gap-2">
                      <h2 className="font-headline-md text-[27px] font-extrabold text-white tracking-tight drop-shadow-xs truncate">
                        {currentProfile.displayName}, {currentProfile.age}
                      </h2>
                      {currentProfile.badges.trusted && (
                        <span
                          className="material-symbols-outlined text-[20px] text-[#ec4d86] shrink-0"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title="Citas verificadas"
                        >
                          verified
                        </span>
                      )}
                      {currentProfile.badges.verified && (
                        <span
                          className="material-symbols-outlined text-[20px] text-sky-400 shrink-0"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                          title="Identidad verificada"
                        >
                          verified
                        </span>
                      )}
                    </div>
                    <p className="text-[13.5px] text-white/90 flex items-center gap-1 mt-1.5">
                      <span className="material-symbols-outlined text-[13px] text-[#ff6b9e]">location_on</span>
                      {currentProfile.city} • {currentProfile.distance}
                    </p>
                    {/* Capítulo 1 cierra con el motivo humano (no con la bio
                        truncada, que vive completa en el cuaderno): en 1 segundo
                        entendés por qué apareció esta persona. */}
                    {primaryReason && (
                      <p className="text-[13.5px] font-semibold text-white mt-1.5 truncate flex items-center gap-1.5 drop-shadow-xs">
                        <span className="material-symbols-outlined text-[14px] text-[#ff6b9e] shrink-0">
                          {affinity?.signals[0]?.icon ?? 'location_on'}
                        </span>
                        <span className="truncate">{primaryReason}</span>
                      </p>
                    )}
                  </div>

                  {/* Sin contenido no hay cuaderno: el botón no se ofrece. */}
                  {hasNotebookContent && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playClick();
                        setShowFullNotebook(!showFullNotebook);
                      }}
                      className="relative p-2.5 bg-black/60 text-white hover:bg-black/80 rounded-full border border-white/30 backdrop-blur-xs shadow-elevation-md transition-colors"
                      title={`Abrir cuaderno: ${currentProfile.prompts.length} respuestas${currentProfile.audioBio ? ' + audio' : ''}`}
                      aria-label={`Abrir cuaderno de ${currentProfile.displayName}: ${currentProfile.prompts.length} respuestas${currentProfile.audioBio ? ' y audio' : ''}`}
                    >
                      <motion.span
                        animate={{ rotate: showFullNotebook ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="material-symbols-outlined text-[20px] block"
                      >
                        expand_more
                      </motion.span>
                      {/* Promesa de contenido: el chevron ya no es genérico, dice
                          cuánta historia hay adentro. */}
                      {(currentProfile.prompts.length > 0 || currentProfile.audioBio) && !showFullNotebook && (
                        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ec4d86] text-white text-[10px] font-bold flex items-center justify-center font-mono">
                          {currentProfile.prompts.length + (currentProfile.audioBio ? 1 : 0)}
                        </span>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Capítulo 2 — por qué esta persona: razones humanas primero, el %
                  como sello que las respalda (nunca "Compatibilidad: 87%"). Vive
                  DENTRO de la tarjeta para que todo salga junto con ella: un
                  mismo espacio, no bloques sueltos compitiendo. */}
              {affinity && (
                <motion.div
                  key={`affinity-${currentProfile.id}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className={`mx-4 mt-3 flex items-center gap-2.5 rounded-[var(--radius-md)] border px-3 py-2.5 ${
                    isLight ? 'bg-[#fcf9f2] border-[#ffe0ec]' : 'bg-[#0a1120] border-[#ec4d86]/20'
                  }`}
                  aria-live="polite"
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-[12px] font-bold truncate ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                      {primaryReason ?? 'Seleccionada para vos hoy'}
                    </p>
                    {affinity.signals.length > 1 && (
                      <p className={`text-[11px] truncate ${isLight ? 'text-[#5b6478]' : 'text-[#a9b2c9]'}`}>
                        {affinity.signals
                          .slice(1)
                          .map((s) => s.label)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <span
                    className="shrink-0 rounded-full bg-gradient-to-br from-[#ec4d86] to-[#ff6b9e] text-white text-[12px] font-extrabold px-2 py-0.5 font-mono"
                    title="Afinidad estimada con tus datos"
                  >
                    {affinity.score}
                  </span>
                </motion.div>
              )}

              {/* Capítulo 3 — qué podrían hacer: hipótesis concreta de primera
                  cita con rincón real. Si no hay match honesto, no existe. */}
              {planSuggestion && onOpenVerifiedSpots && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onOpenVerifiedSpots();
                  }}
                  className={`mx-4 mt-2 flex items-center gap-2 rounded-[var(--radius-md)] border px-2.5 py-2 text-left transition-colors active:scale-[0.99] ${
                    isLight ? 'bg-white border-[#ffe0ec] hover:bg-[#fcf9f2]' : 'bg-[#131f36] border-[#ec4d86]/20 hover:bg-white/5'
                  }`}
                  title={`Ver ${planSuggestion.spot.name}`}
                >
                  <span className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-[#ec4d86]/25">
                    <img
                      src={planSuggestion.spot.image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[12px] font-bold truncate ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                      Podrían ir a {planSuggestion.spot.name}
                    </span>
                    <span className={`block text-[11px] truncate ${isLight ? 'text-[#5b6478]' : 'text-[#a9b2c9]'}`}>
                      {planSuggestion.spot.neighborhood} · {planSuggestion.reason}
                    </span>
                  </span>
                  <span className={`material-symbols-outlined text-[16px] shrink-0 ${isLight ? 'text-[#5b6478]' : 'text-[#a9b2c9]'}`}>
                    chevron_right
                  </span>
                </button>
              )}

              {/* Nivel 3 — un fragmento sin abrir el cuaderno: la pregunta (no la
                  respuesta), la voz (no el audio). Tocar abre la profundidad.
                  El motivo sigue siendo la única entrada; esto es la promesa. */}
              {storyPeek && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playClick();
                    setShowFullNotebook(true);
                  }}
                  className={`mx-4 mt-2 flex items-center gap-2.5 rounded-[var(--radius-md)] border px-3 py-2 text-left transition-colors active:scale-[0.99] ${
                    isLight ? 'bg-white border-[#ffe0ec] hover:bg-[#fcf9f2]' : 'bg-[#0a1120] border-[#ec4d86]/20 hover:bg-white/5'
                  }`}
                  title="Abrir el cuaderno"
                  aria-label={`${storyPeek.text}. ${storyPeek.hint}`}
                >
                  <span className="material-symbols-outlined text-[18px] text-[#ec4d86] shrink-0" aria-hidden="true">
                    {storyPeek.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-[12px] italic truncate ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                      {storyPeek.text}
                    </span>
                    <span className={`block text-[11px] truncate ${isLight ? 'text-[#5b6478]' : 'text-[#a9b2c9]'}`}>
                      {storyPeek.hint}
                    </span>
                  </span>
                  <span className={`material-symbols-outlined text-[16px] shrink-0 ${isLight ? 'text-[#5b6478]' : 'text-[#a9b2c9]'}`} aria-hidden="true">
                    chevron_right
                  </span>
                </button>
              )}

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
                    <div className={`p-5 flex flex-col gap-4 ${isLight ? 'bg-white' : 'bg-[#0f1a2e]'}`}>
                      {currentProfile.bio && (
                        <p className={`text-[14px] leading-relaxed ${isLight ? 'text-[#2e5570]' : 'text-[#ffe0ec]/90'}`}>
                          {currentProfile.bio}
                        </p>
                      )}

                      {currentProfile.audioBio && (
                        <div
                          className={`p-3.5 rounded-[var(--radius-md)] flex items-center gap-3 transition-all ${
                            isLight ? 'bg-[#fcf9f2]' : 'bg-[#131f36]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[20px] text-[#ec4d86] shrink-0">mic</span>
                          <div className="flex-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                            <span className="text-[10px] font-bold text-[#ec4d86] block mb-1">Audio-bio</span>
                            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                            <audio controls preload="none" className="w-full h-8" src={currentProfile.audioBio.url} />
                          </div>
                        </div>
                      )}

                      {currentProfile.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {currentProfile.interests.map((interest) => (
                            <button
                              key={interest.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                likeFromFragment(`interés en ${interest.name}`);
                              }}
                              title={`Me gusta su interés en ${interest.name}`}
                              aria-label={`Me gusta su interés en ${interest.name}`}
                              className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1.5 min-h-[32px] rounded-full transition-transform active:scale-95 ${
                                isLight ? 'bg-[#fcf9f2] text-[#ec4d86] font-bold' : 'bg-[#131f36] text-[#ffa3c4]'
                              }`}
                            >
                              {interest.name}
                              <span className="material-symbols-outlined text-[13px]">favorite</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {currentProfile.prompts.map((prompt, pIdx) => (
                        <motion.div
                          key={pIdx}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: pIdx * 0.08 }}
                          className={`p-3.5 rounded-[var(--radius-md)] ${isLight ? 'bg-[#fcf9f2]' : 'bg-[#0a1120]'}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="text-[11px] font-bold text-[#ec4d86] block">{prompt.question}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                likeFromFragment(`respuesta sobre “${prompt.question}”`);
                              }}
                              title="Me gusta esta respuesta"
                              aria-label={`Me gusta su respuesta sobre ${prompt.question}`}
                              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#ec4d86] hover:bg-[#ec4d86]/10 active:scale-90 transition-all"
                            >
                              <span className="material-symbols-outlined text-[16px]">favorite</span>
                            </button>
                          </div>
                          <p
                            title={prompt.answer}
                            className={`text-[13px] leading-relaxed break-words line-clamp-8 ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}
                          >
                            {prompt.answer}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Pista única anti-Tinder: el camino principal no es el botón
                  grande, es reaccionar a algo concreto. Desaparece para siempre
                  con la primera acción. */}
              {!hintSeen && hasFragments && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playClick();
                    dismissHint();
                    setShowFullNotebook(true);
                  }}
                  className={`mx-4 mt-3 flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[11.5px] font-bold transition-colors animate-fadeIn ${
                    isLight ? 'bg-[#ec4d86]/8 text-[#ec4d86]' : 'bg-white/5 text-[#ffa3c4]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">favorite</span>
                  Tocá el corazón en lo que te guste — eso también es un me gusta
                </button>
              )}

              {/* Action row: pasar / me gusta / destacar, con deshacer discreto. */}
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
                      ? 'text-slate-400 hover:text-[#ec4d86]'
                      : 'text-white/40 hover:text-[#ffa3c4]'
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
                    isLight ? 'bg-white text-[#ff6b9e]' : 'bg-[#131f3690] text-[#ffa3c4]'
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
                  className="w-[60px] h-[60px] rounded-full bg-gradient-to-br from-[#ec4d86] to-[#ff6b9e] text-white flex items-center justify-center shadow-[0_10px_22px_-6px_rgba(225,29,72,0.55)] transition-all"
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
                    isLight ? 'bg-white text-[#6fa8c9]' : 'bg-[#131f3690] text-[#6fa8c9]'
                  }`}
                  title="Super Spark: le llega tu perfil destacado"
                  aria-label="Super Spark"
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

      {/* Seguridad integrada: reportar o bloquear sin tener que matchear primero. */}
      {currentProfile && (
        <ReportBlockSheet
          open={isReportOpen}
          onOpenChange={setIsReportOpen}
          partnerId={currentProfile.id}
          partnerName={currentProfile.displayName}
          onActionComplete={() => setCurrentIndex((prev) => prev + 1)}
        />
      )}
    </div>
  );
};
