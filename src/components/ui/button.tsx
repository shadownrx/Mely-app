import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-medium transition-all focus-glow disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-elevation-sm hover:from-rose-700 hover:to-rose-600 hover:shadow-elevation-md font-semibold',
        cherry:
          'bg-gradient-to-r from-[#e11d48] to-[#ff4d67] text-white shadow-elevation-md hover:opacity-95 hover:shadow-elevation-lg font-semibold',
        destructive:
          'bg-red-500 text-white shadow-elevation-sm hover:bg-red-600 dark:bg-red-900 dark:text-red-100 dark:hover:bg-red-800',
        outline:
          'border border-rose-200 bg-white text-slate-800 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/40 dark:bg-[#140b0f] dark:text-rose-100 dark:hover:bg-rose-950/40',
        secondary:
          'bg-rose-100 text-rose-900 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-200 dark:hover:bg-rose-900/60',
        ghost:
          'hover:bg-rose-100/70 hover:text-rose-900 dark:hover:bg-rose-950/50 dark:hover:text-rose-200',
        link: 'text-rose-600 underline-offset-4 hover:underline dark:text-rose-400',
        stamp:
          'border-2 border-dashed border-rose-400 bg-rose-50/50 text-rose-700 hover:bg-rose-100/80 dark:border-rose-500/40 dark:bg-rose-950/20 dark:text-rose-300 font-label-caps tracking-widest uppercase',
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
      variant: 'default',
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
