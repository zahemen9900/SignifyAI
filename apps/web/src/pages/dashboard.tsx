import { motion } from 'framer-motion';
import { Activity, Flame, Layers, Sparkles, TrendingUp } from 'lucide-react';

import { LessonCard } from '@/components/dashboard/lesson-card';
import { MetricCard } from '@/components/dashboard/metric-card';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardOverview } from '@/lib/queries/dashboard';
import { useAuth } from '@/state/auth-provider';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const { data, isLoading, error } = useDashboardOverview(user?.id);

  const nickname = profile?.nickname ?? profile?.email ?? 'Explorer';
  const xpValue = profile?.xp ?? 0;
  const streakValue = profile?.streak_count ?? 0;

  const averageScore = data?.metrics.averageScore !== null && data?.metrics.averageScore !== undefined
    ? `${Math.round(data.metrics.averageScore)}%`
    : '—';
  const totalSessions = data?.metrics.totalSessions ?? 0;
  const lastPractised = data?.metrics.latestSessionAt ? formatDateTime(data.metrics.latestSessionAt) : 'No sessions yet';
  const weeklyActivity = data?.metrics.weeklyActivity ?? [];
  const recentLessons = data?.lessons ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="rounded-[32px] border border-border/60 bg-gradient-to-br from-brand/20 via-background to-background p-10 shadow-xl backdrop-blur"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Badge variant="brand">Akwaaba back</Badge>
            <h2 className="font-display text-4xl uppercase text-foreground sm:text-5xl">{nickname}, your studio awaits</h2>
            <p className="max-w-2xl text-base text-muted-foreground">
              Continue your Ghanaian Sign Language mastery. Keep the streak alive, explore new lessons, and unlock more
              expressive conversations.
            </p>
          </div>
          <div className="rounded-3xl border border-highlight/40 bg-highlight/15 px-6 py-5 text-highlight-foreground">
            <p className="text-xs font-semibold uppercase tracking-[0.35em]">Current streak</p>
            <p className="mt-2 text-4xl font-black">{streakValue} days</p>
            <p className="mt-1 text-xs text-highlight-foreground/80">Practice daily to keep the XP flow sparkling.</p>
          </div>
        </div>
      </motion.section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total sessions"
          value={`${totalSessions}`}
          description="Completed practice journeys tracked across all modes."
          icon={<Layers size={16} />}
          accent="brand"
        />
        <MetricCard
          title="Average score"
          value={averageScore}
          description="Performance across your recent SignTalk checks."
          icon={<TrendingUp size={16} />}
          accent="highlight"
        />
        <MetricCard
          title="Total XP"
          value={xpValue.toLocaleString()}
          description="Every gesture adds up to a brighter signing future."
          icon={<Sparkles size={16} />}
          accent="accent"
        />
        <MetricCard
          title="Last practised"
          value={lastPractised}
          description="Keep momentum—SignifyAI thrives on your rhythm."
          icon={<Flame size={16} />}
          accent="brand"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="border-border/60 bg-background/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="font-display text-2xl uppercase text-foreground">Recent triumphs</CardTitle>
              <p className="text-sm text-muted-foreground">Latest lessons you practised in the SignTalk studio.</p>
            </div>
            <Badge variant="muted">Live sync</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {isLoading ? (
              <div className="col-span-full space-y-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="h-32 rounded-2xl border border-border/50 bg-muted/40 animate-pulse" />
                ))}
              </div>
            ) : error ? (
              <div className="col-span-full rounded-2xl border border-highlight/40 bg-highlight/10 p-6 text-sm text-highlight-foreground">
                We could not load your lesson summary right now. Please refresh to try again.
              </div>
            ) : recentLessons.length > 0 ? (
              recentLessons.slice(0, 4).map((lesson) => (
                <LessonCard key={lesson.id} {...lesson} />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-border/60 bg-muted/40 p-6 text-sm text-muted-foreground">
                You have not completed any practice sessions yet. Start a Basics mission to log your first win.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Activity size={18} /> Weekly tempo
            </CardTitle>
            <p className="text-sm text-muted-foreground">Seven-day snapshot of your studio dedication.</p>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-8 rounded-lg border border-border/50 bg-background/40 animate-pulse" />
                ))}
              </div>
            ) : weeklyActivity.length > 0 ? (
              weeklyActivity.slice(0, 7).map((entry) => (
                <div key={entry.metric_day} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/80 px-4 py-3">
                  <span className="text-foreground">{formatMetricDay(entry.metric_day)}</span>
                  <span className="font-semibold text-brand">
                    {entry.sessions_completed} session{entry.sessions_completed === 1 ? '' : 's'}
                  </span>
                </div>
              ))
            ) : (
              <p>
                No weekly activity yet. Dive into a lesson and we will chart your dedication here.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function formatDateTime(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return 'No sessions yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function formatMetricDay(input: string) {
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown day';
  }

  return new Intl.DateTimeFormat(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(date);
}
