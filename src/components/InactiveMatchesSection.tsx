import React from 'react';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import { useInactiveMatches, useReactivateMatch } from '../hooks/useMatches';
import { usePerks, useShop } from '../hooks/useShop';
import { sounds } from '../utils/audio';
import { ProfilePhoto } from './ProfilePhoto';
import { Button } from './ui/button';

interface InactiveMatchesSectionProps {
  onOpenChat: (connectionId: string) => void;
}

/**
 * Matches que se enfriaron porque nadie escribió a tiempo. Antes el backend no los
 * listaba, así que "Reactivar match" se vendía en la Tienda sin ningún lugar desde
 * donde usarlo. Gold y Black traen reactivaciones incluidas; el resto paga en coins.
 */
export const InactiveMatchesSection: React.FC<InactiveMatchesSectionProps> = ({ onOpenChat }) => {
  const { isLight } = useTheme();
  const { data: inactive = [] } = useInactiveMatches();
  const { data: perks } = usePerks();
  const { data: shopItems = [] } = useShop();
  const reactivate = useReactivateMatch();

  if (inactive.length === 0) return null;

  const price = shopItems.find((i) => i.key === 'REACTIVATE_MATCH')?.price;
  const perk = perks?.items.find((i) => i.itemKey === 'REACTIVATE_MATCH');
  const includedLeft = perk ? (perk.unlimited ? Infinity : perk.remaining ?? 0) : 0;
  const costLabel = includedLeft > 0 ? 'Incluido en tu plan' : price != null ? `${price} coins` : 'Reactivar';

  const handleReactivate = (connectionId: string, name: string) => {
    if (reactivate.isPending) return;
    sounds.playCoins();
    reactivate.mutate(connectionId, {
      onSuccess: (res) => {
        toast.success(res.includedInPlan ? `Volviste a conectar con ${name} (incluido en tu plan).` : `Volviste a conectar con ${name}.`);
        onOpenChat(connectionId);
      },
      onError: (err: any) => toast.error(err?.message ?? 'No se pudo reactivar el match'),
    });
  };

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-baseline justify-between px-1">
        <h3
          className={`text-[16px] italic font-semibold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Se enfriaron
        </h3>
        <span className={`text-[10.5px] ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/70'}`}>
          {includedLeft === Infinity
            ? 'Reactivar está incluido en tu plan'
            : includedLeft > 0
              ? `Te ${includedLeft === 1 ? 'queda' : 'quedan'} ${includedLeft} incluida${includedLeft === 1 ? '' : 's'}`
              : 'Nadie escribió a tiempo'}
        </span>
      </div>
      <div
        className={`rounded-[var(--radius-md)] border divide-y ${
          isLight ? 'bg-white border-[#ffe0ec] divide-[#ffe0ec]' : 'bg-[#0f1a2e] border-[#ec4d86]/25 divide-[#ec4d86]/15'
        }`}
      >
        {inactive.map((match) => (
          <div key={match.id} className="p-3 flex items-center gap-3">
            <ProfilePhoto
              url={match.other.photos[0]?.url}
              name={match.other.displayName}
              className="w-11 h-11 rounded-xl border border-[#ffe0ec]/60 dark:border-white/10 grayscale"
            />
            <div className="flex-1 min-w-0">
              <p className={`text-[13px] font-bold truncate ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
                {match.other.displayName}
              </p>
              <p className={`text-[10.5px] ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/70'}`}>{costLabel}</p>
            </div>
            <Button
              size="sm"
              variant="primary"
              disabled={reactivate.isPending}
              onClick={() => handleReactivate(match.id, match.other.displayName)}
              className="h-8 px-3 rounded-xl text-[10.5px] shrink-0"
            >
              Reactivar
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};
