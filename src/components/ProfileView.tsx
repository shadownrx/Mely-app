import React, { useRef, useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { toast } from 'sonner';
import { Stamp } from '../types';
import { sounds } from '../utils/audio';
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
  const { user, refreshUser } = useAuth();
  const { data: stamps = [] } = useStamps();
  const { data: wallet } = useWallet();
  const uploadAudioBio = useUploadAudioBio();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!user) return null;

  const unlockedStamps = stamps.filter((s) => s.unlocked);
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

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-6 pb-6">
      {/* Settings door — the one place that leads to the full Ajustes panel */}
      <motion.div variants={item} className="flex justify-end -mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            sounds.playClick();
            onOpenFullSettings?.();
          }}
          className="rounded-full"
          aria-label="Ajustes"
        >
          <span className="material-symbols-outlined text-[22px]">settings</span>
        </Button>
      </motion.div>

      {/* Header: avatar in gradient ring, name + verified, one-line meta, membership pill */}
      <motion.section variants={item} className="flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
          className="w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-[#e11d48] to-[#ff4d67]"
        >
          <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-white dark:border-[#0b090a]">
            <img src={user.photos[0]?.url} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        </motion.div>

        <div className="flex items-center gap-1.5 mt-3">
          <h2 className="font-headline-md text-[19px] font-extrabold">
            {user.displayName}, {user.age}
          </h2>
          {user.badges.verified && (
            <span className="material-symbols-outlined text-[17px] text-sky-400" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified
            </span>
          )}
        </div>
        {(user.job || user.city) && (
          <p className="text-[12.5px] text-slate-500 dark:text-[#a89a9e] mt-0.5">
            {[user.job, user.city].filter(Boolean).join(' · ')}
          </p>
        )}

        <span className="text-[10px] font-bold tracking-wide text-[#e11d48] bg-[#fff1f3] dark:bg-[#e11d48]/15 px-3 py-1 rounded-full mt-2.5">
          {user.membership.tierLabel.toUpperCase()}
        </span>

        {onOpenFullSettings && (
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenFullSettings();
            }}
            className="mt-4 h-9 px-5 rounded-full border border-slate-200 dark:border-white/12 text-[13px] font-bold cursor-pointer"
          >
            Editar perfil
          </button>
        )}
      </motion.section>

      {/* Stat row: number over label, thin dividers */}
      <motion.section variants={item} className="flex items-center justify-center border-y border-slate-100 dark:border-white/10 py-4">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[17px] font-extrabold">
            {unlockedStamps.length}/{stamps.length}
          </span>
          <span className="text-[10.5px] text-slate-500 dark:text-[#a89a9e] mt-0.5">Sellos</span>
        </div>
        <div className="w-px h-7 bg-slate-100 dark:bg-white/10" />
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[17px] font-extrabold">{walletBalance.toLocaleString()}</span>
          <span className="text-[10.5px] text-slate-500 dark:text-[#a89a9e] mt-0.5">Coins</span>
        </div>
        <div className="w-px h-7 bg-slate-100 dark:bg-white/10" />
        <div className="flex-1 flex flex-col items-center">
          <span className={`text-[15px] font-extrabold ${user.badges.verified ? 'text-emerald-500' : 'text-amber-500'}`}>
            {user.badges.verificationLabel}
          </span>
          <span className="text-[10.5px] text-slate-500 dark:text-[#a89a9e] mt-0.5">Identidad</span>
        </div>
      </motion.section>

      {/* Audio-bio: one playable row, or an upload prompt when there isn't one yet */}
      <motion.section variants={item} className="rounded-2xl p-3.5 border border-slate-100 dark:border-white/10 bg-white dark:bg-[#150f11] flex items-center gap-3">
        {user.audioBio ? (
          <>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (isPlaying) {
                  audioPlayerRef.current?.pause();
                } else {
                  audioPlayerRef.current?.play();
                }
              }}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 ${isPlaying ? 'bg-[#e11d48] animate-pulse' : 'bg-gradient-to-tr from-[#e11d48] to-[#ff4d67]'}`}
            >
              <span className="material-symbols-outlined text-[22px]">{isPlaying ? 'pause' : 'play_arrow'}</span>
            </motion.button>
            <div className="flex-1 min-w-0">
              <span className="block text-[13px] font-bold">Mi audio-bio</span>
              <span className="block text-[11px] text-slate-500 dark:text-[#a89a9e]">
                {user.audioBio.durationSec != null ? `${user.audioBio.durationSec}s · ` : ''}tocá para escuchar
              </span>
            </div>
            <audio
              ref={audioPlayerRef}
              src={user.audioBio.url}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
            />
          </>
        ) : (
          <>
            <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-white/8 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px] text-[#e11d48]">mic</span>
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-[13px] font-bold">Agregá tu audio-bio</span>
              <span className="block text-[11px] text-slate-500 dark:text-[#a89a9e]">Un audio corto de hasta 60 segundos</span>
            </div>
            <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioFileChange} />
            <Button variant="cherry" size="sm" onClick={() => audioInputRef.current?.click()} disabled={uploadAudioBio.isPending} className="rounded-full shrink-0 normal-case tracking-normal">
              {uploadAudioBio.isPending ? 'Subiendo...' : 'Subir'}
            </Button>
          </>
        )}
      </motion.section>

      {/* Bio */}
      {user.bio && (
        <motion.section variants={item}>
          <span className="text-[11px] font-bold tracking-wide text-slate-500 dark:text-[#a89a9e]">SOBRE MÍ</span>
          <p className="text-[13.5px] leading-relaxed mt-1.5">{user.bio}</p>
        </motion.section>
      )}

      {/* Prompts, stacked cards */}
      {user.prompts.length > 0 && (
        <motion.section variants={item} className="flex flex-col gap-2.5">
          {user.prompts.map((p) => (
            <div key={p.id} className="rounded-2xl p-3.5 border border-slate-100 dark:border-white/10 bg-white dark:bg-[#150f11]">
              <span className="block text-[11px] font-bold text-[#e11d48]">{p.question}</span>
              <p className="text-[13.5px] leading-snug mt-1">{p.answer}</p>
            </div>
          ))}
        </motion.section>
      )}

      {/* Stamps grid */}
      <motion.section variants={item} className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-bold tracking-wide text-slate-500 dark:text-[#a89a9e]">SELLOS</span>
          <span className="text-[11.5px] text-slate-500 dark:text-[#a89a9e]">
            {unlockedStamps.length} de {stamps.length}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {stamps.map((stamp, idx) => (
            <motion.button
              key={stamp.key}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.03, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                sounds.playStamp();
                onSelectStamp(stamp);
              }}
              className="flex flex-col items-center gap-1.5 focus:outline-none"
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  stamp.unlocked
                    ? 'bg-[#fff1f3] text-[#e11d48] dark:bg-[#e11d48]/15'
                    : 'border border-dashed border-slate-200 dark:border-white/12 text-slate-300 dark:text-white/25'
                }`}
              >
                <span className="material-symbols-outlined text-[22px]" style={stamp.unlocked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                  {stamp.unlocked ? stamp.iconName : 'lock'}
                </span>
              </div>
              <span className="text-[9.5px] font-bold text-center leading-tight">{stamp.title}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Wallet -> Store */}
      <motion.section variants={item} className="rounded-2xl p-5 border border-slate-100 dark:border-white/10 bg-white dark:bg-[#150f11] flex flex-col items-center text-center gap-1.5">
        <span className="text-[11px] font-bold tracking-wide text-slate-500 dark:text-[#a89a9e]">BALANCE ACTUAL</span>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[#e11d48] text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            monetization_on
          </span>
          <span className="text-[26px] font-extrabold">{walletBalance.toLocaleString()}</span>
        </div>
        {onOpenStore && (
          <Button
            variant="cherry"
            size="sm"
            onClick={() => {
              sounds.playClick();
              onOpenStore();
            }}
            className="mt-1 rounded-full gap-1.5 normal-case tracking-normal"
          >
            <span className="material-symbols-outlined text-[16px]">local_mall</span>
            <span>Explorar tienda</span>
          </Button>
        )}
      </motion.section>

      <motion.button
        variants={item}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => {
          sounds.playClick();
          onSignOut();
        }}
        className="text-[13px] font-bold text-[#e11d48] cursor-pointer"
      >
        Cerrar sesión
      </motion.button>
    </motion.div>
  );
};
