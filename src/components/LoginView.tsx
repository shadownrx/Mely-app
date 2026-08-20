import React, { useState } from 'react';
import { Profile } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface LoginViewProps {
  onLogin: (user: Profile, walletAmount?: number) => void;
  onGoToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGoToRegister }) => {
  const { isLight, toggleTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'google' | 'apple' | 'facebook' | null>(null);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Por favor ingresá tu correo electrónico o Pasaporte ID.');
      return;
    }

    if (!password) {
      setErrorMsg('Por favor ingresá tu contraseña o llave de acceso.');
      return;
    }

    setIsSubmitting(true);
    sounds.playClick();

    setTimeout(() => {
      // Dynamic profile generation or standard login
      const cleanEmail = email.trim();
      const localPart = cleanEmail.split('@')[0];
      const customName = localPart
        .replace(/[._-]/g, ' ')
        .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase()) || 'Miembro MELY';

      const userProfile: Profile = {
        id: `user-${Date.now()}`,
        name: customName,
        email: cleanEmail,
        age: 28,
        occupation: 'Diseño & Fotografía',
        city: 'Palermo Soho, CABA',
        distance: '0 km',
        joined: "Feb '26",
        membership: 'Premium Member',
        bio: 'Enamorado/a de las sobremesas porteñas, el café de especialidad y los encuentros auténticos.',
        passType: 'Pasaporte Nacional',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        gallery: [
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        ],
        tags: ['Café de Especialidad', 'Vermú en Chacarita', 'Muestras en el MALBA', 'Sobremesas Infinitas'],
        prompts: [
          { question: 'Mi cita ideal no negociable...', answer: 'Un café de especialidad en Cuervo o un vermut en Chacarita con charla sin apuro.' },
        ],
        verifiedEncounters: 1,
      };

      sounds.playStamp();
      onLogin(userProfile, 3500);
    }, 600);
  };

  const handleSocialLogin = (provider: 'google' | 'apple' | 'facebook') => {
    sounds.playClick();
    setSocialLoading(provider);

    setTimeout(() => {
      sounds.playStamp();

      let socialUser: Profile;
      if (provider === 'google') {
        socialUser = {
          id: `user-google-${Date.now()}`,
          name: 'Mariel Juárez',
          email: 'marieljuarezcm@gmail.com',
          age: 27,
          occupation: 'Directora de Arte & Fotógrafa',
          city: 'Palermo / Chacarita (CABA)',
          distance: '0 km',
          joined: "Feb '26",
          membership: 'Founding Member',
          bio: 'Fotografía analógica 35mm, vinilos de rock nacional, arquitectura y caminatas por San Telmo.',
          passType: 'Founding Pass',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
          ],
          tags: ['Café de Especialidad', 'Vermú en Chacarita', 'Muestras en el MALBA', 'Librerías de Corrientes'],
          prompts: [
            { question: 'Mi cita ideal no negociable...', answer: 'Recorrer una librería antigua y tomar un café de especialidad debatiendo sobre cine o música.' },
          ],
          verifiedEncounters: 2,
        };
      } else if (provider === 'apple') {
        socialUser = {
          id: `user-apple-${Date.now()}`,
          name: 'Mateo Rossi',
          email: 'mateo.rossi@icloud.com',
          age: 29,
          occupation: 'Arquitecto & Diseñador Urbano',
          city: 'San Telmo / Puerto Madero (CABA)',
          distance: '0 km',
          joined: "Feb '26",
          membership: 'VIP Member',
          bio: 'Apasionado del diseño sustentable, los pasajes porteños y el vermut los domingos al atardecer.',
          passType: 'VIP Pass',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
          ],
          tags: ['Arquitectura & Pasajes', 'Vermú en Chacarita', 'Vinos Malbec & Bodegas'],
          prompts: [
            { question: 'El plan ideal de fin de semana...', answer: 'Paseo en bici por la Costanera y cena en algún bodegón clásico.' },
          ],
          verifiedEncounters: 3,
        };
      } else {
        socialUser = {
          id: `user-fb-${Date.now()}`,
          name: 'Valentina Paz',
          email: 'valentina.paz@facebook.com',
          age: 26,
          occupation: 'Curadora de Arte & Gestora Cultural',
          city: 'Recoleta / Colegiales (CABA)',
          distance: '0 km',
          joined: "Feb '26",
          membership: 'Premium Member',
          bio: 'Amante del arte contemporáneo, el cine independiente y las sobremesas con amigos.',
          passType: 'Pasaporte Nacional',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
          gallery: [
            'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
          ],
          tags: ['Muestras en el MALBA', 'Cine Gaumont & Cosmos', 'Café de Especialidad'],
          prompts: [
            { question: 'Una charla que nunca falla...', answer: '¿Cuál fue la última película que te voló la cabeza?' },
          ],
          verifiedEncounters: 1,
        };
      }

      onLogin(socialUser, 4000);
    }, 700);
  };

  const handleSendRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playStamp();
    setRecoverySent(true);
    setTimeout(() => {
      setShowRecoveryModal(false);
      setRecoverySent(false);
      setRecoveryEmail('');
    }, 2000);
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

          {/* Email / Passport ID Input */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="login-email"
              className={`font-label-caps text-[10px] uppercase tracking-wider font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}
            >
              CORREO ELECTRÓNICO O PASAPORTE ID
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
            disabled={isSubmitting || !!socialLoading}
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

        {/* Social Logins Divider */}
        <div className="px-5 pt-3 pb-1">
          <div className="flex items-center gap-3 mb-3.5">
            <div className={`flex-1 h-px ${isLight ? 'bg-gray-200' : 'bg-[#e11d48]/25'}`} />
            <span className={`font-label-caps text-[9px] uppercase tracking-widest font-semibold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
              O CONTINUAR CON
            </span>
            <div className={`flex-1 h-px ${isLight ? 'bg-gray-200' : 'bg-[#e11d48]/25'}`} />
          </div>

          {/* Social Sign-In Buttons */}
          <div className="flex flex-col gap-2.5">
            {/* Google Button */}
            <button
              type="button"
              disabled={!!socialLoading || isSubmitting}
              onClick={() => handleSocialLogin('google')}
              className={`w-full py-2.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-3 font-body-sm text-[13px] font-medium tactile-btn disabled:opacity-50 shadow-sm ${
                isLight
                  ? 'bg-[#fff5f6] hover:bg-[#fff1f3] border border-[#fecdd3] text-[#0f172a]'
                  : 'bg-[#0b0507] hover:bg-[#190910] border border-[#e11d48]/25 text-[#fff1f2]'
              }`}
            >
              {socialLoading === 'google' ? (
                <span className="flex items-center gap-2 font-label-caps text-[10px] uppercase font-bold text-[#e11d48]">
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  AUTENTICANDO CON GOOGLE...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"
                    />
                  </svg>
                  <span>Continuar con Google</span>
                </>
              )}
            </button>

            {/* Apple Button */}
            <button
              type="button"
              disabled={!!socialLoading || isSubmitting}
              onClick={() => handleSocialLogin('apple')}
              className={`w-full py-2.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-3 font-body-sm text-[13px] font-medium tactile-btn disabled:opacity-50 shadow-sm ${
                isLight
                  ? 'bg-[#fff5f6] hover:bg-[#fff1f3] border border-[#fecdd3] text-[#0f172a]'
                  : 'bg-[#0b0507] hover:bg-[#190910] border border-[#e11d48]/25 text-[#fff1f2]'
              }`}
            >
              {socialLoading === 'apple' ? (
                <span className="flex items-center gap-2 font-label-caps text-[10px] uppercase font-bold text-[#e11d48]">
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  AUTENTICANDO CON APPLE...
                </span>
              ) : (
                <>
                  <svg className={`w-4 h-4 shrink-0 fill-current ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`} viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.02.63-2.66 1.38-.56.65-.99 1.7-0.87 2.72 1.04.08 2.05-.53 2.61-1.23z" />
                  </svg>
                  <span>Continuar con Apple</span>
                </>
              )}
            </button>

            {/* Facebook Button */}
            <button
              type="button"
              disabled={!!socialLoading || isSubmitting}
              onClick={() => handleSocialLogin('facebook')}
              className={`w-full py-2.5 px-4 rounded-2xl transition-all flex items-center justify-center gap-3 font-body-sm text-[13px] font-medium tactile-btn disabled:opacity-50 shadow-sm ${
                isLight
                  ? 'bg-[#fff5f6] hover:bg-[#fff1f3] border border-[#fecdd3] text-[#0f172a]'
                  : 'bg-[#0b0507] hover:bg-[#190910] border border-[#e11d48]/25 text-[#fff1f2]'
              }`}
            >
              {socialLoading === 'facebook' ? (
                <span className="flex items-center gap-2 font-label-caps text-[10px] uppercase font-bold text-[#1877F2]">
                  <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                  AUTENTICANDO CON FACEBOOK...
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Continuar con Facebook</span>
                </>
              )}
            </button>
          </div>
        </div>
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
                ✓ Enlace de restablecimiento enviado a tu correo. Revisá tu bandeja.
              </div>
            ) : (
              <form onSubmit={handleSendRecovery} className="flex flex-col gap-3">
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
