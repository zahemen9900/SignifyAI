import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MetricCardProps = {
  title: string;
  value: string;
  description?: string;
  icon: ReactNode;
  accent?: 'brand' | 'highlight' | 'accent';
};

const accentClasses: Record<NonNullable<MetricCardProps['accent']>, string> = {
  brand: 'border-brand/40 bg-brand/10 text-brand-foreground',
  highlight: 'border-highlight/40 bg-highlight/10 text-highlight-foreground',
  accent: 'border-accent/40 bg-accent/10 text-accent-foreground'
};

export function MetricCard({ title, value, description, icon, accent = 'brand' }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card className={`${accentClasses[accent]} overflow-hidden`}>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="text-xs font-semibold uppercase tracking-[0.35em] opacity-80">{title}</CardTitle>
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-foreground/20 bg-background/60 text-current">
            {icon}
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-3xl font-black text-current">{value}</p>
          {description ? <p className="text-sm text-current/80">{description}</p> : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
