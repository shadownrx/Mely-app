import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ARGENTINA_CITIES } from '../data/mockData';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useInterests, useUpdateProfile, useReplacePrompts, useDeleteAccount } from '../hooks/useProfile';
import type { Gender, LookingFor, Prompt } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent } from './ui/dialog';

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
    if (seeking.length === 0) {
      toast.error('Elegí al menos a quién querés conocer.');
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
      // Guarda también los prompts acá: son parte de la misma pantalla y este es el
      // botón que la gente más toca, no debería perder ediciones de prompts sin avisar.
      await replacePrompts.mutateAsync(prompts.map((p) => ({ question: p.question, answer: p.answer })));
      await refreshUser();
      sounds.playStamp();
      toast.success('Perfil actualizado correctamente.');
    } catch (err: any) {
      toast.error(err?.message ?? 'No se pudo guardar el perfil');
    }
  };

  const saveDiscoveryPrefs = async () => {
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
      toast.success('Preferencias de descubrimiento actualizadas.');
    } catch (err: any) {
      toast.error(err?.message ?? 'No se pudieron guardar las preferencias');
    }
  };

  const handleSavePrompts = async () => {
    try {
      await replacePrompts.mutateAsync(prompts.map((p) => ({ question: p.question, answer: p.answer })));
      await refreshUser();
      sounds.playStamp();
      toast.success('Prompts guardados.');
    } catch (err: any) {
      toast.error(err?.message ?? 'No se pudieron guardar los prompts');
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
            <Button variant="ghost" size="icon" onClick={() => { sounds.playClick(); onClose(); }} aria-label="Cerrar">
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">close</span>
            </Button>
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
              className={`px-3 py-1.5 rounded-2xl flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
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
              className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
                isLight ? 'border-[#e11d48] bg-gradient-to-br from-white to-[#ffe4e6]/40 shadow-lg' : 'border-[#2a131b] bg-[#0c0507] text-[#fda4af]/70'
              }`}
            >
              <h4 className="font-headline-md text-[14px] font-bold">Blanco & Rojo Coral</h4>
              <span className="font-label-caps text-[9px] text-[#e11d48] font-bold uppercase">Base Clara</span>
            </button>
            <button
              type="button"
              onClick={() => { sounds.playClick(); setTheme('dark'); }}
              className={`p-4 rounded-2xl border-2 text-left flex flex-col gap-2 transition-all cursor-pointer ${
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
            <Label className="mb-1 block">Nombre</Label>
            <Input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required minLength={2} maxLength={40} />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="mb-1 block">Ciudad</Label>
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ARGENTINA_CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Barrio / Zona</Label>
              <Input type="text" value={zone} onChange={(e) => setZone(e.target.value)} maxLength={80} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <Label className="mb-1 block">Ocupación</Label>
              <Input type="text" value={job} onChange={(e) => setJob(e.target.value)} maxLength={80} />
            </div>
            <div>
              <Label className="mb-1 block">Estudios</Label>
              <Input type="text" value={studies} onChange={(e) => setStudies(e.target.value)} maxLength={80} />
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Bio</Label>
            <Textarea rows={3} value={bio ?? ''} onChange={(e) => setBio(e.target.value)} maxLength={300} className="text-[12px]" />
          </div>

          <div>
            <Label className="mb-1 block">Tu género</Label>
            <div className="flex flex-wrap gap-1.5">
              {GENDER_OPTIONS.map((g) => (
                <button key={g.value} type="button" onClick={() => { sounds.playClick(); setGender(g.value); }}
                  className={`px-3 py-1.5 rounded-full text-[11px] border transition-all cursor-pointer ${gender === g.value ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent' : isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fda4af]/70'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Buscás conocer a</Label>
            <div className="flex flex-wrap gap-1.5">
              {GENDER_OPTIONS.map((g) => (
                <button key={g.value} type="button" onClick={() => toggleSeeking(g.value)}
                  className={`px-3 py-1.5 rounded-full text-[11px] border transition-all cursor-pointer ${seeking.includes(g.value) ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent' : isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fda4af]/70'}`}>
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Estás buscando</Label>
            <Select value={lookingFor} onValueChange={(v) => setLookingFor(v as LookingFor)}>
              <SelectTrigger className="text-[12px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOOKING_FOR_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-1.5 block">Intereses ({selectedInterestIds.length}/20)</Label>
            <div className="flex flex-wrap gap-1.5">
              {interests.map((interest) => {
                const isSelected = selectedInterestIds.includes(interest.id);
                return (
                  <button key={interest.id} type="button" onClick={() => toggleInterest(interest.id)}
                    className={`px-3 py-1 rounded-full text-[11px] transition-all border cursor-pointer ${isSelected ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-bold border-transparent' : isLight ? 'bg-[#fff5f6] text-[#475569] border-[#fecdd3]' : 'bg-[#0b0507] text-[#fda4af]/70 border-[#e11d48]/25'}`}>
                    {isSelected ? `✓ ${interest.name}` : `+ ${interest.name}`}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="button" variant="cherry" onClick={saveProfile} disabled={updateProfile.isPending || replacePrompts.isPending} className="w-full gap-2">
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>GUARDAR PERFIL</span>
          </Button>

          {/* Blind Date Prompt */}
          <div className={`pt-4 mt-1 border-t flex flex-col gap-2.5 ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/20'}`}>
            <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">Perfil a Ciegas 🕶️</span>
            <Input type="text" value={blindTeaser} onChange={(e) => setBlindTeaser(e.target.value)} maxLength={160} placeholder="Un adelanto misterioso de vos..." className="text-[12px]" />
            <Textarea rows={2} value={blindPhilosophy} onChange={(e) => setBlindPhilosophy(e.target.value)} maxLength={300} placeholder="Tu filosofía de vida en unas líneas..." className="text-[12px]" />
            <Textarea rows={2} value={blindIdealDate} onChange={(e) => setBlindIdealDate(e.target.value)} maxLength={300} placeholder="Tu cita ideal..." className="text-[12px]" />
          </div>

          {/* Prompts */}
          <div className={`pt-4 mt-1 border-t flex flex-col gap-2.5 ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/20'}`}>
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[10px] text-[#e11d48] uppercase font-bold tracking-wider">Prompts de Perfil ({prompts.length}/5)</span>
              {prompts.length < 5 && (
                <button type="button" onClick={addPrompt} className="text-[10px] font-bold text-[#e11d48] flex items-center gap-1 cursor-pointer">
                  <span className="material-symbols-outlined text-[14px]">add</span>Agregar
                </button>
              )}
            </div>
            {prompts.map((p, i) => (
              <div key={p.id} className="flex flex-col gap-1.5">
                <div className="flex gap-1.5">
                  <Input
                    type="text"
                    value={p.question}
                    onChange={(e) => setPrompts((prev) => prev.map((x, idx) => (idx === i ? { ...x, question: e.target.value } : x)))}
                    maxLength={120}
                    placeholder="Pregunta"
                    className="flex-1 text-[12px] font-bold text-[#e11d48] dark:text-[#fb7185]"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setPrompts((prev) => prev.filter((_, idx) => idx !== i))} className="text-[#e11d48] shrink-0" aria-label="Borrar prompt">
                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">close</span>
                  </Button>
                </div>
                <Textarea
                  rows={2}
                  value={p.answer}
                  onChange={(e) => setPrompts((prev) => prev.map((x, idx) => (idx === i ? { ...x, answer: e.target.value } : x)))}
                  maxLength={300}
                  placeholder="Tu respuesta"
                  className="text-[12px]"
                />
              </div>
            ))}
            <Button type="button" variant="outline" onClick={handleSavePrompts} disabled={replacePrompts.isPending} className="w-full">
              Guardar Prompts
            </Button>
          </div>
        </div>
      )}

      {/* DISCOVERY */}
      {activeSection === 'discovery' && (
        <div className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-4 ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
          <p className={`text-[11px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
            Estos valores son tus preferencias por defecto — se usan como punto de partida cada vez que abrís los filtros de Descubrir.
          </p>
          <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[10px] uppercase font-bold">Distancia Máxima</span>
              <span className="font-headline-md text-[16px] text-[#e11d48] font-bold">{maxDistanceKm} km</span>
            </div>
            <Slider min={1} max={500} step={1} value={[maxDistanceKm]} onValueChange={([v]) => setMaxDistanceKm(v)} />
          </div>
          <div className={`p-4 rounded-2xl border flex flex-col gap-3 ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
            <div className="flex justify-between items-center">
              <span className="font-label-caps text-[10px] uppercase font-bold">Rango de Edad</span>
              <span className="font-headline-md text-[16px] text-[#e11d48] font-bold">{minAge} - {maxAge} años</span>
            </div>
            <Slider
              min={18}
              max={99}
              step={1}
              value={[minAge, maxAge]}
              onValueChange={([lo, hi]) => {
                setMinAge(lo);
                setMaxAge(hi);
              }}
            />
          </div>
          <Button type="button" variant="cherry" onClick={saveDiscoveryPrefs} disabled={updateProfile.isPending} className="w-full">
            Guardar Preferencias
          </Button>
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
            <Button type="button" variant="cherry" size="sm" onClick={() => sounds.playStamp()} className="h-7 px-2.5 text-[9px] rounded-xl tracking-normal">
              Probar
            </Button>
          </div>
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
            <span className="font-body-sm text-[13px] font-semibold">Sonido de monedas</span>
            <Button type="button" variant="cherry" size="sm" onClick={() => sounds.playCoins()} className="h-7 px-2.5 text-[9px] rounded-xl tracking-normal">
              Probar
            </Button>
          </div>
        </div>
      )}

      {/* ACCOUNT ACTIONS */}
      <div className={`p-5 rounded-3xl border shadow-xl flex flex-col gap-3 ${isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/30'}`}>
        <span className={`font-label-caps text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]'}`}>ACCIONES DE CUENTA</span>
        <Button
          type="button"
          variant="outline"
          onClick={() => { sounds.playClick(); setShowSignOutConfirm(true); }}
          className={`w-full gap-2 text-[11px] ${isLight ? 'bg-[#fff1f3] text-[#e11d48]' : 'bg-[#1f0d16] text-[#fda4af]'}`}
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span>CERRAR SESIÓN</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => { sounds.playClick(); setShowDeleteConfirm(true); }}
          className="w-full text-[10px] border-red-500/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          Eliminar Cuenta Permanentemente
        </Button>
      </div>

      <Dialog open={showSignOutConfirm} onOpenChange={setShowSignOutConfirm}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[360px] p-6 text-center">
          <h3 className="font-headline-md text-[18px] font-bold">¿Cerrar Sesión?</h3>
          <p className={`text-[12px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>Vas a poder volver a ingresar en cualquier momento con tus credenciales.</p>
          <div className="flex gap-2.5">
            <Button type="button" variant="secondary" onClick={() => setShowSignOutConfirm(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="button" variant="cherry" onClick={() => { setShowSignOutConfirm(false); onSignOut(); }} className="flex-1">
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-[360px] p-6 text-center">
          <h3 className="font-headline-md text-[18px] font-bold text-red-500">Eliminar cuenta</h3>
          <p className={`text-[12px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
            Esta acción es permanente. Se borra tu perfil, matches, mensajes y saldo. No se puede deshacer.
          </p>
          <div className="flex gap-2.5">
            <Button type="button" variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={async () => {
                await deleteAccount.mutateAsync();
                setShowDeleteConfirm(false);
                onSignOut();
              }}
              disabled={deleteAccount.isPending}
              className="flex-1"
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
