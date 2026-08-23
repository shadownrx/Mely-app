import React, { useEffect, useState } from 'react';
import { ARGENTINA_CITIES } from '../data/mockData';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { updateProfile, replacePrompts, uploadPhoto, listInterests } from '../lib/api/profile';
import { redeemCode } from '../lib/api/wallet';
import { ApiError } from '../lib/apiClient';
import type { Gender } from '../types';

interface RegisterViewProps {
  onGoToLogin: () => void;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'WOMAN', label: 'Mujer' },
  { value: 'MAN', label: 'Hombre' },
  { value: 'NON_BINARY', label: 'No binario' },
  { value: 'OTHER', label: 'Otro' },
];

function isAdult(dateOfBirth: string): boolean {
  if (!dateOfBirth) return false;
  const dob = new Date(dateOfBirth);
  const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  return age >= 18;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ onGoToLogin }) => {
  const { isLight, toggleTheme } = useTheme();
  const { register, refreshUser } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1
  const [name, setName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<Gender>('WOMAN');
  const [seeking, setSeeking] = useState<Gender[]>(['MAN']);
  const [city, setCity] = useState(ARGENTINA_CITIES[0]);
  const [job, setJob] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step1Error, setStep1Error] = useState('');

  // Step 2
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Step 3
  const [bio, setBio] = useState('');
  const [availableInterests, setAvailableInterests] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>([]);
  const [promptQ, setPromptQ] = useState('Mi cita ideal no negociable...');
  const [promptA, setPromptA] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    listInterests()
      .then(setAvailableInterests)
      .catch(() => undefined);
  }, []);

  const toggleSeeking = (g: Gender) => {
    sounds.playClick();
    setSeeking((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const toggleInterest = (id: string) => {
    sounds.playClick();
    setSelectedInterestIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) return prev;
      return [...prev, id];
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleStep1Continue = () => {
    setStep1Error('');
    if (!name.trim() || !dateOfBirth || !email.trim() || !password) {
      setStep1Error('Completá todos los campos obligatorios.');
      return;
    }
    if (!isAdult(dateOfBirth)) {
      setStep1Error('MELY es exclusivamente para mayores de 18 años.');
      return;
    }
    if (!seeking.length) {
      setStep1Error('Elegí a quién te gustaría conocer.');
      return;
    }
    sounds.playClick();
    setStep(2);
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    if (!acceptTerms || !acceptPrivacy) return;

    setIsIssuing(true);
    sounds.playStamp();
    try {
      await register({
        email: email.trim(),
        password,
        dateOfBirth,
        acceptTerms: true,
        acceptPrivacy: true,
      });

      await updateProfile({
        displayName: name.trim(),
        gender,
        seeking,
        lookingFor: 'UNSURE',
        bio: bio.trim() || undefined,
        city,
        job: job.trim() || undefined,
        interestIds: selectedInterestIds,
      });

      if (promptA.trim()) {
        await replacePrompts([{ question: promptQ.trim() || 'Mi cita ideal...', answer: promptA.trim() }]);
      }

      if (avatarFile) {
        await uploadPhoto(avatarFile).catch(() => undefined);
      }

      await redeemCode('WELCOME').catch(() => undefined);
      await refreshUser();
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.code === 'EMAIL_TAKEN'
            ? 'Ese correo ya tiene un pasaporte emitido. Iniciá sesión.'
            : err.message
          : 'No pudimos completar el registro. Probá de nuevo.';
      setSubmitError(message);
      setIsIssuing(false);
    }
  };

  return (
    <div className={`w-full max-w-[420px] mx-auto min-h-screen py-6 px-4 flex flex-col justify-between animate-fadeIn pb-12 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
      {/* Top Header & Theme Switcher */}
      <div className="w-full flex justify-between items-center mb-5 pb-3 border-b border-[#e11d48]/25">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            if (step > 1) {
              setStep((s) => (s - 1) as 1 | 2 | 3);
            } else {
              onGoToLogin();
            }
          }}
          className={`flex items-center gap-1 font-label-caps text-[10px] uppercase font-bold focus:outline-none ${isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#fda4af] hover:text-[#fff1f2]'}`}
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>{step > 1 ? 'Paso Anterior' : 'Iniciar Sesión'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              toggleTheme();
            }}
            className={`p-1.5 rounded-full border text-[13px] ${isLight ? 'bg-white border-[#fecdd3] text-[#e11d48]' : 'bg-[#140b0f] border-[#e11d48]/30 text-[#fda4af]'}`}
            title="Cambiar tema"
          >
            <span className="material-symbols-outlined text-[15px] block">
              {isLight ? 'dark_mode' : 'light_mode'}
            </span>
          </button>

          <div className="flex items-center gap-1.5 ml-1">
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 1 ? 'bg-[#e11d48] shadow-[0_0_8px_rgba(225,29,72,0.8)]' : isLight ? 'bg-gray-200' : 'bg-white/20'}`} />
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 2 ? 'bg-[#e11d48] shadow-[0_0_8px_rgba(225,29,72,0.8)]' : isLight ? 'bg-gray-200' : 'bg-white/20'}`} />
            <span className={`w-2.5 h-2.5 rounded-full transition-all ${step >= 3 ? 'bg-[#e11d48] shadow-[0_0_8px_rgba(225,29,72,0.8)]' : isLight ? 'bg-gray-200' : 'bg-white/20'}`} />
          </div>
        </div>
      </div>

      {/* Hero Passport Application Badge */}
      <div className="text-center mb-5">
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border mb-2 ${isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-[#e11d48]/15 border-[#e11d48]/30'}`}>
          <span className="text-[12px]">🇦🇷</span>
          <span className="font-label-caps text-[9px] text-[#e11d48] uppercase tracking-[0.2em] font-bold">
            REPÚBLICA ARGENTINA • MELY CLUB
          </span>
        </div>
        <h2 className={`font-headline-md text-[22px] font-black tracking-tight ${isLight ? 'text-[#0f172a]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#fb7185] to-[#fff1f2]'}`}>
          Emisión de Pasaporte de Conexiones
        </h2>
        <p className={`font-body-sm text-[12px] mt-1 max-w-[340px] mx-auto ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
          Creá tu credencial oficial para citas presenciales y encuentros verificados en Argentina.
        </p>
      </div>

      {/* Live Passport Card Preview */}
      <div
        className={`rounded-3xl p-4 border relative overflow-hidden shadow-2xl mb-5 ticket-edge-bottom ${
          isLight
            ? 'bg-white border-[#fecdd3] shadow-[0_10px_30px_rgba(225,29,72,0.08)]'
            : 'bg-[#140b0f] border-[#e11d48]/35'
        }`}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#e11d48 1px, transparent 1px)',
            backgroundSize: '12px 12px',
          }}
        />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#e11d48] shrink-0 p-0.5 bg-[#fff5f6] dark:bg-[#0b0507] shadow-md flex items-center justify-center">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="material-symbols-outlined text-[26px] text-[#e11d48]">person</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`font-headline-md text-[18px] font-bold truncate block ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                {name || 'Tu Nombre'}
              </span>
            </div>
            <span className="font-meta-data text-[10px] text-[#e11d48] uppercase tracking-wider block truncate font-bold">
              Nuevo Miembro • {city}
            </span>
            <span className={`font-body-sm text-[11px] block truncate mt-0.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
              {job || 'Tu ocupación'}
            </span>
          </div>

          <div className="w-10 h-10 rounded-full border border-dashed border-[#e11d48] flex items-center justify-center text-[#e11d48] shrink-0">
            <span className="material-symbols-outlined text-[20px]">
              verified_user
            </span>
          </div>
        </div>

        <div className={`mt-3 pt-2.5 border-t flex justify-between items-center text-[9px] font-label-caps ${isLight ? 'border-[#fecdd3] text-[#64748b]' : 'border-[#e11d48]/20 text-[#fda4af]/60'}`}>
          <span>PASAPORTE OFICIAL ARGENTINA</span>
          <span className="text-[#e11d48] font-bold">+1,000 PTS BONO DE BIENVENIDA</span>
        </div>
      </div>

      {/* Multistep Form */}
      <form
        onSubmit={handleCompleteRegistration}
        className={`rounded-3xl p-5 border shadow-2xl flex flex-col gap-4 ${
          isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
        }`}
      >
        {/* STEP 1: Personal Identification */}
        {step === 1 && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <div className={`border-b pb-2 mb-1 flex justify-between items-center ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/20'}`}>
              <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">
                1. IDENTIDAD & ACCESO
              </span>
              <span className={`font-meta-data text-[9px] font-bold ${isLight ? 'text-gray-400' : 'text-[#fda4af]/60'}`}>PASO 1 DE 3</span>
            </div>

            {step1Error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-body-sm">
                {step1Error}
              </div>
            )}

            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                Nombre Completo / Titular del Pasaporte
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Mariel Juárez"
                className={`w-full border rounded-2xl px-3.5 py-2.5 font-body-sm text-[13px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                  Fecha de nacimiento
                </label>
                <input
                  type="date"
                  required
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={`w-full border rounded-2xl px-3.5 py-2.5 font-body-sm text-[13px] focus:outline-none ${
                    isLight
                      ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                      : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                  }`}
                />
              </div>

              <div>
                <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                  Ciudad / Barrio
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full border rounded-2xl px-3 py-2.5 font-body-sm text-[12px] focus:outline-none ${
                    isLight
                      ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                      : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                  }`}
                >
                  {ARGENTINA_CITIES.map((c) => (
                    <option key={c} value={c} className={isLight ? 'bg-white text-[#0f172a]' : 'bg-[#0b0507] text-[#fff1f2]'}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                  Tu género
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className={`w-full border rounded-2xl px-3 py-2.5 font-body-sm text-[12px] focus:outline-none ${
                    isLight
                      ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                      : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                  }`}
                >
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value} className={isLight ? 'bg-white text-[#0f172a]' : 'bg-[#0b0507] text-[#fff1f2]'}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                  Ocupación
                </label>
                <input
                  type="text"
                  value={job}
                  onChange={(e) => setJob(e.target.value)}
                  placeholder="Opcional"
                  className={`w-full border rounded-2xl px-3.5 py-2.5 font-body-sm text-[13px] focus:outline-none ${
                    isLight
                      ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                      : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1.5 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                Te gustaría conocer a
              </label>
              <div className="flex flex-wrap gap-1.5">
                {GENDER_OPTIONS.map((g) => {
                  const isSelected = seeking.includes(g.value);
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => toggleSeeking(g.value)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-body-sm transition-all border ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent shadow-sm'
                          : isLight
                          ? 'bg-white text-[#475569] border-[#fecdd3] hover:border-[#e11d48]'
                          : 'bg-[#0b0507] text-[#fda4af]/70 border-[#e11d48]/25 hover:border-[#e11d48]/50'
                      }`}
                    >
                      {isSelected ? `✓ ${g.label}` : g.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                Correo Electrónico
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu.correo@mely.app"
                className={`w-full border rounded-2xl px-3.5 py-2.5 font-mono text-[12px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
            </div>

            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                Crear Llave de Acceso (Contraseña)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres, letras y números"
                className={`w-full border rounded-2xl px-3.5 py-2.5 font-mono text-[12px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={handleStep1Continue}
              className="mt-2 w-full py-3 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] tracking-wider uppercase font-bold rounded-2xl tactile-btn hover:opacity-95 shadow-md shadow-[#e11d48]/20 flex items-center justify-center gap-2"
            >
              <span>CONTINUAR A FOTOGRAFÍA</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        )}

        {/* STEP 2: Photo */}
        {step === 2 && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <div className={`border-b pb-2 mb-1 flex justify-between items-center ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/20'}`}>
              <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">
                2. FOTOGRAFÍA
              </span>
              <span className={`font-meta-data text-[9px] font-bold ${isLight ? 'text-gray-400' : 'text-[#fda4af]/60'}`}>PASO 2 DE 3</span>
            </div>

            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[#e11d48] p-0.5 bg-[#fff5f6] dark:bg-[#0b0507] shadow-md flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                ) : (
                  <span className="material-symbols-outlined text-[48px] text-[#e11d48]">person</span>
                )}
              </div>
              <label
                className={`px-4 py-2 rounded-2xl border cursor-pointer font-label-caps text-[10px] uppercase font-bold tactile-btn ${
                  isLight ? 'bg-[#fff5f6] border-[#fecdd3] text-[#e11d48]' : 'bg-[#0b0507] border-[#e11d48]/30 text-[#fda4af]'
                }`}
              >
                {avatarFile ? 'Cambiar foto' : 'Subir foto'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarChange} />
              </label>
              <p className={`font-body-sm text-[11px] text-center max-w-[280px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                Podés subirla ahora o después desde tu perfil.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setStep(3);
              }}
              className="mt-2 w-full py-3 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] tracking-wider uppercase font-bold rounded-2xl tactile-btn hover:opacity-90 flex items-center justify-center gap-2 shadow-md"
            >
              <span>CONTINUAR A BIO & INTERESES</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        )}

        {/* STEP 3: Bio, Prompts, Interests, and Terms */}
        {step === 3 && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <div className={`border-b pb-2 mb-1 flex justify-between items-center ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/20'}`}>
              <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">
                3. BIO, AFINIDADES & EMISIÓN
              </span>
              <span className={`font-meta-data text-[9px] font-bold ${isLight ? 'text-gray-400' : 'text-[#fda4af]/60'}`}>PASO 3 DE 3</span>
            </div>

            {submitError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-body-sm">
                {submitError}
              </div>
            )}

            {/* Bio Editorial */}
            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                Bio Editorial del Pasaporte
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describí tus afinidades, gustos y lo que buscás compartir en un encuentro..."
                className={`w-full border rounded-2xl px-3.5 py-2 font-body-sm text-[12px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
            </div>

            {/* Intereses reales */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`font-label-caps text-[10px] uppercase font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                  Intereses ({selectedInterestIds.length}/6)
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {availableInterests.map((interest) => {
                  const isSelected = selectedInterestIds.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      type="button"
                      onClick={() => toggleInterest(interest.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-body-sm transition-all border ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent shadow-sm'
                          : isLight
                          ? 'bg-white text-[#475569] border-[#fecdd3] hover:border-[#e11d48]'
                          : 'bg-[#0b0507] text-[#fda4af]/70 border-[#e11d48]/25 hover:border-[#e11d48]/50'
                      }`}
                    >
                      {isSelected ? `✓ ${interest.name}` : `+ ${interest.name}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt de Cita */}
            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                Pregunta de Encuentro Presencial (opcional)
              </label>
              <input
                type="text"
                value={promptQ}
                onChange={(e) => setPromptQ(e.target.value)}
                className={`w-full border rounded-2xl px-3.5 py-1.5 font-body-sm text-[12px] mb-1.5 focus:outline-none font-medium ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#e11d48] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fb7185] focus:border-[#fb7185]'
                }`}
              />
              <input
                type="text"
                value={promptA}
                onChange={(e) => setPromptA(e.target.value)}
                placeholder="Tu respuesta..."
                className={`w-full border rounded-2xl px-3.5 py-2 font-body-sm text-[12px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
            </div>

            {/* Terms */}
            <div className={`p-3 rounded-2xl border flex flex-col gap-2 ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="accent-[#e11d48] rounded w-4 h-4 mt-0.5"
                />
                <span className={`font-body-sm text-[11px] leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#fda4af]/80'}`}>
                  Acepto los <strong>Términos y Condiciones</strong> de MELY Argentina.
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={acceptPrivacy}
                  onChange={(e) => setAcceptPrivacy(e.target.checked)}
                  className="accent-[#e11d48] rounded w-4 h-4 mt-0.5"
                />
                <span className={`font-body-sm text-[11px] leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#fda4af]/80'}`}>
                  Acepto la <strong>Política de Privacidad</strong> y la verificación presencial mediante token en cada encuentro.
                </span>
              </label>
            </div>

            {/* Final Issuance Button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isIssuing || !acceptTerms || !acceptPrivacy}
              className="w-full py-3.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[11px] tracking-[0.18em] uppercase font-bold rounded-2xl tactile-btn hover:opacity-95 shadow-xl shadow-[#e11d48]/25 flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50"
            >
              {isIssuing ? (
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                  ESTAMPANDO PASAPORTE OFICIAL...
                </span>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                  <span>EMITIR MI PASAPORTE (+1,000 PTS)</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Switch to Login */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            onGoToLogin();
          }}
          className={`font-label-caps text-[10px] uppercase tracking-wider underline focus:outline-none font-bold ${
            isLight ? 'text-[#e11d48] hover:text-[#be123c]' : 'text-[#fda4af]/80 hover:text-[#fff1f2]'
          }`}
        >
          ¿Ya tenés un Pasaporte emitido? Iniciá Sesión acá
        </button>
      </div>
    </div>
  );
};
