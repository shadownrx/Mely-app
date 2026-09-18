import React, { useState } from 'react';
import { toast } from 'sonner';
import { Stamp, PlanType, MeProfile } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useDatesMeta, useProposeDate } from '../hooks/useDates';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';
import { Sheet, SheetContent } from './ui/sheet';

// --- PROPOSE DATE MODAL ---
interface ProposeDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string;
  partnerName: string;
}

function defaultDateTimeLocal(daysAhead: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function daysUntilWeekday(targetDow: number) {
  const today = new Date().getDay();
  return (targetDow - today + 7) % 7;
}

type DayKey = 'hoy' | 'mañana' | 'sabado' | 'domingo';
type TimeKey = 'mañana' | 'tarde' | 'noche' | 'chat';

const DAY_OPTIONS: { key: DayKey; label: string; daysAhead: number }[] = [
  { key: 'hoy', label: 'Hoy', daysAhead: 0 },
  { key: 'mañana', label: 'Mañana', daysAhead: 1 },
  { key: 'sabado', label: 'Sábado', daysAhead: daysUntilWeekday(6) },
  { key: 'domingo', label: 'Domingo', daysAhead: daysUntilWeekday(0) },
];

// "Coordinar por chat" (no fija horario, sólo manda lugar y plan) era antes un botón
// aparte que reemplazaba el input de fecha/hora — funcionalidad real que se mantiene,
// pero ahora vive re-acomodada como una cuarta opción dentro de los chips de Horario
// en vez de competir con ellos por su propio espacio.
const TIME_OPTIONS: { key: TimeKey; label: string; hour: number | null }[] = [
  { key: 'mañana', label: 'Mañana', hour: 10 },
  { key: 'tarde', label: 'Tarde', hour: 16 },
  { key: 'noche', label: 'Noche', hour: 20 },
  { key: 'chat', label: 'Coordinar por chat', hour: null },
];

// Chip reutilizable, per Propose.dc.html: fondo/borde/texto coral cuando está activo,
// hairline transparente cuando no.
const Chip: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; className?: string }> = ({
  active,
  onClick,
  children,
  className = '',
}) => {
  const { isLight } = useTheme();
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-[38px] px-4 rounded-[var(--radius-pill)] border-[1.5px] text-[13px] font-bold whitespace-nowrap transition-colors cursor-pointer ${className}`}
      style={
        active
          ? { background: 'var(--coral-500)', borderColor: 'var(--coral-500)', color: 'var(--ink-on-coral)' }
          : {
              background: 'transparent',
              borderColor: isLight ? 'rgba(22,34,59,0.14)' : 'var(--hairline-strong)',
              color: isLight ? 'var(--text-on-light)' : 'var(--text-primary)',
            }
      }
    >
      {children}
    </button>
  );
};

export const ProposeDateModal: React.FC<ProposeDateModalProps> = ({
  isOpen,
  onClose,
  connectionId,
  partnerName,
}) => {
  const { isLight } = useTheme();
  const { data: meta } = useDatesMeta();
  const proposeDate = useProposeDate(connectionId);

  const [zone, setZone] = useState('The Roastery, Palermo Soho');
  const [planType, setPlanType] = useState<PlanType>('COFFEE');
  const [dayKey, setDayKey] = useState<DayKey>('sabado');
  const [timeKey, setTimeKey] = useState<TimeKey>('tarde');
  const [note, setNote] = useState('Un café de especialidad y caminata por la galería.');
  const [showTemplates, setShowTemplates] = useState(false);

  const quickVenues: { zone: string; planType: PlanType; dayKey: DayKey; timeKey: TimeKey }[] = [
    { zone: 'The Roastery, Palermo Soho', planType: 'COFFEE', dayKey: 'sabado', timeKey: 'tarde' },
    { zone: 'Bistró Rosetta, Recoleta', planType: 'FOOD', dayKey: 'domingo', timeKey: 'noche' },
    { zone: 'Speakeasy Florería Atlántico', planType: 'BAR', dayKey: 'sabado', timeKey: 'noche' },
    { zone: 'Café & Libros El Ateneo', planType: 'CHILL', dayKey: 'mañana', timeKey: 'mañana' },
  ];

  const planOptions = meta?.planTypes ?? [
    { value: 'COFFEE' as PlanType, label: 'Café' },
    { value: 'FOOD' as PlanType, label: 'Comer' },
    { value: 'BAR' as PlanType, label: 'Bar' },
  ];

  const selectedDay = DAY_OPTIONS.find((d) => d.key === dayKey)!;
  const selectedTime = TIME_OPTIONS.find((t) => t.key === timeKey)!;
  const coordinateByChat = timeKey === 'chat';
  const summary = `${planOptions.find((p) => p.value === planType)?.label ?? planType} · ${selectedDay.label} ${
    coordinateByChat ? '· coordinan por chat' : selectedTime.label.toLowerCase()
  } · ${zone}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    proposeDate.mutate(
      {
        scheduledAt: coordinateByChat
          ? undefined
          : new Date(defaultDateTimeLocal(selectedDay.daysAhead, selectedTime.hour!)).toISOString(),
        zone,
        planType,
        note: note || undefined,
      },
      {
        onSuccess: () => {
          sounds.playCoins();
          toast.success(`Invitación enviada a ${partnerName}`);
          onClose();
        },
        onError: (err: any) => toast.error(err?.message ?? 'No se pudo enviar la invitación'),
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[420px] p-0 gap-0 rounded-[var(--radius-lg)] overflow-hidden max-h-[90dvh] flex flex-col">
        <DialogHeader
          className={`p-5 border-b space-y-0 ${isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#131f36] border-[#f16b48]/20'}`}
        >
          <span className={`font-label-caps text-[9px] uppercase tracking-widest block font-bold ${isLight ? 'text-[#f16b48]' : 'text-[#ffb295]'}`}>
            PROPUESTA DE ENCUENTRO PRESENCIAL
          </span>
          <h3
            className={`text-[20px] italic font-semibold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Invitar a {partnerName}
          </h3>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Día */}
          <div className="flex flex-col gap-2.5">
            <Label className="normal-case tracking-wide text-[12px] font-bold">Día</Label>
            <div className="flex gap-2 flex-wrap">
              {DAY_OPTIONS.map((d) => (
                <Chip key={d.key} active={dayKey === d.key} onClick={() => { sounds.playClick(); setDayKey(d.key); }}>
                  {d.label}
                </Chip>
              ))}
            </div>
          </div>

          {/* Horario (incluye "Coordinar por chat" como cuarta opción) */}
          <div className="flex flex-col gap-2.5">
            <Label className="normal-case tracking-wide text-[12px] font-bold">Horario</Label>
            <div className="flex gap-2 flex-wrap">
              {TIME_OPTIONS.map((t) => (
                <Chip key={t.key} active={timeKey === t.key} onClick={() => { sounds.playClick(); setTimeKey(t.key); }}>
                  {t.label}
                </Chip>
              ))}
            </div>
            {coordinateByChat && (
              <p
                className={`text-[11.5px] rounded-2xl px-3.5 py-2.5 border ${
                  isLight ? 'bg-[#fcf9f2] border-[#ffe3d3] text-[#5b6478]' : 'bg-[#0a1120] border-[#f16b48]/25 text-[#ffb295]/80'
                }`}
              >
                No fijás un horario: le mandás la propuesta con el lugar y plan, y se ponen de acuerdo con la hora charlando en el chat.
              </p>
            )}
          </div>

          {/* Zona / lugar */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="propose-zone" className="normal-case tracking-wide text-[12px] font-bold">
                Lugar / Dirección
              </Label>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setShowTemplates((prev) => !prev);
                }}
                className="text-[11.5px] font-bold hover:underline cursor-pointer"
                style={{ color: 'var(--coral-500)' }}
              >
                {showTemplates ? 'Ocultar plantillas' : 'Usar una plantilla rápida'}
              </button>
            </div>
            <Input
              id="propose-zone"
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              required
              minLength={2}
              maxLength={80}
            />

            {showTemplates && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                {quickVenues.map((qv, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setZone(qv.zone);
                      setPlanType(qv.planType);
                      setDayKey(qv.dayKey);
                      setTimeKey(qv.timeKey);
                    }}
                    className={`p-2.5 rounded-2xl text-left border text-[11px] transition-all cursor-pointer ${
                      zone === qv.zone
                        ? isLight
                          ? 'bg-[#fcf9f2] border-[#f16b48] text-[#f16b48] font-bold'
                          : 'bg-[#17233d] border-[#ffb295] text-[#f5f1e8] font-bold'
                        : isLight
                        ? 'bg-white border-[#ffe3d3] text-[#2e5570] hover:bg-[#fcf9f2]'
                        : 'bg-[#0a1120] border-[#f16b48]/20 text-[#ffb295]/70 hover:border-[#f16b48]/50'
                    }`}
                  >
                    <span className={`font-bold block truncate ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                      {planOptions.find((p) => p.value === qv.planType)?.label ?? qv.planType}
                    </span>
                    <span className={`text-[9px] truncate block ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/70'}`}>
                      {qv.zone}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tipo de plan */}
          <div className="flex flex-col gap-2.5">
            <Label className="normal-case tracking-wide text-[12px] font-bold">Tipo de plan</Label>
            <div className="flex gap-2 flex-wrap">
              {planOptions.map((p) => (
                <Chip key={p.value} active={planType === p.value} onClick={() => { sounds.playClick(); setPlanType(p.value); }}>
                  {p.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="propose-note" className="mb-1.5 block normal-case tracking-wide text-[12px] font-bold">
              Nota o Detalle Especial (Opcional)
            </Label>
            <Input
              id="propose-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
              placeholder="Ej: Un café de especialidad y caminata..."
            />
          </div>

          <div className="pt-1 flex flex-col gap-2.5">
            <p className="text-center text-[12.5px]" style={{ color: isLight ? 'var(--text-on-light-muted)' : 'var(--text-secondary)' }}>
              {summary}
            </p>
            <Button
              type="submit"
              disabled={proposeDate.isPending}
              className="w-full h-14 rounded-[var(--radius-pill)] text-[16px] font-bold shadow-[var(--shadow-coral)]"
              style={{ background: 'var(--coral-500)', color: 'var(--ink-on-coral)' }}
            >
              {proposeDate.isPending ? 'Enviando…' : 'Enviar propuesta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- STAMP KEEPSAKE MODAL ---
interface StampModalProps {
  stamp: Stamp | null;
  onClose: () => void;
}

export const StampModal: React.FC<StampModalProps> = ({ stamp, onClose }) => {
  const { isLight } = useTheme();

  return (
    <Dialog open={Boolean(stamp)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[380px] p-6 rounded-3xl flex flex-col items-center text-center">
        {stamp && (
          <>
            <div
              className={`w-24 h-24 rounded-full border-4 border-[#f16b48] text-[#f16b48] flex items-center justify-center stamp-ink mb-4 shadow-xl relative ${
                isLight ? 'bg-[#fcf9f2]' : 'bg-[#0a1120]'
              }`}
            >
              <div className="absolute inset-1.5 border border-[#f16b48]/40 rounded-full" />
              <span className="material-symbols-outlined text-[42px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {stamp.iconName}
              </span>
            </div>

            <span className={`font-label-caps text-[10px] uppercase tracking-widest mb-1 font-bold ${isLight ? 'text-[#f16b48]' : 'text-[#ffb295]'}`}>
              {stamp.unlocked ? 'SELLO OFICIAL DE CONEXIÓN' : 'SELLO POR DESBLOQUEAR'}
            </span>
            <h3 className={`font-headline-md text-[22px] font-bold mb-1 ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
              {stamp.title}
            </h3>
            <span className={`font-meta-data text-[12px] mb-4 font-semibold ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]'}`}>
              {stamp.unlockedAt ? `Fecha: ${new Date(stamp.unlockedAt).toLocaleDateString('es-AR')}` : stamp.description}
            </span>

            <div
              className={`rounded-2xl p-4 border w-full text-left flex flex-col gap-2.5 mb-5 ${
                isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#0a1120] border-[#f16b48]/20'
              }`}
            >
              {stamp.location && (
                <div>
                  <span className={`font-label-caps text-[9px] uppercase block font-bold ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/60'}`}>
                    LUGAR
                  </span>
                  <p className={`font-body-sm text-[13px] ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>{stamp.location}</p>
                </div>
              )}

              {stamp.partnerName && (
                <div>
                  <span className={`font-label-caps text-[9px] uppercase block font-bold ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/60'}`}>
                    ENCUENTRO CON
                  </span>
                  <p className={`font-body-sm text-[13px] ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>{stamp.partnerName}</p>
                </div>
              )}

              {stamp.notes && (
                <div>
                  <span className={`font-label-caps text-[9px] uppercase block font-bold ${isLight ? 'text-[#5b6478]' : 'text-[#ffb295]/60'}`}>
                    MEMORIA / DETALLES
                  </span>
                  <p className={`font-body-sm text-[13px] italic ${isLight ? 'text-[#2e5570]' : 'text-[#ffb295]'}`}>"{stamp.notes}"</p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-full"
            >
              Cerrar Recuerdo
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
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

  return (
    <Dialog open={Boolean(pack)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[380px] p-6 rounded-3xl flex flex-col items-center text-center">
        {pack && (
          <>
            <div
              className={`w-16 h-16 rounded-full border text-[#f16b48] flex items-center justify-center mb-4 ${
                isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#f16b48]/20 border-[#f16b48]/40'
              }`}
            >
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                monetization_on
              </span>
            </div>

            <span className={`font-label-caps text-[10px] uppercase tracking-widest mb-1 font-bold ${isLight ? 'text-[#f16b48]' : 'text-[#ffb295]'}`}>
              BÓVEDA PERSONAL
            </span>
            <h3 className={`font-headline-md text-[20px] font-bold mb-1 ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>{pack.name}</h3>
            <p className={`font-body-sm text-[13px] mb-5 ${isLight ? 'text-[#2e5570]' : 'text-[#ffb295]/80'}`}>
              Recibirás <strong className="text-[#f16b48]">+{pack.pts} PTS</strong> en tu saldo de Mely para regalos y beneficios de conexión.
            </p>

            <div
              className={`p-4 rounded-2xl border w-full flex justify-between items-center mb-6 ${
                isLight ? 'bg-[#fcf9f2] border-[#ffe3d3]' : 'bg-[#0a1120] border-[#f16b48]/25'
              }`}
            >
              <span className={`font-label-caps text-[11px] uppercase font-bold ${isLight ? 'text-[#16223b]' : 'text-[#ffb295]'}`}>
                Importe Total
              </span>
              <span className={`font-headline-md text-[20px] font-bold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>{pack.price} USD</span>
            </div>

            <div className="flex gap-2.5 w-full">
              <Button
                variant="secondary"
                onClick={() => {
                  sounds.playClick();
                  onClose();
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="cherry"
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-1"
              >
                Confirmar Pago
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

// --- MENU DRAWER ---
interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: any) => void;
  onSignOut: () => void;
  user: MeProfile;
  /** Contadores opcionales para mostrar un badge junto al link (ej: citas pendientes) —
   * relevante ahora que Citas/Tienda/Matches se movieron de la bottom nav al menú y
   * perdieron el badge que tenían ahí. */
  badges?: Partial<Record<string, number>>;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSignOut,
  user,
  badges,
}) => {
  const { isLight, toggleTheme } = useTheme();

  const mainLinks = [
    { label: 'Descubrir', tab: 'descubrir', icon: 'explore' },
    { label: 'Matches', tab: 'matches', icon: 'favorite' },
    { label: 'Mensajes', tab: 'mensajes', icon: 'chat_bubble' },
    { label: 'Tienda', tab: 'tienda', icon: 'local_mall' },
    { label: 'Citas', tab: 'citas', icon: 'event_available' },
    { label: 'Perfil', tab: 'perfil', icon: 'badge' },
    { label: 'Ajustes', tab: 'ajustes', icon: 'settings' },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[310px] p-5 flex flex-col justify-between overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className={`pb-3.5 border-b pr-8 ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
            <h2 className="font-wordmark text-[19px] font-bold text-[#f16b48]">MELY</h2>
          </div>

          {/* User mini badge */}
          <div
            onClick={() => {
              sounds.playClick();
              onNavigate('perfil');
              onClose();
            }}
            className={`p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition-colors ${
              isLight ? 'border-slate-100 hover:bg-slate-50' : 'border-white/10 hover:bg-white/5'
            }`}
          >
            <img
              src={user.photos[0]?.url}
              alt={user.displayName}
              className="w-10 h-10 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <span className={`text-[13.5px] font-bold block truncate ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                {user.displayName}
              </span>
              <span className="text-[11px] text-[#f16b48] font-bold block truncate">{user.membership.tierLabel}</span>
            </div>
            <span className={`material-symbols-outlined text-[18px] ${isLight ? 'text-[#6fa8c9]' : 'text-[#ffb295]/50'}`}>
              chevron_right
            </span>
          </div>

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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group cursor-pointer ${
                  isLight ? 'hover:bg-slate-50 text-[#16223b]' : 'hover:bg-white/5 text-[#f5f1e8]'
                }`}
              >
                <span className="material-symbols-outlined text-[19px] text-[#f16b48] group-hover:scale-110 transition-transform">
                  {link.icon}
                </span>
                <span className="text-[13.5px] font-medium flex-1">{link.label}</span>
                {Boolean(badges?.[link.tab]) && (
                  <span className="min-w-[18px] h-[18px] px-1 rounded-[var(--radius-pill)] bg-[#f16b48] text-white text-[10px] font-bold flex items-center justify-center">
                    {badges![link.tab]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className={`pt-4 border-t flex flex-col gap-2.5 ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              toggleTheme();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors group cursor-pointer ${
              isLight ? 'hover:bg-slate-50 text-[#16223b]' : 'hover:bg-white/5 text-[#f5f1e8]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px] text-[#f16b48]">{isLight ? 'dark_mode' : 'light_mode'}</span>
            <span className="text-[13.5px] font-medium">{isLight ? 'Modo oscuro' : 'Modo claro'}</span>
          </button>

          <Button
            variant="outline"
            onClick={() => {
              sounds.playClick();
              onSignOut();
              onClose();
            }}
            className="w-full gap-1.5 text-[13px] normal-case tracking-normal text-[#f16b48]"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Cerrar sesión</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
