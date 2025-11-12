import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export function Alert({
  variant = 'default',
  className,
  title,
  children
}: {
  variant?: 'default' | 'success' | 'error';
  className?: string;
  title?: string;
  children?: ReactNode;
}) {
  const variantStyles = {
    default: 'border-border/60 bg-muted/50 text-foreground',
    success: 'border-brand/50 bg-brand/15 text-brand-foreground',
    error: 'border-rose-500/60 bg-rose-500/10 text-rose-100'
  } as const;

  return (
    <div
      role="status"
      className={cn(
        'rounded-2xl border px-4 py-3 text-sm shadow-inner backdrop-blur',
        variantStyles[variant],
        className
      )}
    >
      {title ? <p className="text-sm font-semibold uppercase tracking-[0.2em]">{title}</p> : null}
      {children ? <div className="mt-1 text-sm opacity-90">{children}</div> : null}
    </div>
  );
}
