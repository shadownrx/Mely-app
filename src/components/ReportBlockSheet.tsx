import React, { useState } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { sounds } from '../utils/audio';
import { useBlockUser, useReportUser } from '../hooks/useModeration';
import type { ReportReason } from '../lib/api/moderation';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface ReportBlockSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partnerId: string;
  partnerName: string;
  /** Se llama tras bloquear o reportar con éxito — el caller decide si cierra un modal padre, saca al match de una lista local, etc. */
  onActionComplete?: (action: 'blocked' | 'reported') => void;
}

const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'FAKE_PROFILE', label: 'Perfil falso o fotos que no son suyas' },
  { value: 'HARASSMENT', label: 'Acoso o comportamiento hostil' },
  { value: 'UNSOLICITED_SEXUAL', label: 'Contenido sexual no solicitado' },
  { value: 'INAPPROPRIATE', label: 'Contenido inapropiado' },
  { value: 'POSSIBLE_MINOR', label: 'Podría ser menor de edad' },
  { value: 'SPAM_SCAM', label: 'Spam o intento de estafa' },
  { value: 'OTHER', label: 'Otro motivo' },
];

type SheetView = 'menu' | 'report' | 'block-confirm';

export const ReportBlockSheet: React.FC<ReportBlockSheetProps> = ({
  open,
  onOpenChange,
  partnerId,
  partnerName,
  onActionComplete,
}) => {
  const { isLight } = useTheme();
  const [view, setView] = useState<SheetView>('menu');
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const blockUser = useBlockUser();
  const reportUser = useReportUser();

  const reset = () => {
    setView('menu');
    setReason(null);
    setDetails('');
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 200);
  };

  const handleBlock = async () => {
    try {
      await blockUser.mutateAsync(partnerId);
      sounds.playClick();
      toast.success(`Bloqueaste a ${partnerName}`, { description: 'No va a poder verte ni escribirte nunca más.' });
      close();
      onActionComplete?.('blocked');
    } catch {
      toast.error('No pudimos bloquear a esta persona. Probá de nuevo.');
    }
  };

  const handleReport = async () => {
    if (!reason) return;
    try {
      await reportUser.mutateAsync({ userId: partnerId, reason, details: details.trim() || undefined });
      sounds.playClick();
      toast.success('Gracias por avisarnos', { description: 'Nuestro equipo va a revisar el reporte a la brevedad.' });
      close();
      onActionComplete?.('reported');
    } catch {
      toast.error('No pudimos enviar el reporte. Probá de nuevo.');
    }
  };

  const mutedText = isLight ? 'text-[#5b6478]' : 'text-[#a9b2c9]';

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) close(); else onOpenChange(true); }}>
      <SheetContent side="bottom" className="rounded-t-3xl p-5">
        {view === 'menu' && (
          <>
            <SheetHeader className="text-left mb-1">
              <SheetTitle>Reportar o bloquear</SheetTitle>
              <p className={`text-[12.5px] ${mutedText}`}>Sobre {partnerName}. Esto queda entre vos y el equipo de MELY.</p>
            </SheetHeader>
            <div className="flex flex-col gap-2 mt-3">
              <button
                type="button"
                onClick={() => { sounds.playClick(); setView('report'); }}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  isLight ? 'bg-white border-[#ffe0ec] hover:bg-[#fcf9f2]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-amber-500 shrink-0">flag</span>
                <span>
                  <span className={`block text-[13.5px] font-bold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>Reportar perfil</span>
                  <span className={`block text-[11.5px] ${mutedText}`}>Contanos qué pasó, revisamos cada reporte</span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => { sounds.playClick(); setView('block-confirm'); }}
                className={`w-full text-left px-4 py-3.5 rounded-2xl border flex items-center gap-3 transition-colors ${
                  isLight ? 'bg-white border-[#ffe0ec] hover:bg-[#fcf9f2]' : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[20px] text-red-500 shrink-0">block</span>
                <span>
                  <span className={`block text-[13.5px] font-bold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>Bloquear a {partnerName}</span>
                  <span className={`block text-[11.5px] ${mutedText}`}>No van a poder verse ni contactarse más</span>
                </span>
              </button>
            </div>
          </>
        )}

        {view === 'report' && (
          <>
            <SheetHeader className="text-left mb-1">
              <button
                type="button"
                onClick={() => setView('menu')}
                className={`inline-flex items-center gap-1 text-[11.5px] font-bold mb-1 ${isLight ? 'text-[#ec4d86]' : 'text-[#ffa3c4]'}`}
              >
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                Volver
              </button>
              <SheetTitle>¿Por qué reportás a {partnerName}?</SheetTitle>
            </SheetHeader>
            <RadioGroup
              value={reason ?? undefined}
              onValueChange={(v) => setReason(v as ReportReason)}
              className="mt-2 gap-2.5"
            >
              {REPORT_REASONS.map((r) => (
                <Label
                  key={r.value}
                  htmlFor={`report-${r.value}`}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer text-[13px] font-medium ${
                    reason === r.value
                      ? 'border-[#ec4d86] bg-[#ec4d86]/8'
                      : isLight
                      ? 'border-[#ffe0ec] bg-white'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <RadioGroupItem value={r.value} id={`report-${r.value}`} />
                  {r.label}
                </Label>
              ))}
            </RadioGroup>
            <Textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Contanos más detalles (opcional)"
              className="mt-3 min-h-[70px]"
              maxLength={500}
            />
            <Button
              type="button"
              variant="destructive"
              disabled={!reason || reportUser.isPending}
              onClick={handleReport}
              className="w-full mt-4"
            >
              {reportUser.isPending ? 'Enviando…' : 'Enviar reporte'}
            </Button>
          </>
        )}

        {view === 'block-confirm' && (
          <>
            <SheetHeader className="text-left mb-1">
              <SheetTitle className="text-red-500">Bloquear a {partnerName}</SheetTitle>
              <p className={`text-[12.5px] ${mutedText}`}>
                Ya no va a poder ver tu perfil, escribirte ni volver a aparecer en tu Descubrir. No se le avisa que la bloqueaste.
              </p>
            </SheetHeader>
            <div className="flex gap-2.5 mt-4">
              <Button type="button" variant="tertiary" onClick={() => setView('menu')} className="flex-1">
                Cancelar
              </Button>
              <Button type="button" variant="destructive" onClick={handleBlock} disabled={blockUser.isPending} className="flex-1">
                {blockUser.isPending ? 'Bloqueando…' : 'Bloquear'}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};
