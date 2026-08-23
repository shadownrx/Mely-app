import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Stamp } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useStamps } from '../hooks/useStamps';
import { useWallet } from '../hooks/useWallet';
import { useUploadAudioBio } from '../hooks/useProfile';
import { Button } from './ui/button';

interface ProfileViewProps {
  onSelectStamp: (stamp: Stamp) => void;
  onOpenFullSettings?: () => void;
  onOpenStore?: () => void;
  onSignOut: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onSelectStamp,
  onOpenFullSettings,
  onOpenStore,
  onSignOut,
}) => {
  const { isLight } = useTheme();
  const { user, refreshUser } = useAuth();
  const { data: stamps = [] } = useStamps();
  const { data: wallet } = useWallet();
  const uploadAudioBio = useUploadAudioBio();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [activeSubTab, setActiveSubTab] = useState<'passport' | 'audio_bio' | 'settings'>('passport');
  const [isPlaying, setIsPlaying] = useState(false);

  if (!user) return null;

  const unlockedStampsCount = stamps.filter((s) => s.unlocked).length;
  const progressPercent = stamps.length ? Math.min(100, Math.round((unlockedStampsCount / stamps.length) * 100)) : 0;
  const walletBalance = wallet?.balance ?? 0;

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadAudioBio.mutate(file, {
      onSuccess: () => {
        sounds.playNotification();
        refreshUser();
      },
      onError: (err: any) => toast.error(err?.message ?? 'No se pudo subir el audio'),
    });
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-6 pb-6 animate-fadeIn">
      {/* Profile Hero Ticket */}
      <section
        className={`rounded-3xl p-6 border relative overflow-hidden flex flex-col items-center ticket-edge-bottom shadow-2xl ${
          isLight ? 'bg-white border-[#fecdd3] shadow-[0_10px_30px_rgba(225,29,72,0.08)]' : 'bg-[#140b0f] border-[#e11d48]/30 shadow-2xl'
        }`}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(#e11d48 1px, transparent 1px)', backgroundSize: '12px 12px' }}
        />

        <div className={`flex items-center gap-1 p-1 rounded-full border mb-5 relative z-10 ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507]/90 border-[#e11d48]/30'}`}>
          {([
            ['passport', 'Pasaporte & Bóveda'],
            ['audio_bio', 'Mi Audio-Bio 🎙️'],
            ['settings', 'Ajustes'],
          ] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                sounds.playClick();
                setActiveSubTab(id);
              }}
              className={`px-3 py-1.5 h-auto rounded-full font-label-caps text-[9.5px] tracking-wider uppercase transition-all ${
                activeSubTab === id
                  ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold shadow-md shadow-[#e11d48]/30'
                  : isLight
                  ? 'text-[#64748b] hover:text-[#0f172a]'
                  : 'text-[#fda4af] opacity-70 hover:opacity-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={`relative w-24 h-24 rounded-full overflow-hidden mb-3 border-2 p-1 shadow-md ${isLight ? 'border-[#e11d48] bg-[#fff5f6]' : 'border-[#e11d48] bg-[#0b0507] shadow-[0_0_20px_rgba(225,29,72,0.35)]'}`}>
          <img src={user.photos[0]?.url} alt={user.displayName} className="w-full h-full object-cover rounded-full" referrerPolicy="no-referrer" />
        </div>

        <h2 className={`font-headline-md text-[24px] font-bold mb-0.5 tracking-tight text-center ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
          {user.displayName}
        </h2>
        <p className="font-meta-data text-[11px] text-[#e11d48] uppercase tracking-widest mb-6 font-bold">{user.membership.tierLabel}</p>

        <div className={`flex justify-between items-center w-full border-t pt-5 perforation-line ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/30'}`}>
          <div className="flex flex-col items-center flex-1">
            <span className={`font-label-caps text-[10px] uppercase tracking-wider mb-0.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>Sellos</span>
            <span className="font-body-sm text-[13px] font-bold text-[#e11d48]">{unlockedStampsCount}/{stamps.length}</span>
          </div>
          <div className={`h-7 w-px ${isLight ? 'bg-[#fecdd3]' : 'bg-[#e11d48]/30'}`} />
          <div className="flex flex-col items-center flex-1">
            <span className={`font-label-caps text-[10px] uppercase tracking-wider mb-0.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>Wallet</span>
            <span className={`font-body-sm text-[13px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{walletBalance.toLocaleString()} coins</span>
          </div>
          <div className={`h-7 w-px ${isLight ? 'bg-[#fecdd3]' : 'bg-[#e11d48]/30'}`} />
          <div className="flex flex-col items-center flex-1">
            <span className={`font-label-caps text-[10px] uppercase tracking-wider mb-0.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>Verificación</span>
            <span className={`font-meta-data text-[12px] ${isLight ? 'text-[#334155]' : 'text-[#fce7eb]'}`}>{user.badges.verificationLabel}</span>
          </div>
        </div>
      </section>

      {activeSubTab === 'passport' ? (
        <>
          {/* PASSPORT / STAMPS */}
          <section className="flex flex-col gap-4 relative">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-baseline">
                <h2 className={`font-headline-md text-[22px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>Pasaporte de Conexiones</h2>
                <span className={`font-meta-data text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>{unlockedStampsCount} de {stamps.length}</span>
              </div>
              <div className={`h-2 rounded-full overflow-hidden border ${isLight ? 'bg-gray-100 border-[#fecdd3]' : 'bg-[#1c0b12] border-[#e11d48]/20'}`}>
                <div className="h-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className={`p-5 rounded-3xl border grid grid-cols-3 gap-4 sm:gap-6 ${isLight ? 'bg-white border-[#fecdd3] shadow-sm' : 'bg-[#0b0507] border-[#e11d48]/25 shadow-[inset_0_4px_24px_rgba(0,0,0,0.8)]'}`}>
              {stamps.map((stamp) => (
                <button
                  key={stamp.key}
                  onClick={() => {
                    sounds.playStamp();
                    onSelectStamp(stamp);
                  }}
                  className={`flex flex-col items-center gap-2 group focus:outline-none ${stamp.unlocked ? '' : 'opacity-40 hover:opacity-75 transition-opacity'}`}
                >
                  <div
                    className={`w-16 h-16 rounded-full border-2 flex items-center justify-center relative group-hover:scale-105 transition-transform ${
                      stamp.unlocked
                        ? isLight
                          ? 'border-[#e11d48] bg-[#fff5f6] text-[#e11d48] shadow-sm'
                          : 'border-[#e11d48] bg-[#1c0c13]/80 text-[#e11d48] shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                        : isLight
                        ? 'border-dashed border-[#fecdd3] text-[#64748b] bg-gray-50'
                        : 'border-dashed border-[#e11d48]/40 text-[#fda4af] bg-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[26px]" style={stamp.unlocked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                      {stamp.unlocked ? stamp.iconName : 'lock'}
                    </span>
                  </div>
                  <div className="text-center">
                    <span className={`font-label-caps text-[9.5px] block uppercase tracking-wider font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{stamp.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* WALLET SUMMARY -> STORE */}
          <section
            className={`rounded-3xl p-6 border relative overflow-hidden shadow-2xl flex flex-col items-center text-center gap-2 ${
              isLight ? 'bg-gradient-to-br from-white to-[#fff5f6] border-[#fecdd3]' : 'bg-gradient-to-br from-[#1c0d13] to-[#10070a] border-[#e11d48]/35'
            }`}
          >
            <span className={`font-label-caps text-[11px] tracking-widest uppercase font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]'}`}>BALANCE ACTUAL</span>
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[#e11d48] text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>monetization_on</span>
              <span className={`font-display-lg text-[32px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{walletBalance.toLocaleString()}</span>
            </div>
            {onOpenStore && (
              <Button
                variant="cherry"
                size="sm"
                onClick={() => {
                  sounds.playClick();
                  onOpenStore();
                }}
                className="mt-1 rounded-full gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">local_mall</span>
                <span>Explorar Tienda</span>
              </Button>
            )}
          </section>
        </>
      ) : activeSubTab === 'audio_bio' ? (
        <section className="flex flex-col gap-4 animate-fadeIn">
          <div>
            <h2 className={`font-headline-md text-[22px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>Mi Audio-Bio</h2>
            <p className={`font-meta-data text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>Grabá una nota de audio corta para tu perfil.</p>
          </div>

          <div className={`rounded-3xl p-5 border relative overflow-hidden shadow-xl flex flex-col gap-4 ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
            {user.audioBio ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (isPlaying) {
                      audioPlayerRef.current?.pause();
                    } else {
                      audioPlayerRef.current?.play();
                    }
                  }}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md active:scale-95 ${isPlaying ? 'bg-[#e11d48] animate-pulse' : 'bg-gradient-to-tr from-[#e11d48] to-[#ff4d67]'}`}
                >
                  <span className="material-symbols-outlined text-[24px]">{isPlaying ? 'pause' : 'play_arrow'}</span>
                </button>
                <div className="flex-1">
                  <span className={`font-body-sm text-[13px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>Audio-bio activa</span>
                  {user.audioBio.durationSec != null && (
                    <span className="block text-[11px] text-[#e11d48] font-mono">{user.audioBio.durationSec}s</span>
                  )}
                </div>
                <audio
                  ref={audioPlayerRef}
                  src={user.audioBio.url}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            ) : (
              <p className={`text-[12px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>Todavía no subiste una audio-bio.</p>
            )}
          </div>

          <div className={`rounded-3xl p-5 border shadow-md flex flex-col gap-3 items-center text-center ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
            <span className="material-symbols-outlined text-[36px] text-[#e11d48]">mic</span>
            <p className={`text-[12px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>Subí un archivo de audio (mp3, m4a, wav) de hasta 60 segundos.</p>
            <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioFileChange} />
            <Button variant="cherry" onClick={() => audioInputRef.current?.click()} disabled={uploadAudioBio.isPending} className="rounded-full">
              {uploadAudioBio.isPending ? 'Subiendo...' : 'Subir Audio'}
            </Button>
          </div>
        </section>
      ) : (
        <section className="flex flex-col gap-5">
          <div className={`p-4 rounded-3xl border shadow-lg flex items-center justify-between ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-gradient-to-r from-[#1c0d13] to-[#14080d] border-[#e11d48]/40'}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#e11d48]/15 border border-[#e11d48]/30 text-[#e11d48] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">settings</span>
              </div>
              <div>
                <span className={`font-headline-md text-[14px] font-bold block ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>Panel Completo de Ajustes</span>
                <span className={`font-meta-data text-[10px] block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>Perfil, descubrimiento, seguridad y tema</span>
              </div>
            </div>
            <Button
              variant="cherry"
              size="sm"
              onClick={() => {
                sounds.playClick();
                onOpenFullSettings?.();
              }}
              className="rounded-xl gap-1"
            >
              <span>Abrir</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Button>
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              onClick={() => {
                sounds.playClick();
                onSignOut();
              }}
              className="w-full py-3.5 h-auto rounded-2xl text-[#e11d48] border-[#e11d48]/40 text-[14px] normal-case tracking-normal"
            >
              Cerrar Sesión
            </Button>
          </div>
        </section>
      )}
    </div>
  );
};
