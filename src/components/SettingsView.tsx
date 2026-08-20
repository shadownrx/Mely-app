import React, { useState } from 'react';
import { Profile, UserSettings } from '../types';
import { sounds } from '../utils/audio';
import { ARGENTINA_CITIES } from '../data/mockData';
import { useTheme } from '../context/ThemeContext';

interface SettingsViewProps {
  user: Profile;
  settings: UserSettings;
  walletBalance: number;
  onUpdateUser: (updatedUser: Partial<Profile>) => void;
  onUpdateSettings: (updatedSettings: Partial<UserSettings>) => void;
  onRedeemCoupon: (code: string) => boolean;
  onSignOut: () => void;
  onResetDemo: () => void;
  onClose?: () => void;
}

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

export const SettingsView: React.FC<SettingsViewProps> = ({
  user,
  settings,
  walletBalance,
  onUpdateUser,
  onUpdateSettings,
  onRedeemCoupon,
  onSignOut,
  onResetDemo,
  onClose,
}) => {
  const { theme, setTheme, isLight } = useTheme();
  const [activeSection, setActiveSection] = useState<'theme' | 'profile' | 'discovery' | 'security' | 'sounds' | 'membership'>('theme');
  
  // Profile Editor state
  const [editName, setEditName] = useState(user.name);
  const [editAge, setEditAge] = useState(user.age);
  const [editOccupation, setEditOccupation] = useState(user.occupation);
  const [editCity, setEditCity] = useState(user.city);
  const [editBio, setEditBio] = useState(user.bio);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [editPassType, setEditPassType] = useState(user.passType);
  const [editTags, setEditTags] = useState<string[]>(user.tags || []);
  const [promptQ, setPromptQ] = useState(user.prompts?.[0]?.question || 'Mi cita ideal no negociable...');
  const [promptA, setPromptA] = useState(user.prompts?.[0]?.answer || 'Un buen café de especialidad y charla sin reloj.');
  const [savedBanner, setSavedBanner] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Security rotation simulated
  const [tokenRotated, setTokenRotated] = useState(false);

  // Confirmation dialogs
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playStamp();
    onUpdateUser({
      name: editName,
      age: editAge,
      occupation: editOccupation,
      city: editCity,
      bio: editBio,
      avatar: editAvatar,
      passType: editPassType,
      tags: editTags,
      prompts: [{ question: promptQ, answer: promptA }],
    });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2500);
  };

  const handleToggleTag = (tag: string) => {
    sounds.playClick();
    if (editTags.includes(tag)) {
      setEditTags((prev) => prev.filter((t) => t !== tag));
    } else {
      if (editTags.length < 6) {
        setEditTags((prev) => [...prev, tag]);
      }
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playCoins();
    const success = onRedeemCoupon(couponCode.trim().toUpperCase());
    if (success) {
      setCouponMessage({ text: '¡Cupón canjeado con éxito! +1,000 PTS acreditados a tu Bóveda.', success: true });
      setCouponCode('');
    } else {
      setCouponMessage({ text: 'Código no válido o ya utilizado. Probá con "MELY2026", "ARGENTINA" o "PASAPORTE1000".', success: false });
    }
  };

  const handleRotateToken = () => {
    sounds.playStamp();
    setTokenRotated(true);
    setTimeout(() => setTokenRotated(false), 2500);
  };

  return (
    <div className={`w-full max-w-[420px] mx-auto flex flex-col gap-5 pb-24 animate-fadeIn ${
      isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
    }`}>
      {/* Settings Header */}
      <div
        className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-colors ${
          isLight
            ? 'bg-white border-[#fecdd3] shadow-[0_4px_20px_rgba(255,77,103,0.08)]'
            : 'bg-[#140b0f] border-[#e11d48]/30 shadow-2xl'
        }`}
      >
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[11px]">🇦🇷</span>
              <span
                className={`font-label-caps text-[9px] uppercase tracking-widest font-bold ${
                  isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'
                }`}
              >
                PANEL DE CONTROL • ARGENTINA
              </span>
            </div>
            <h2
              className={`font-headline-md text-[22px] font-black ${
                isLight ? 'text-[#0f172a]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#fb7185] to-[#fff1f2]'
              }`}
            >
              Ajustes del Pasaporte
            </h2>
          </div>
          {onClose && (
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className={`p-1.5 rounded-full focus:outline-none transition-colors ${
                isLight ? 'text-[#64748b] hover:text-[#0f172a] hover:bg-[#fff1f3]' : 'text-[#fda4af] hover:text-[#fff1f2] hover:bg-white/5'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          )}
        </div>

        {/* Section Navigation Tabs Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-label-caps uppercase">
          {[
            { id: 'theme' as const, label: 'Tema', icon: 'palette' },
            { id: 'profile' as const, label: 'Perfil', icon: 'badge' },
            { id: 'discovery' as const, label: 'Descubrir', icon: 'radar' },
            { id: 'security' as const, label: 'Seguridad', icon: 'shield' },
            { id: 'sounds' as const, label: 'Audio', icon: 'volume_up' },
            { id: 'membership' as const, label: 'Membresía', icon: 'stars' },
          ].map((tab) => {
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  sounds.playClick();
                  setActiveSection(tab.id);
                }}
                className={`px-3 py-1.5 rounded-2xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold shadow-md shadow-[#e11d48]/25'
                    : isLight
                    ? 'bg-[#fff1f3] text-[#64748b] hover:text-[#0f172a] border border-[#fecdd3]'
                    : 'bg-[#0b0507] text-[#fda4af]/70 hover:text-[#fff1f2] border border-[#e11d48]/20'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {savedBanner && (
        <div className="p-3.5 rounded-2xl bg-[#e11d48]/10 border border-[#e11d48]/40 text-[#e11d48] text-[12px] font-body-sm flex items-center gap-2 animate-fadeIn shadow-sm">
          <span className="material-symbols-outlined text-[20px] text-[#e11d48]">check_circle</span>
          <span className="font-medium">Cambios de pasaporte guardados correctamente.</span>
        </div>
      )}

      {/* SECTION 0: TEMA & APARIENCIA (DIRECT THEME SELECTOR) */}
      {activeSection === 'theme' && (
        <div
          className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
          }`}
        >
          <div className="border-b border-[#e11d48]/20 pb-2.5 flex justify-between items-center">
            <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">
              SELECTOR DE TEMA VISUAL
            </span>
            <span className={`font-meta-data text-[9px] font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
              INTERFAZ MELY
            </span>
          </div>

          <p className={`font-body-sm text-[13px] leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#fce7eb]/80'}`}>
            Seleccioná la paleta visual con la que deseás vivir tu experiencia en MELY:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* OPTION 1: Blanco & Coral (New requested light theme) */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setTheme('light');
                onUpdateSettings({ theme: 'light' });
              }}
              className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                isLight
                  ? 'border-[#e11d48] bg-gradient-to-br from-white via-[#fff5f6] to-[#ffe4e6]/40 shadow-lg shadow-[#e11d48]/15 ring-2 ring-[#e11d48]/20'
                  : 'border-[#2a131b] bg-[#0c0507] text-[#fda4af]/70 hover:border-[#e11d48]/50'
              }`}
            >
              {isLight && (
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#e11d48] text-white font-label-caps text-[8px] font-bold uppercase">
                  ACTIVO
                </span>
              )}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#ff4d67] to-[#e11d48] text-white flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    wb_sunny
                  </span>
                </div>
                <div>
                  <h4 className={`font-headline-md text-[14px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                    Blanco & Rojo Coral
                  </h4>
                  <span className="font-label-caps text-[9px] text-[#e11d48] font-bold uppercase">
                    Base Clara Minimalista
                  </span>
                </div>
              </div>

              {/* Theme Palette Swatches Preview */}
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white border border-[#fecdd3]">
                <span className="w-5 h-5 rounded-full bg-[#ffffff] border border-gray-200 shadow-sm" title="Fondo Blanco Puro" />
                <span className="w-5 h-5 rounded-full bg-[#fff1f3] border border-[#fecdd3]" title="Contenedor Rosa Pálido" />
                <span className="w-5 h-5 rounded-full bg-[#ff4d67]" title="Color Coral Primario" />
                <span className="w-5 h-5 rounded-full bg-[#e11d48]" title="Acento Rojo Cereza" />
                <span className="text-[10px] font-mono text-[#0f172a] ml-auto font-bold">#FFFFFF</span>
              </div>

              <p className={`text-[11px] leading-snug ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
                Fondo blanco puro de alta luminosidad con acento enérgico rosa/rojo coral.
              </p>
            </button>

            {/* OPTION 2: Obsidiana & Cereza (Dark mode) */}
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setTheme('dark');
                onUpdateSettings({ theme: 'dark' });
              }}
              className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                !isLight
                  ? 'border-[#e11d48] bg-gradient-to-br from-[#1e0a12] to-[#0c0507] shadow-lg shadow-[#e11d48]/25 ring-2 ring-[#e11d48]/30'
                  : 'border-[#fecdd3] bg-white text-[#64748b] hover:border-[#e11d48]'
              }`}
            >
              {!isLight && (
                <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#e11d48] text-white font-label-caps text-[8px] font-bold uppercase">
                  ACTIVO
                </span>
              )}
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#16080e] to-[#2b0d18] text-[#fb7185] border border-[#e11d48]/40 flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    dark_mode
                  </span>
                </div>
                <div>
                  <h4 className={`font-headline-md text-[14px] font-bold ${!isLight ? 'text-[#fff1f2]' : 'text-[#0f172a]'}`}>
                    Obsidiana & Cereza
                  </h4>
                  <span className="font-label-caps text-[9px] text-[#fb7185] font-bold uppercase">
                    Modo Noche Nocturno
                  </span>
                </div>
              </div>

              {/* Theme Palette Swatches Preview */}
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-[#090406] border border-[#e11d48]/30">
                <span className="w-5 h-5 rounded-full bg-[#0a0507] border border-[#e11d48]/40" title="Negro Obsidiana" />
                <span className="w-5 h-5 rounded-full bg-[#180b10] border border-[#e11d48]/40" title="Contenedor Borgoña Oscuro" />
                <span className="w-5 h-5 rounded-full bg-[#e11d48]" title="Rojo Carmesí" />
                <span className="w-5 h-5 rounded-full bg-[#fb7185]" title="Rosa Suave" />
                <span className="text-[10px] font-mono text-[#fda4af] ml-auto font-bold">#0A0507</span>
              </div>

              <p className={`text-[11px] leading-snug ${!isLight ? 'text-[#fda4af]/70' : 'text-[#64748b]'}`}>
                Estética noir íntima inspirada en la noche de Buenos Aires y sus bares.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: PERFIL / IDENTIDAD */}
      {activeSection === 'profile' && (
        <form
          onSubmit={handleSaveProfile}
          className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
          }`}
        >
          <div className="border-b border-[#e11d48]/20 pb-2.5 flex justify-between items-center">
            <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">
              IDENTIDAD & DATOS DE PASAPORTE
            </span>
            <span className={`font-meta-data text-[9px] font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
              ID: {user.id.slice(0, 10)}
            </span>
          </div>

          {/* Avatar selector & preview */}
          <div
            className={`flex items-center gap-4 p-3.5 rounded-2xl border ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
            }`}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#e11d48] shrink-0 bg-black shadow-md">
              <img src={editAvatar} alt={editName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 min-w-0">
              <label
                className={`font-label-caps text-[9px] uppercase block mb-1 font-bold ${
                  isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
                }`}
              >
                URL de Fotografía de Pasaporte
              </label>
              <input
                type="url"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
                className={`w-full border rounded-xl px-2.5 py-1.5 font-mono text-[11px] focus:outline-none ${
                  isLight
                    ? 'bg-white border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#140b0f] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
            </div>
          </div>

          {/* Name & Age */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="col-span-2">
              <label
                className={`font-label-caps text-[9px] uppercase block mb-1 font-bold ${
                  isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
                }`}
              >
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={`w-full border rounded-2xl px-3 py-2 font-body-sm text-[13px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
            </div>
            <div>
              <label
                className={`font-label-caps text-[9px] uppercase block mb-1 font-bold ${
                  isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
                }`}
              >
                Edad
              </label>
              <input
                type="number"
                min={18}
                max={99}
                value={editAge}
                onChange={(e) => setEditAge(Number(e.target.value))}
                className={`w-full border rounded-2xl px-3 py-2 font-body-sm text-[13px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
            </div>
          </div>

          {/* City & Pass Type */}
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label
                className={`font-label-caps text-[9px] uppercase block mb-1 font-bold ${
                  isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
                }`}
              >
                Ciudad / Barrio
              </label>
              <select
                value={editCity}
                onChange={(e) => setEditCity(e.target.value)}
                className={`w-full border rounded-2xl px-3 py-2 font-body-sm text-[12px] focus:outline-none ${
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
            <div>
              <label
                className={`font-label-caps text-[9px] uppercase block mb-1 font-bold ${
                  isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
                }`}
              >
                Tipo de Pasaporte
              </label>
              <select
                value={editPassType}
                onChange={(e) => setEditPassType(e.target.value)}
                className={`w-full border rounded-2xl px-3 py-2 font-body-sm text-[12px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              >
                <option value="Pasaporte Nacional">Pasaporte Nacional</option>
                <option value="Founding Pass">Pase Fundador</option>
                <option value="VIP Pass">Pase Círculo VIP</option>
              </select>
            </div>
          </div>

          {/* Occupation */}
          <div>
            <label
              className={`font-label-caps text-[9px] uppercase block mb-1 font-bold ${
                isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
              }`}
            >
              Ocupación / Vocación
            </label>
            <input
              type="text"
              value={editOccupation}
              onChange={(e) => setEditOccupation(e.target.value)}
              className={`w-full border rounded-2xl px-3 py-2 font-body-sm text-[13px] focus:outline-none ${
                isLight
                  ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                  : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
              }`}
            />
          </div>

          {/* Bio Editorial */}
          <div>
            <label
              className={`font-label-caps text-[9px] uppercase block mb-1 font-bold ${
                isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
              }`}
            >
              Bio Editorial
            </label>
            <textarea
              rows={3}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className={`w-full border rounded-2xl px-3 py-2 font-body-sm text-[12px] focus:outline-none ${
                isLight
                  ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                  : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
              }`}
            />
          </div>

          {/* Tags */}
          <div>
            <label
              className={`font-label-caps text-[9px] uppercase block mb-1.5 font-bold ${
                isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
              }`}
            >
              Sellos de Afinidad ({editTags.length}/6)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_TAGS.map((tag) => {
                const isSelected = editTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-[11px] font-body-sm transition-all border ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent shadow-sm'
                        : isLight
                        ? 'bg-[#fff5f6] text-[#475569] border-[#fecdd3] hover:border-[#e11d48]'
                        : 'bg-[#0b0507] text-[#fda4af]/70 border-[#e11d48]/25 hover:border-[#e11d48]/50'
                    }`}
                  >
                    {isSelected ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label
              className={`font-label-caps text-[9px] uppercase block mb-1 font-bold ${
                isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
              }`}
            >
              Prompt de Encuentro Presencial
            </label>
            <input
              type="text"
              value={promptQ}
              onChange={(e) => setPromptQ(e.target.value)}
              className="w-full border border-[#e11d48]/30 rounded-2xl px-3 py-1.5 text-[#e11d48] font-body-sm text-[12px] mb-1.5 focus:outline-none font-bold bg-[#fff5f6]"
            />
            <input
              type="text"
              value={promptA}
              onChange={(e) => setPromptA(e.target.value)}
              className={`w-full border rounded-2xl px-3 py-2 font-body-sm text-[12px] focus:outline-none ${
                isLight
                  ? 'bg-white border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                  : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
              }`}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] tracking-widest uppercase font-bold rounded-2xl tactile-btn hover:opacity-95 shadow-md shadow-[#e11d48]/25 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>GUARDAR CAMBIOS EN PASAPORTE</span>
          </button>
        </form>
      )}

      {/* SECTION 2: DESCUBRIMIENTO / FILTROS */}
      {activeSection === 'discovery' && (
        <div
          className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
          }`}
        >
          <div className="border-b border-[#e11d48]/20 pb-2.5 flex justify-between items-center">
            <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">
              PREFERENCIAS DE DESCUBRIMIENTO
            </span>
            <span className={`font-meta-data text-[9px] font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
              RADAR MELY
            </span>
          </div>

          {/* Visibility Toggle */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
            }`}
          >
            <div className="pr-4">
              <span className={`font-body-sm text-[14px] font-semibold block mb-0.5 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                Mostrarme en MELY
              </span>
              <span className={`font-meta-data text-[11px] block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                Permitir que otros miembros descubran tu pasaporte en el feed
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.discoveryEnabled}
                onChange={(e) => {
                  sounds.playClick();
                  onUpdateSettings({ discoveryEnabled: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 dark:bg-[#2b1019] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e11d48]" />
            </label>
          </div>

          {/* Max Distance Slider */}
          <div
            className={`p-4 rounded-2xl border flex flex-col gap-2 ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`font-label-caps text-[10px] uppercase font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
                Distancia Máxima
              </span>
              <span className="font-headline-md text-[16px] text-[#e11d48] font-bold">
                {settings.maxDistanceKm} km
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={100}
              value={settings.maxDistanceKm}
              onChange={(e) => {
                onUpdateSettings({ maxDistanceKm: Number(e.target.value) });
              }}
              className="w-full accent-[#e11d48]"
            />
            <span className={`font-meta-data text-[9px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/50'}`}>
              Muestra perfiles dentro de tu radio local o de viaje.
            </span>
          </div>

          {/* Age Range */}
          <div
            className={`p-4 rounded-2xl border flex flex-col gap-2 ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`font-label-caps text-[10px] uppercase font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
                Rango de Edad
              </span>
              <span className="font-headline-md text-[16px] text-[#e11d48] font-bold">
                {settings.ageRange[0]} - {settings.ageRange[1]} años
              </span>
            </div>
            <div className="flex gap-3 items-center">
              <input
                type="range"
                min={18}
                max={60}
                value={settings.ageRange[1]}
                onChange={(e) => {
                  onUpdateSettings({ ageRange: [settings.ageRange[0], Number(e.target.value)] });
                }}
                className="w-full accent-[#e11d48]"
              />
            </div>
          </div>

          {/* Only Verified Encounters Toggle */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
            }`}
          >
            <div className="pr-4">
              <span className={`font-body-sm text-[13px] font-semibold block mb-0.5 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                Solo Perfiles con Encuentros Verificados
              </span>
              <span className={`font-meta-data text-[10px] block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                Filtrar miembros que ya han completado sellos presenciales con token
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.onlyVerifiedMembers}
                onChange={(e) => {
                  sounds.playClick();
                  onUpdateSettings({ onlyVerifiedMembers: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 dark:bg-[#2b1019] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e11d48]" />
            </label>
          </div>
        </div>
      )}

      {/* SECTION 3: SEGURIDAD & SESIONES */}
      {activeSection === 'security' && (
        <div
          className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
          }`}
        >
          <div className="border-b border-[#e11d48]/20 pb-2.5 flex justify-between items-center">
            <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">
              SEGURIDAD, TOKENS & CRIPTOGRAFÍA
            </span>
            <span className="font-meta-data text-[9px] text-[#e11d48] font-bold">ENCRIPTACIÓN SHA-256</span>
          </div>

          {/* 2FA Toggle */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
            }`}
          >
            <div>
              <span className={`font-body-sm text-[14px] font-semibold block ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                Autenticación de Dos Factores (2FA)
              </span>
              <span className={`font-meta-data text-[10px] block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                Protección para canjes de bóveda y acuerdos de cita
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.twoFactorEnabled}
                onChange={(e) => {
                  sounds.playClick();
                  onUpdateSettings({ twoFactorEnabled: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 dark:bg-[#2b1019] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e11d48]" />
            </label>
          </div>

          {/* Token Rotation Box */}
          <div
            className={`p-4 rounded-2xl border flex flex-col gap-2 ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
            }`}
          >
            <div className="flex justify-between items-center">
              <div>
                <span className={`font-body-sm text-[13px] font-semibold block ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  Token de Verificación Presencial
                </span>
                <span className="font-meta-data text-[10px] text-[#e11d48] block font-bold">
                  {tokenRotated ? 'TOKEN ROTADO: ' + 'AR-' + Math.floor(1000 + Math.random() * 9000) : 'Rotación Criptográfica Diaria'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRotateToken}
                className="px-3 py-1.5 bg-[#e11d48] text-white rounded-xl text-[10px] font-label-caps uppercase font-bold tactile-btn shadow-sm"
              >
                Rotar Llave
              </button>
            </div>
          </div>

          {/* Incognito Mode */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
            }`}
          >
            <div>
              <span className={`font-body-sm text-[14px] font-semibold block ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                Modo Incógnito
              </span>
              <span className={`font-meta-data text-[10px] block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                Explorar pasaportes sin registrar huella de visualización
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input
                type="checkbox"
                checked={settings.incognitoMode}
                onChange={(e) => {
                  sounds.playClick();
                  onUpdateSettings({ incognitoMode: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-12 h-6 bg-gray-300 dark:bg-[#2b1019] rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#e11d48]" />
            </label>
          </div>
        </div>
      )}

      {/* SECTION 4: AUDIO, HÁPTICA & SONIDOS */}
      {activeSection === 'sounds' && (
        <div
          className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
          }`}
        >
          <div className="border-b border-[#e11d48]/20 pb-2.5 flex justify-between items-center">
            <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">
              AUDIO KEEPSAKE & EXPERIENCIA HÁPTICA
            </span>
            <span className={`font-meta-data text-[9px] font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
              WEB AUDIO API
            </span>
          </div>

          {/* Stamp Sounds */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
            }`}
          >
            <div className="pr-3">
              <span className={`font-body-sm text-[13px] font-semibold block ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                Sonido de Sello de Tinta Física
              </span>
              <span className={`font-meta-data text-[10px] block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                Efecto al desbloquear sellos o verificar encuentros
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => sounds.playStamp()}
                className="px-2.5 py-1 bg-[#e11d48] text-white text-[9px] font-label-caps uppercase rounded-xl font-bold"
              >
                Probar
              </button>
              <input
                type="checkbox"
                checked={settings.stampSoundsEnabled}
                onChange={(e) => onUpdateSettings({ stampSoundsEnabled: e.target.checked })}
                className="accent-[#e11d48] w-4 h-4"
              />
            </div>
          </div>

          {/* Vault Coins Sounds */}
          <div
            className={`p-4 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
            }`}
          >
            <div className="pr-3">
              <span className={`font-body-sm text-[13px] font-semibold block ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                Sonido de Monedas en Bóveda
              </span>
              <span className={`font-meta-data text-[10px] block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                Efecto al recargar PTS o recibir recompensas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => sounds.playCoins()}
                className="px-2.5 py-1 bg-[#e11d48] text-white text-[9px] font-label-caps uppercase rounded-xl font-bold"
              >
                Probar
              </button>
              <input
                type="checkbox"
                checked={settings.coinsSoundsEnabled}
                onChange={(e) => onUpdateSettings({ coinsSoundsEnabled: e.target.checked })}
                className="accent-[#e11d48] w-4 h-4"
              />
            </div>
          </div>
        </div>
      )}

      {/* SECTION 5: MEMBRESÍA & BÓVEDA */}
      {activeSection === 'membership' && (
        <div
          className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-4 ${
            isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
          }`}
        >
          <div className="border-b border-[#e11d48]/20 pb-2.5 flex justify-between items-center">
            <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">
              MEMBRESÍA & BÓVEDA DE BENEFICIOS
            </span>
            <span className="font-meta-data text-[9px] text-[#e11d48] font-bold">{user.membership}</span>
          </div>

          {/* Tier Status Card */}
          <div
            className={`p-4 rounded-2xl border flex flex-col gap-2 shadow-sm ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#1f0d16] border-[#e11d48]/35'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className={`font-label-caps text-[10px] uppercase font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]'}`}>
                PASAPORTE ACTIVO
              </span>
              <span className="font-label-caps text-[9px] bg-[#e11d48] text-white px-2 py-0.5 rounded-full font-bold">
                ESTADO VITALICIO
              </span>
            </div>
            <span className={`font-headline-md text-[20px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              {user.membership}
            </span>
            <span className={`font-meta-data text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
              Saldo en Bóveda: <strong className="text-[#e11d48] font-bold">{walletBalance.toLocaleString()} PTS</strong>
            </span>
          </div>

          {/* Coupon Redemption Form */}
          <form
            onSubmit={handleApplyCoupon}
            className={`p-4 rounded-2xl border flex flex-col gap-2.5 ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
            }`}
          >
            <span className={`font-label-caps text-[10px] uppercase font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
              Canjear Cupón o Código de Embajador
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ej. ARGENTINA, MELY2026"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className={`flex-1 border rounded-xl px-3 py-2 font-mono text-[12px] uppercase focus:outline-none ${
                  isLight
                    ? 'bg-white border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#140b0f] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] font-bold uppercase rounded-xl tactile-btn shadow-sm"
              >
                Canjear
              </button>
            </div>
            {couponMessage && (
              <span className={`text-[11px] font-body-sm mt-1 font-medium ${couponMessage.success ? 'text-[#e11d48]' : 'text-gray-500'}`}>
                {couponMessage.text}
              </span>
            )}
          </form>
        </div>
      )}

      {/* ACCOUNT ACTIONS / DANGER ZONE */}
      <div
        className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-3 ${
          isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
        }`}
      >
        <span className={`font-label-caps text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]'}`}>
          ACCIONES DE CUENTA
        </span>

        <button
          id="settings-sign-out-btn"
          type="button"
          onClick={() => {
            sounds.playClick();
            setShowSignOutConfirm(true);
          }}
          className={`w-full py-3 border font-label-caps text-[11px] tracking-wider uppercase font-bold rounded-2xl tactile-btn flex items-center justify-center gap-2 ${
            isLight
              ? 'bg-[#fff1f3] border-[#fecdd3] text-[#e11d48] hover:bg-[#ffe4e6]'
              : 'bg-[#1f0d16] hover:bg-[#e11d48]/20 border-[#e11d48]/40 text-[#fda4af]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>CERRAR SESIÓN DE ESTE PASAPORTE</span>
        </button>

        <button
          type="button"
          onClick={() => {
            sounds.playClick();
            setShowResetConfirm(true);
          }}
          className={`w-full py-2.5 border text-[10px] font-label-caps uppercase rounded-2xl tactile-btn ${
            isLight
              ? 'bg-transparent border-gray-200 text-gray-500 hover:bg-gray-50'
              : 'bg-transparent hover:bg-white/5 border-white/10 text-[#fda4af]/70'
          }`}
        >
          Restablecer Datos de Demostración
        </button>
      </div>

      {/* SIGN OUT CONFIRMATION MODAL */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className={`border rounded-3xl w-full max-w-[360px] p-6 text-center shadow-2xl ${
              isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/40'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-[#e11d48]/20 text-[#e11d48] flex items-center justify-center mx-auto mb-3">
              <span className="material-symbols-outlined text-[24px]">logout</span>
            </div>
            <h3 className={`font-headline-md text-[18px] font-bold mb-1 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              ¿Cerrar Sesión?
            </h3>
            <p className={`font-body-sm text-[12px] mb-5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
              Tu pasaporte, sellos y saldo quedarán seguros. Vas a poder volver a ingresar en cualquier momento con tus credenciales.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                className={`flex-1 py-2.5 border font-label-caps text-[10px] uppercase font-bold rounded-2xl ${
                  isLight ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-[#0b0507] text-[#fda4af] border-white/10'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSignOutConfirm(false);
                  onSignOut();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] uppercase font-bold rounded-2xl tactile-btn shadow-md"
              >
                Confirmar Salida
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESET CONFIRMATION MODAL */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div
            className={`border rounded-3xl w-full max-w-[360px] p-6 text-center shadow-2xl ${
              isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'
            }`}
          >
            <h3 className={`font-headline-md text-[18px] font-bold mb-1 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              Reiniciar Demostración
            </h3>
            <p className={`font-body-sm text-[12px] mb-5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
              ¿Querés restaurar todos los chats, sellos, saldo y perfiles al estado inicial?
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className={`flex-1 py-2.5 border font-label-caps text-[10px] uppercase font-bold rounded-2xl ${
                  isLight ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-[#0b0507] text-[#fda4af] border-white/10'
                }`}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowResetConfirm(false);
                  onResetDemo();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] uppercase font-bold rounded-2xl tactile-btn shadow-md"
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
