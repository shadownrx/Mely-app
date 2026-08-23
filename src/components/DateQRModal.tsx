import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import QrScanner from 'qr-scanner';
import QrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min.js?url';
import { motion } from 'motion/react';
import { PlanType } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useConfirmDate, useCurrentDateMeet, useGenerateQr, useScanCheckIn } from '../hooks/useDates';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';

QrScanner.WORKER_PATH = QrScannerWorkerPath;

const PLAN_LABELS: Record<PlanType, string> = {
  COFFEE: 'Café',
  FOOD: 'Comida',
  BAR: 'Tragos',
  CINEMA: 'Cine',
  ACTIVITY: 'Actividad',
  CHILL: 'Plan tranqui',
  OTHER: 'Plan',
};

interface DateQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectionId: string | null;
  partnerName: string;
  partnerAvatar: string;
}

export const DateQRModal: React.FC<DateQRModalProps> = ({
  isOpen,
  onClose,
  connectionId,
  partnerName,
  partnerAvatar,
}) => {
  const { isLight } = useTheme();
  const [mode, setMode] = useState<'show_qr' | 'scan_manual'>('show_qr');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);

  const { data: dateMeet } = useCurrentDateMeet(isOpen ? connectionId : null);
  const dateId = dateMeet?.id ?? null;
  const zone = dateMeet?.zone ?? '';
  const planType = (dateMeet?.planType ?? 'OTHER') as PlanType;
  const status = dateMeet?.status ?? '';

  const generateQr = useGenerateQr();
  const scanCheckIn = useScanCheckIn();
  const confirmDate = useConfirmDate();

  useEffect(() => {
    if (!isOpen || !dateId) return;
    setMode('show_qr');
    setManualCode('');
    setUseManualEntry(false);
    setCameraError(null);
    setScanError(null);
    setVerificationSuccess(status === 'VERIFIED');
    if (status === 'CANCELLED' || status === 'VERIFIED') return;
    generateQr.mutate(dateId, {
      onSuccess: async (res) => {
        setQrDataUrl(await QRCode.toDataURL(res.payload, { margin: 1, width: 220, color: { dark: '#0f172a' } }));
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, dateId, status]);

  const submitCode = (code: string) => {
    if (!dateId || !code.trim() || scanCheckIn.isPending) return;
    setScanError(null);
    scannerRef.current?.pause();
    scanCheckIn.mutate(
      { dateId, code: code.trim() },
      {
        onSuccess: () => {
          sounds.playScanBeep();
          setManualCode('');
        },
        onError: (err: any) => {
          setScanError(err?.message ?? 'Código inválido');
          scannerRef.current?.start().catch(() => undefined);
        },
      },
    );
  };

  // Escaneo real con cámara: apuntás al QR de tu pareja en vez de tener que pasarte el código
  // por texto, que era lo que permitía el ingreso manual como único camino.
  useEffect(() => {
    if (!isOpen || mode !== 'scan_manual' || useManualEntry || !videoRef.current) return;
    let cancelled = false;
    const scanner = new QrScanner(
      videoRef.current,
      (result) => {
        const text = typeof result === 'string' ? result : result.data;
        try {
          const parsed = JSON.parse(text) as { dateId?: string; code?: string };
          if (!parsed.code) throw new Error('sin código');
          if (parsed.dateId && parsed.dateId !== dateId) {
            setScanError('Ese QR es de otra cita.');
            return;
          }
          submitCode(parsed.code);
        } catch {
          setScanError('QR no reconocido. Probá de nuevo o ingresá el código a mano.');
        }
      },
      { highlightScanRegion: true, highlightCodeOutline: true, preferredCamera: 'environment' },
    );
    scannerRef.current = scanner;
    scanner.start().catch(() => {
      if (!cancelled) setCameraError('No se pudo acceder a la cámara. Revisá los permisos o ingresá el código a mano.');
    });
    return () => {
      cancelled = true;
      scanner.stop();
      scanner.destroy();
      scannerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mode, useManualEntry, dateId]);

  if (!isOpen || !connectionId || !dateId) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    submitCode(manualCode);
  };

  const handleConfirm = (sawEachOther: boolean) => {
    sounds.playClick();
    confirmDate.mutate(
      { dateId, sawEachOther },
      {
        onSuccess: (res) => {
          if (res.verified) {
            sounds.playVerified();
            setVerificationSuccess(true);
          }
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-[400px] p-0 gap-0 overflow-hidden">
        {/* Top Header */}
        <DialogHeader className={`p-4 border-b flex-row items-center shrink-0 space-y-0 ${isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-[#1c0d15] border-[#e11d48]/30'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-[#e11d48] overflow-hidden shrink-0">
              <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div>
              <span className="font-label-caps text-[9px] uppercase tracking-widest text-[#e11d48] font-bold block">
                PASE DE CITA PRESENCIAL
              </span>
              <h3 className={`font-headline-md text-[16px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                Cita con {partnerName}
              </h3>
            </div>
          </div>
        </DialogHeader>

        {!verificationSuccess && (
          <div
            className={`p-2 flex gap-1 border-b ${isLight ? 'bg-[#fff8f9] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'}`}
          >
            <button
              onClick={() => {
                sounds.playClick();
                setMode('show_qr');
              }}
              className={`flex-1 py-1.5 rounded-xl font-label-caps text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                mode === 'show_qr'
                  ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white shadow-sm'
                  : isLight
                  ? 'text-[#64748b] hover:bg-white'
                  : 'text-[#fda4af]/60 hover:text-[#fda4af]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">qr_code_2</span>
              <span>Mi Pase QR</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                setMode('scan_manual');
              }}
              className={`flex-1 py-1.5 rounded-xl font-label-caps text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                mode === 'scan_manual'
                  ? 'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white shadow-sm'
                  : isLight
                  ? 'text-[#64748b] hover:bg-white'
                  : 'text-[#fda4af]/60 hover:text-[#fda4af]'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">document_scanner</span>
              <span>Escanear a {partnerName}</span>
            </button>
          </div>
        )}

        {/* Mode 1: SHOW QR */}
        {mode === 'show_qr' && !verificationSuccess && (
          <div className="p-5 flex flex-col items-center gap-4 text-center">
            <div
              className={`p-4 rounded-3xl border-2 border-dashed relative shadow-inner ${
                isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#0d070a] border-[#e11d48]/40'
              }`}
            >
              <div className="w-[220px] h-[220px] bg-white p-2 rounded-2xl flex items-center justify-center shadow-md overflow-hidden">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Código QR de la cita" className="w-full h-full object-contain" />
                ) : (
                  <span className="material-symbols-outlined text-[48px] text-slate-300 animate-pulse">qr_code_2</span>
                )}
              </div>
              <div className="mt-3">
                <span className={`font-meta-data text-[9px] uppercase ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
                  {PLAN_LABELS[planType]} EN {zone}
                </span>
              </div>
            </div>

            <div
              className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 w-full ${
                isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#180d14] border-[#e11d48]/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#e11d48] shrink-0 mt-0.5">verified</span>
              <div>
                <h4 className={`font-label-caps text-[10px] uppercase font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  Encuentro Seguro en Persona
                </h4>
                <p className={`font-body-sm text-[11px] mt-0.5 leading-snug ${isLight ? 'text-[#64748b]' : 'text-[#dec0b6]/80'}`}>
                  Mostrale este código a {partnerName}, que lo ingrese desde su celular. Al validarse ambos, confirmen que se vieron para desbloquear el sello.
                </p>
              </div>
            </div>

            {status === 'CHECKED_IN' && (
              <div className={`w-full flex flex-col gap-2 p-3 rounded-2xl border ${isLight ? 'bg-[#ecfdf5] border-[#a7f3d0]' : 'bg-[#064e3b]/30 border-[#10b981]/40'}`}>
                <p className={`text-[11px] font-bold ${isLight ? 'text-[#065f46]' : 'text-[#6ee7b7]'}`}>
                  Check-in listo. ¿Se vieron en persona?
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleConfirm(true)}
                    disabled={confirmDate.isPending}
                    className="flex-1 py-2 bg-gradient-to-r from-[#10b981] to-[#34d399] text-white font-label-caps text-[10px] font-bold uppercase rounded-xl"
                  >
                    Sí, nos vimos
                  </Button>
                  <Button
                    onClick={() => handleConfirm(false)}
                    disabled={confirmDate.isPending}
                    variant="ghost"
                    className="flex-1 py-2 font-label-caps text-[10px] font-bold uppercase rounded-xl"
                  >
                    No pasó
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: CAMERA SCAN (con fallback manual) */}
        {mode === 'scan_manual' && !verificationSuccess && (
          <div className="p-5 flex flex-col items-center gap-3 text-center">
            {!useManualEntry ? (
              <>
                <p className={`font-body-sm text-[12px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
                  Apuntá la cámara al QR que {partnerName} te muestra en su pantalla.
                </p>
                <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black relative border-2 border-dashed border-[#e11d48]/40">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
                  {cameraError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 bg-black/85 text-center">
                      <span className="material-symbols-outlined text-[32px] text-[#fb7185]">videocam_off</span>
                      <p className="text-[11px] text-white/90">{cameraError}</p>
                    </div>
                  )}
                </div>
                {scanError && <p className="text-[11px] text-[#e11d48] font-bold">{scanError}</p>}
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setUseManualEntry(true);
                    setCameraError(null);
                    setScanError(null);
                  }}
                  className={`font-label-caps text-[10px] uppercase font-bold underline ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}
                >
                  No puedo usar la cámara, ingresar código a mano
                </button>
              </>
            ) : (
              <form onSubmit={handleManualSubmit} className="w-full flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-[48px] text-[#e11d48]/70">pin</span>
                <p className={`font-body-sm text-[12px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
                  Pedile a {partnerName} que te muestre su pase y escribí el código de 6 dígitos.
                </p>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoFocus
                  className="text-center font-mono tracking-[0.4em] py-3 text-[22px] h-auto"
                />
                {scanError && <p className="text-[11px] text-[#e11d48] font-bold">{scanError}</p>}
                <Button
                  type="submit"
                  disabled={scanCheckIn.isPending}
                  className="w-full py-2.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[11px] font-bold uppercase tracking-wider rounded-2xl shadow-md shadow-[#e11d48]/25 disabled:opacity-60"
                >
                  VALIDAR CÓDIGO
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setUseManualEntry(false);
                    setScanError(null);
                  }}
                  className={`font-label-caps text-[10px] uppercase font-bold underline ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}
                >
                  Volver a usar la cámara
                </button>
              </form>
            )}
          </div>
        )}

        {/* State: VERIFICATION SUCCESS */}
        {verificationSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 flex flex-col items-center gap-4 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#10b981] to-[#34d399] flex items-center justify-center text-white shadow-xl shadow-[#10b981]/30">
              <span className="material-symbols-outlined text-[36px]">verified</span>
            </div>
            <div>
              <span className="font-label-caps text-[9px] uppercase tracking-widest text-[#059669] font-bold block">
                ¡ENCUENTRO VERIFICADO CON ÉXITO!
              </span>
              <h3 className={`font-headline-md text-[20px] font-black mt-0.5 ${isLight ? 'text-[#0f172a]' : 'text-white'}`}>
                Cita Presencial Confirmada
              </h3>
              <p className={`font-body-sm text-[12px] mt-1 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
                El sello de {PLAN_LABELS[planType]} en {zone} se estampó en tu pasaporte MELY.
              </p>
            </div>
            <Button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-full py-2.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[11px] font-bold uppercase tracking-wider rounded-2xl tactile-btn shadow-md shadow-[#e11d48]/25"
            >
              LISTO • VOLVER AL ITINERARIO
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};
