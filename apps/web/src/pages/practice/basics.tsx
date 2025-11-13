import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePracticeSessions } from '@/lib/queries/practice';
import { useAuth } from '@/state/auth-provider';

export function PracticeBasicsPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = usePracticeSessions(user?.id, 'word');
  const sessions = data ?? [];

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles size={16} />
          <span className="font-semibold uppercase tracking-[0.35em]">Basics track</span>
        </div>
        <p>
          Build vocabulary confidence through focused word-level drills. We prioritise clarity and repetition so every
          gesture lands gracefully.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl border border-border/50 bg-background/40 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-highlight/40 bg-highlight/10 p-6 text-sm text-highlight-foreground">
          We could not load your basics sessions right now. Please refresh to try again.
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => (
            <Card key={session.id} className="border-border/60 bg-background/90">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground">{session.lesson?.title ?? 'Independent drill'}</CardTitle>
                <Badge variant="accent">Score {session.score !== null ? `${Math.round(session.score)}%` : 'pending'}</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p className="flex items-center gap-2 text-foreground">
                  <Lightbulb size={16} className="text-highlight" />
                  <span>{session.lesson?.difficulty_level ?? 'intro'}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Completed {formatRelativeTime(session.completed_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
          You have not practised in Basics yet. Start with "Ama" greetings to unlock your first badge.
        </div>
      )}
    </motion.section>
  );
}

function formatRelativeTime(timestamp: string | null) {
  if (!timestamp) {
    return 'not yet';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'not yet';
  }

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (Math.abs(diffDays) >= 1) {
    return formatter.format(diffDays, 'day');
  }

  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  if (Math.abs(diffHours) >= 1) {
    return formatter.format(diffHours, 'hour');
  }

  const diffMinutes = Math.round(diffMs / (1000 * 60));
  return formatter.format(diffMinutes, 'minute');
}
