import React, { useState } from 'react';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { forgotPassword } from '../lib/api/auth';
import { ApiError } from '../lib/apiClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Dialog, DialogContent } from './ui/dialog';
import { GoogleAuthButton } from './GoogleAuthButton';

export type GooglePrefill = { pendingToken: string; email: string; name?: string };

interface LoginViewProps {
  onGoToRegister: () => void;
  onGoogleNeedsProfile: (data: GooglePrefill) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onGoToRegister, onGoogleNeedsProfile }) => {
  const { isLight, toggleTheme } = useTheme();
  const { login, loginWithGoogle } = useAuth();
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

  const handleGoogleCredential = async (idToken: string) => {
    setErrorMsg('');
    sounds.playClick();
    try {
      const result = await loginWithGoogle(idToken);
      if (result.needsProfile) {
        onGoogleNeedsProfile({ pendingToken: result.pendingToken, email: result.email, name: result.name });
      } else {
        sounds.playStamp();
      }
    } catch (err) {
      setErrorMsg(
        err instanceof ApiError ? err.message : 'No pudimos conectar con Google. Probá de nuevo.',
      );
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
    <div className={`w-full max-w-[420px] mx-auto min-h-screen py-10 px-6 flex flex-col justify-center animate-fadeIn ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
      {/* Theme toggle, unobtrusive corner control */}
      <button
        type="button"
        onClick={() => {
          sounds.playClick();
          toggleTheme();
        }}
        className={`self-end w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
          isLight ? 'bg-[#f2f2f4] text-[#0f172a] hover:bg-[#e7e7ea]' : 'bg-white/8 text-[#fff1f2] hover:bg-white/14'
        }`}
        title="Cambiar tema de color"
        aria-label="Cambiar tema de color"
      >
        <span className="material-symbols-outlined text-[17px]">{isLight ? 'dark_mode' : 'light_mode'}</span>
      </button>

      {/* Wordmark + one-line promise */}
      <div className="mt-2 mb-9">
        <span className="font-headline-md text-[30px] font-bold text-[#e11d48]">MELY</span>
        <p className={`text-[14px] mt-2 leading-relaxed ${isLight ? 'text-[#64748b]' : 'text-[#a89a9e]'}`}>
          Bienvenida de vuelta. Iniciá sesión para seguir tus citas y conversaciones.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-[12px] flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5 text-[#e11d48]">error</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email">Email</Label>
          <Input
            id="login-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu.correo@ejemplo.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="login-pass">Contraseña</Label>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowRecoveryModal(true);
              }}
              className="text-[12.5px] font-bold text-[#e11d48] hover:underline cursor-pointer normal-case tracking-normal"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div className="relative flex items-center">
            <Input
              id="login-pass"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresá tu contraseña"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute right-3 p-1 focus:outline-none cursor-pointer ${isLight ? 'text-gray-400 hover:text-[#0f172a]' : 'text-[#a89a9e] hover:text-[#fff1f2]'}`}
              aria-label="Ver u ocultar contraseña"
            >
              <span className="material-symbols-outlined text-[18px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
        </div>

        <Label className="flex items-center gap-2 cursor-pointer select-none normal-case tracking-normal text-[12.5px] font-normal text-slate-500 dark:text-[#a89a9e]">
          <Checkbox checked={rememberMe} onCheckedChange={(v) => setRememberMe(v === true)} />
          Recordar mi sesión
        </Label>

        <Button
          id="login-submit-btn"
          type="submit"
          variant="cherry"
          size="lg"
          disabled={isSubmitting}
          className="w-full mt-1 normal-case tracking-normal text-[15px]"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              Iniciando sesión...
            </span>
          ) : (
            'Iniciar sesión'
          )}
        </Button>
      </form>

      <div className="flex items-center gap-3 my-6">
        <span className={`flex-1 h-px ${isLight ? 'bg-[#e7e7ea]' : 'bg-white/10'}`} />
        <span className={`text-[12px] ${isLight ? 'text-[#6b7280]' : 'text-[#a89a9e]'}`}>o continuá con</span>
        <span className={`flex-1 h-px ${isLight ? 'bg-[#e7e7ea]' : 'bg-white/10'}`} />
      </div>

      <GoogleAuthButton onCredential={handleGoogleCredential} text="signin_with" />

      <div className="mt-8 flex items-center justify-center gap-1.5">
        <span className={`text-[13.5px] ${isLight ? 'text-[#6b7280]' : 'text-[#a89a9e]'}`}>¿No tenés cuenta?</span>
        <button
          id="btn-switch-register"
          type="button"
          onClick={() => {
            sounds.playClick();
            onGoToRegister();
          }}
          className="text-[13.5px] font-bold text-[#e11d48] hover:underline cursor-pointer"
        >
          Registrate
        </button>
      </div>

      {/* Password Recovery Modal */}
      <Dialog open={showRecoveryModal} onOpenChange={setShowRecoveryModal}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[360px] p-6 rounded-3xl">
          <h3 className={`font-headline-md text-[18px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
            Recuperar contraseña
          </h3>
          <p className={`text-[12.5px] ${isLight ? 'text-[#64748b]' : 'text-[#a89a9e]'}`}>
            Ingresá el correo asociado a tu cuenta para recibir un enlace seguro de restablecimiento.
          </p>

          {recoverySent ? (
            <div className="p-3 bg-[#10b981]/15 border border-[#10b981]/40 rounded-2xl text-[#059669] text-[12.5px] text-center font-medium">
              Si el correo existe, te enviamos un enlace de restablecimiento. Revisá tu bandeja.
            </div>
          ) : (
            <form onSubmit={handleSendRecovery} className="flex flex-col gap-3">
              {recoveryError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px]">
                  {recoveryError}
                </div>
              )}
              <Input
                type="email"
                required
                placeholder="tu.correo@ejemplo.com"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
              />
              <Button type="submit" variant="cherry" className="w-full normal-case tracking-normal">
                Enviar enlace de recuperación
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
