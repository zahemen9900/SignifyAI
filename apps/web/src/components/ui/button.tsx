import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

type ButtonVariant =
  | 'default'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'accent'
  | 'highlight';

type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60';

const variantStyles: Record<ButtonVariant, string> = {
  default:
    'bg-brand text-brand-foreground shadow-glow hover:shadow-ember hover:scale-[1.02]',
  secondary:
    'bg-muted/60 text-foreground hover:bg-muted hover:-translate-y-0.5 border border-border',
  ghost: 'bg-transparent text-foreground hover:bg-muted/50',
  outline:
    'border border-border text-foreground hover:border-brand hover:text-brand hover:-translate-y-0.5',
  accent: 'bg-accent text-accent-foreground shadow-glow hover:shadow-ember hover:scale-[1.02]',
  highlight: 'bg-highlight text-highlight-foreground shadow-ember hover:brightness-110'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
  icon: 'h-10 w-10'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp ref={ref} className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)} {...props} />
    );
  }
);

Button.displayName = 'Button';
