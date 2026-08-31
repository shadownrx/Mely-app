import React from 'react';
import { toast } from 'sonner';
import { sounds } from '../utils/audio';
import { useTheme } from '../context/ThemeContext';
import { useWhoLikedMe, useSwipe } from '../hooks/useDiscover';
import { usePurchase } from '../hooks/useShop';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Skeleton } from './ui/skeleton';

interface WhoLikedYouModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  likesUnlockPrice: number;
}

export const WhoLikedYouModal: React.FC<WhoLikedYouModalProps> = ({ open, onOpenChange, likesUnlockPrice }) => {
  const { isLight } = useTheme();
  const { refreshUser } = useAuth();
  const { data, isLoading } = useWhoLikedMe();
  const { like } = useSwipe();
  const purchase = usePurchase();

  const handleLikeBack = (userId: string) => {
    sounds.playHeart();
    like.mutate(userId, {
      onSuccess: (res) => {
        if (res.match) {
          toast.success('¡Es un match! Ya lo tenés en Mensajes.');
        }
      },
    });
  };

  const handleUnlock = () => {
    sounds.playCoins();
    purchase.mutate(
      { itemKey: 'LIKES_UNLOCK' },
      {
        onSuccess: () => {
          refreshUser();
          toast.success('Desbloqueado por 24 horas.');
        },
        onError: (err: any) => toast.error(err?.message ?? 'No se pudo desbloquear'),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[420px] max-h-[80vh] p-0 gap-0 overflow-hidden flex flex-col">
        <DialogHeader className={`p-4 border-b flex-row items-center gap-2 space-y-0 ${isLight ? 'bg-[#fff1f3] border-[#fecdd3]' : 'bg-gradient-to-r from-[#2b0c16] to-[#170a0f] border-[#e11d48]/30'}`}>
          <span className="material-symbols-outlined text-[#e11d48] text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
          <DialogTitle className={`font-headline-md text-[16px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
            Quién te dio like
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading && (
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          )}

          {!isLoading && data && data.count === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <span className={`material-symbols-outlined text-[36px] ${isLight ? 'text-gray-300' : 'text-white/20'}`}>
                favorite_border
              </span>
              <p className={`text-[13px] ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                Todavía nadie te dio like. Seguí explorando en Descubrir.
              </p>
            </div>
          )}

          {!isLoading && data && data.count > 0 && !data.unlocked && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-2.5">
                {Array.from({ length: Math.min(data.count, 9) }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-[3/4] rounded-2xl flex items-center justify-center ${isLight ? 'bg-[#fff1f3]' : 'bg-[#1a0c13]'}`}
                  >
                    <span className="material-symbols-outlined text-[28px] text-[#e11d48]/40" style={{ fontVariationSettings: "'FILL' 1" }}>
                      person
                    </span>
                  </div>
                ))}
              </div>
              <div className={`p-3.5 rounded-2xl border text-center ${isLight ? 'bg-[#fff5f6] border-[#fecdd3]' : 'bg-[#0e0508] border-[#e11d48]/30'}`}>
                <p className={`text-[13px] font-bold ${isLight ? 'text-[#0f172a]' : 'text-[#fff1f2]'}`}>
                  {data.count} {data.count === 1 ? 'persona te dio like' : 'personas te dieron like'}
                </p>
                <p className={`text-[11px] mt-1 mb-3 ${isLight ? 'text-[#64748b]' : 'text-[#fda4af]/70'}`}>
                  Desbloqueá para ver quiénes son y darles like de vuelta.
                </p>
                <Button variant="cherry" onClick={handleUnlock} disabled={purchase.isPending} className="w-full gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">lock_open</span>
                  <span>Desbloquear · {likesUnlockPrice} coins</span>
                </Button>
              </div>
            </div>
          )}

          {!isLoading && data && data.unlocked && data.profiles.length > 0 && (
            <div className="grid grid-cols-2 gap-3">
              {data.profiles.map((p) => (
                <div key={p.id} className={`relative rounded-2xl overflow-hidden border ${isLight ? 'border-[#fecdd3]' : 'border-[#e11d48]/25'}`}>
                  <div className="aspect-[3/4] w-full bg-[#1a0c13]">
                    {p.photos[0]?.url && (
                      <img src={p.photos[0].url} alt={p.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    )}
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent">
                    <p className="text-white text-[12.5px] font-bold truncate">{p.displayName}, {p.age}</p>
                    <Button
                      size="sm"
                      variant="cherry"
                      onClick={() => handleLikeBack(p.id)}
                      disabled={like.isPending}
                      className="w-full h-7 mt-1.5 gap-1 text-[11px]"
                    >
                      <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                      <span>Me gusta</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
