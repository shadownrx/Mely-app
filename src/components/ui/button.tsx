import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

/* Gramática MELY — misma intención, mismo lenguaje.
 * primary: mueve la historia hacia adelante (gradiente coral = acción MELY).
 * secondary: alternativa válida con borde (misma presencia, menos empuje).
 * tertiary: contextual/discreta (icono, menú, cancelar).
 * destructive: reportar, bloquear, eliminar.
 * special: identidad propia de MELY (pasaporte/sello, ticket dashed).
 * link: texto accionable.
 * El radio lo pone el tamaño/contexto (hero = pill vía className); el color
 * lo pone la intención. Deuda honesta: texto blanco sobre coral no llega a
 * 4.5:1 — candidato futuro `ink-on-coral` cuando se revise la marca. */
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-all focus-glow disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none cursor-pointer',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-to-r from-[#ec4d86] to-[#ff6b9e] text-white shadow-[var(--shadow-coral)] hover:brightness-[1.05] active:brightness-95',
        secondary:
          'border border-black/10 bg-white text-slate-800 hover:bg-[#fcf9f2] hover:text-[#c9366d] dark:border-white/10 dark:bg-[#0f1a2e] dark:text-rose-100 dark:hover:bg-rose-950/40',
        tertiary:
          'hover:bg-rose-100/70 hover:text-rose-900 dark:hover:bg-rose-950/50 dark:hover:text-rose-200',
        destructive:
          'bg-red-500 text-white shadow-elevation-sm hover:bg-red-600 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800',
        special:
          'border-2 border-dashed border-rose-400 bg-rose-50/50 text-rose-700 hover:bg-rose-100/80 dark:border-rose-500/40 dark:bg-rose-950/20 dark:text-rose-300 font-label-caps tracking-widest uppercase',
        link: 'text-rose-600 underline-offset-4 hover:underline dark:text-rose-400',
      },
      size: {
        default: 'h-11 px-5 py-2.5 text-sm',
        sm: 'h-9 rounded-xl px-3 text-xs',
        lg: 'h-13 rounded-2xl px-8 text-base font-semibold',
        icon: 'h-10 w-10 rounded-full',
        'icon-sm': 'h-8 w-8 rounded-full text-xs',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
