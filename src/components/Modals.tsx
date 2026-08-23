import React, { useState } from 'react';
import { toast } from 'sonner';
import { Stamp, PlanType, MeProfile } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useDatesMeta, useProposeDate } from '../hooks/useDates';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  const [scheduledAt, setScheduledAt] = useState(() => defaultDateTimeLocal(3, 16));
  const [coordinateByChat, setCoordinateByChat] = useState(false);
  const [note, setNote] = useState('Un café de especialidad y caminata por la galería.');

  const quickVenues: { zone: string; planType: PlanType; daysAhead: number; hour: number }[] = [
    { zone: 'The Roastery, Palermo Soho', planType: 'COFFEE', daysAhead: 3, hour: 16 },
    { zone: 'Bistró Rosetta, Recoleta', planType: 'FOOD', daysAhead: 4, hour: 20 },
    { zone: 'Speakeasy Florería Atlántico', planType: 'BAR', daysAhead: 5, hour: 21 },
    { zone: 'Café & Libros El Ateneo', planType: 'CHILL', daysAhead: 6, hour: 17 },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    proposeDate.mutate(
      {
        scheduledAt: coordinateByChat ? undefined : new Date(scheduledAt).toISOString(),
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
      <DialogContent className="w-[calc(100%-2rem)] max-w-[420px] p-0 gap-0 rounded-3xl overflow-hidden max-h-[90dvh] flex flex-col">
        <DialogHeader
          className={`p-5 border-b space-y-0 ${isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-[#1c0d15] border-[#e11d48]/20'}`}
        >
          <span className={`font-label-caps text-[9px] uppercase tracking-widest block font-bold ${isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'}`}>
            PROPUESTA DE ENCUENTRO PRESENCIAL
          </span>
          <h3
            className={`font-headline-md text-[18px] font-black ${
              isLight ? 'text-[#0f172a]' : 'text-transparent dark:text-transparent bg-clip-text bg-gradient-to-r from-[#fb7185] to-[#fff1f2]'
            }`}
          >
            Invitar a {partnerName}
          </h3>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div>
            <Label className="mb-1.5 block">Plantillas de Citas Mely</Label>
            <div className="grid grid-cols-2 gap-2">
              {quickVenues.map((qv, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setZone(qv.zone);
                    setPlanType(qv.planType);
                    setScheduledAt(defaultDateTimeLocal(qv.daysAhead, qv.hour));
                    setCoordinateByChat(false);
                  }}
                  className={`p-2.5 rounded-2xl text-left border text-[11px] transition-all font-body-sm cursor-pointer ${
                    zone === qv.zone
                      ? isLight
                        ? 'bg-[#fff1f3] border-[#e11d48] text-[#e11d48] font-bold shadow-sm'
                        : 'bg-[#2b1019] border-[#fb7185] text-[#fff1f2] font-bold shadow-md'
                      : isLight
                      ? 'bg-white border-[#fecdd3] text-[#475569] hover:bg-[#fff5f6]'
                      : 'bg-[#0b0507] border-[#e11d48]/20 text-[#fda4af]/70 hover:border-[#e11d48]/50'
                  }`}
                >
                  <span className={`font-bold block truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                    {meta?.planTypes.find((p) => p.value === qv.planType)?.label ?? qv.planType}
                  </span>
                  <span className={`text-[9px] truncate block ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                    {qv.zone}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="mb-1 block">Tipo de Plan</Label>
            <Select value={planType} onValueChange={(v) => setPlanType(v as PlanType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(meta?.planTypes ?? []).map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="propose-zone" className="mb-1 block">
              Lugar / Dirección
            </Label>
            <Input
              id="propose-zone"
              type="text"
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              required
              minLength={2}
              maxLength={80}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Fecha y Hora</Label>
              <Button
                type="button"
                variant={coordinateByChat ? 'cherry' : 'outline'}
                size="sm"
                onClick={() => {
                  sounds.playClick();
                  setCoordinateByChat((prev) => !prev);
                }}
                className="h-7 px-2 text-[9px] rounded-lg tracking-normal"
              >
                Coordinar por chat
              </Button>
            </div>
            {coordinateByChat ? (
              <p
                className={`font-body-sm text-[11.5px] rounded-2xl px-3.5 py-2.5 border ${
                  isLight ? 'bg-[#fff5f6] border-[#fecdd3] text-[#64748b]' : 'bg-[#0b0507] border-[#e11d48]/25 text-[#fda4af]/80'
                }`}
              >
                No fijás un horario: le mandás la propuesta con el lugar y plan, y se ponen de acuerdo con la hora charlando en el chat.
              </p>
            ) : (
              <Input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
                min={defaultDateTimeLocal(0, 0)}
              />
            )}
          </div>

          <div>
            <Label htmlFor="propose-note" className="mb-1 block">
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

          <div className="pt-2">
            <Button type="submit" variant="cherry" size="lg" disabled={proposeDate.isPending} className="w-full gap-2">
              <span>ENVIAR INVITACIÓN TICKET</span>
              <span className="material-symbols-outlined text-[16px]">confirmation_number</span>
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
              className={`w-24 h-24 rounded-full border-4 border-[#e11d48] text-[#e11d48] flex items-center justify-center stamp-ink mb-4 shadow-xl relative ${
                isLight ? 'bg-[#fff5f6]' : 'bg-[#0b0507]'
              }`}
            >
              <div className="absolute inset-1.5 border border-[#e11d48]/40 rounded-full" />
              <span className="material-symbols-outlined text-[42px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                {stamp.iconName}
              </span>
            </div>

            <span className={`font-label-caps text-[10px] uppercase tracking-widest mb-1 font-bold ${isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'}`}>
              {stamp.unlocked ? 'SELLO OFICIAL DE CONEXIÓN' : 'SELLO POR DESBLOQUEAR'}
            </span>
            <h3 className={`font-headline-md text-[22px] font-bold mb-1 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              {stamp.title}
            </h3>
            <span className={`font-meta-data text-[12px] mb-4 font-semibold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]'}`}>
              {stamp.unlockedAt ? `Fecha: ${new Date(stamp.unlockedAt).toLocaleDateString('es-AR')}` : stamp.description}
            </span>

            <div
              className={`rounded-2xl p-4 border w-full text-left flex flex-col gap-2.5 mb-5 ${
                isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
              }`}
            >
              {stamp.location && (
                <div>
                  <span className={`font-label-caps text-[9px] uppercase block font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
                    LUGAR
                  </span>
                  <p className={`font-body-sm text-[13px] ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{stamp.location}</p>
                </div>
              )}

              {stamp.partnerName && (
                <div>
                  <span className={`font-label-caps text-[9px] uppercase block font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
                    ENCUENTRO CON
                  </span>
                  <p className={`font-body-sm text-[13px] ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{stamp.partnerName}</p>
                </div>
              )}

              {stamp.notes && (
                <div>
                  <span className={`font-label-caps text-[9px] uppercase block font-bold ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
                    MEMORIA / DETALLES
                  </span>
                  <p className={`font-body-sm text-[13px] italic ${isLight ? 'text-[#475569]' : 'text-[#fda4af]'}`}>"{stamp.notes}"</p>
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
              className={`w-16 h-16 rounded-full border text-[#e11d48] flex items-center justify-center mb-4 ${
                isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#e11d48]/20 border-[#e11d48]/40'
              }`}
            >
              <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                monetization_on
              </span>
            </div>

            <span className={`font-label-caps text-[10px] uppercase tracking-widest mb-1 font-bold ${isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'}`}>
              BÓVEDA PERSONAL
            </span>
            <h3 className={`font-headline-md text-[20px] font-bold mb-1 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{pack.name}</h3>
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
              <span className={`font-headline-md text-[20px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>{pack.price} USD</span>
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
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onSignOut,
  user,
}) => {
  const { isLight, toggleTheme } = useTheme();

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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-[310px] p-5 flex flex-col justify-between overflow-y-auto no-scrollbar">
        <div className="flex flex-col gap-5">
          {/* Header */}
          <div className="flex justify-between items-center pb-3.5 border-b border-[#e11d48]/20 pr-8">
            <div>
              <h2 className={`font-headline-md text-[20px] tracking-[0.2em] font-bold ${isLight ? 'text-[#e11d48]' : 'text-[#fb7185]'}`}>
                MELY
              </h2>
              <span className={`font-label-caps text-[8.5px] uppercase tracking-wider ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                PASAPORTE DE CONEXIONES
              </span>
            </div>
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
            <Button
              type="button"
              variant="cherry"
              size="sm"
              onClick={() => {
                sounds.playClick();
                toggleTheme();
              }}
              className="h-7 px-2.5 text-[9px] rounded-xl tracking-normal"
            >
              Cambiar
            </Button>
          </div>

          {/* User mini passport badge */}
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
              src={user.photos[0]?.url}
              alt={user.displayName}
              className="w-10 h-10 rounded-full object-cover border border-[#e11d48]/50 shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="flex-1 min-w-0">
              <span className={`font-headline-md text-[13px] font-bold block truncate ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                {user.displayName}
              </span>
              <span className="font-meta-data text-[9px] text-[#e11d48] uppercase block truncate font-bold">
                {user.membership.tierLabel}
              </span>
            </div>
            <span className={`material-symbols-outlined text-[18px] ${isLight ? 'text-[#94a3b8]' : 'text-[#fda4af]/50'}`}>
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
                  isLight ? 'hover:bg-[#fff1f3] text-[#0f172a]' : 'hover:bg-white/5 text-[#fff1f2]'
                }`}
              >
                <span className="material-symbols-outlined text-[19px] text-[#e11d48] group-hover:scale-110 transition-transform">
                  {link.icon}
                </span>
                <span className="font-body-sm text-[13px] font-medium">{link.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex flex-col gap-2.5">
          <Button
            variant="outline"
            onClick={() => {
              sounds.playClick();
              onSignOut();
              onClose();
            }}
            className={`w-full gap-1.5 text-[10px] ${isLight ? 'bg-[#fff1f3] text-[#e11d48]' : 'bg-[#170a0f] text-[#fda4af]'}`}
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Cerrar Sesión</span>
          </Button>

          <span className={`font-meta-data text-[8px] text-center block ${isLight ? 'text-gray-400' : 'text-[#fda4af]/40'}`}>
            MELY v2.8 • CHERRY & CORAL EDITION
          </span>
        </div>
      </SheetContent>
    </Sheet>
  );
};
