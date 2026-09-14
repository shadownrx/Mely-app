import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-11 w-full rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm shadow-[0_1px_2px_rgba(15,23,42,0.03)] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-glow focus-visible:border-[#d91f4f] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#0b0507] dark:text-rose-100 dark:placeholder:text-rose-400/30 dark:shadow-[0_1px_2px_rgba(0,0,0,0.3)] transition-all font-body-sm text-slate-900',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
