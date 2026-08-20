import React, { useState } from 'react';
import { Profile, Stamp } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';

// --- PROPOSE DATE MODAL ---
interface ProposeDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSubmit: (title: string, venue: string, time: string, notes: string) => void;
}

export const ProposeDateModal: React.FC<ProposeDateModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  onSubmit,
}) => {
  const { isLight } = useTheme();
  const [title, setTitle] = useState('Coffee & Art Walk');
  const [venue, setVenue] = useState('The Roastery, Palermo Soho');
  const [time, setTime] = useState('Jueves, 26 Oct • 4:00 PM');
  const [notes, setNotes] = useState('Un café de especialidad y caminata por la galería.');

  if (!isOpen) return null;

  const quickVenues = [
    { title: 'Coffee & Art Walk', venue: 'The Roastery, Palermo Soho', time: 'Jueves, 26 Oct • 4:00 PM' },
    { title: 'Cata de Vinos Naturales', venue: 'Bistró Rosetta, Recoleta', time: 'Viernes, 27 Oct • 8:30 PM' },
    { title: 'Jazz & Coctelería de Autor', venue: 'Speakeasy Florería Atlántico', time: 'Sábado, 28 Oct • 9:00 PM' },
    { title: 'Tarde de Vinilos y Libros', venue: 'Café & Libros El Ateneo', time: 'Domingo, 29 Oct • 5:00 PM' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    onSubmit(title, venue, time, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`border rounded-3xl w-full max-w-[420px] overflow-hidden shadow-2xl relative ${
          isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/40'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b flex justify-between items-center ${
            isLight
              ? 'bg-[#fff1f3] border-[#fecdd3]'
              : 'bg-[#1c0d15] border-[#e11d48]/20'
          }`}
        >
          <div>
            <span
              className={`font-label-caps text-[9px] uppercase tracking-widest block font-bold ${
                isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'
              }`}
            >
              PROPUESTA DE ENCUENTRO PRESENCIAL
            </span>
            <h3
              className={`font-headline-md text-[18px] font-black ${
                isLight ? 'text-[#0f172a]' : 'text-transparent bg-clip-text bg-gradient-to-r from-[#fb7185] to-[#fff1f2]'
              }`}
            >
              Invitar a {partnerName}
            </h3>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className={`p-1.5 rounded-full focus:outline-none ${
              isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#fda4af] hover:text-[#fff1f2]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label
              className={`font-label-caps text-[10px] uppercase block mb-1.5 font-bold ${
                isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
              }`}
            >
              Plantillas de Citas Mely
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickVenues.map((qv, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setTitle(qv.title);
                    setVenue(qv.venue);
                    setTime(qv.time);
                  }}
                  className={`p-2.5 rounded-2xl text-left border text-[11px] transition-all font-body-sm ${
                    venue === qv.venue
                      ? isLight
                        ? 'bg-[#fff1f3] border-[#e11d48] text-[#e11d48] font-bold shadow-sm'
                        : 'bg-[#2b1019] border-[#fb7185] text-[#fff1f2] font-bold shadow-md'
                      : isLight
                      ? 'bg-white border-[#fecdd3] text-[#475569] hover:bg-[#fff5f6]'
                      : 'bg-[#0b0507] border-[#e11d48]/20 text-[#fda4af]/70 hover:border-[#e11d48]/50'
                  }`}
                >
                  <span className={`font-bold block truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                    {qv.title}
                  </span>
                  <span className={`text-[9px] truncate block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                    {qv.venue}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label
              className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${
                isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
              }`}
            >
              Título del Plan
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={`w-full border rounded-2xl px-3.5 py-2 font-body-sm text-[13px] focus:outline-none ${
                isLight
                  ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                  : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
              }`}
            />
          </div>

          <div>
            <label
              className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${
                isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
              }`}
            >
              Lugar / Dirección
            </label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              required
              className={`w-full border rounded-2xl px-3.5 py-2 font-body-sm text-[13px] focus:outline-none ${
                isLight
                  ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                  : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
              }`}
            />
          </div>

          <div>
            <label
              className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${
                isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
              }`}
            >
              Fecha y Hora
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className={`w-full border rounded-2xl px-3.5 py-2 font-body-sm text-[13px] focus:outline-none ${
                isLight
                  ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                  : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
              }`}
            />
          </div>

          <div>
            <label
              className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${
                isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'
              }`}
            >
              Nota o Detalle Especial (Opcional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Un café de especialidad y caminata..."
              className={`w-full border rounded-2xl px-3.5 py-2 font-body-sm text-[13px] focus:outline-none ${
                isLight
                  ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] placeholder:text-gray-400 focus:border-[#e11d48]'
                  : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] placeholder:text-[#fda4af]/40 focus:border-[#fb7185]'
              }`}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[11px] tracking-widest font-bold rounded-2xl tactile-btn hover:brightness-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#e11d48]/25 focus:outline-none"
            >
              <span>ENVIAR INVITACIÓN TICKET</span>
              <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- STAMP KEEPSAKE MODAL ---
interface StampModalProps {
  stamp: Stamp | null;
  onClose: () => void;
}

export const StampModal: React.FC<StampModalProps> = ({ stamp, onClose }) => {
  const { isLight } = useTheme();
  if (!stamp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`border rounded-3xl w-full max-w-[380px] overflow-hidden shadow-2xl relative p-6 flex flex-col items-center text-center ${
          isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/40'
        }`}
      >
        {/* Close */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className={`absolute top-4 right-4 p-1 rounded-full focus:outline-none ${
            isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#fda4af] hover:text-[#fff1f2]'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        {/* Sello Grande con efecto Ink */}
        <div
          className={`w-24 h-24 rounded-full border-4 border-[#e11d48] text-[#e11d48] flex items-center justify-center stamp-ink mb-4 shadow-xl relative ${
            isLight ? 'bg-[#fff5f6]' : 'bg-[#0b0507]'
          }`}
          style={{ transform: `rotate(${stamp.rotation}deg)` }}
        >
          <div className="absolute inset-1.5 border border-[#e11d48]/40 rounded-full" />
          <span
            className="material-symbols-outlined text-[42px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {stamp.iconName}
          </span>
        </div>

        <span
          className={`font-label-caps text-[10px] uppercase tracking-widest mb-1 font-bold ${
            isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'
          }`}
        >
          {stamp.unlocked ? 'SELLO OFICIAL DE CONEXIÓN' : 'SELLO POR DESBLOQUEAR'}
        </span>
        <h3
          className={`font-headline-md text-[22px] font-bold mb-1 ${
            isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
          }`}
        >
          {stamp.title}
        </h3>
        <span className={`font-meta-data text-[12px] mb-4 font-semibold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]'}`}>
          Fecha: {stamp.date}
        </span>

        <div
          className={`rounded-2xl p-4 border w-full text-left flex flex-col gap-2.5 mb-5 ${
            isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
          }`}
        >
          {stamp.location && (
            <div>
              <span
                className={`font-label-caps text-[9px] uppercase block font-bold ${
                  isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'
                }`}
              >
                LUGAR
              </span>
              <p className={`font-body-sm text-[13px] ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                {stamp.location}
              </p>
            </div>
          )}

          {stamp.partnerName && (
            <div>
              <span
                className={`font-label-caps text-[9px] uppercase block font-bold ${
                  isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'
                }`}
              >
                ENCUENTRO CON
              </span>
              <p className={`font-body-sm text-[13px] ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                {stamp.partnerName}
              </p>
            </div>
          )}

          {stamp.notes && (
            <div>
              <span
                className={`font-label-caps text-[9px] uppercase block font-bold ${
                  isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'
                }`}
              >
                MEMORIA / DETALLES
              </span>
              <p className={`font-body-sm text-[13px] italic ${isLight ? 'text-[#475569]' : 'text-[#fda4af]'}`}>
                "{stamp.notes}"
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className={`w-full py-3 border font-label-caps text-[10px] tracking-wider uppercase font-bold rounded-2xl tactile-btn focus:outline-none ${
            isLight
              ? 'bg-[#fff1f3] border-[#fecdd3] text-[#e11d48] hover:bg-[#ffe4e6]'
              : 'bg-[#1f0d16] hover:bg-[#2b1019] border-[#e11d48]/30 text-[#fff1f2]'
          }`}
        >
          Cerrar Recuerdo
        </button>
      </div>
    </div>
  );
};

// --- COIN RECHARGE CONFIRMATION MODAL ---
interface RechargeModalProps {
  pack: { pts: number; price: string; name: string } | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({ pack, onClose, onConfirm }) => {
  const { isLight } = useTheme();
  if (!pack) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`border rounded-3xl w-full max-w-[380px] overflow-hidden shadow-2xl p-6 flex flex-col items-center text-center ${
          isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/40'
        }`}
      >
        <div
          className={`w-16 h-16 rounded-full border text-[#e11d48] flex items-center justify-center mb-4 ${
            isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#e11d48]/20 border-[#e11d48]/40'
          }`}
        >
          <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            monetization_on
          </span>
        </div>

        <span
          className={`font-label-caps text-[10px] uppercase tracking-widest mb-1 font-bold ${
            isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'
          }`}
        >
          BÓVEDA PERSONAL
        </span>
        <h3
          className={`font-headline-md text-[20px] font-bold mb-1 ${
            isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'
          }`}
        >
          {pack.name}
        </h3>
        <p className={`font-body-sm text-[13px] mb-5 ${isLight ? 'text-[#475569]' : 'text-[#fda4af]/80'}`}>
          Recibirás <strong className="text-[#e11d48]">+{pack.pts} PTS</strong> en tu saldo de Mely para regalos y beneficios de conexión.
        </p>

        <div
          className={`p-4 rounded-2xl border w-full flex justify-between items-center mb-6 ${
            isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/25'
          }`}
        >
          <span className={`font-label-caps text-[11px] uppercase font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
            Importe Total
          </span>
          <span className={`font-headline-md text-[20px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
            {pack.price} USD
          </span>
        </div>

        <div className="flex gap-2.5 w-full">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className={`flex-1 py-3 font-label-caps text-[10px] uppercase font-bold rounded-2xl tactile-btn border focus:outline-none ${
              isLight
                ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
                : 'bg-[#0b0507] text-[#fda4af] hover:bg-white/5 border-white/10'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] tracking-wider uppercase font-bold rounded-2xl tactile-btn hover:brightness-105 shadow-md shadow-[#e11d48]/25 focus:outline-none"
          >
            Confirmar Pago
          </button>
        </div>
      </div>
    </div>
  );
};

// --- SETTINGS / ACCOUNT MODAL ---
interface SettingsModalProps {
  type: 'personal' | 'security' | 'preferences' | null;
  onClose: () => void;
  user: Profile;
  onUpdateName?: (name: string, bio: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ type, onClose, user, onUpdateName }) => {
  const { isLight } = useTheme();
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState(user.bio);

  if (!type) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    onUpdateName?.(name, bio);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div
        className={`border rounded-3xl w-full max-w-[400px] overflow-hidden shadow-2xl p-6 ${
          isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#140b0f] border-[#e11d48]/40'
        }`}
      >
        <div className="flex justify-between items-center pb-4 border-b border-[#e11d48]/20 mb-4">
          <h3 className={`font-headline-md text-[18px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
            {type === 'personal' && 'Información Personal'}
            {type === 'security' && 'Seguridad & Privacidad'}
            {type === 'preferences' && 'Preferencias de Radar'}
          </h3>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className={`p-1 rounded-full focus:outline-none ${
              isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#fda4af] hover:text-[#fff1f2]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {type === 'personal' && (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
                Nombre Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full border rounded-2xl px-3.5 py-2 font-body-sm text-[13px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
            </div>
            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
                Bio Editorial
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className={`w-full border rounded-2xl px-3.5 py-2 font-body-sm text-[13px] focus:outline-none ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3] text-[#0f172a] focus:border-[#e11d48]'
                    : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fff1f2] focus:border-[#fb7185]'
                }`}
              />
            </div>
            <button
              type="submit"
              className="mt-2 w-full py-3 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] tracking-wider uppercase font-bold rounded-2xl tactile-btn hover:brightness-105 shadow-md shadow-[#e11d48]/25"
            >
              Guardar Cambios
            </button>
          </form>
        )}

        {type === 'security' && (
          <div className="flex flex-col gap-3 text-[13px]">
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
              <span className={isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}>Autenticación de 2 Factores</span>
              <span className="text-[#e11d48] font-bold text-[11px]">ACTIVA</span>
            </div>
            <div className={`p-3 rounded-2xl border flex items-center justify-between ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}>
              <span className={isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}>Token de Verificación Presencial</span>
              <span className="text-[#e11d48] font-bold text-[11px]">ROTACIÓN DIARIA</span>
            </div>
          </div>
        )}

        {type === 'preferences' && (
          <div className="flex flex-col gap-3.5 text-[13px]">
            <div>
              <label className={`font-label-caps text-[10px] uppercase block mb-1 font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fda4af]'}`}>
                Rango de Edad: 24 - 38 años
              </label>
              <input type="range" min="18" max="60" defaultValue="35" className="w-full accent-[#e11d48]" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MENU DRAWER ---
interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: any) => void;
  onOpenAuth?: (screen: 'login' | 'register') => void;
  onSignOut?: () => void;
  onResetDemo: () => void;
  isAuthenticated: boolean;
  user: Profile;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAuth,
  onSignOut,
  onResetDemo,
  isAuthenticated,
  user,
}) => {
  const { isLight, toggleTheme } = useTheme();
  if (!isOpen) return null;

  const mainLinks = [
    { label: 'Descubrir Perfiles', tab: 'descubrir', icon: 'explore' },
    { label: 'Matches & Conexiones', tab: 'matches', icon: 'favorite' },
    { label: 'Mensajes & Chat', tab: 'mensajes', icon: 'chat_bubble' },
    { label: 'Tienda & Beneficios', tab: 'tienda', icon: 'local_mall' },
    { label: 'Itinerario de Citas', tab: 'citas', icon: 'event_available' },
    { label: 'Pasaporte & Bóveda', tab: 'perfil', icon: 'badge' },
    { label: 'Panel de Ajustes', tab: 'ajustes', icon: 'settings' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex bg-black/75 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div
        className={`w-[310px] h-full border-r p-5 flex flex-col justify-between shadow-2xl overflow-y-auto no-scrollbar transition-colors ${
          isLight
            ? 'bg-white border-[#fecdd3] text-[#0f172a]'
            : 'bg-[#0e070a] border-[#e11d48]/30 text-[#fff1f2]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex justify-between items-center pb-3.5 border-b border-[#e11d48]/20">
            <div>
              <h2
                className={`font-headline-md text-[20px] tracking-[0.2em] font-bold ${
                  isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'
                }`}
              >
                MELY
              </h2>
              <span className={`font-label-caps text-[8.5px] uppercase tracking-wider ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                PASAPORTE DE CONEXIONES
              </span>
            </div>
            <button
              onClick={onClose}
              className={`p-1 focus:outline-none ${isLight ? 'text-[#64748b] hover:text-[#0f172a]' : 'text-[#fda4af] hover:text-white'}`}
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>

          {/* Theme Quick Switcher Inside Drawer */}
          <div
            className={`p-3 rounded-2xl border flex items-center justify-between ${
              isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#190c12] border-[#e11d48]/30'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e11d48] text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isLight ? 'wb_sunny' : 'dark_mode'}
              </span>
              <div>
                <span className={`font-label-caps text-[9px] uppercase font-bold block ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  {isLight ? 'Tema Blanco & Coral' : 'Tema Obsidiana Noir'}
                </span>
                <span className={`text-[10px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                  {isLight ? 'Fondo blanco puro' : 'Fondo oscuro noche'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                toggleTheme();
              }}
              className="px-2.5 py-1 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[9px] font-bold uppercase rounded-xl tactile-btn shadow-sm"
            >
              Cambiar
            </button>
          </div>

          {/* User mini passport badge */}
          {isAuthenticated ? (
            <div
              onClick={() => {
                sounds.playClick();
                onNavigate('perfil');
                onClose();
              }}
              className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-colors ${
                isLight
                  ? 'bg-white border-[#fecdd3] hover:border-[#e11d48] shadow-sm'
                  : 'bg-[#190c12] border-[#e11d48]/30 hover:border-[#e11d48]/60'
              }`}
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-10 h-10 rounded-full object-cover border border-[#e11d48]/50 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <span className={`font-headline-md text-[13px] font-bold block truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  {user.name}
                </span>
                <span className="font-meta-data text-[9px] text-[#e11d48] uppercase block truncate font-bold">
                  {user.membership}
                </span>
              </div>
              <span className={`material-symbols-outlined text-[18px] ${isLight ? 'text-[#94a3b8]' : 'text-[#fda4af]/50'}`}>
                chevron_right
              </span>
            </div>
          ) : (
            <div className={`p-3 rounded-2xl border flex flex-col gap-2 ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#190c12] border-white/10'}`}>
              <span className={`font-label-caps text-[10px] uppercase font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                ESTADO: MODO INVITADO
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenAuth?.('login');
                    onClose();
                  }}
                  className="py-1.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white rounded-xl font-label-caps text-[9px] font-bold uppercase"
                >
                  Entrar
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    onOpenAuth?.('register');
                    onClose();
                  }}
                  className={`py-1.5 border rounded-xl font-label-caps text-[9px] font-bold uppercase ${
                    isLight ? 'bg-white text-[#0f172a] border-[#fecdd3]' : 'bg-[#140a0e] text-[#fda4af] border-white/10'
                  }`}
                >
                  Registro
                </button>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {mainLinks.map((link) => (
              <button
                key={link.tab}
                onClick={() => {
                  sounds.playClick();
                  onNavigate(link.tab);
                  onClose();
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group ${
                  isLight
                    ? 'hover:bg-[#fff1f3] text-[#0f172a]'
                    : 'hover:bg-white/5 text-[#fff1f2]'
                }`}
              >
                <span className="material-symbols-outlined text-[19px] text-[#e11d48] group-hover:scale-110 transition-transform">
                  {link.icon}
                </span>
                <span className="font-body-sm text-[13px] font-medium">
                  {link.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Auth Switcher Quick Options */}
          <div className="pt-2 flex flex-col gap-1.5 border-t border-gray-200 dark:border-white/5">
            <span className={`font-label-caps text-[9px] uppercase tracking-wider px-1 ${isLight ? 'text-[#94a3b8]' : 'text-[#fda4af]/50'}`}>
              ACCESO & CUENTA
            </span>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenAuth?.('login');
                onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors text-[12px] ${
                isLight ? 'hover:bg-[#fff1f3] text-[#475569]' : 'hover:bg-white/5 text-[#fda4af]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              <span>Cambiar de Pasaporte (Login)</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onOpenAuth?.('register');
                onClose();
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors text-[12px] ${
                isLight ? 'hover:bg-[#fff1f3] text-[#e11d48]' : 'hover:bg-white/5 text-[#fb7185]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Emitir Nuevo Pasaporte (Registro)</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex flex-col gap-2.5">
          {isAuthenticated && (
            <button
              onClick={() => {
                sounds.playClick();
                onSignOut?.();
                onClose();
              }}
              className={`w-full py-2 border text-[10px] font-label-caps uppercase rounded-xl flex items-center justify-center gap-1.5 ${
                isLight
                  ? 'bg-[#fff1f3] hover:bg-[#ffe4e6] border-[#fecdd3] text-[#e11d48]'
                  : 'bg-[#170a0f] hover:bg-[#e11d48]/15 border-[#e11d48]/30 text-[#fda4af]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>Cerrar Sesión</span>
            </button>
          )}

          <button
            onClick={() => {
              sounds.playClick();
              onResetDemo();
              onClose();
            }}
            className={`w-full py-2 border text-[9px] font-label-caps uppercase rounded-xl ${
              isLight
                ? 'bg-transparent hover:bg-gray-50 border-gray-200 text-gray-500'
                : 'bg-transparent hover:bg-white/5 border-white/10 text-[#fda4af]/70'
            }`}
          >
            Restaurar Demo Mely
          </button>

          <span className={`font-meta-data text-[8px] text-center block ${isLight ? 'text-gray-400' : 'text-[#fda4af]/40'}`}>
            MELY v2.8 • CHERRY & CORAL EDITION
          </span>
        </div>
      </div>
    </div>
  );
};
