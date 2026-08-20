import React, { useState } from 'react';
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
  onProposeDateDirect: (profile: Profile) => void;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  profiles,
  onLike,
  onPass,
  onSuperLike,
  onProposeDateDirect,
}) => {
  const { isLight } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [actionState, setActionState] = useState<'liked' | 'passed' | 'starred' | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [showFullNotebook, setShowFullNotebook] = useState(false);

  const currentProfile = profiles[currentIndex];

  if (!currentProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
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
      </div>
    );
  }

  const handleAction = (type: 'liked' | 'passed' | 'starred') => {
    setActionState(type);
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
      setGalleryIndex(0);
      setShowFullNotebook(false);
      setCurrentIndex((prev) => prev + 1);
    }, 450);
  };

  return (
    <div className="flex flex-col gap-5 pb-8 animate-fadeIn">
      {/* Top Header Tag */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#e11d48] animate-ping" />
          <Badge
            variant="outline"
            className={`font-label-caps text-[10px] uppercase tracking-widest font-bold border-0 px-0 ${
              isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'
            }`}
          >
            Curaduría de Conexiones
          </Badge>
        </div>
        <span className={`font-meta-data text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
          Perfil {currentIndex + 1} de {profiles.length}
        </span>
      </div>

      {/* Main Discover Card - Physical Keepsake Ticket */}
      <Card
        className={`rounded-3xl border overflow-hidden relative shadow-2xl transition-all duration-300 ${
          isLight
            ? 'bg-white border-[#fecdd3] shadow-[0_10px_30px_rgba(225,29,72,0.08)]'
            : 'bg-[#140b0f] border-[#e11d48]/30 shadow-[0_0_30px_rgba(225,29,72,0.15)]'
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

        {/* Action Stamps Animation Overlay */}
        {actionState === 'liked' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
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
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
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
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
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
            src={currentProfile.gallery[galleryIndex] || currentProfile.avatar}
            alt={currentProfile.name}
            className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />

          {/* Vignette & Gradient */}
          <div
            className={`absolute inset-0 bg-gradient-to-t ${
              isLight
                ? 'from-black/80 via-black/25 to-transparent'
                : 'from-[#140b0f] via-[#140b0f]/30 to-transparent'
            }`}
          />

          {/* Photo Pagination Bars */}
          {currentProfile.gallery.length > 1 && (
            <div className="absolute top-3 inset-x-4 flex gap-1.5 z-20">
              {currentProfile.gallery.map((_, idx) => (
                <div
                  key={idx}
                  onClick={() => setGalleryIndex(idx)}
                  className={`h-1 flex-1 rounded-full cursor-pointer transition-all ${
                    idx === galleryIndex ? 'bg-[#ff4d67]' : 'bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Badges on Photo */}
          <div className="absolute top-7 left-4 z-20 flex gap-2">
            <Badge className="font-label-caps text-[9px] uppercase tracking-wider bg-black/75 text-[#fda4af] px-2.5 py-1 rounded-full border border-white/20 backdrop-blur-sm font-bold">
              {currentProfile.membership}
            </Badge>
            <Badge className="font-meta-data text-[9px] bg-black/75 text-white px-2.5 py-1 rounded-full border border-white/20 flex items-center gap-1 backdrop-blur-sm font-bold">
              <span className="material-symbols-outlined text-[12px] text-[#e11d48]" style={{ fontVariationSettings: "'FILL' 1" }}>
                verified
              </span>
              {currentProfile.verifiedEncounters} Encuentros
            </Badge>
          </div>

          {/* Primary Name & Intro Overlay */}
          <div className="absolute bottom-4 left-5 right-5 z-20 flex justify-between items-end">
            <div>
              <div className="flex items-baseline gap-2">
                <h2 className="font-headline-md text-[26px] font-bold text-white tracking-tight">
                  {currentProfile.name}
                </h2>
                <span className="font-meta-data text-[18px] text-white/90 font-light">
                  {currentProfile.age}
                </span>
              </div>
              <p className="font-body-sm text-[13px] text-[#fca5a5] opacity-95 mt-0.5 font-medium">
                {currentProfile.occupation}
              </p>
              <p className="font-meta-data text-[11px] text-white/80 flex items-center gap-1 mt-1">
                <span className="material-symbols-outlined text-[13px] text-[#ff4d67]">location_on</span>
                {currentProfile.city} • {currentProfile.distance}
              </p>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                sounds.playClick();
                setShowFullNotebook(!showFullNotebook);
              }}
              className="p-2 bg-black/60 text-white hover:bg-black/80 rounded-full border border-white/30 backdrop-blur-sm"
              title="Abrir cuaderno de memorias"
            >
              <span className="material-symbols-outlined text-[20px]">
                {showFullNotebook ? 'expand_less' : 'expand_more'}
              </span>
            </Button>
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

          {/* Interests Tags */}
          <div className="flex flex-wrap gap-1.5">
            {currentProfile.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className={`font-label-caps text-[9px] uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                  isLight
                    ? 'bg-[#fff1f3] text-[#e11d48] border-[#fecdd3] font-bold'
                    : 'bg-[#1c0c12] text-[#fda4af] border-[#e11d48]/20'
                }`}
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Expanded Prompts */}
          {showFullNotebook && (
            <div className={`flex flex-col gap-3 pt-3 border-t animate-fadeIn ${isLight ? 'border-gray-100' : 'border-white/5'}`}>
              {currentProfile.prompts.map((prompt, pIdx) => (
                <div
                  key={pIdx}
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
                </div>
              ))}
            </div>
          )}

          {/* Ticket Perforation & Stub Metadata */}
          <div
            className={`border-t pt-4 perforation-line flex justify-between items-center text-[10.5px] font-meta-data ${
              isLight ? 'border-[#fecdd3] text-[#64748b]' : 'border-[#e11d48]/20 text-[#fda4af]/70'
            }`}
          >
            <span>PASAPORTE: {currentProfile.passType}</span>
            <span>MIEMBRO DESDE: {currentProfile.joined}</span>
          </div>
        </div>

        {/* Tactile Action Controls Bar */}
        <div
          className={`p-4 border-t flex items-center justify-between px-6 ${
            isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-[#0d0609] border-[#e11d48]/20'
          }`}
        >
          {/* Rewind button */}
          <Button
            id="btn-discover-rewind"
            variant="ghost"
            size="icon"
            onClick={() => {
              if (currentIndex > 0) {
                sounds.playClick();
                setCurrentIndex((prev) => prev - 1);
              }
            }}
            disabled={currentIndex === 0}
            className={`w-11 h-11 rounded-full border flex items-center justify-center tactile-btn active:scale-95 transition-all shadow-sm ${
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
          </Button>

          {/* Pass button */}
          <Button
            id="btn-discover-pass"
            variant="ghost"
            size="icon"
            onClick={() => handleAction('passed')}
            className={`w-13 h-13 rounded-full border flex items-center justify-center tactile-btn active:scale-95 transition-all shadow-md hover:scale-105 ${
              isLight
                ? 'border-red-200 bg-white text-red-500 hover:bg-red-50'
                : 'border-[#881337] bg-[#1a080e] text-[#fb7185] hover:bg-[#881337]/30'
            }`}
            title="Pasar"
            aria-label="Pasar perfil"
          >
            <span className="material-symbols-outlined text-[26px]">close</span>
          </Button>

          {/* Super Like Star button */}
          <Button
            id="btn-discover-superlike"
            variant="ghost"
            size="icon"
            onClick={() => handleAction('starred')}
            className={`w-11 h-11 rounded-full border flex items-center justify-center tactile-btn active:scale-95 transition-all shadow-sm hover:scale-105 ${
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
          </Button>

          {/* Like / Stamp button (Coral / Rose Gradient) */}
          <Button
            id="btn-discover-stamp-like"
            variant="ghost"
            size="icon"
            onClick={() => handleAction('liked')}
            className="w-13 h-13 rounded-full border border-[#e11d48] bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] text-white flex items-center justify-center tactile-btn active:scale-95 transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:scale-105 hover:brightness-105"
            title="Me gusta"
            aria-label="Me gusta y conectar"
          >
            <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              favorite
            </span>
          </Button>

          {/* Propose Date Direct button */}
          <Button
            id="btn-discover-propose"
            variant="ghost"
            size="icon"
            onClick={() => {
              sounds.playStamp();
              onProposeDateDirect(currentProfile);
            }}
            className={`w-11 h-11 rounded-full border flex items-center justify-center tactile-btn active:scale-95 transition-all shadow-sm hover:scale-105 ${
              isLight
                ? 'border-[#fecdd3] bg-white text-[#e11d48] hover:bg-[#fff1f3]'
                : 'border-[#fb7185]/30 bg-[#1c0c12] text-[#fda4af] hover:bg-[#e11d48]/20'
            }`}
            title="Proponer Café / Cita"
            aria-label="Proponer cita"
          >
            <span className="material-symbols-outlined text-[20px]">local_cafe</span>
          </Button>
        </div>
      </Card>
    </div>
  );
};
