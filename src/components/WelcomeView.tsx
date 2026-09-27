import React from 'react';
import { motion } from 'motion/react';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface WelcomeViewProps {
  onCreateAccount: () => void;
  onGoToLogin: () => void;
}

// Pantalla de bienvenida (hero) que faltaba antes del formulario de login — per
// Main.dc.html del diseño aprobado: wordmark + link "Ya tengo cuenta" arriba, una
// tarjeta ilustrada con glow coral detrás, titular editorial en dos líneas (la
// segunda en coral itálica) y dos CTAs (crear cuenta / ya tengo cuenta). Antes
// LoginView arrancaba directo en el formulario, sin ningún momento de marca.
export const WelcomeView: React.FC<WelcomeViewProps> = ({ onCreateAccount, onGoToLogin }) => {
  const { isLight } = useTheme();

  return (
    <div
      className={`w-full max-w-[420px] mx-auto min-h-screen py-8 px-6 flex flex-col ${
        isLight ? 'text-[var(--text-on-light)]' : 'text-[var(--text-primary)]'
      }`}
    >
      {/* Top bar: wordmark + "Ya tengo cuenta" */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between"
      >
        <span className="font-wordmark text-[22px] italic font-bold" style={{ color: 'var(--coral-500)' }}>
          Mely
        </span>
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onGoToLogin();
          }}
          className="text-[13px] font-bold hover:underline cursor-pointer"
          style={{ color: isLight ? 'var(--text-on-light-muted)' : 'var(--text-secondary)' }}
        >
          Ya tengo cuenta
        </button>
      </motion.div>

      {/* Hero: glow coral + tarjeta ilustrada apilada */}
      <div className="relative flex-1 flex items-center justify-center min-h-[280px] my-6">
        <div
          className="absolute w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(255,107,158,0.28) 0%, rgba(255,107,158,0) 70%)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: -10 }}
          animate={{ opacity: 1, scale: 1, rotate: -8 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute w-[190px] h-[240px] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]"
          style={{ background: 'var(--midnight-700)', border: '1px solid var(--hairline)' }}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 8 }}
          animate={{ opacity: 1, scale: 1, rotate: 5 }}
          transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-[196px] h-[250px] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-lg)]"
          style={{
            background: 'linear-gradient(155deg, var(--coral-700) 0%, var(--coral-500) 55%, var(--coral-300) 100%)',
          }}
        >
          <div className="absolute top-3 right-3 px-2 py-1 rounded-[var(--radius-pill)] bg-white/90 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]" style={{ color: 'var(--coral-600)' }}>
              verified
            </span>
            <span className="text-[10px] font-bold" style={{ color: 'var(--coral-600)' }}>
              Perfil verificado
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/55 via-black/10 to-transparent">
            <p className="text-white text-[15px] font-bold">Clara, 29</p>
            <p className="text-white/85 text-[11px] mt-1 leading-snug italic" style={{ fontFamily: 'var(--font-display)' }}>
              "Nunca pensé que iba a volver a tener ganas de conocer a alguien."
            </p>
          </div>
        </motion.div>
      </div>

      {/* Titular editorial */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="mb-7"
      >
        <h1
          className="text-[28px] leading-[1.15] font-semibold"
          style={{ fontFamily: 'var(--font-display)', color: isLight ? 'var(--text-on-light)' : 'var(--text-primary)' }}
        >
          Conocer a alguien,
          <br />
          <span className="italic" style={{ color: 'var(--coral-500)' }}>
            otra vez con ganas.
          </span>
        </h1>
        <p className="text-[14px] mt-2.5 leading-relaxed" style={{ color: isLight ? 'var(--text-on-light-muted)' : 'var(--text-secondary)' }}>
          Perfiles verificados, conversaciones con intención y citas de verdad — no otro scroll infinito.
        </p>
      </motion.div>

      {/* CTAs */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }} className="flex flex-col gap-2.5">
        <button
          id="welcome-create-account-btn"
          type="button"
          onClick={() => {
            sounds.playClick();
            onCreateAccount();
          }}
          className="w-full h-13 rounded-[var(--radius-pill)] text-[15px] font-bold shadow-[var(--shadow-coral)]"
          style={{ background: 'var(--coral-500)', color: 'var(--ink-on-coral)' }}
        >
          Crear cuenta
        </button>
        <button
          id="welcome-goto-login-btn"
          type="button"
          onClick={() => {
            sounds.playClick();
            onGoToLogin();
          }}
          className="w-full h-13 rounded-[var(--radius-pill)] text-[15px] font-bold border"
          style={{
            borderColor: isLight ? 'rgba(22,34,59,0.14)' : 'var(--hairline-strong)',
            color: isLight ? 'var(--text-on-light)' : 'var(--text-primary)',
          }}
        >
          Ya tengo cuenta
        </button>
      </motion.div>

      {/* Trust line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        className="flex items-center justify-center gap-1.5 mt-5"
      >
        <span className="material-symbols-outlined text-[14px]" style={{ color: 'var(--coral-500)' }}>
          verified
        </span>
        <span className="text-[11.5px]" style={{ color: isLight ? 'var(--text-on-light-muted)' : 'var(--text-secondary)' }}>
          Perfiles verificados, comunidad cuidada.
        </span>
      </motion.div>
    </div>
  );
};
