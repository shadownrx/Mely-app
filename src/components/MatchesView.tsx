import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Match } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent } from './ui/dialog';
import { Skeleton } from './ui/skeleton';

interface MatchesViewProps {
  matches: Match[];
  isLoading?: boolean;
  onOpenChat: (connectionId: string) => void;
  onProposeDate: (match: Match) => void;
  onExploreMore?: () => void;
}

type FilterType = 'all' | 'online' | 'verified' | 'vip';
type ViewLayout = 'grid' | 'list';

export const MatchesView: React.FC<MatchesViewProps> = ({
  matches,
  isLoading = false,
  onOpenChat,
  onProposeDate,
  onExploreMore,
}) => {
  const { isLight } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [layoutMode, setLayoutMode] = useState<ViewLayout>('grid');
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [selectedGalleryIdx, setSelectedGalleryIdx] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);

  // Filter matches based on search & category
  const filteredMatches = matches.filter((match) => {
    const other = match.other;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      other.displayName.toLowerCase().includes(q) ||
      (other.city ?? '').toLowerCase().includes(q) ||
      other.interests.some((i) => i.name.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (activeFilter === 'online') return other.lastActive === 'En línea';
    if (activeFilter === 'verified') return other.badges.trusted;
    if (activeFilter === 'vip') return other.membership.tier === 'VIP' || other.membership.tier === 'FOUNDING';

    return true;
  });

  return (
    <div className="flex flex-col gap-4 pb-20 select-none">
      {/* Minimal header — TopAppBar already shows the page title, this is just the icon controls */}
      <div className="flex flex-col gap-3 px-0.5">
        <div className="flex justify-end items-center">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playClick();
                setSearchOpen((v) => !v);
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                searchOpen ? 'bg-[#e11d48] text-white' : isLight ? 'bg-[#f2f2f4] text-[#0f172a] hover:bg-[#e7e7ea]' : 'bg-white/8 text-[#fff1f2] hover:bg-white/14'
              }`}
              aria-label="Buscar y filtrar"
              title="Buscar y filtrar"
            >
              <span className="material-symbols-outlined text-[16px]">search</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setLayoutMode(layoutMode === 'grid' ? 'list' : 'grid');
              }}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                isLight ? 'bg-[#f2f2f4] text-[#0f172a] hover:bg-[#e7e7ea]' : 'bg-white/8 text-[#fff1f2] hover:bg-white/14'
              }`}
              aria-label={layoutMode === 'grid' ? 'Ver como lista' : 'Ver como cuadrícula'}
              title={layoutMode === 'grid' ? 'Ver como lista' : 'Ver como cuadrícula'}
            >
              <span className="material-symbols-outlined text-[16px]">{layoutMode === 'grid' ? 'view_list' : 'grid_view'}</span>
            </button>
          </div>
        </div>

        {/* Story-row of matches, Instagram-style gradient ring around each avatar */}
        {matches.length > 0 && (
          <div className="flex flex-col gap-1.5 pt-0.5">
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar py-0.5">
              {matches.map((m) => (
                <motion.button
                  key={`ribbon-${m.id}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedMatch(m);
                    setSelectedGalleryIdx(0);
                  }}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
                  title={`Ver perfil de ${m.other.displayName}`}
                >
                  <div className="relative">
                    <div className="w-[50px] h-[50px] rounded-full p-[2px] bg-gradient-to-tr from-[#e11d48] via-[#fb7185] to-[#f43f5e] shadow-elevation-sm transition-transform">
                      <img
                        src={m.other.photos[0]?.url}
                        alt={m.other.displayName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full border border-white dark:border-[#0d070a]"
                      />
                    </div>
                    {m.other.lastActive === 'En línea' && (
                      <span className="absolute bottom-0 right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0d070a]" />
                    )}
                    {m.unread > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-[#e11d48] text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-[#0d070a]">
                        {m.unread}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold truncate max-w-[54px] ${isLight ? 'text-[#1e293b]' : 'text-[#fce7eb]'}`}>
                    {m.other.displayName.split(' ')[0]}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Search & Filter Bar — collapsed by default, one tap away behind the search icon */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-1.5 pt-0.5">
                <div className="relative flex items-center">
                  <span className={`material-symbols-outlined absolute left-3 text-[17px] pointer-events-none ${isLight ? 'text-[#94a3b8]' : 'text-[#fda4af]/50'}`}>
                    search
                  </span>
                  <Input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar match..."
                    className="pl-9 pr-8 h-auto py-1.5 text-[12px]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-1 text-gray-400 hover:text-rose-500 p-2"
                      aria-label="Limpiar búsqueda"
                      title="Limpiar búsqueda"
                    >
                      <span className="material-symbols-outlined text-[15px]" aria-hidden="true">close</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'all', label: 'Todos', icon: 'grid_view' },
                    { id: 'online', label: 'En línea', icon: 'bolt' },
                    { id: 'verified', label: 'Verificados', icon: 'verified' },
                    { id: 'vip', label: 'VIP', icon: 'workspace_premium' },
                  ].map((f) => {
                    const isSelected = activeFilter === f.id;
                    return (
                      <motion.button
                        key={f.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          sounds.playClick();
                          setActiveFilter(f.id as FilterType);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10.5px] font-semibold flex items-center gap-1 whitespace-nowrap transition-all shrink-0 ${
                          isSelected
                            ? 'bg-[#e11d48] text-white'
                            : isLight
                            ? 'bg-[#f7f7f8] text-[#475569] hover:text-[#e11d48]'
                            : 'bg-white/5 text-[#a89a9e] hover:text-[#fb7185]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}>
                          {f.icon}
                        </span>
                        <span>{f.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MATCHES LIST / GRID LAYOUT                                   */}
      {/* ------------------------------------------------------------- */}
      {isLoading && matches.length === 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredMatches.length > 0 ? (
        <AnimatePresence mode="wait">
          {layoutMode === 'list' ? (
            /* COMPACT LIST VIEW */
            <motion.div
              key="list-layout"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-2"
            >
              {filteredMatches.map((match, idx) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    isLight
                      ? 'bg-white border-[#fecdd3]/70 hover:border-[#e11d48] shadow-elevation-sm'
                      : 'bg-[#140b0f] border-[#e11d48]/25 hover:border-[#e11d48]/60'
                  }`}
                >
                  {/* Left: Avatar + Info */}
                  <div
                    className="flex items-center gap-3 cursor-pointer min-w-0 flex-1"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedMatch(match);
                      setSelectedGalleryIdx(0);
                    }}
                  >
                    <div className="relative shrink-0">
                      <img
                        src={match.other.photos[0]?.url}
                        alt={match.other.displayName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-[#fecdd3]/60 dark:border-white/10"
                      />
                      {match.other.lastActive === 'En línea' && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#140b0f]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className={`text-[13px] font-bold truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>
                          {match.other.displayName}, {match.other.age}
                        </h4>
                        {match.other.badges.trusted && (
                          <span className="material-symbols-outlined text-[13px] text-[#e11d48]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            verified
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${isLight ? 'text-gray-500' : 'text-[#fda4af]/70'}`}>
                        {match.other.city || 'Buenos Aires'}
                      </p>
                    </div>
                  </div>

                  {/* Right: Sleek Compact Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Chat Icon Button */}
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        sounds.playClick();
                        onOpenChat(match.id);
                      }}
                      className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-colors ${
                        isLight
                          ? 'bg-[#fff1f3] border-[#fecdd3] text-[#e11d48] hover:bg-[#ffe4e6]'
                          : 'bg-white/5 border-white/10 text-[#fda4af] hover:bg-[#e11d48]/20'
                      }`}
                      title="Abrir Chat"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                    </motion.button>

                    {/* Date Pill Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        sounds.playStamp();
                        onProposeDate(match);
                      }}
                      className="h-8 px-2.5 rounded-xl bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white text-[10.5px] font-bold flex items-center gap-1 shadow-elevation-sm hover:brightness-105 transition-all"
                      title="Proponer Cita"
                    >
                      <span className="material-symbols-outlined text-[14px]">local_cafe</span>
                      <span>Cita</span>
                    </motion.button>
                  </div>
                </motion.div>
              ))}

              {onExploreMore && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: filteredMatches.length * 0.04, duration: 0.25 }}
                  onClick={() => {
                    sounds.playClick();
                    onExploreMore();
                  }}
                  className={`p-3 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 transition-colors ${
                    isLight
                      ? 'border-[#fecdd3] hover:border-[#e11d48] text-[#e11d48] hover:bg-[#fff1f3]'
                      : 'border-[#e11d48]/30 hover:border-[#e11d48]/60 text-[#fda4af] hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">explore</span>
                  <span className="text-[12px] font-bold">Seguir descubriendo</span>
                </motion.button>
              )}
            </motion.div>
          ) : (
            /* REFINED COMPACT GRID VIEW */
            <motion.div
              key="grid-layout"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-2 gap-3"
            >
              {filteredMatches.map((match, idx) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04, duration: 0.25 }}
                >
                  {/* Instagram-grid weight: square photo, minimal chrome, name below not on top */}
                  <div
                    className="relative aspect-[1/1.15] rounded-2xl overflow-hidden cursor-pointer bg-[#0b0507] group"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedMatch(match);
                      setSelectedGalleryIdx(0);
                    }}
                    title="Ver perfil completo"
                  >
                    <img
                      src={match.other.photos[0]?.url}
                      alt={match.other.displayName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    {match.other.lastActive === 'En línea' && (
                      <span className="absolute top-2.5 right-2.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0b090a]" />
                    )}
                    <motion.button
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playClick();
                        onOpenChat(match.id);
                      }}
                      className="absolute bottom-2.5 right-2.5 w-9 h-9 rounded-full bg-white/95 shadow-elevation-sm flex items-center justify-center text-[#e11d48]"
                      title="Abrir chat"
                      aria-label="Abrir chat"
                    >
                      <span className="material-symbols-outlined text-[16px]">chat</span>
                    </motion.button>
                  </div>
                  <div className="pt-2 px-0.5">
                    <div className="flex items-center gap-1">
                      <h3 className="text-[13.5px] font-bold truncate">
                        {match.other.displayName}, {match.other.age}
                      </h3>
                      {match.other.badges.trusted && (
                        <span className="material-symbols-outlined text-[13px] text-sky-400 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                          verified
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-[#a89a9e]">{match.other.city || 'Buenos Aires'}</span>
                  </div>
                </motion.div>
              ))}

              {/* Tile final para seguir explorando: con pocos matches, el grid dejaba
                  mucho espacio vacío debajo en vez de invitar a la próxima acción. */}
              {onExploreMore && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: filteredMatches.length * 0.04, duration: 0.25 }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      onExploreMore();
                    }}
                    className={`w-full h-full min-h-[212px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-center p-4 transition-colors ${
                      isLight
                        ? 'border-[#fecdd3] hover:border-[#e11d48] text-[#e11d48] hover:bg-[#fff1f3]'
                        : 'border-[#e11d48]/30 hover:border-[#e11d48]/60 text-[#fda4af] hover:bg-white/5'
                    }`}
                  >
                    <span className="w-10 h-10 rounded-full bg-[#e11d48]/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-[22px]">explore</span>
                    </span>
                    <span className="text-[12px] font-bold leading-tight">Seguir descubriendo</span>
                    <span className="text-[10px] opacity-70">Encontrá más conexiones</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex flex-col items-center justify-center py-12 px-6 text-center rounded-2xl border border-dashed ${
            isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-[#e11d48]/10 text-[#e11d48] flex items-center justify-center mb-2.5">
            <span className="material-symbols-outlined text-[26px]">favorite_border</span>
          </div>
          <h3 className={`font-headline-md text-[15px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
            {searchQuery ? 'Sin coincidencias' : 'Sin sparks en este filtro'}
          </h3>
          <p className={`font-body-sm text-[11.5px] max-w-xs mt-1 mb-4 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
            {searchQuery
              ? 'Prueba buscando con otro término.'
              : 'Explora perfiles en el radar para generar nuevas conexiones.'}
          </p>

          {searchQuery ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('all');
              }}
              className="rounded-full px-3.5 h-7.5 text-[11px] font-bold border-[#e11d48] text-[#e11d48]"
            >
              Limpiar búsqueda
            </Button>
          ) : onExploreMore ? (
            <Button
              size="sm"
              onClick={() => {
                sounds.playHeart();
                onExploreMore();
              }}
              className="bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white rounded-full px-4 h-8 text-[11px] font-bold shadow-elevation-sm hover:brightness-105 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">explore</span>
              <span>Seguir Descubriendo</span>
            </Button>
          ) : null}
        </motion.div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MATCH PROFILE DETAIL MODAL WITH FLUID SPRING ANIMATION        */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedMatch(null)}
              className="absolute inset-0 bg-black/75 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 14 }}
              transition={{ type: 'spring', stiffness: 360, damping: 28 }}
              className={`relative z-10 w-full max-w-md max-h-[88vh] rounded-2xl overflow-hidden flex flex-col shadow-2xl border ${
                isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/40 text-[#fff1f2]'
              }`}
            >
              {/* Modal Header Gallery */}
              <div className="relative h-60 w-full bg-black shrink-0">
                <img
                  src={selectedMatch.other.photos[selectedGalleryIdx]?.url || selectedMatch.other.photos[0]?.url}
                  alt={selectedMatch.other.displayName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                {/* Close Button */}
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="absolute top-3 right-3 w-11 h-11 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Cerrar"
                  title="Cerrar"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
                </button>

                {/* Photo Dots */}
                {selectedMatch.other.photos.length > 1 && (
                  <div className="absolute top-3 left-3 flex items-center gap-1">
                    {selectedMatch.other.photos.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedGalleryIdx(idx)}
                        aria-label={`Foto ${idx + 1}`}
                        className="py-3 px-1 flex items-center"
                      >
                        <span
                          className={`h-1.5 rounded-full transition-all duration-200 block ${
                            selectedGalleryIdx === idx ? 'w-5 bg-[#e11d48]' : 'w-2 bg-white/60'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
                {/* Bottom Identity Overlay */}
                <div className="absolute bottom-3 left-3.5 right-3.5">
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xl font-bold text-white drop-shadow-xs">
                      {selectedMatch.other.displayName}, {selectedMatch.other.age}
                    </h2>
                    {selectedMatch.other.badges.trusted && (
                      <span className="material-symbols-outlined text-[#e11d48] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                    )}
                  </div>
                  <p className="text-[#fda4af] text-[12px] font-medium">
                    {selectedMatch.other.city}
                  </p>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-3.5 overflow-y-auto flex flex-col gap-3">
                {/* Bio */}
                <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-[#fff1f3]/50 border-[#fecdd3]' : 'bg-white/5 border-white/10'}`}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#e11d48] mb-0.5">
                    Sobre {selectedMatch.other.displayName}
                  </h4>
                  <p className={`text-[12px] leading-relaxed ${isLight ? 'text-[#334155]' : 'text-[#fce7eb]'}`}>
                    {selectedMatch.other.bio}
                  </p>
                </div>

                {/* Interests */}
                {selectedMatch.other.interests.length > 0 && (
                  <div>
                    <h4 className={`text-[10px] font-bold uppercase tracking-wider mb-1.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                      Intereses
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedMatch.other.interests.map((interest) => (
                        <span
                          key={interest.id}
                          className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-medium border ${
                            isLight
                              ? 'bg-[#fff1f3] text-[#e11d48] border-[#fecdd3]'
                              : 'bg-[#e11d48]/15 text-[#fda4af] border-[#e11d48]/30'
                          }`}
                        >
                          #{interest.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Prompts Q&A */}
                {selectedMatch.other.prompts.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <h4 className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                      Icebreakers
                    </h4>
                    {selectedMatch.other.prompts.map((p) => (
                      <div
                        key={p.id}
                        className={`p-2.5 rounded-xl border ${
                          isLight ? 'bg-gray-50 border-gray-200' : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <p className="text-[10.5px] font-bold text-[#e11d48] mb-0.5">
                          {p.question}
                        </p>
                        <p className={`text-[11.5px] ${isLight ? 'text-gray-700' : 'text-gray-200'}`}>
                          {p.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Actions Footer - Compact & Elegant */}
              <div
                className={`p-3 border-t flex items-center gap-2 shrink-0 ${
                  isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#180b12] border-[#e11d48]/30'
                }`}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    sounds.playClick();
                    const id = selectedMatch.id;
                    setSelectedMatch(null);
                    onOpenChat(id);
                  }}
                  className={`flex-1 h-8.5 text-[11px] font-bold rounded-xl border flex items-center justify-center gap-1.5 transition-colors ${
                    isLight
                      ? 'bg-white border-[#fecdd3] text-[#e11d48] hover:bg-[#fff1f3]'
                      : 'bg-white/5 border-white/10 text-[#fda4af] hover:bg-white/10'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">chat</span>
                  <span>Chat</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    sounds.playStamp();
                    const target = selectedMatch;
                    setSelectedMatch(null);
                    onProposeDate(target);
                  }}
                  className="flex-1 h-8.5 bg-gradient-to-r from-[#e11d48] via-[#f43f5e] to-[#ff4d67] text-white text-[11px] font-bold rounded-xl shadow-elevation-sm flex items-center justify-center gap-1.5 hover:brightness-105 transition-all"
                >
                  <span className="material-symbols-outlined text-[15px]">local_cafe</span>
                  <span>Proponer Cita</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
