import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

type PracticeMetricRow = {
  metric_day: string;
  sessions_completed: number;
  avg_score: number | null;
  score_sum: number | null;
};

type PracticeSessionRow = {
  id: string;
  mode: string;
  score: number | null;
  completed_at: string | null;
  lesson_id: string | null;
  lesson: {
    id: string;
    title: string;
    lesson_type: string;
    difficulty_level: string | null;
    cover_media_id: string | null;
  } | null;
};

export type DashboardOverview = {
  metrics: {
    totalSessions: number;
    averageScore: number | null;
    latestSessionAt: string | null;
    weeklyActivity: PracticeMetricRow[];
  };
  lessons: Array<{
    id: string;
    title: string;
    lessonType: string;
    difficulty: string | null;
    lastCompletedAt: string | null;
    mode: string;
    score: number | null;
  }>;
};

async function fetchDashboardOverview(userId: string): Promise<DashboardOverview> {
  const [{ data: sessionsData, error: sessionsError }, { data: metricsData, error: metricsError }] = await Promise.all([
    supabase
      .from('practice_sessions')
      .select('id, mode, score, completed_at, lesson_id, lesson:lessons(id,title,lesson_type,difficulty_level,cover_media_id)')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(30),
    supabase
      .from('practice_metrics_daily')
      .select('metric_day,sessions_completed,avg_score,score_sum')
      .eq('user_id', userId)
      .order('metric_day', { ascending: false })
      .limit(14)
  ]);

  if (sessionsError) {
    throw sessionsError;
  }

  if (metricsError) {
    throw metricsError;
  }

  const sessions = ((sessionsData ?? []) as unknown as PracticeSessionRow[]).filter(Boolean);
  const uniqueLessons = new Map<string, DashboardOverview['lessons'][number]>();

  for (const session of sessions) {
    if (!session.lesson_id || !session.lesson) {
      continue;
    }

    if (!uniqueLessons.has(session.lesson_id)) {
      uniqueLessons.set(session.lesson_id, {
        id: session.lesson_id,
        title: session.lesson.title,
        lessonType: session.lesson.lesson_type,
        difficulty: session.lesson.difficulty_level,
        lastCompletedAt: session.completed_at,
        mode: session.mode,
        score: session.score
      });
    }
  }

  const totalSessions = sessions.length;
  const scores = sessions.map((session) => session.score).filter((value): value is number => typeof value === 'number');
  const averageScore = scores.length > 0 ? scores.reduce((sum, value) => sum + value, 0) / scores.length : null;
  const latestSessionAt = sessions.length > 0 ? sessions[0].completed_at : null;

  return {
    metrics: {
      totalSessions,
      averageScore,
      latestSessionAt,
      weeklyActivity: (metricsData ?? []) as PracticeMetricRow[]
    },
    lessons: Array.from(uniqueLessons.values())
  };
}

export function useDashboardOverview(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['dashboard-overview', userId],
    queryFn: async () => {
      if (!userId) {
        return null;
      }

      return await fetchDashboardOverview(userId);
    },
    enabled: Boolean(userId)
  });
}