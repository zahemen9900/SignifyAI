import * as React from 'react';

import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'accent' | 'muted' | 'contrast' | 'outline';
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  brand: 'bg-brand/20 text-brand border border-brand/40 dark:text-emerald-200',
  accent: 'bg-accent/20 text-accent border border-accent/40 dark:text-amber-200',
  muted: 'bg-muted text-muted-foreground border border-muted/60',
  contrast: 'bg-foreground text-background border border-foreground/40',
  outline: 'border border-border/60 bg-background text-muted-foreground'
};

export const Badge = ({ className, variant = 'brand', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.22em]',
      variantStyles[variant],
      className
    )}
    {...props}
  />
);
