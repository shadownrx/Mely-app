import React, { useEffect, useState } from 'react';
import { ARGENTINA_CITIES } from '../data/mockData';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useInterests, useUpdateProfile, useReplacePrompts, useDeleteAccount } from '../hooks/useProfile';
import type { Gender, LookingFor, Prompt } from '../types';

interface SettingsViewProps {
  onSignOut: () => void;
  onClose?: () => void;
}

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'WOMAN', label: 'Mujer' },
  { value: 'MAN', label: 'Hombre' },
  { value: 'NON_BINARY', label: 'No binario' },
  { value: 'OTHER', label: 'Otro' },
];

const LOOKING_FOR_OPTIONS: { value: LookingFor; label: string }[] = [
  { value: 'RELATIONSHIP', label: 'Relación seria' },
  { value: 'CASUAL', label: 'Algo casual' },
  { value: 'FRIENDSHIP', label: 'Amistad' },
  { value: 'UNSURE', label: 'Todavía no sé' },
];

export const SettingsView: React.FC<SettingsViewProps> = ({ onSignOut, onClose }) => {
  const { theme, setTheme, isLight } = useTheme();
  const { user, refreshUser } = useAuth();
  const { data: interests = [] } = useInterests();
  const updateProfile = useUpdateProfile();
  const replacePrompts = useReplacePrompts();
  const deleteAccount = useDeleteAccount();

  const [activeSection, setActiveSection] = useState<'theme' | 'profile' | 'discovery' | 'security' | 'sounds'>('theme');

  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [city, setCity] = useState(user?.city ?? ARGENTINA_CITIES[0]);
  const [zone, setZone] = useState(user?.zone ?? '');
  const [job, setJob] = useState(user?.job ?? '');
  const [studies, setStudies] = useState(user?.studies ?? '');
  const [gender, setGender] = useState<Gender>(user?.gender ?? 'WOMAN');
  const [seeking, setSeeking] = useState<Gender[]>(user?.seeking ?? ['MAN']);
  const [lookingFor, setLookingFor] = useState<LookingFor>(user?.lookingFor ?? 'UNSURE');
  const [selectedInterestIds, setSelectedInterestIds] = useState<string[]>(user?.interests.map((i) => i.id) ?? []);
  const [blindTeaser, setBlindTeaser] = useState(user?.blindPrompt?.teaser ?? '');
  const [blindPhilosophy, setBlindPhilosophy] = useState(user?.blindPrompt?.philosophy ?? '');
  const [blindIdealDate, setBlindIdealDate] = useState(user?.blindPrompt?.idealDate ?? '');
  const [prompts, setPrompts] = useState<Prompt[]>(user?.prompts ?? []);

  const [minAge, setMinAge] = useState(user?.minAge ?? 21);
  const [maxAge, setMaxAge] = useState(user?.maxAge ?? 40);
  const [maxDistanceKm, setMaxDistanceKm] = useState(user?.maxDistanceKm ?? 25);

  const [savedBanner, setSavedBanner] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName);
    setBio(user.bio ?? '');
    setCity(user.city ?? ARGENTINA_CITIES[0]);
    setZone(user.zone ?? '');
    setJob(user.job ?? '');
    setStudies(user.studies ?? '');
    setGender(user.gender);
    setSeeking(user.seeking);
    setLookingFor(user.lookingFor);
    setSelectedInterestIds(user.interests.map((i) => i.id));
    setBlindTeaser(user.blindPrompt?.teaser ?? '');
    setBlindPhilosophy(user.blindPrompt?.philosophy ?? '');
    setBlindIdealDate(user.blindPrompt?.idealDate ?? '');
    setPrompts(user.prompts);
    setMinAge(user.minAge);
    setMaxAge(user.maxAge);
    setMaxDistanceKm(user.maxDistanceKm);
  }, [user]);

  if (!user) return null;

  const toggleSeeking = (g: Gender) => {
    sounds.playClick();
    setSeeking((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const toggleInterest = (id: string) => {
    sounds.playClick();
    setSelectedInterestIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 20) return prev;
      return [...prev, id];
    });
  };

  const saveProfile = async () => {
    setFormError(null);
    if (seeking.length === 0) {
      setFormError('Elegí al menos a quién querés conocer.');
      return;
    }
    try {
      await updateProfile.mutateAsync({
        displayName,
        gender,
        seeking,
        lookingFor,
        bio: bio || null,
        city: city || null,
        zone: zone || null,
        job: job || null,
        studies: studies || null,
        interestIds: selectedInterestIds,
        blindPromptTeaser: blindTeaser || null,
        blindPromptPhilosophy: blindPhilosophy || null,
        blindPromptIdealDate: blindIdealDate || null,
        maxDistanceKm,
        minAge,
        maxAge,
      });
      await refreshUser();
      sounds.playStamp();
      setSavedBanner('Perfil actualizado correctamente.');
      setTimeout(() => setSavedBanner(null), 2500);
    } catch (err: any) {
      setFormError(err?.message ?? 'No se pudo guardar el perfil');
    }
  };

  const saveDiscoveryPrefs = async () => {
    setFormError(null);
    try {
      await updateProfile.mutateAsync({
        displayName,
        gender,
        seeking,
        lookingFor,
        bio: bio || null,
        city: city || null,
        zone: zone || null,
        job: job || null,
        studies: studies || null,
        interestIds: selectedInterestIds,
        maxDistanceKm,
        minAge,
        maxAge,
      });
      await refreshUser();
      sounds.playStamp();
      setSavedBanner('Preferencias de descubrimiento actualizadas.');
      setTimeout(() => setSavedBanner(null), 2500);
    } catch (err: any) {
      setFormError(err?.message ?? 'No se pudieron guardar las preferencias');
    }
  };

  const handleSavePrompts = async () => {
    setFormError(null);
    try {
      await replacePrompts.mutateAsync(prompts.map((p) => ({ question: p.question, answer: p.answer })));
      await refreshUser();
      sounds.playStamp();
      setSavedBanner('Prompts guardados.');
      setTimeout(() => setSavedBanner(null), 2500);
    } catch (err: any) {
      setFormError(err?.message ?? 'No se pudieron guardar los prompts');
    }
  };

  const addPrompt = () => {
    if (prompts.length >= 5) return;
    setPrompts((prev) => [...prev, { id: `new-${Date.now()}`, question: '', answer: '' }]);
  };

  return (
    <div className={`w-full max-w-[420px] mx-auto flex flex-col gap-5 pb-24 animate-fadeIn ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
      {/* Header */}
      <div className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className={`font-headline-md text-[22px] font-black ${isLight ? 'text-[#0f172a]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#fb7185] to-[#fff1f2]'}`}>
            Ajustes del Pasaporte
          </h2>
          {onClose && (
            <button onClick={() => { sounds.playClick(); onClose(); }} className={`p-1.5 rounded-full ${isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#fda4af] hover:text-white'}`}>
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px] font-label-caps uppercase">
          {[
            { id: 'theme' as const, label: 'Tema', icon: 'palette' },
            { id: 'profile' as const, label: 'Perfil', icon: 'badge' },
            { id: 'discovery' as const, label: 'Descubrir', icon: 'radar' },
            { id: 'security' as const, label: 'Seguridad', icon: 'shield' },
            { id: 'sounds' as const, label: 'Audio', icon: 'volume_up' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { sounds.playClick(); setActiveSection(tab.id); }}
              className={`px-3 py-1.5 rounded-2xl flex items-center gap-1.5 whitespace-nowrap transition-all ${
                activeSection === tab.id
                  ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold shadow-md shadow-[#e11d48]/25'
                  : isLight
                  ? 'bg-[#fff1f3] text-[#64748b] hover:text-[#0f172a] border border-[#fecdd3]'
                  : 'bg-[#0b0507] text-[#fda4af]/70 hover:text-[#fff1f2] border border-[#e11d48]/20'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {savedBanner && (
        <div className="p-3.5 rounded-2xl bg-[#e11d48]/10 border border-[#e11d48]/40 text-[#e11d48] text-[12px] font-body-sm flex items-center gap-2 animate-fadeIn">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-medium">{savedBanner}</span>
        </div>
      )}
      {formError && (
        <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-500 text-[12px] font-body-sm">{formError}</div>
      )}

      {/* THEME */}
      {activeSection === 'theme' && (
        <div className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-4 ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
          <p className={`font-body-sm text-[13px] leading-relaxed ${isLight ? 'text-[#475569]' : 'text-[#fce7eb]/80'}`}>
            Seleccioná la paleta visual con la que deseás vivir tu experiencia en MELY:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => { sounds.playClick(); setTheme('light'); }}
              className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all ${
                isLight ? 'border-[#e11d48] bg-gradient-to-br from-white to-[#ffe4e6]/40 shadow-lg' : 'border-[#2a131b] bg-[#0c0507] text-[#fda4af]/70'
              }`}
            >
              <h4 className="font-headline-md text-[14px] font-bold">Blanco & Rojo Coral</h4>
              <span className="font-label-caps text-[9px] text-[#e11d48] font-bold uppercase">Base Clara</span>
            </button>
            <button
              type="button"
              onClick={() => { sounds.playClick(); setTheme('dark'); }}
              className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all ${
                !isLight ? 'border-[#e11d48] bg-gradient-to-br from-[#1e0a12] to-[#0c0507] shadow-lg' : 'border-[#fecdd3] bg-white text-[#64748b]'
              }`}
            >
              <h4 className="font-headline-md text-[14px] font-bold">Obsidiana & Cereza</h4>
              <span className="font-label-caps text-[9px] text-[#fb7185] font-bold uppercase">Modo Noche</span>
            </button>
          </div>
        </div>
      )}

      {/* PROFILE */}
      {activeSection === 'profile' && (
        <div className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-4 ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
          <div>
            <label className="font-label-caps text-[9px] uppercase block mb-1 font-bold">Nombre</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required minLength={2} maxLength={40}
              className={`w-full border rounded-2xl px-3 py-2 text-[13px] focus:outline-none ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-white'}`} />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-label-caps text-[9px] uppercase block mb-1 font-bold">Ciudad</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className={`w-full border rounded-2xl px-3 py-2 text-[12px] focus:outline-none ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-white'}`}>
                {ARGENTINA_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="font-label-caps text-[9px] uppercase block mb-1 font-bold">Barrio / Zona</label>
              <input type="text" value={zone} onChange={(e) => setZone(e.target.value)} maxLength={80}
                className={`w-full border rounded-2xl px-3 py-2 text-[12px] focus:outline-none ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-white'}`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="font-label-caps text-[9px] uppercase block mb-1 font-bold">Ocupación</label>
              <input type="text" value={job} onChange={(e) => setJob(e.target.value)} maxLength={80}
                className={`w-full border rounded-2xl px-3 py-2 text-[13px] focus:outline-none ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-white'}`} />
            </div>
            <div>
              <label className="font-label-caps text-[9px] uppercase block mb-1 font-bold">Estudios</label>
              <input type="text" value={studies} onChange={(e) => setStudies(e.target.value)} maxLength={80}
                className={`w-full border rounded-2xl px-3 py-2 text-[13px] focus:outline-none ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-white'}`} />
            </div>
          </div>

          <div>
            <label className="font-label-caps text-[9px] uppercase block mb-1 font-bold">Bio</label>
            <textarea rows={3} value={bio ?? ''} onChange={(e) => setBio(e.target.value)} maxLength={300}
              className={`w-full border rounded-2xl px-3 py-2 text-[12px] focus:outline-none ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-white'}`} />
          </div>

          <div>
            <label className="font-label-caps text-[9px] uppercase block mb-1 font-bold">Tu género</label>
            <div className="flex flex-wrap gap-1.5">
              {GENDER_OPTIONS.map((g) => (
                <button key={g.value} type="button" onClick={() => { sounds.playClick(); setGender(g.value); }}
                  className={`px-3 py-1.5 rounded-full text-[11px] border transition-all ${gender === g.value ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent' : isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fda4af]/70'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-label-caps text-[9px] uppercase block mb-1 font-bold">Buscás conocer a</label>
            <div className="flex flex-wrap gap-1.5">
              {GENDER_OPTIONS.map((g) => (
                <button key={g.value} type="button" onClick={() => toggleSeeking(g.value)}
                  className={`px-3 py-1.5 rounded-full text-[11px] border transition-all ${seeking.includes(g.value) ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent' : isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fda4af]/70'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-label-caps text-[9px] uppercase block mb-1 font-bold">Estás buscando</label>
            <select value={lookingFor} onChange={(e) => setLookingFor(e.target.value as LookingFor)} className={`w-full border rounded-2xl px-3 py-2 text-[12px] focus:outline-none ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-white'}`}>
              {LOOKING_FOR_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div>
            <label className="font-label-caps text-[9px] uppercase block mb-1.5 font-bold">Intereses ({selectedInterestIds.length}/20)</label>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((interest) => {
                const isSelected = selectedInterestIds.includes(interest.id);
                return (
                  <button key={interest.id} type="button" onClick={() => toggleInterest(interest.id)}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all border ${isSelected ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent' : isLight ? 'bg-[#fff5f6] text-[#475569] border-[#fecdd3]' : 'bg-[#0b0507] text-[#fda4af]/70 border-[#e11d48]/25'}`}>
                    {isSelected ? `✓ ${interest.name}` : `+ ${interest.name}`}
                  </button>
                );
              })}
            </div>
          </div>

          <button type="button" onClick={saveProfile} disabled={updateProfile.isPending}
            className="w-full py-3.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] tracking-widest uppercase font-bold rounded-2xl shadow-md shadow-[#e11d48]/25 flex items-center justify-center gap-2 disabled:opacity-60">
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>GUARDAR PERFIL</span>
          </button>

          {/* Blind Date Prompt */}
          <div className={`pt-4 mt-1 border-t flex flex-col gap-2.5 ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/20'}`}>
            <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">Perfil a Ciegas 🕶️</span>
            <input type="text" value={blindTeaser} onChange={(e) => setBlindTeaser(e.target.value)} maxLength={160} placeholder="Un adelanto misterioso de vos..."
              className={`w-full border rounded-2xl px-3 py-2 text-[12px] focus:outline-none ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-white'}`} />
            <textarea rows={2} value={blindPhilosophy} onChange={(e) => setBlindPhilosophy(e.target.value)} maxLength={300} placeholder="Tu filosofía de vida en unas líneas..."
              className={`w-full border rounded-2xl px-3 py-2 text-[12px] focus:outline-none ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-white'}`} />
            <textarea rows={2} value={blindIdealDate} onChange={(e) => setBlindIdealDate(e.target.value)} maxLength={300} placeholder="Tu cita ideal..."
              className={`w-full border rounded-2xl px-3 py-2 text-[12px] focus:outline-none ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-white'}`} />
          </div>

          {/* Prompts */}
          <div className={`pt-4 mt-1 border-t flex flex-col gap-2.5 ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/20'}`}>
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">Prompts de Perfil ({prompts.length}/5)</span>
              {prompts.length < 5 && (
                <button type="button" onClick={addPrompt} className="text-[10px] font-bold text-[#e11d48] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">add</span>Agregar
                </button>
              )}
            </div>
            {prompts.map((p, i) => (
              <div key={p.id} className="flex flex-col gap-1.5">
                <div className="flex gap-1.5">
                  <input type="text" value={p.question} onChange={(e) => setPrompts((prev) => prev.map((x, idx) => idx === i ? { ...x, question: e.target.value } : x))} maxLength={120}
                    placeholder="Pregunta"
                    className={`flex-1 border rounded-2xl px-3 py-1.5 text-[12px] font-bold text-[#e11d48] focus:outline-none ${isLight ? 'bg-[#fff5f6] border-[#e11d48]/30' : 'bg-[#0b0507] border-[#e11d48]/30'}`} />
                  <button type="button" onClick={() => setPrompts((prev) => prev.filter((_, idx) => idx !== i))} className="px-2 text-[#e11d48]">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
                <input type="text" value={p.answer} onChange={(e) => setPrompts((prev) => prev.map((x, idx) => idx === i ? { ...x, answer: e.target.value } : x))} maxLength={300}
                  placeholder="Tu respuesta"
                  className={`w-full border rounded-2xl px-3 py-2 text-[12px] focus:outline-none ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-white'}`} />
              </div>
            ))}
            <button type="button" onClick={handleSavePrompts} disabled={replacePrompts.isPending}
              className={`w-full py-2.5 border font-label-caps text-[10px] uppercase font-bold rounded-2xl disabled:opacity-60 ${isLight ? 'border-[#e11d48] text-[#e11d48] bg-[#fff1f3]' : 'border-[#e11d48]/40 text-[#fda4af] bg-[#1f0d16]'}`}>
              Guardar Prompts
            </button>
          </div>
        </div>
      )}

      {/* DISCOVERY */}
      {activeSection === 'discovery' && (
        <div className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-4 ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
          <p className={`text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
            Estos valores son tus preferencias por defecto — se usan como punto de partida cada vez que abrís los filtros de Descubrir.
          </p>
          <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[10px] uppercase font-bold">Distancia Máxima</span>
              <span className="font-headline-md text-[16px] text-[#e11d48] font-bold">{maxDistanceKm} km</span>
            </div>
            <input type="range" min={1} max={500} value={maxDistanceKm} onChange={(e) => setMaxDistanceKm(Number(e.target.value))} className="w-full accent-[#e11d48]" />
          </div>
          <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[10px] uppercase font-bold">Rango de Edad</span>
              <span className="font-headline-md text-[16px] text-[#e11d48] font-bold">{minAge} - {maxAge} años</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input type="range" min={18} max={maxAge} value={minAge} onChange={(e) => setMinAge(Number(e.target.value))} className="w-full accent-[#e11d48]" />
              <input type="range" min={minAge} max={99} value={maxAge} onChange={(e) => setMaxAge(Number(e.target.value))} className="w-full accent-[#e11d48]" />
            </div>
          </div>
          <button type="button" onClick={saveDiscoveryPrefs} disabled={updateProfile.isPending}
            className="w-full py-3 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] uppercase font-bold rounded-2xl shadow-md disabled:opacity-60">
            Guardar Preferencias
          </button>
        </div>
      )}

      {/* SECURITY */}
      {activeSection === 'security' && (
        <div className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-3 ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
            <span className="font-body-sm text-[13px] font-semibold">Email verificado</span>
            <span className={`font-label-caps text-[10px] font-bold px-2.5 py-1 rounded-full ${user.emailVerified ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>
              {user.emailVerified ? 'VERIFICADO' : 'PENDIENTE'}
            </span>
          </div>
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
            <span className="font-body-sm text-[13px] font-semibold">Teléfono verificado</span>
            <span className={`font-label-caps text-[10px] font-bold px-2.5 py-1 rounded-full ${user.phoneVerified ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>
              {user.phoneVerified ? 'VERIFICADO' : 'PENDIENTE'}
            </span>
          </div>
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
            <span className="font-body-sm text-[13px] font-semibold">Verificación de identidad</span>
            <span className="font-label-caps text-[10px] text-[#e11d48] font-bold">{user.badges.verificationLabel}</span>
          </div>
        </div>
      )}

      {/* SOUNDS */}
      {activeSection === 'sounds' && (
        <div className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-3 ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
            <span className="font-body-sm text-[13px] font-semibold">Sonido de sello</span>
            <button type="button" onClick={() => sounds.playStamp()} className="px-2.5 py-1 bg-[#e11d48] text-white text-[9px] font-label-caps uppercase rounded-xl font-bold">Probar</button>
          </div>
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
            <span className="font-body-sm text-[13px] font-semibold">Sonido de monedas</span>
            <button type="button" onClick={() => sounds.playCoins()} className="px-2.5 py-1 bg-[#e11d48] text-white text-[9px] font-label-caps uppercase rounded-xl font-bold">Probar</button>
          </div>
        </div>
      )}

      {/* ACCOUNT ACTIONS */}
      <div className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-3 ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
        <span className={`font-label-caps text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]'}`}>ACCIONES DE CUENTA</span>
        <button type="button" onClick={() => { sounds.playClick(); setShowSignOutConfirm(true); }}
          className={`w-full py-3 border font-label-caps text-[11px] tracking-wider uppercase font-bold rounded-2xl flex items-center justify-center gap-2 ${isLight ? 'bg-[#fff1f3] border-[#fecdd3] text-[#e11d48]' : 'bg-[#1f0d16] border-[#e11d48]/40 text-[#fda4af]'}`}>
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>CERRAR SESIÓN</span>
        </button>
        <button type="button" onClick={() => { sounds.playClick(); setShowDeleteConfirm(true); }}
          className="w-full py-2.5 border border-red-500/40 text-red-500 text-[10px] font-label-caps uppercase rounded-2xl">
          Eliminar Cuenta Permanentemente
        </button>
      </div>

      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-3xl w-full max-w-[360px] p-6 text-center shadow-2xl ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/40'}`}>
            <h3 className="font-headline-md text-[18px] font-bold mb-1">¿Cerrar Sesión?</h3>
            <p className={`text-[12px] mb-5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>Vas a poder volver a ingresar en cualquier momento con tus credenciales.</p>
            <div className="flex gap-2.5">
              <button type="button" onClick={() => setShowSignOutConfirm(false)} className={`flex-1 py-2.5 border font-label-caps text-[10px] uppercase font-bold rounded-2xl ${isLight ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-[#0b0507] text-[#fda4af] border-white/10'}`}>Cancelar</button>
              <button type="button" onClick={() => { setShowSignOutConfirm(false); onSignOut(); }} className="flex-1 py-2.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] uppercase font-bold rounded-2xl">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className={`border rounded-3xl w-full max-w-[360px] p-6 text-center shadow-2xl ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
            <h3 className="font-headline-md text-[18px] font-bold mb-1 text-red-500">Eliminar cuenta</h3>
            <p className={`text-[12px] mb-5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
              Esta acción es permanente. Se borra tu perfil, matches, mensajes y saldo. No se puede deshacer.
            </p>
            <div className="flex gap-2.5">
              <button type="button" onClick={() => setShowDeleteConfirm(false)} className={`flex-1 py-2.5 border font-label-caps text-[10px] uppercase font-bold rounded-2xl ${isLight ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-[#0b0507] text-[#fda4af] border-white/10'}`}>Cancelar</button>
              <button
                type="button"
                onClick={async () => {
                  await deleteAccount.mutateAsync();
                  setShowDeleteConfirm(false);
                  onSignOut();
                }}
                disabled={deleteAccount.isPending}
                className="flex-1 py-2.5 bg-red-600 text-white font-label-caps text-[10px] uppercase font-bold rounded-2xl disabled:opacity-60"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
