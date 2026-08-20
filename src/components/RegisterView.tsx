import React, { useState } from 'react';
import { Profile } from '../types';
import { ARGENTINA_CITIES } from '../data/mockData';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface RegisterViewProps {
  onRegister: (newUser: Profile, welcomePts: number) => void;
  onGoToLogin: () => void;
}

const PRESET_AVATARS = [
  {
    name: 'Retrato Clásico I',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Retrato Clásico II',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Retrato Clásico III',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Retrato Clásico IV',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Retrato Clásico V',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Retrato Clásico VI',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
  },
];

const AVAILABLE_TAGS = [
  'Café de Especialidad',
  'Vermú en Chacarita',
  'Muestras en el MALBA',
  'Vinilos & Rock Nacional',
  'Vinos Malbec & Bodegas',
  'Librerías de Corrientes',
  'Fotografía 35mm',
  'Paseos por San Telmo',
  'Cine Gaumont & Cosmos',
  'Sobremesas Infinitas',
  'Bicicleteadas Porteñas',
  'Arquitectura & Pasajes',
];

export const RegisterView: React.FC<RegisterViewProps> = ({ onRegister, onGoToLogin }) => {
  const { isLight, toggleTheme } = useTheme();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('Mariel Juárez');
  const [email, setEmail] = useState('mariel.juarez@mely.app');
  const [password, setPassword] = useState('mely2026');
  const [age, setAge] = useState<number>(27);
  const [occupation, setOccupation] = useState('Diseñadora Visual & Fotógrafa');
  const [city, setCity] = useState('Palermo / Chacarita (CABA)');
  const [membershipType, setMembershipType] = useState<'Premium Member' | 'Founding Member' | 'VIP Member'>('Premium Member');
  const [passType, setPassType] = useState('Pasaporte Nacional');
  const [bio, setBio] = useState('Enamorada de la fotografía analógica, las conversaciones profundas frente a un buen café de especialidad y las sobremesas sin apuro.');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Café de Especialidad',
    'Vermú en Chacarita',
    'Muestras en el MALBA',
    'Librerías de Corrientes',
  ]);
  const [promptQ, setPromptQ] = useState('Mi cita ideal no negociable...');
  const [promptA, setPromptA] = useState('Un café de especialidad en Cuervo o un vermucito en Chacarita con charla sin reloj.');
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [isIssuing, setIsIssuing] = useState(false);

  const toggleTag = (tag: string) => {
    sounds.playClick();
    if (selectedTags.includes(tag)) {
      setSelectedTags((prev) => prev.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 6) {
        setSelectedTags((prev) => [...prev, tag]);
      }
    }
  };

  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) return;

    setIsIssuing(true);
    sounds.playStamp();

    setTimeout(() => {
      const now = new Date();
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      const joinedStr = `${monthNames[now.getMonth()]} '${now.getFullYear().toString().slice(-2)}`;

      const finalAvatar = customAvatarUrl.trim() || selectedAvatar;

      const newUser: Profile = {
        id: `user-${Date.now()}`,
        name: name.trim() || 'Nuevo Miembro',
        email: email.trim() || 'miembro@mely.app',
        age: Number(age) || 27,
        occupation: occupation.trim() || 'Miembro MELY',
        city,
        distance: '0 km',
        joined: joinedStr,
        membership: membershipType,
        bio: bio.trim() || 'Amante de los encuentros reales, el café de especialidad y la buena música.',
        passType,
        avatar: finalAvatar,
        gallery: [
          finalAvatar,
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        ],
        tags: selectedTags.length > 0 ? selectedTags : ['Café de Especialidad', 'Arte'],
        prompts: [
          { question: promptQ, answer: promptA },
        ],
        verifiedEncounters: 0,
      };

      onRegister(newUser, 1000);
    }, 900);
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
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#e11d48] shrink-0 p-0.5 bg-[#fff5f6] dark:bg-[#0b0507] shadow-md">
            <img
              src={customAvatarUrl.trim() || selectedAvatar}
              alt="Avatar Preview"
              className="w-full h-full object-cover rounded-full"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`font-headline-md text-[18px] font-bold truncate block ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                {name || 'Tu Nombre'}
              </span>
              <span className={`font-meta-data text-[12px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
                , {age}
              </span>
            </div>
            <span className="font-meta-data text-[10px] text-[#e11d48] uppercase tracking-wider block truncate font-bold">
              {membershipType} • {city}
            </span>
            <span className={`font-body-sm text-[11px] block truncate mt-0.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
              {occupation || 'Tu Ocupación'}
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

            {/* Quick Social Sign-Up */}
            <div className="flex flex-col gap-2 pb-2">
              <span className={`font-label-caps text-[9px] uppercase tracking-wider font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
                EMISIÓN RÁPIDA CON TUS CUENTAS
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playStamp();
                    setName('Mariel Juárez');
                    setEmail('marieljuarezcm@gmail.com');
                    setOccupation('Directora Creativa');
                    setCity('Palermo Soho, CABA');
                    setStep(2);
                  }}
                  className={`py-2 px-2 border rounded-2xl flex items-center justify-center gap-1.5 text-[11px] font-body-sm tactile-btn shadow-sm ${
                    isLight
                      ? 'bg-[#fff5f6] hover:bg-[#fff1f3] border-[#fecdd3] text-[#0f172a]'
                      : 'bg-[#0b0507] hover:bg-[#1f0d16] border-[#e11d48]/25 text-[#fff1f2]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.9 5 12 5z"/>
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
                    <path fill="#FBBC05" d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.6 7.4C.6 9.4 0 11.6 0 14s.6 4.6 1.6 6.6l3.7-2.9z"/>
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.1 0-5.8-2.4-6.7-5.3L1.6 16C3.5 19.8 7.4 23 12 23z"/>
                  </svg>
                  <span className="font-medium text-[10px]">Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playStamp();
                    setName('Mariel Juárez');
                    setEmail('mariel.juarez@icloud.com');
                    setOccupation('Diseño & Fotografía');
                    setCity('Palermo Soho, CABA');
                    setStep(2);
                  }}
                  className={`py-2 px-2 border rounded-2xl flex items-center justify-center gap-1.5 text-[11px] font-body-sm tactile-btn shadow-sm ${
                    isLight
                      ? 'bg-[#fff5f6] hover:bg-[#fff1f3] border-[#fecdd3] text-[#0f172a]'
                      : 'bg-[#0b0507] hover:bg-[#1f0d16] border-[#e11d48]/25 text-[#fff1f2]'
                  }`}
                >
                  <svg className={`w-3.5 h-3.5 shrink-0 fill-current ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`} viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.87-.93.04-2.02.63-2.66 1.38-.56.65-.99 1.7-0.87 2.72 1.04.08 2.05-.53 2.61-1.23z"/>
                  </svg>
                  <span className="font-medium text-[10px]">Apple</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playStamp();
                    setName('Mariel Juárez');
                    setEmail('mariel.juarez@facebook.com');
                    setOccupation('Fotógrafa & Artista');
                    setCity('Chacarita, CABA');
                    setStep(2);
                  }}
                  className={`py-2 px-2 border rounded-2xl flex items-center justify-center gap-1.5 text-[11px] font-body-sm tactile-btn shadow-sm ${
                    isLight
                      ? 'bg-[#fff5f6] hover:bg-[#fff1f3] border-[#fecdd3] text-[#0f172a]'
                      : 'bg-[#0b0507] hover:bg-[#1f0d16] border-[#e11d48]/25 text-[#fff1f2]'
                  }`}
                >
                  <svg className="w-3.5 h-3.5 shrink-0 fill-[#1877F2]" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="font-medium text-[10px]">Facebook</span>
                </button>
              </div>

              <div className="flex items-center gap-2 my-1">
                <div className={`flex-1 h-px ${isLight ? 'bg-gray-200' : 'bg-[#e11d48]/20'}`} />
                <span className={`font-label-caps text-[8px] uppercase tracking-widest ${isLight ? 'text-gray-400' : 'text-[#fda4af]/60'}`}>O FORMULARIO TRADICIONAL</span>
                <div className={`flex-1 h-px ${isLight ? 'bg-gray-200' : 'bg-[#e11d48]/20'}`} />
              </div>
            </div>

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
                  Edad
                </label>
                <input
                  type="number"
                  required
                  min={18}
                  max={99}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
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

            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                Ocupación / Vocación Creativa
              </label>
              <input
                type="text"
                required
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Ej. Diseñadora Visual & Fotógrafa"
                className={`w-full border rounded-2xl px-3.5 py-2.5 font-body-sm text-[13px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
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
                placeholder="Mínimo 6 caracteres"
                className={`w-full border rounded-2xl px-3.5 py-2.5 font-mono text-[12px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setStep(2);
              }}
              className="mt-2 w-full py-3 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] tracking-wider uppercase font-bold rounded-2xl tactile-btn hover:opacity-95 shadow-md shadow-[#e11d48]/20 flex items-center justify-center gap-2"
            >
              <span>CONTINUAR A FOTOGRAFÍA & TIPO DE PASE</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        )}

        {/* STEP 2: Photo & Membership Tier */}
        {step === 2 && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <div className={`border-b pb-2 mb-1 flex justify-between items-center ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/20'}`}>
              <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">
                2. FOTOGRAFÍA & TIPO DE PASE
              </span>
              <span className={`font-meta-data text-[9px] font-bold ${isLight ? 'text-gray-400' : 'text-[#fda4af]/60'}`}>PASO 2 DE 3</span>
            </div>

            {/* Photo Selection */}
            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-2 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                Seleccioná tu Retrato de Pasaporte
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {PRESET_AVATARS.map((av, idx) => {
                  const isSelected = selectedAvatar === av.url && !customAvatarUrl;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setSelectedAvatar(av.url);
                        setCustomAvatarUrl('');
                      }}
                      className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all group ${
                        isSelected ? 'border-[#e11d48] scale-105 shadow-md' : isLight ? 'border-gray-200 opacity-80 hover:opacity-100' : 'border-[#e11d48]/20 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#e11d48]/25 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white text-[22px] drop-shadow-md">
                            check_circle
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="O ingresá URL de imagen personalizada..."
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className={`w-full border rounded-2xl px-3 py-2 font-mono text-[11px] focus:outline-none ${
                    isLight
                      ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                      : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                  }`}
                />
              </div>
            </div>

            {/* Membership Tier */}
            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-2 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                Categoría de Miembro
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { title: 'Premium', sub: 'Pase Nacional', tier: 'Premium Member' as const, pass: 'Pasaporte Nacional' },
                  { title: 'Founding', sub: 'Pase Fundador', tier: 'Founding Member' as const, pass: 'Founding Pass' },
                  { title: 'VIP', sub: 'Pase Círculo VIP', tier: 'VIP Member' as const, pass: 'VIP Pass' },
                ].map((tierItem) => {
                  const isSelected = membershipType === tierItem.tier;
                  return (
                    <button
                      key={tierItem.tier}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setMembershipType(tierItem.tier);
                        setPassType(tierItem.pass);
                      }}
                      className={`p-2.5 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? isLight
                            ? 'bg-[#fff1f3] border-[#e11d48] text-[#0f172a] shadow-sm font-bold'
                            : 'bg-[#1f0d16] border-[#e11d48] text-[#fff1f2] shadow-md shadow-[#e11d48]/20 font-bold'
                          : isLight
                          ? 'bg-[#fafafa] border-[#fecdd3] text-[#64748b] hover:border-[#e11d48]'
                          : 'bg-[#0b0507] border-[#e11d48]/20 text-[#fda4af]/70 hover:border-[#e11d48]/40'
                      }`}
                    >
                      <span className="font-label-caps text-[10px] block truncate text-[#e11d48] font-bold">
                        {tierItem.title}
                      </span>
                      <span className={`font-meta-data text-[8px] block truncate ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
                        {tierItem.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
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

        {/* STEP 3: Bio, Prompts, Tags, and Terms */}
        {step === 3 && (
          <div className="flex flex-col gap-3.5 animate-fadeIn">
            <div className={`border-b pb-2 mb-1 flex justify-between items-center ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/20'}`}>
              <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">
                3. BIO, AFINIDADES & EMISIÓN
              </span>
              <span className={`font-meta-data text-[9px] font-bold ${isLight ? 'text-gray-400' : 'text-[#fda4af]/60'}`}>PASO 3 DE 3</span>
            </div>

            {/* Bio Editorial */}
            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                Bio Editorial del Pasaporte
              </label>
              <textarea
                rows={2}
                required
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

            {/* Tags de afinidad */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`font-label-caps text-[10px] uppercase font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                  Sellos de Afinidad e Intereses ({selectedTags.length}/6)
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-[11px] font-body-sm transition-all border ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent shadow-sm'
                          : isLight
                          ? 'bg-white text-[#475569] border-[#fecdd3] hover:border-[#e11d48]'
                          : 'bg-[#0b0507] text-[#fda4af]/70 border-[#e11d48]/25 hover:border-[#e11d48]/50'
                      }`}
                    >
                      {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Prompt de Cita */}
            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#334155]' : 'text-[#fda4af]'}`}>
                Pregunta de Encuentro Presencial
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
                required
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

            {/* Terms of Keepsake Club */}
            <div className={`p-3 rounded-2xl border ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="accent-[#e11d48] rounded w-4 h-4 mt-0.5"
                />
                <span className={`font-body-sm text-[11px] leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#fda4af]/80'}`}>
                  Acepto el manifiesto de <strong>MELY Argentina</strong>: Citas reales, respeto a la privacidad y verificación presencial mediante token en cada encuentro.
                </span>
              </label>
            </div>

            {/* Final Issuance Button */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isIssuing || !termsAccepted}
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
