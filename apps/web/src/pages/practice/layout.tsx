import { Outlet, NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Sparkles, Stars } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardOverview } from '@/lib/queries/dashboard';
import { useAuth } from '@/state/auth-provider';

const navItems = [
  { label: 'Basics', to: '/practice/basics', description: 'Master the foundational gestures.', icon: <Stars size={16} /> },
  { label: 'Advanced', to: '/practice/advanced', description: 'Push accuracy with sentence drills.', icon: <Sparkles size={16} /> },
  { label: 'Freestyle', to: '/practice/freestyle', description: 'Express freely and refine your flow.', icon: <Flame size={16} /> }
];

export function PracticeLayout() {
  const { user, profile } = useAuth();
  const { data } = useDashboardOverview(user?.id);

  const nickname = profile?.nickname ?? 'Explorer';
  const totalSessions = data?.metrics.totalSessions ?? 0;

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded-3xl border border-border/60 bg-background/90 p-8 shadow-lg backdrop-blur"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge variant="brand">Practice arena</Badge>
            <h2 className="mt-3 font-display text-3xl uppercase text-foreground">Sharpen your signing, {nickname}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Each track is tuned to Ghanaian Sign Language fluency. Rotate through Basics, Advanced, and Freestyle to
              keep your gestures vibrant.
            </p>
          </div>
          <Card className="border-brand/30 bg-brand/10 text-brand-foreground">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-[0.35em] opacity-80">Sessions logged</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-black">{totalSessions}</p>
              <p className="text-xs text-brand-foreground/80">Every session powers adaptive feedback.</p>
            </CardContent>
          </Card>
        </div>
      </motion.section>

      <div className="flex flex-wrap gap-3">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            className={({ isActive }) =>
              `flex min-w-[220px] flex-1 items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                isActive
                  ? 'border-brand/60 bg-brand/15 text-brand-foreground shadow-glow'
                  : 'border-border/60 bg-muted/30 text-muted-foreground hover:border-brand/40 hover:bg-brand/10 hover:text-brand-foreground'
              }`
            }
          >
            <span className="flex items-center gap-2">
              {item.icon}
              {item.label}
            </span>
            <span className="text-xs font-normal text-muted-foreground/80">{item.description}</span>
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}
