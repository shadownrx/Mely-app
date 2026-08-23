import { cn } from '../../lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-rose-100/70 dark:bg-rose-950/30', className)}
      {...props}
    />
  );
}

export { Skeleton };
