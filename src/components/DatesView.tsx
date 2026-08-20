import React from 'react';
import { DateProposal } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';

interface DatesViewProps {
  dates: { proposal: DateProposal; partnerName: string; partnerAvatar: string; threadId: string }[];
  onOpenChat: (threadId: string) => void;
  onVerifyDate: (threadId: string, dateId: string) => void;
}

export const DatesView: React.FC<DatesViewProps> = ({
  dates,
  onOpenChat,
}) => {
  const { isLight } = useTheme();

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
            isLight
              ? 'text-[#e11d48] bg-[#fff1f3] border-[#fecdd3]'
              : 'text-[#fb7185] bg-[#e11d48]/15 border-[#e11d48]/30'
          }`}
        >
          {dates.length} Registros
        </span>
      </div>

      {/* List of Date Ticket Stubs */}
      <div className="flex flex-col gap-4">
        {dates.map(({ proposal, partnerName, partnerAvatar, threadId }) => {
          const isVerified = proposal.status === 'verified';
          const isAccepted = proposal.status === 'accepted';

          return (
            <div
              key={proposal.id}
              className={`border rounded-3xl overflow-hidden relative shadow-2xl ${
                isLight
                  ? 'bg-white border-[#fecdd3] shadow-[0_10px_30px_rgba(225,29,72,0.08)]'
                  : 'bg-[#140b0f] border-[#e11d48]/30 shadow-[0_0_30px_rgba(225,29,72,0.12)]'
              }`}
            >
              {/* Perforation Notches on Sides */}
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 w-3.5 h-7 rounded-r-full border-r border-t border-b ${
                  isLight
                    ? 'bg-[#fafafa] border-[#fecdd3]'
                    : 'bg-[#0b090a] border-[#e11d48]/30'
                }`}
              />
              <div
                className={`absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-7 rounded-l-full border-l border-t border-b ${
                  isLight
                    ? 'bg-[#fafafa] border-[#fecdd3]'
                    : 'bg-[#0b090a] border-[#e11d48]/30'
                }`}
              />

              {/* Ticket Top Banner */}
              <div
                className={`p-4 border-b border-dashed flex items-center justify-between ${
                  isLight
                    ? 'bg-[#fff5f6] border-[#fecdd3]'
                    : 'bg-[#1b0d13] border-[#e11d48]/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-[#e11d48] shrink-0 shadow-md">
                    <img
                      src={partnerAvatar}
                      alt={partnerName}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <span className="font-label-caps text-[9px] text-[#e11d48] uppercase tracking-widest block font-bold">
                      CITA CON {partnerName}
                    </span>
                    <h3 className={`font-headline-md text-[17px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                      {proposal.title}
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-label-caps text-[9px] uppercase px-3 py-1 rounded-full font-bold border ${
                      isVerified
                        ? 'bg-[#10b981]/15 text-[#059669] border-[#10b981]/40'
                        : isAccepted
                        ? isLight
                          ? 'bg-[#fff1f3] text-[#e11d48] border-[#fecdd3]'
                          : 'bg-[#e11d48]/20 text-[#fb7185] border-[#e11d48]/40'
                        : isLight
                        ? 'bg-gray-100 text-gray-700 border-gray-200'
                        : 'bg-[#fb7185]/20 text-[#fda4af] border-[#fb7185]/40'
                    }`}
                  >
                    {isVerified ? 'VERIFICADA' : isAccepted ? 'CONFIRMADA' : 'PROPUESTA'}
                  </span>
                </div>
              </div>

              {/* Ticket Content */}
              <div className="p-4 sm:p-5 flex flex-col gap-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                  <div
                    className={`p-3.5 rounded-2xl border ${
                      isLight
                        ? 'bg-[#fff5f6] border-[#fecdd3]'
                        : 'bg-[#0e070a] border-[#e11d48]/20'
                    }`}
                  >
                    <span className={`font-label-caps text-[9px] uppercase block mb-1 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                      LUGAR & DIRECCIÓN
                    </span>
                    <p className={`font-body-sm text-[13px] font-medium flex items-center gap-1.5 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                      <span className="material-symbols-outlined text-[16px] text-[#e11d48]">
                        location_on
                      </span>
                      {proposal.venue}
                    </p>
                  </div>

                  <div
                    className={`p-3.5 rounded-2xl border ${
                      isLight
                        ? 'bg-[#fff5f6] border-[#fecdd3]'
                        : 'bg-[#0e070a] border-[#e11d48]/20'
                    }`}
                  >
                    <span className={`font-label-caps text-[9px] uppercase block mb-1 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                      HORARIO
                    </span>
                    <p className={`font-body-sm text-[13px] font-medium flex items-center gap-1.5 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                      <span className="material-symbols-outlined text-[16px] text-[#e11d48]">
                        schedule
                      </span>
                      {proposal.time}
                    </p>
                  </div>
                </div>

                {/* Perforation Divider & Actions */}
                <div
                  className={`flex items-center justify-between pt-3 border-t perforation-line gap-2 ${
                    isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/20'
                  }`}
                >
                  <span className={`font-meta-data text-[10px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                    TOKEN: <strong className="text-[#e11d48] font-mono">{proposal.token}</strong>
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        onOpenChat(threadId);
                      }}
                      className={`px-3.5 py-1.5 border font-label-caps text-[10px] uppercase font-bold rounded-xl tactile-btn flex items-center gap-1 focus:outline-none transition-colors ${
                        isLight
                          ? 'bg-white border-[#fecdd3] text-[#475569] hover:text-[#e11d48] hover:border-[#e11d48]'
                          : 'bg-[#1a0b11] hover:bg-[#280f1a] border-[#e11d48]/30 text-[#fda4af] hover:text-[#fff1f2]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      <span>Chat</span>
                    </button>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        onOpenChat(threadId);
                      }}
                      className="px-4 py-1.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] uppercase font-bold rounded-xl tactile-btn hover:opacity-90 flex items-center gap-1 focus:outline-none shadow-md shadow-[#e11d48]/25"
                    >
                      <span className="material-symbols-outlined text-[14px]">qr_code</span>
                      <span>Pase QR</span>
                    </button>
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
