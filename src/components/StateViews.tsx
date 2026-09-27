import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { sounds } from '../utils/audio';
import { Button } from './ui/button';

// Lenguaje único de estados Mely: círculo dashed + icono + título + explicación
// + acción. Antes cada vista lo copiaba a mano con pequeñas diferencias (tamaño
// del círculo, copy, padding); ahora es un solo componente con el mismo idioma
// visual en Descubrir, Likes, Matches, Citas, Mensajes y errores.

export interface StateAction {
  label: string;
  onClick: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'link';
}

interface StateBaseProps {
  icon: string;
  title: string;
  body?: string;
  actions?: StateAction[];
  /** Versión densa para intercalar dentro de listas o paneles chicos. */
  compact?: boolean;
  /** Acento ámbar para estados "límite alcanzado", coral para el resto. */
  accent?: 'coral' | 'amber';
}

const StateShell: React.FC<StateBaseProps & { label: string }> = ({
  icon,
  title,
  body,
  actions = [],
  compact = false,
  accent = 'coral',
  label,
}) => {
  const { isLight } = useTheme();
  const amber = accent === 'amber';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      role="status"
      aria-label={label}
      className={`flex flex-col items-center text-center ${compact ? 'py-8 px-4 gap-2' : 'py-14 px-6 gap-3'}`}
    >
      <div
        className={`rounded-full border-2 border-dashed flex items-center justify-center ${
          compact ? 'w-14 h-14' : 'w-20 h-20'
        } ${amber ? 'text-amber-500' : 'text-[#ec4d86]'} ${
          isLight ? 'bg-white shadow-elevation-sm' : 'bg-[#0f1a2e]'
        }`}
      >
        <span className={`material-symbols-outlined ${compact ? 'text-[26px]' : 'text-[36px]'}`} aria-hidden="true">
          {icon}
        </span>
      </div>
      <h3 className={`${compact ? 'text-[15px]' : 'text-[18px]'} font-bold ${isLight ? 'text-[#16223b]' : 'text-[#f5f1e8]'}`}>
        {title}
      </h3>
      {body && (
        <p className={`leading-relaxed ${compact ? 'text-[12px] max-w-[240px]' : 'text-[13px] max-w-[260px]'} ${isLight ? 'text-[#5b6478]' : 'text-[#ffa3c4]/80'}`}>
          {body}
        </p>
      )}
      {actions.length > 0 && (
        <div className={`flex items-center justify-center gap-2.5 flex-wrap ${compact ? 'mt-1' : 'mt-2'}`}>
          {actions.map((a) =>
            a.variant === 'link' ? (
              <button
                key={a.label}
                type="button"
                onClick={() => {
                  sounds.playClick();
                  a.onClick();
                }}
                className={`text-[12px] font-bold underline underline-offset-4 ${isLight ? 'text-[#ec4d86]' : 'text-[#ffa3c4]'}`}
              >
                {a.label}
              </button>
            ) : (
              <Button
                key={a.label}
                variant={a.variant === 'secondary' ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => {
                  sounds.playClick();
                  a.onClick();
                }}
                className="rounded-full gap-1.5"
              >
                {a.icon && <span className="material-symbols-outlined text-[15px]">{a.icon}</span>}
                {a.label}
              </Button>
            ),
          )}
        </div>
      )}
    </motion.div>
  );
};

/** Estado vacío diseñado: responde qué pasó y qué se puede hacer ahora. */
export const EmptyState: React.FC<StateBaseProps> = (props) => <StateShell {...props} label={props.title} />;

interface ErrorStateProps extends Omit<StateBaseProps, 'icon' | 'accent'> {
  icon?: string;
  onRetry?: () => void;
  retryLabel?: string;
  onBack?: () => void;
  backLabel?: string;
}

/** Error controlado: mensaje entendible + acciones (reintentar / volver). */
export const ErrorState: React.FC<ErrorStateProps> = ({
  icon = 'signal_wifi_off',
  title,
  body,
  actions = [],
  onRetry,
  retryLabel = 'Reintentar',
  onBack,
  backLabel = 'Volver',
  compact = false,
}) => {
  const merged: StateAction[] = [
    ...(onRetry ? [{ label: retryLabel, onClick: onRetry, icon: 'refresh', variant: 'primary' as const }] : []),
    ...(onBack ? [{ label: backLabel, onClick: onBack, variant: 'secondary' as const }] : []),
    ...actions,
  ];
  return <StateShell icon={icon} title={title} body={body} actions={merged} compact={compact} accent="coral" label={title} />;
};
