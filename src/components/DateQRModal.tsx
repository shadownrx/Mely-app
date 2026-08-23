import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DateProposal } from '../types';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface DateQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateProposal?: DateProposal;
  partnerName: string;
  partnerAvatar: string;
  threadId: string;
  onConfirmVerification: (threadId: string, dateId: string) => void;
}

export const DateQRModal: React.FC<DateQRModalProps> = ({
  isOpen,
  onClose,
  dateProposal,
  partnerName,
  partnerAvatar,
  threadId,
  onConfirmVerification,
}) => {
  const { isLight } = useTheme();
  const [mode, setMode] = useState<'show_qr' | 'scan_camera'>('show_qr');
  const [isScanning, setIsScanning] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setMode('show_qr');
      setIsScanning(false);
      setVerificationSuccess(false);
      setScanProgress(0);
    }
  }, [isOpen]);

  if (!isOpen || !dateProposal) return null;

  const handleStartScanSimulation = () => {
    sounds.playClick();
    setMode('scan_camera');
    setIsScanning(true);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setVerificationSuccess(true);
          sounds.playScanBeep();
          setTimeout(() => {
            sounds.playVerified();
            onConfirmVerification(threadId, dateProposal.id);
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  const handleDirectSimulate = () => {
    sounds.playScanBeep();
    setVerificationSuccess(true);
    setTimeout(() => {
      sounds.playVerified();
      onConfirmVerification(threadId, dateProposal.id);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 15 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={`border rounded-3xl w-full max-w-[400px] overflow-hidden shadow-2xl relative ${
          isLight ? 'bg-white border-[#fecdd3]' : 'bg-[#130a0e] border-[#e11d48]/40'
        }`}
      >
        {/* Top Header */}
        <div
          className={`p-4 border-b flex justify-between items-center ${
            isLight
              ? 'bg-[#fff1f3] border-[#fecdd3]'
              : 'bg-[#1c0d15] border-[#e11d48]/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-[#e11d48] overflow-hidden shrink-0">
              <img
                src={partnerAvatar}
                alt={partnerName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
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

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className={`p-1.5 rounded-full focus:outline-none ${
              isLight ? 'text-gray-400 hover:text-gray-900' : 'text-[#fda4af]/70 hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tab Switcher: Mi QR vs Escanear */}
        <div
          className={`p-2 flex gap-1 border-b ${
            isLight ? 'bg-[#fff8f9] border-[#fecdd3]' : 'bg-[#0b0507] border-[#e11d48]/20'
          }`}
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
            onClick={handleStartScanSimulation}
            className={`flex-1 py-1.5 rounded-xl font-label-caps text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              mode === 'scan_camera'
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

        {/* Mode 1: SHOW QR */}
        {mode === 'show_qr' && !verificationSuccess && (
          <div className="p-5 flex flex-col items-center gap-4 text-center">
            {/* QR Card Container */}
            <div
              className={`p-4 rounded-3xl border-2 border-dashed relative shadow-inner ${
                isLight
                  ? 'bg-white border-[#fecdd3]'
                  : 'bg-[#0d070a] border-[#e11d48]/40'
              }`}
            >
              {/* Simulated Authentic QR Graphic SVG */}
              <div className="w-48 h-48 bg-white p-3 rounded-2xl flex flex-col items-center justify-center shadow-md relative overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900">
                  {/* Outer corner markers */}
                  <rect x="5" y="5" width="26" height="26" fill="currentColor" rx="4" />
                  <rect x="10" y="10" width="16" height="16" fill="white" rx="2" />
                  <rect x="14" y="14" width="8" height="8" fill="currentColor" />

                  <rect x="69" y="5" width="26" height="26" fill="currentColor" rx="4" />
                  <rect x="74" y="10" width="16" height="16" fill="white" rx="2" />
                  <rect x="78" y="14" width="8" height="8" fill="currentColor" />

                  <rect x="5" y="69" width="26" height="26" fill="currentColor" rx="4" />
                  <rect x="10" y="74" width="16" height="16" fill="white" rx="2" />
                  <rect x="14" y="78" width="8" height="8" fill="currentColor" />

                  {/* QR Data Matrix Patterns */}
                  <rect x="36" y="8" width="6" height="6" fill="currentColor" />
                  <rect x="46" y="8" width="6" height="6" fill="currentColor" />
                  <rect x="56" y="8" width="6" height="6" fill="currentColor" />

                  <rect x="8" y="36" width="6" height="6" fill="currentColor" />
                  <rect x="20" y="36" width="6" height="6" fill="currentColor" />
                  <rect x="36" y="36" width="28" height="28" fill="#e11d48" rx="4" />

                  {/* Center Heart Emblem inside QR */}
                  <circle cx="50" cy="50" r="10" fill="white" />
                  <path
                    d="M 50 53 L 46 49 C 44 47 44 44 46 43 C 48 42 50 44 50 44 C 50 44 52 42 54 43 C 56 44 56 47 54 49 Z"
                    fill="#e11d48"
                  />

                  <rect x="70" y="36" width="6" height="6" fill="currentColor" />
                  <rect x="82" y="36" width="6" height="6" fill="currentColor" />

                  <rect x="36" y="70" width="6" height="6" fill="currentColor" />
                  <rect x="48" y="70" width="6" height="6" fill="currentColor" />
                  <rect x="60" y="70" width="6" height="6" fill="currentColor" />
                  <rect x="72" y="70" width="6" height="6" fill="currentColor" />
                  <rect x="84" y="70" width="6" height="6" fill="currentColor" />

                  <rect x="36" y="82" width="6" height="6" fill="currentColor" />
                  <rect x="52" y="82" width="6" height="6" fill="currentColor" />
                  <rect x="68" y="82" width="6" height="6" fill="currentColor" />
                  <rect x="84" y="82" width="6" height="6" fill="currentColor" />
                </svg>

                {/* Live Subtle pulse effect */}
                <div className="absolute inset-0 border-2 border-[#e11d48]/30 rounded-2xl pointer-events-none animate-pulse" />
              </div>

              {/* Dynamic Token Label */}
              <div className="mt-3">
                <span className="font-mono text-[11px] font-bold text-[#e11d48] tracking-widest block">
                  TOKEN: {dateProposal.token}
                </span>
                <span className={`font-meta-data text-[9px] uppercase ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/60'}`}>
                  VÁLIDO PARA ENCUENTRO EN {dateProposal.venue}
                </span>
              </div>
            </div>

            {/* Instruction Callout */}
            <div
              className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 w-full ${
                isLight
                  ? 'bg-[#fff5f6] border-[#fecdd3]'
                  : 'bg-[#180d14] border-[#e11d48]/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-[#e11d48] shrink-0 mt-0.5">
                verified
              </span>
              <div>
                <h4 className={`font-label-caps text-[10px] uppercase font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  Encuentro Seguro en Persona
                </h4>
                <p className={`font-body-sm text-[11px] mt-0.5 leading-snug ${isLight ? 'text-[#64748b]' : 'text-[#dec0b6]/80'}`}>
                  Muestra este código a {partnerName} al encontrarse. Al validarse, ambos desbloquean el sello de cera en su pasaporte y <strong>+150 MELY Coins</strong>.
                </p>
              </div>
            </div>

            {/* Quick Simulate Button */}
            <Button
              onClick={handleDirectSimulate}
              className="w-full py-2.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[11px] font-bold uppercase tracking-wider rounded-2xl tactile-btn shadow-md shadow-[#e11d48]/25"
            >
              <span className="material-symbols-outlined text-[15px] mr-1.5">handshake</span>
              SIMULAR VALIDACIÓN MUTUA EN EL CAFÉ
            </Button>
          </div>
        )}

        {/* Mode 2: SCANNER CAMERA SIMULATOR */}
        {mode === 'scan_camera' && !verificationSuccess && (
          <div className="p-5 flex flex-col items-center gap-4 text-center">
            {/* Viewfinder Screen */}
            <div className="relative w-64 h-64 rounded-3xl overflow-hidden border-2 border-[#e11d48] bg-black flex items-center justify-center shadow-2xl">
              {/* Camera Background Placeholder */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-black opacity-80" />

              {/* Viewfinder Target Corners */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#e11d48] rounded-tl-lg" />
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#e11d48] rounded-tr-lg" />
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#e11d48] rounded-bl-lg" />
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#e11d48] rounded-br-lg" />

              {/* Laser Scan Line Animation */}
              <motion.div
                animate={{ y: [-90, 90, -90] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-52 h-0.5 bg-gradient-to-r from-transparent via-[#e11d48] to-transparent shadow-[0_0_15px_#e11d48]"
              />

              {/* Central Target Grid */}
              <div className="relative z-10 flex flex-col items-center justify-center p-4">
                <span className="material-symbols-outlined text-[48px] text-[#e11d48]/70 animate-pulse">
                  qr_code_scanner
                </span>
                <span className="font-label-caps text-[10px] text-white/90 font-bold uppercase tracking-wider mt-2 bg-black/60 px-2.5 py-1 rounded-full border border-white/20">
                  Escaneando código de {partnerName}...
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-[#e11d48] to-[#ff4d67] h-full"
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <p className={`font-body-sm text-[12px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/80'}`}>
              Apunta la cámara al teléfono de {partnerName} para confirmar el encuentro.
            </p>
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
                El sello de <strong>{dateProposal.title}</strong> se ha estampado en tu pasaporte MELY.
              </p>
            </div>

            {/* Reward Summary Pill */}
            <div
              className={`p-3 rounded-2xl border flex items-center justify-around w-full ${
                isLight
                  ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#065f46]'
                  : 'bg-[#064e3b]/30 border-[#10b981]/40 text-[#6ee7b7]'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-amber-500">toll</span>
                <span className="font-mono text-[13px] font-bold">+150 Coins</span>
              </div>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[18px] text-[#e11d48]">approval</span>
                <span className="font-label-caps text-[10px] uppercase font-bold">1 Sello Nuevo</span>
              </div>
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
      </motion.div>
    </div>
  );
};
