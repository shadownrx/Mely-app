import React, { useState } from 'react';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { forgotPassword } from '../lib/api/auth';
import { ApiError } from '../lib/apiClient';

interface LoginViewProps {
  onGoToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onGoToRegister }) => {
  const { isLight, toggleTheme } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Por favor ingresá tu correo electrónico.');
      return;
    }
    if (!password) {
      setErrorMsg('Por favor ingresá tu contraseña.');
      return;
    }

    setIsSubmitting(true);
    sounds.playClick();
    try {
      await login(email.trim(), password);
      sounds.playStamp();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.code === 'UNAUTHORIZED'
            ? 'Email o contraseña incorrectos.'
            : err.message
          : 'No pudimos conectar con el servidor. Probá de nuevo.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    sounds.playStamp();
    try {
      await forgotPassword(recoveryEmail.trim());
      setRecoverySent(true);
      setTimeout(() => {
        setShowRecoveryModal(false);
        setRecoverySent(false);
        setRecoveryEmail('');
      }, 2500);
    } catch {
      setRecoveryError('No pudimos enviar el enlace. Probá de nuevo en un momento.');
    }
  };

  return (
    <div className={`w-full max-w-[420px] mx-auto min-h-screen py-8 px-4 flex flex-col justify-between items-center animate-fadeIn ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
      {/* Top Theme Switcher Bar */}
      <div className="w-full flex justify-end mb-2">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            toggleTheme();
          }}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-label-caps uppercase font-bold transition-colors ${
            isLight
              ? 'bg-white border-[#fecdd3] text-[#e11d48] hover:bg-[#fff1f3]'
              : 'bg-[#140b0f] border-[#e11d48]/30 text-[#fda4af] hover:text-[#fff1f2]'
          }`}
          title="Cambiar tema de color"
        >
          <span className="material-symbols-outlined text-[15px]">
            {isLight ? 'dark_mode' : 'light_mode'}
          </span>
          <span>{isLight ? 'Modo Oscuro' : 'Modo Blanco / Coral'}</span>
        </button>
      </div>

      {/* Header Emblem */}
      <div className="w-full flex flex-col items-center text-center mb-6">
        {/* Keepsake Stamp Logo */}
        <div className="relative mb-3 group cursor-pointer" onClick={() => sounds.playStamp()}>
          <div
            className={`w-20 h-20 rounded-full border-2 text-[#e11d48] flex items-center justify-center stamp-ink relative shadow-md ${
              isLight
                ? 'border-[#e11d48] bg-white'
                : 'border-[#e11d48] bg-[#140b0f] shadow-[0_0_25px_rgba(225,29,72,0.35)]'
            }`}
          >
            <div className="absolute inset-1 border border-dashed border-[#e11d48]/40 rounded-full" />
            <span
              className="material-symbols-outlined text-[36px] text-[#e11d48]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              favorite
            </span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] text-white rounded-full p-1 border-2 border-white dark:border-[#0b0507]">
            <span className="material-symbols-outlined text-[14px] font-bold block">
              verified
            </span>
          </div>
        </div>

        <div
          className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border mb-1.5 ${
            isLight
              ? 'bg-[#fff1f3] border-[#fecdd3] text-[#e11d48]'
              : 'bg-[#e11d48]/15 border-[#e11d48]/30 text-[#fb7185]'
          }`}
        >
          <span className="text-[11px]">🇦🇷</span>
          <span className="font-label-caps text-[9px] uppercase tracking-widest font-bold">
            ARGENTINA
          </span>
        </div>

        <h1
          className={`font-headline-md text-[28px] tracking-[0.22em] uppercase font-black ${
            isLight
              ? 'text-[#0f172a]'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-[#fb7185] to-[#fff1f2]'
          }`}
        >
          MELY
        </h1>
        <span className={`font-label-caps text-[10px] tracking-[0.25em] uppercase -mt-1 block font-bold ${isLight ? 'text-[#e11d48]' : 'text-[#fda4af]'}`}>
          PASAPORTE DE CONEXIONES
        </span>
        <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-[#e11d48] to-transparent mt-3" />
      </div>

      {/* Main Passport Login Card */}
      <div
        className={`w-full rounded-3xl border shadow-2xl overflow-hidden relative ticket-edge-bottom pb-5 ${
          isLight
            ? 'bg-white border-[#fecdd3] shadow-[0_10px_30px_rgba(225,29,72,0.08)]'
            : 'bg-[#140b0f] border-[#e11d48]/30 shadow-2xl'
        }`}
      >
        {/* Security watermark pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#e11d48 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        {/* Ticket Header Strip */}
        <div
          className={`px-5 py-3.5 border-b flex justify-between items-center ${
            isLight
              ? 'bg-[#fff5f6] border-[#fecdd3]'
              : 'bg-[#1c0d14] border-[#e11d48]/25'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#e11d48] text-[18px]">
              login
            </span>
            <span className={`font-label-caps text-[10px] tracking-wider uppercase font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              INICIAR SESIÓN
            </span>
          </div>
          <span className={`font-meta-data text-[9px] uppercase tracking-widest font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
            ACCESO SEGURO
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 pb-3 flex flex-col gap-4 relative z-10">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-[12px] font-body-sm flex items-start gap-2">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5 text-[#e11d48]">
                error
              </span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className={`font-label-caps text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}
            >
              CORREO ELECTRÓNICO
            </label>
            <div className="relative flex items-center">
              <span className={`material-symbols-outlined absolute left-3.5 text-[18px] ${isLight ? 'text-gray-400' : 'text-[#fda4af]/50'}`}>
                mail
              </span>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@ejemplo.com"
                className={`w-full border rounded-2xl pl-10 pr-3.5 py-3 font-body-sm text-[13px] focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] placeholder:text-gray-400 focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] placeholder:text-[#fda4af]/30 focus:border-[#fb7185]'
                }`}
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="login-pass"
                className={`font-label-caps text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}
              >
                CONTRASEÑA
              </label>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowRecoveryModal(true);
                }}
                className="font-label-caps text-[9px] text-[#e11d48] hover:underline uppercase font-bold"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative flex items-center">
              <span className={`material-symbols-outlined absolute left-3.5 text-[18px] ${isLight ? 'text-gray-400' : 'text-[#fda4af]/50'}`}>
                lock
              </span>
              <input
                id="login-pass"
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresá tu contraseña"
                className={`w-full border rounded-2xl pl-10 pr-10 py-3 font-body-sm text-[13px] focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] placeholder:text-gray-400 focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] placeholder:text-[#fda4af]/30 focus:border-[#fb7185]'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 p-1 focus:outline-none ${isLight ? 'text-gray-400 hover:text-[#0f172a]' : 'text-[#fda4af]/60 hover:text-[#fff1f2]'}`}
                aria-label="Ver u ocultar contraseña"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-[#e11d48] rounded w-4 h-4"
              />
              <span className={`font-body-sm text-[12px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
                Recordar mi sesión
              </span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-1.5 py-3.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[11px] tracking-[0.18em] uppercase font-bold rounded-2xl tactile-btn hover:opacity-95 shadow-lg shadow-[#e11d48]/25 flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                INICIANDO SESIÓN...
              </span>
            ) : (
              <>
                <span>INGRESAR A MI PASAPORTE</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Switch to Register Footer */}
      <div className="w-full mt-6 flex flex-col items-center gap-3 text-center">
        <p className={`font-body-sm text-[13px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
          ¿Aún no tenés cuenta en MELY?
        </p>
        <button
          id="btn-switch-register"
          type="button"
          onClick={() => {
            sounds.playClick();
            onGoToRegister();
          }}
          className={`w-full py-3 border text-[#e11d48] font-label-caps text-[10px] tracking-widest uppercase font-bold rounded-2xl tactile-btn transition-colors flex items-center justify-center gap-2 focus:outline-none ${
            isLight
              ? 'bg-white hover:bg-[#fff5f6] border-[#fecdd3]'
              : 'bg-[#140b0f] hover:bg-[#1f0d16] border-[#e11d48]/40'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
          <span>REGISTRARSE / SOLICITAR PASAPORTE</span>
        </button>

        <span className={`font-meta-data text-[9px] uppercase tracking-wider mt-2 ${isLight ? 'text-gray-400' : 'text-[#fda4af]/40'}`}>
          MELY ARGENTINA • ENCUENTROS VERIFICADOS EN PERSONA
        </span>
      </div>

      {/* Password Recovery Modal */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div
            className={`border rounded-3xl w-full max-w-[360px] overflow-hidden shadow-2xl p-6 relative ${
              isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/40'
            }`}
          >
            <button
              onClick={() => setShowRecoveryModal(false)}
              className={`absolute top-4 right-4 p-1 focus:outline-none ${isLight ? 'text-gray-400 hover:text-[#0f172a]' : 'text-[#fda4af] hover:text-[#fff1f2]'}`}
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#e11d48]/15 border border-[#e11d48]/30 text-[#e11d48] flex items-center justify-center mb-3">
              <span className="material-symbols-outlined text-[24px]">vpn_key</span>
            </div>

            <span className="font-label-caps text-[9px] text-[#e11d48] uppercase tracking-widest block font-bold mb-0.5">
              RECUPERACIÓN SEGURA
            </span>
            <h3 className={`font-headline-md text-[18px] font-bold mb-2 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              Recuperar Contraseña
            </h3>
            <p className={`font-body-sm text-[12px] mb-4 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
              Ingresá el correo asociado a tu cuenta para recibir un enlace seguro de restablecimiento.
            </p>

            {recoverySent ? (
              <div className="p-3 bg-[#10b981]/15 border border-[#10b981]/40 rounded-2xl text-[#059669] text-[12px] font-body-sm text-center font-medium">
                ✓ Si el correo existe, te enviamos un enlace de restablecimiento. Revisá tu bandeja.
              </div>
            ) : (
              <form onSubmit={handleSendRecovery} className="flex flex-col gap-3">
                {recoveryError && (
                  <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-body-sm">
                    {recoveryError}
                  </div>
                )}
                <input
                  type="email"
                  required
                  placeholder="tu.correo@ejemplo.com"
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  className={`w-full border rounded-2xl px-3.5 py-2.5 font-mono text-[12px] focus:outline-none ${
                    isLight
                      ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                      : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                  }`}
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] tracking-wider uppercase font-bold rounded-2xl tactile-btn hover:opacity-90 shadow-md"
                >
                  Enviar Enlace de Recuperación
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
