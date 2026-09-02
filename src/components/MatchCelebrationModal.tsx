import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Profile } from '../types';
import { sounds } from '../utils/audio';

interface MatchCelebrationModalProps {
  profile: Profile | null;
  coinsEarned?: number;
  myAvatar?: string;
  onSendMessage: () => void;
  onClose: () => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  profile,
  coinsEarned = 0,
  myAvatar,
  onSendMessage,
  onClose,
}) => {
  const firedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!profile || firedFor.current === profile.id) return;
    firedFor.current = profile.id;
    const colors = ['#e11d48', '#ff4d67', '#fda4af', '#ffffff'];
    const burst = (originX: number) =>
      confetti({
        particleCount: 60,
        angle: originX < 0.5 ? 60 : 120,
        spread: 65,
        startVelocity: 45,
        origin: { x: originX, y: 0.65 },
        colors,
        zIndex: 110,
        disableForReducedMotion: true,
      });
    burst(0.15);
    burst(0.85);
    const fallTimer = window.setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 100,
        startVelocity: 30,
        origin: { x: 0.5, y: 0.3 },
        colors,
        zIndex: 110,
        disableForReducedMotion: true,
      });
    }, 200);
    return () => window.clearTimeout(fallTimer);
  }, [profile]);

  return (
    <AnimatePresence>
      {profile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 320, damping: 26 }}
            className="relative z-10 w-full max-w-[340px] flex flex-col items-center text-center"
          >
            <span className="text-[13px] font-bold tracking-wide text-white/80 uppercase">MELY</span>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="font-headline-md text-[32px] font-extrabold text-white mt-2"
            >
              ¡Es un match!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[14px] text-white/75 mt-1.5"
            >
              A vos y a {profile.displayName} les gustaron mutuamente
            </motion.p>

            {coinsEarned > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.55, type: 'spring', stiffness: 340, damping: 20 }}
                className="mt-3 flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3.5 py-1.5"
              >
                <span className="material-symbols-outlined text-[16px] text-amber-300" style={{ fontVariationSettings: "'FILL' 1" }}>
                  monetization_on
                </span>
                <span className="text-[13px] font-bold text-white">+{coinsEarned} monedas</span>
              </motion.div>
            )}

            <div className="relative flex items-center justify-center mt-8 mb-9 h-[104px] w-[176px]">
              <motion.div
                initial={{ opacity: 0, x: 16, rotate: -6 }}
                animate={{ opacity: 1, x: 0, rotate: -6 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
                className="absolute left-0 w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-white/40 to-white/10"
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/70">
                  {myAvatar && <img src={myAvatar} alt="Vos" className="w-full h-full object-cover" referrerPolicy="no-referrer" />}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -16, rotate: 6 }}
                animate={{ opacity: 1, x: 0, rotate: 6 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
                className="absolute right-0 w-24 h-24 rounded-full p-[3px] bg-gradient-to-br from-white/40 to-white/10"
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white/70">
                  <img
                    src={profile.photos[0]?.url}
                    alt={profile.displayName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 18 }}
                className="absolute z-10 w-11 h-11 rounded-full bg-gradient-to-br from-[#e11d48] to-[#ff4d67] flex items-center justify-center shadow-[0_6px_18px_rgba(225,29,72,0.5)]"
              >
                <span className="material-symbols-outlined text-[20px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
              className="w-full flex flex-col gap-2.5"
            >
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onSendMessage();
                }}
                className="w-full h-13 rounded-full bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white text-[15px] font-bold shadow-[0_10px_24px_-8px_rgba(225,29,72,0.6)]"
              >
                Enviar mensaje
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                className="w-full h-13 rounded-full text-white/80 text-[14px] font-bold"
              >
                Seguir viendo perfiles
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
