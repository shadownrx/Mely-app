import * as React from 'react';
import { cn } from '../../lib/utils';

const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: 'horizontal' | 'vertical'; dashed?: boolean }
>(({ className, orientation = 'horizontal', dashed = false, ...props }, ref) => (
  <div
    ref={ref}
    role="separator"
    aria-orientation={orientation}
    className={cn(
      'shrink-0',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
      dashed
        ? 'border-t border-dashed border-rose-200 dark:border-rose-900/40 bg-transparent'
        : 'bg-rose-100 dark:bg-rose-950/40',
      className
    )}
    {...props}
  />
));
Separator.displayName = 'Separator';

export { Separator };
