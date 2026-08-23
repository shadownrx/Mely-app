import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ICEBREAKER_QUESTIONS } from '../data/mockData';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader } from './ui/dialog';

interface IcebreakerWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  partnerName: string;
  onSendIcebreakerToChat: (questionText: string) => void;
}

export const IcebreakerWheelModal: React.FC<IcebreakerWheelModalProps> = ({
  isOpen,
  onClose,
  partnerName,
  onSendIcebreakerToChat,
}) => {
  const { isLight } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);

  const filteredQuestions = selectedCategory === 'all'
    ? ICEBREAKER_QUESTIONS
    : ICEBREAKER_QUESTIONS.filter((q) => q.category === selectedCategory);

  const currentQuestion = filteredQuestions[currentIndex % filteredQuestions.length] || ICEBREAKER_QUESTIONS[0];

  const handleSpinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    let ticks = 0;
    const tickInterval = setInterval(() => {
      sounds.playSpinTick();
      ticks++;
      if (ticks > 8) {
        clearInterval(tickInterval);
      }
    }, 90);

    const extraRounds = 360 * 3 + Math.floor(Math.random() * 360);
    setWheelRotation((prev) => prev + extraRounds);

    setTimeout(() => {
      setIsSpinning(false);
      const nextIdx = Math.floor(Math.random() * filteredQuestions.length);
      setCurrentIndex(nextIdx);
      sounds.playCoins();
    }, 900);
  };

  const handleSendToChat = () => {
    sounds.playStamp();
    onSendIcebreakerToChat(currentQuestion.question);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-1.5rem)] max-w-[420px] p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader
          className={`p-4 sm:p-5 border-b flex-row items-center shrink-0 space-y-0 ${
            isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-[#1c0d15] border-[#e11d48]/30'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#e11d48] to-[#ff4d67] flex items-center justify-center text-white shadow-md shadow-[#e11d48]/30">
              <span className="material-symbols-outlined text-[18px]">casino</span>
            </div>
            <div>
              <span className="font-label-caps text-[9px] uppercase tracking-widest text-[#e11d48] font-bold block">
                ROMPER EL HIELO
              </span>
              <h3 className={`font-headline-md text-[17px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                Ruleta de Preguntas con {partnerName}
              </h3>
            </div>
          </div>
        </DialogHeader>

        {/* Roulette Animated Wheel Graphic */}
        <div className="p-5 flex flex-col items-center gap-4 text-center">
          <div className="relative">
            {/* Spinning Dial */}
            <motion.div
              animate={{ rotate: wheelRotation }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="w-28 h-28 rounded-full border-4 border-[#e11d48] p-1.5 flex items-center justify-center bg-gradient-to-tr from-rose-950 via-slate-900 to-rose-900 shadow-xl"
            >
              <div className="w-full h-full rounded-full border border-dashed border-rose-400/40 flex items-center justify-center relative">
                <span className="material-symbols-outlined text-[36px] text-amber-300 animate-pulse">
                  psychology_alt
                </span>
                {/* Dial spokes */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-full h-0.5 bg-rose-500/20" />
                  <div className="h-full w-0.5 bg-rose-500/20 absolute" />
                </div>
              </div>
            </motion.div>

            {/* Pointer Indicator */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#e11d48] rotate-45 border-2 border-white shadow-md z-10" />
          </div>

          <Button
            size="sm"
            onClick={handleSpinRoulette}
            disabled={isSpinning}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-label-caps text-[10px] uppercase font-bold tracking-wider rounded-xl tactile-btn shadow-md shadow-amber-500/25"
          >
            <span className="material-symbols-outlined text-[14px] mr-1.5">autorenew</span>
            GIRAR RULETA DE PREGUNTAS
          </Button>

          {/* Current Question Card Display */}
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-2xl border text-left w-full transition-all ${
              isLight
                ? 'bg-[#fff5f6] border-[#fecdd3]'
                : 'bg-[#1a0c13] border-[#e11d48]/30'
            }`}
          >
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-label-caps text-[9px] uppercase font-bold text-[#e11d48] px-2 py-0.5 rounded-md bg-[#e11d48]/10 border border-[#e11d48]/20">
                {currentQuestion.category.toUpperCase()}
              </span>
              <span className={`text-[10px] ${isLight ? 'text-[#64748b]' : 'text-[#dec0b6]/70'}`}>
                {currentQuestion.context}
              </span>
            </div>

            <p className={`font-headline-md text-[14px] font-bold leading-relaxed mt-2 ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
              “{currentQuestion.question}”
            </p>

            {/* Options pills if available */}
            {currentQuestion.options && currentQuestion.options.length > 0 && (
              <div className="mt-3 flex flex-col gap-1.5">
                <span className="font-label-caps text-[9px] uppercase text-gray-400 font-bold block">
                  Opciones sugeridas para charlar:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {currentQuestion.options.map((opt, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-xl text-[10px] font-medium border leading-tight ${
                        isLight
                          ? 'bg-white border-[#fecdd3] text-[#475569]'
                          : 'bg-[#0f070b] border-[#e11d48]/20 text-[#fda4af]/80'
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full pt-1">
            <Button
              onClick={handleSendToChat}
              className="flex-1 py-2.5 bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white font-label-caps text-[10px] font-bold uppercase tracking-wider rounded-2xl tactile-btn shadow-md shadow-[#e11d48]/25"
            >
              <span className="material-symbols-outlined text-[14px] mr-1">send</span>
              ENVIAR AL CHAT
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
