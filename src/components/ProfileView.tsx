import React, { useMemo, useRef, useState } from 'react';
import { motion, type Variants } from 'motion/react';
import { toast } from 'sonner';
import { Stamp } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useStamps } from '../hooks/useStamps';
import { useWallet } from '../hooks/useWallet';
import {
  useDeletePhoto,
  useSubmitVerificationSelfie,
  useUploadAudioBio,
  useUploadPhoto,
} from '../hooks/useProfile';
import { Button } from './ui/button';

interface ProfileViewProps {
  onSelectStamp: (stamp: Stamp) => void;
  onOpenFullSettings?: () => void;
  onOpenStore?: () => void;
  onSignOut: () => void;
}

const MAX_PHOTOS = 6;

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
  const submitVerificationSelfie = useSubmitVerificationSelfie();
  const uploadPhoto = useUploadPhoto();
  const deletePhoto = useDeletePhoto();
  const audioInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // % de completitud del perfil — heurística simple sobre las señales que el
  // diseño (MyProfile.dc.html) destaca como "lo que falta": fotos, bio, prompts,
  // intereses, audio-bio y verificación de identidad.
  const completeness = useMemo(() => {
    if (!user) return { pct: 0, hint: '' };
    const checks: { done: boolean; hint: string }[] = [
      { done: user.photos.length >= 4, hint: 'Agregá una foto más para brillar y aparecer en más descubrimientos.' },
      { done: Boolean(user.bio && user.bio.trim().length > 0), hint: 'Contá algo de vos en tu bio.' },
      { done: user.prompts.length > 0, hint: 'Respondé al menos un prompt para romper el hielo.' },
      { done: user.interests.length >= 3, hint: 'Sumá tus intereses para conectar por lo que te gusta.' },
      { done: Boolean(user.audioBio), hint: 'Grabá tu audio-bio: los perfiles con voz generan más matches.' },
      { done: user.badges.verification === 'VERIFIED', hint: 'Verificá tu identidad y sumá el tilde azul.' },
    ];
    const done = checks.filter((c) => c.done).length;
    const pct = Math.round((done / checks.length) * 100);
    const nextHint = checks.find((c) => !c.done)?.hint ?? '¡Tu perfil está completo!';
    return { pct, hint: nextHint };
  }, [user]);

  if (!user) return null;

  const unlockedStamps = stamps.filter((s) => s.unlocked);
  const walletBalance = wallet?.balance ?? 0;

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadPhoto.mutate(file, {
      onSuccess: () => {
        sounds.playNotification();
        refreshUser();
      },
      onError: (err: any) => toast.error(err?.message ?? 'No se pudo subir la foto'),
    });
    e.target.value = '';
  };

  const handleDeletePhoto = (photoId: string) => {
    if (user.photos.length <= 1) {
      toast.error('Necesitás al menos una foto en tu perfil.');
      return;
    }
    deletePhoto.mutate(photoId, {
      onSuccess: () => {
        toast.success('Foto eliminada.');
        refreshUser();
      },
      onError: (err: any) => toast.error(err?.message ?? 'No se pudo eliminar la foto'),
    });
  };

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

  const handleSelfieFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    submitVerificationSelfie.mutate(file, {
      onSuccess: () => {
        sounds.playNotification();
        toast.success('Selfie enviada — la revisamos y te avisamos.');
        refreshUser();
      },
      onError: (err: any) => toast.error(err?.message ?? 'No se pudo enviar la selfie'),
    });
    e.target.value = '';
  };

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
  };

  const cardStyle = {
    background: isLight ? '#FFFFFF' : 'var(--midnight-850)',
    borderColor: isLight ? 'rgba(22,34,59,0.08)' : 'var(--hairline)',
  };
  const mutedText = isLight ? 'var(--text-on-light-muted)' : 'var(--text-secondary)';
  const primaryText = isLight ? 'var(--text-on-light)' : 'var(--text-primary)';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-5 pb-6">
      {/* Header: título + acceso a Ajustes — reemplaza el botón de gear "flotante"
          suelto que había antes, per MyProfile.dc.html. */}
      <motion.div variants={item} className="flex items-center justify-between">
        <h1 className="text-[24px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: primaryText }}>
          Mi perfil
        </h1>
        <Button
          variant="tertiary"
          size="icon"
          onClick={() => {
            sounds.playClick();
            onOpenFullSettings?.();
          }}
          className="rounded-full"
          aria-label="Ajustes"
          style={{ background: isLight ? 'var(--cream-100)' : 'var(--midnight-800)', border: `1px solid ${isLight ? 'rgba(22,34,59,0.08)' : 'var(--hairline)'}` }}
        >
          <span className="material-symbols-outlined text-[20px]" style={{ color: mutedText }}>
            settings
          </span>
        </Button>
      </motion.div>

      {/* Identity: avatar horizontal + nombre + verificación */}
      <motion.section variants={item} className="flex items-center gap-4">
        <div className="relative shrink-0">
          <div className="w-[76px] h-[76px] rounded-full overflow-hidden" style={{ background: 'linear-gradient(155deg, var(--midnight-500), var(--midnight-800))' }}>
            {user.photos[0]?.url && (
              <img src={user.photos[0].url} alt={user.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              photoInputRef.current?.click();
            }}
            aria-label="Editar foto"
            className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full flex items-center justify-center border-2"
            style={{ background: 'var(--coral-500)', borderColor: isLight ? '#FFFFFF' : 'var(--midnight-900)' }}
          >
            <span className="material-symbols-outlined text-[13px]" style={{ color: 'var(--ink-on-coral)' }}>
              edit
            </span>
          </button>
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-[19px] font-semibold truncate" style={{ fontFamily: 'var(--font-display)', color: primaryText }}>
            {user.displayName}, {user.age}
          </span>
          {user.badges.verification === 'VERIFIED' ? (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]" style={{ color: 'var(--success-500)' }} title="Identidad verificada">
                verified
              </span>
              <span className="text-[12.5px] font-semibold" style={{ color: 'var(--success-500)' }}>
                Perfil verificado
              </span>
            </span>
          ) : (
            <span className="text-[12px]" style={{ color: mutedText }}>
              {[user.job, user.city].filter(Boolean).join(' · ') || user.membership.tierLabel}
            </span>
          )}
        </div>
      </motion.section>

      {/* Recompensas / Tienda — antes vivía como una tarjeta de wallet al final; el
          diseño la sube arriba como promo de primer nivel. */}
      {onOpenStore && (
        <motion.button
          variants={item}
          type="button"
          onClick={() => {
            sounds.playClick();
            onOpenStore();
          }}
          className="flex items-center gap-3.5 rounded-[var(--radius-lg)] border p-4 text-left shadow-[var(--shadow-sm)]"
          style={{ background: isLight ? 'linear-gradient(150deg,#FFFFFF,var(--cream-100))' : 'linear-gradient(150deg, var(--midnight-700), var(--midnight-850))', borderColor: isLight ? 'rgba(22,34,59,0.08)' : 'var(--hairline-strong)' }}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,138,101,0.16)' }}>
            <span className="material-symbols-outlined text-[19px]" style={{ color: 'var(--coral-500)' }}>
              monetization_on
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14.5px] font-semibold truncate" style={{ fontFamily: 'var(--font-display)', color: primaryText }}>
              Recompensas · {walletBalance.toLocaleString()} ◉
            </p>
            <p className="text-[12px]" style={{ color: mutedText }}>
              Canjeá lo que ganaste avanzando conexiones
            </p>
          </div>
          <span className="material-symbols-outlined text-[18px] shrink-0" style={{ color: 'var(--coral-300)' }}>
            chevron_right
          </span>
        </motion.button>
      )}

      {/* Completitud */}
      <motion.section variants={item} className="rounded-[var(--radius-lg)] border p-4 flex flex-col gap-2.5" style={cardStyle}>
        <div className="flex items-center justify-between">
          <span className="text-[13.5px] font-bold" style={{ color: primaryText }}>
            Tu perfil está al {completeness.pct}%
          </span>
          <span className="text-[13.5px] font-bold" style={{ color: 'var(--coral-500)' }}>
            {completeness.pct}%
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: isLight ? 'rgba(22,34,59,0.08)' : 'var(--midnight-700)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${completeness.pct}%`, background: 'var(--coral-500)' }} />
        </div>
        <span className="text-[12px]" style={{ color: mutedText }}>
          {completeness.hint}
        </span>
      </motion.section>

      {/* Fotos */}
      <motion.section variants={item} className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: primaryText }}>
            Fotos
          </span>
          <span className="text-[11.5px] font-semibold" style={{ color: isLight ? 'var(--text-on-light-muted)' : 'var(--text-tertiary)' }}>
            {user.photos.length} de {MAX_PHOTOS}
          </span>
        </div>
        <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoFileChange} />
        <div className="grid grid-cols-3 gap-2">
          {user.photos.map((photo) => (
            <div key={photo.id} className="relative aspect-square rounded-[var(--radius-md)] overflow-hidden group">
              <img src={photo.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <button
                type="button"
                onClick={() => handleDeletePhoto(photo.id)}
                disabled={deletePhoto.isPending}
                aria-label="Eliminar foto"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/55 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <span className="material-symbols-outlined text-[13px]">close</span>
              </button>
            </div>
          ))}
          {user.photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                photoInputRef.current?.click();
              }}
              disabled={uploadPhoto.isPending}
              aria-label="Agregar foto"
              className="aspect-square rounded-[var(--radius-md)] border-[1.5px] border-dashed flex items-center justify-center"
              style={{ borderColor: isLight ? 'rgba(22,34,59,0.16)' : 'var(--hairline-strong)', background: isLight ? 'var(--cream-100)' : 'var(--midnight-800)' }}
            >
              <span className="material-symbols-outlined text-[22px]" style={{ color: isLight ? 'var(--text-on-light-muted)' : 'var(--text-tertiary)' }}>
                {uploadPhoto.isPending ? 'progress_activity' : 'add'}
              </span>
            </button>
          )}
        </div>
      </motion.section>

      {/* Prompts */}
      {user.prompts.length > 0 && (
        <motion.section variants={item} className="flex flex-col gap-2.5">
          <span className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: primaryText }}>
            Mis prompts
          </span>
          <div className="flex flex-col gap-2.5">
            {user.prompts.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2.5 rounded-[var(--radius-md)] border p-3.5"
                style={cardStyle}
              >
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <span className="text-[10.5px] font-bold uppercase tracking-wide" style={{ color: 'var(--coral-500)' }}>
                    {p.question}
                  </span>
                  <span className="text-[13.5px] italic" style={{ color: primaryText }}>
                    {p.answer}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    onOpenFullSettings?.();
                  }}
                  aria-label="Editar prompt"
                  className="shrink-0"
                >
                  <span className="material-symbols-outlined text-[16px]" style={{ color: isLight ? 'var(--text-on-light-muted)' : 'var(--text-tertiary)' }}>
                    edit
                  </span>
                </button>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Intereses */}
      <motion.section variants={item} className="flex flex-col gap-2.5">
        <span className="text-[16px] font-semibold" style={{ fontFamily: 'var(--font-display)', color: primaryText }}>
          Intereses
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {user.interests.map((interest) => (
            <span
              key={interest.id}
              className="h-8 px-3.5 rounded-[var(--radius-pill)] border flex items-center text-[12.5px] font-semibold"
              style={{ ...cardStyle, color: mutedText }}
            >
              {interest.name}
            </span>
          ))}
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              onOpenFullSettings?.();
            }}
            aria-label="Editar intereses"
            className="w-8 h-8 rounded-[var(--radius-pill)] border border-dashed flex items-center justify-center"
            style={{ borderColor: isLight ? 'rgba(22,34,59,0.16)' : 'var(--hairline-strong)' }}
          >
            <span className="material-symbols-outlined text-[15px]" style={{ color: isLight ? 'var(--text-on-light-muted)' : 'var(--text-tertiary)' }}>
              add
            </span>
          </button>
        </div>
      </motion.section>

      {/* --- Más de tu perfil: audio-bio, verificación y sellos — funcionalidad real
          que el mockup no cubre, pero que hay que mantener; se agrupa acá abajo con
          menor jerarquía en vez de competir con la identidad/fotos/prompts de arriba. */}
      <motion.section variants={item} className="flex flex-col gap-2.5 pt-1">
        <span className="text-[11px] font-bold tracking-wide" style={{ color: isLight ? 'var(--text-on-light-muted)' : 'var(--text-tertiary)' }}>
          MÁS DE TU PERFIL
        </span>

        {/* Audio-bio */}
        <div className="rounded-[var(--radius-md)] border p-3 flex items-center gap-3" style={cardStyle}>
          {user.audioBio ? (
            <>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (isPlaying) audioPlayerRef.current?.pause();
                  else audioPlayerRef.current?.play();
                }}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: isPlaying ? 'var(--coral-600)' : 'var(--coral-500)', color: 'var(--ink-on-coral)' }}
              >
                <span className="material-symbols-outlined text-[18px]">{isPlaying ? 'pause' : 'play_arrow'}</span>
              </motion.button>
              <div className="flex-1 min-w-0">
                <span className="block text-[12.5px] font-bold" style={{ color: primaryText }}>Mi audio-bio</span>
                <span className="block text-[10.5px]" style={{ color: mutedText }}>
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
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: isLight ? 'var(--cream-100)' : 'var(--midnight-800)' }}>
                <span className="material-symbols-outlined text-[17px]" style={{ color: 'var(--coral-500)' }}>mic</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="block text-[12.5px] font-bold" style={{ color: primaryText }}>Agregá tu audio-bio</span>
                <span className="block text-[10.5px]" style={{ color: mutedText }}>Un audio corto de hasta 60 segundos</span>
              </div>
              <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioFileChange} />
              <Button variant="primary" size="sm" onClick={() => audioInputRef.current?.click()} disabled={uploadAudioBio.isPending} className="rounded-full shrink-0 normal-case tracking-normal h-8 text-[11px]">
                {uploadAudioBio.isPending ? 'Subiendo...' : 'Subir'}
              </Button>
            </>
          )}
        </div>

        {/* Verificación */}
        {user.badges.verification !== 'VERIFIED' && (
          <div className="rounded-[var(--radius-md)] border p-3 flex items-center gap-3" style={cardStyle}>
            {user.badges.verification === 'PHOTO' ? (
              <>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(227,184,115,0.15)' }}>
                  <span className="material-symbols-outlined text-[17px]" style={{ color: 'var(--warning-500)' }}>hourglass_top</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[12.5px] font-bold" style={{ color: primaryText }}>Selfie en revisión</span>
                  <span className="block text-[10.5px]" style={{ color: mutedText }}>Te avisamos apenas la revisemos</span>
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(127,191,160,0.15)' }}>
                  <span className="material-symbols-outlined text-[17px]" style={{ color: 'var(--success-500)' }}>verified</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[12.5px] font-bold" style={{ color: primaryText }}>Verificá tu perfil</span>
                  <span className="block text-[10.5px]" style={{ color: mutedText }}>Una selfie rápida y sumás el tilde azul</span>
                </div>
                <input ref={selfieInputRef} type="file" accept="image/*" capture="user" className="hidden" onChange={handleSelfieFileChange} />
                <Button variant="primary" size="sm" onClick={() => selfieInputRef.current?.click()} disabled={submitVerificationSelfie.isPending} className="rounded-full shrink-0 normal-case tracking-normal h-8 text-[11px]">
                  {submitVerificationSelfie.isPending ? 'Enviando...' : 'Verificar'}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Sellos, compactos — antes era una grilla de 4 columnas a toda ancho justo
            debajo del header; ahora es una franja secundaria más chica. */}
        <div className="rounded-[var(--radius-md)] border p-3 flex flex-col gap-2.5" style={cardStyle}>
          <div className="flex items-baseline justify-between">
            <span className="text-[12px] font-bold" style={{ color: primaryText }}>Sellos</span>
            <span className="text-[11px]" style={{ color: mutedText }}>{unlockedStamps.length} de {stamps.length}</span>
          </div>
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-0.5">
            {stamps.map((stamp) => (
              <button
                key={stamp.key}
                type="button"
                onClick={() => {
                  sounds.playStamp();
                  onSelectStamp(stamp);
                }}
                className="flex flex-col items-center gap-1 shrink-0 focus:outline-none"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={
                    stamp.unlocked
                      ? { background: 'rgba(255,138,101,0.14)', color: 'var(--coral-500)' }
                      : { border: `1px dashed ${isLight ? 'rgba(22,34,59,0.16)' : 'var(--hairline-strong)'}`, color: isLight ? 'rgba(22,34,59,0.25)' : 'var(--text-tertiary)' }
                  }
                >
                  <span className="material-symbols-outlined text-[18px]" style={stamp.unlocked ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                    {stamp.unlocked ? stamp.iconName : 'lock'}
                  </span>
                </div>
                <span className="text-[8.5px] font-bold text-center leading-tight w-12 truncate" style={{ color: mutedText }}>
                  {stamp.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.button
        variants={item}
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => {
          sounds.playClick();
          onSignOut();
        }}
        className="text-[13px] font-bold cursor-pointer mt-1"
        style={{ color: 'var(--coral-500)' }}
      >
        Cerrar sesión
      </motion.button>
    </motion.div>
  );
};
