import { motion } from 'framer-motion';
import { AlignLeft, BookmarkCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePracticeSessions } from '@/lib/queries/practice';
import { useAuth } from '@/state/auth-provider';

export function PracticeAdvancedPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = usePracticeSessions(user?.id, 'sentence');
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
          <AlignLeft size={16} />
          <span className="font-semibold uppercase tracking-[0.35em]">Advanced track</span>
        </div>
        <p>
          Connect gestures into expressive sentences. We highlight timing, transitions, and pacing to keep your stories
          captivating.
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
          We could not load your advanced sessions right now. Please refresh to try again.
        </div>
      ) : sessions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => (
            <Card key={session.id} className="border-border/60 bg-background/90">
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="text-lg text-foreground">{session.lesson?.title ?? 'Freestyle sentence'}</CardTitle>
                <Badge variant="brand">{session.lesson?.difficulty_level ?? 'intermediate'}</Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  Completion: {session.score !== null ? `${Math.round(session.score)}%` : 'pending evaluation'}
                </p>
                <p className="flex items-center gap-2">
                  <BookmarkCheck size={16} className="text-brand" />
                  <span>Logged {formatDate(session.completed_at)}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-border/60 bg-muted/30 p-6 text-sm text-muted-foreground">
          Advanced lessons will appear here once you complete a Basics session. Keep the momentum going!
        </div>
      )}
    </motion.section>
  );
}

function formatDate(timestamp: string | null) {
  if (!timestamp) {
    return 'not yet';
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'not yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}
