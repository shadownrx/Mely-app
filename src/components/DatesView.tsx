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
  matches: Match[];
  onOpenChat: (connectionId: string) => void;
  onOpenDateQR: (connectionId: string, partnerName: string, partnerAvatar: string) => void;
  onExploreMatches?: () => void;
}

export const DatesView: React.FC<DatesViewProps> = ({ matches, onOpenChat, onOpenDateQR, onExploreMatches }) => {
  const { isLight } = useTheme();
  const { items, isLoading } = useAllDateProposals(matches);

  return (
    <div className="flex flex-col gap-6 pb-12 animate-fadeIn">
      {/* Header Info */}
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <p className="section-kicker">Tu agenda</p>
          <h2 className={`mt-1 font-headline-md text-[22px] font-bold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
            Itinerario de Citas
          </h2>
          <p className={`font-body-sm text-[13px] mt-0.5 ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/80'}`}>
            Tus encuentros acordados y listos para verificar en persona.
          </p>
        </div>
        <span
          className={`font-meta-data text-[12px] font-bold px-2.5 py-0.5 rounded-full border ${
            isLight ? 'text-[#ec4d86] bg-[#fcf9f2] border-[#ffe0ec]' : 'text-[#ffa3c4] bg-[#ec4d86]/15 border-[#ec4d86]/30'
          }`}
        >
          {items.length} Registros
        </span>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-4" aria-label="Cargando itinerario">
          {[0, 1].map((i) => (
            <div
              key={i}
              className={`border rounded-[var(--radius-lg)] overflow-hidden ${isLight ? 'bg-white border-[#ffe0ec]' : 'bg-[#0f1a2e] border-[#ec4d86]/30'}`}
            >
              <div className={`p-4 flex items-center gap-3 border-b border-dashed ${isLight ? 'border-[#ffe0ec]' : 'border-[#ec4d86]/30'}`}>
                <div className="w-11 h-11 rounded-full bg-black/10 dark:bg-white/10 animate-pulse shrink-0" />
                <div className="flex-1 flex flex-col gap-1.5">
                  <div className="h-2.5 w-24 rounded-full bg-black/10 dark:bg-white/10 animate-pulse" />
                  <div className="h-3.5 w-32 rounded-full bg-black/10 dark:bg-white/10 animate-pulse" />
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-16 rounded-[var(--radius-md)] bg-black/5 dark:bg-white/5 animate-pulse" />
                <div className="h-16 rounded-[var(--radius-md)] bg-black/5 dark:bg-white/5 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-14 px-6 text-center">
          <div
            className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center text-[#ec4d86] ${
              isLight ? 'bg-white shadow-elevation-sm' : 'bg-[#0f1a2e]'
            }`}
          >
            <span className="material-symbols-outlined text-[36px]">confirmation_number</span>
          </div>
          <h3 className={`text-[17px] font-bold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
            Tu primera cita te está esperando
          </h3>
          <p className={`text-[13px] max-w-[260px] leading-relaxed ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/80'}`}>
            Todavía no tenés citas acordadas. Cada match puede convertirse en un plan con lugar verificado y sello de recuerdo.
          </p>
          {onExploreMatches && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                sounds.playClick();
                onExploreMatches();
              }}
              className="mt-1 gap-1.5"
            >
              <span className="material-symbols-outlined text-[15px]">local_cafe</span>
              Ver mis matches
            </Button>
          )}
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
              className={`border rounded-[var(--radius-lg)] overflow-hidden relative shadow-2xl ${
                isLight
                  ? 'bg-white border-[#ffe0ec] shadow-[0_10px_30px_rgba(225,29,72,0.08)]'
                  : 'bg-[#0f1a2e] border-[#ec4d86]/30 shadow-[0_0_30px_rgba(225,29,72,0.12)]'
              }`}
            >
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-7 rounded-r-full border-r border-t border-b ${
                  isLight ? 'bg-[#fcf9f2] border-[#ffe0ec]' : 'bg-[#0a1120] border-[#ec4d86]/30'
                }`}
              />
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-7 rounded-l-full border-l border-t border-b ${
                  isLight ? 'bg-[#fcf9f2] border-[#ffe0ec]' : 'bg-[#0a1120] border-[#ec4d86]/30'
                }`}
              />

              {/* Ticket Top Banner */}
              <div
                className={`p-4 border-b border-dashed flex items-center justify-between ${
                  isLight ? 'bg-[#fcf9f2] border-[#ffe0ec]' : 'bg-[#131f36] border-[#ec4d86]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#ec4d86] shrink-0 shadow-elevation-md">
                    <img
                      src={match.other.photos[0]?.url}
                      alt={match.other.displayName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="font-label-caps text-[9px] text-[#ec4d86] uppercase tracking-widest block font-bold">
                      CITA CON {match.other.displayName.toUpperCase()}
                    </span>
                    <h3 className={`font-headline-md text-[17px] font-bold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                      {PLAN_LABELS[dateMeet.planType]}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-label-caps text-[9px] uppercase px-3 py-1 rounded-full font-bold border ${
                      isVerified
                        ? 'bg-[#3f7a5c]/15 text-[#3f7a5c] border-[#3f7a5c]/40'
                        : isAgreed
                        ? isLight
                          ? 'bg-[#fcf9f2] text-[#ec4d86] border-[#ffe0ec]'
                          : 'bg-[#ec4d86]/20 text-[#ffa3c4] border-[#ec4d86]/40'
                        : isLight
                        ? 'bg-[#efe7d8] text-[#5b6478] border-[#ffe0ec]'
                        : 'bg-[#ffa3c4]/20 text-[#ffa3c4] border-[#ffa3c4]/40'
                    }`}
                  >
                    {STATUS_LABEL[dateMeet.status]}
                  </span>
                </div>
              </div>

              {/* Ticket Content */}
              <div className="p-4 sm:p-5 flex flex-col gap-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div className={`p-3.5 rounded-[var(--radius-md)] border ${isLight ? 'bg-[#fcf9f2] border-[#ffe0ec]' : 'bg-[#0a1120] border-[#ec4d86]/20'}`}>
                    <span className={`font-label-caps text-[9px] uppercase block mb-1 ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/70'}`}>
                      LUGAR & DIRECCIÓN
                    </span>
                    <p className={`font-body-sm text-[13px] font-medium flex items-center gap-1.5 ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                      <span className="material-symbols-outlined text-[16px] text-[#ec4d86]">location_on</span>
                      {dateMeet.zone}
                    </p>
                  </div>

                  <div className={`p-3.5 rounded-[var(--radius-md)] border ${isLight ? 'bg-[#fcf9f2] border-[#ffe0ec]' : 'bg-[#0a1120] border-[#ec4d86]/20'}`}>
                    <span className={`font-label-caps text-[9px] uppercase block mb-1 ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/70'}`}>
                      HORARIO
                    </span>
                    <p className={`font-body-sm text-[13px] font-medium flex items-center gap-1.5 ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                      <span className="material-symbols-outlined text-[16px] text-[#ec4d86]">schedule</span>
                      {formatDateTime(dateMeet.scheduledAt)}
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-end pt-3 border-t perforation-line gap-2 ${
                    isLight ? 'border-[#ffe0ec]' : 'border-[#ec4d86]/20'
                  }`}
                >
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
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
                        variant="primary"
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
