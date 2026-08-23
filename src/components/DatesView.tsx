import React from 'react';
import { DateMeet, Match, PlanType } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useAllDateProposals } from '../hooks/useDates';
import { Button } from './ui/button';

const PLAN_LABELS: Record<PlanType, string> = {
  COFFEE: 'Café',
  FOOD: 'Comida',
  BAR: 'Tragos',
  CINEMA: 'Cine',
  ACTIVITY: 'Actividad',
  CHILL: 'Plan tranqui',
  OTHER: 'Plan',
};

const STATUS_LABEL: Record<DateMeet['status'], string> = {
  AGREED: 'CONFIRMADA',
  CHECKED_IN: 'CHECK-IN LISTO',
  VERIFIED: 'VERIFICADA',
  CANCELLED: 'CANCELADA',
  NO_SHOW: 'NO SE PRESENTÓ',
};

function formatDateTime(iso: string | null) {
  if (!iso) return 'A coordinar por chat';
  const formatted = new Date(iso).toLocaleString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
  // toLocaleString devuelve todo en minúsculas en es-AR — capitalize por CSS
  // pondría mayúscula en cada palabra ("Lunes, 5 De Ago"), no solo la primera.
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

interface DatesViewProps {
  onOpenChat: (connectionId: string) => void;
  onOpenDateQR: (connectionId: string, partnerName: string, partnerAvatar: string) => void;
}

export const DatesView: React.FC<DatesViewProps> = ({ onOpenChat, onOpenDateQR }) => {
  const { isLight } = useTheme();
  const { items, isLoading } = useAllDateProposals();

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fadeIn">
      {/* Header Info */}
      <div className="flex justify-between items-baseline px-1">
        <div>
          <h2 className={`font-headline-md text-[22px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
            Itinerario de Citas
          </h2>
          <p className={`font-body-sm text-[13px] mt-0.5 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
            Tus encuentros acordados y listos para verificar en persona.
          </p>
        </div>
        <span
          className={`font-meta-data text-[12px] font-bold px-2.5 py-0.5 rounded-full border ${
            isLight ? 'text-[#e11d48] bg-[#fff1f3] border-[#fecdd3]' : 'text-[#fb7185] bg-[#e11d48]/15 border-[#e11d48]/30'
          }`}
        >
          {items.length} Registros
        </span>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center gap-2 py-12 opacity-60">
          <span className="material-symbols-outlined text-[32px] animate-pulse">confirmation_number</span>
          <span className="text-[12px]">Cargando itinerario...</span>
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-12 text-center opacity-60">
          <span className="material-symbols-outlined text-[32px]">confirmation_number</span>
          <span className="text-[12px]">Todavía no tenés citas acordadas. Proponé un plan desde el chat de un match.</span>
        </div>
      )}

      {/* List of Date Ticket Stubs */}
      <div className="flex flex-col gap-4">
        {items.map(({ match, dateMeet }: { match: Match; dateMeet: DateMeet }) => {
          const isVerified = dateMeet.status === 'VERIFIED';
          const isAgreed = dateMeet.status === 'AGREED' || dateMeet.status === 'CHECKED_IN';

          return (
            <div
              key={dateMeet.id}
              className={`border rounded-3xl overflow-hidden relative shadow-2xl ${
                isLight
                  ? 'bg-white border-[#fecdd3] shadow-[0_10px_30px_rgba(225,29,72,0.08)]'
                  : 'bg-[#140b0f] border-[#e11d48]/30 shadow-[0_0_30px_rgba(225,29,72,0.12)]'
              }`}
            >
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-7 rounded-r-full border-r border-t border-b ${
                  isLight ? 'bg-[#fafafa] border-[#fecdd3]' : 'bg-[#0b090a] border-[#e11d48]/30'
                }`}
              />
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-7 rounded-l-full border-l border-t border-b ${
                  isLight ? 'bg-[#fafafa] border-[#fecdd3]' : 'bg-[#0b090a] border-[#e11d48]/30'
                }`}
              />

              {/* Ticket Top Banner */}
              <div
                className={`p-4 border-b border-dashed flex items-center justify-between ${
                  isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#1b0d13] border-[#e11d48]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#e11d48] shrink-0 shadow-md">
                    <img
                      src={match.other.photos[0]?.url}
                      alt={match.other.displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="font-label-caps text-[9px] text-[#e11d48] uppercase tracking-widest block font-bold">
                      CITA CON {match.other.displayName.toUpperCase()}
                    </span>
                    <h3 className={`font-headline-md text-[17px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                      {PLAN_LABELS[dateMeet.planType]}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-label-caps text-[9px] uppercase px-3 py-1 rounded-full font-bold border ${
                      isVerified
                        ? 'bg-[#10b981]/15 text-[#059669] border-[#10b981]/40'
                        : isAgreed
                        ? isLight
                          ? 'bg-[#fff1f3] text-[#e11d48] border-[#fecdd3]'
                          : 'bg-[#e11d48]/20 text-[#fb7185] border-[#e11d48]/40'
                        : isLight
                        ? 'bg-gray-100 text-gray-700 border-gray-200'
                        : 'bg-[#fb7185]/20 text-[#fda4af] border-[#fb7185]/40'
                    }`}
                  >
                    {STATUS_LABEL[dateMeet.status]}
                  </span>
                </div>
              </div>

              {/* Ticket Content */}
              <div className="p-4 sm:p-5 flex flex-col gap-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0e070a] border-[#e11d48]/20'}`}>
                    <span className={`font-label-caps text-[9px] uppercase block mb-1 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                      LUGAR & DIRECCIÓN
                    </span>
                    <p className={`font-body-sm text-[13px] font-medium flex items-center gap-1.5 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                      <span className="material-symbols-outlined text-[16px] text-[#e11d48]">location_on</span>
                      {dateMeet.zone}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-2xl border ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0e070a] border-[#e11d48]/20'}`}>
                    <span className={`font-label-caps text-[9px] uppercase block mb-1 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                      HORARIO
                    </span>
                    <p className={`font-body-sm text-[13px] font-medium flex items-center gap-1.5 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                      <span className="material-symbols-outlined text-[16px] text-[#e11d48]">schedule</span>
                      {formatDateTime(dateMeet.scheduledAt)}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-end pt-3 border-t perforation-line gap-2 ${
                    isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/20'
                  }`}
                >
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        sounds.playClick();
                        onOpenChat(match.id);
                      }}
                      className="gap-1 rounded-xl"
                    >
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      <span>Chat</span>
                    </Button>

                    {!isVerified && (
                      <Button
                        variant="cherry"
                        size="sm"
                        onClick={() => {
                          sounds.playClick();
                          onOpenDateQR(match.id, match.other.displayName, match.other.photos[0]?.url ?? '');
                        }}
                        className="gap-1 rounded-xl"
                      >
                        <span className="material-symbols-outlined text-[14px]">qr_code</span>
                        <span>Pase QR</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
