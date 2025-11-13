import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

type PracticeMode = 'word' | 'sentence' | 'freestyle';

type PracticeSession = {
  id: string;
  mode: PracticeMode;
  score: number | null;
  completed_at: string | null;
  raw_metrics: Record<string, unknown> | null;
  feedback: Record<string, unknown> | null;
  lesson: {
    id: string;
    title: string;
    lesson_type: string;
    difficulty_level: string | null;
  } | null;
};

async function fetchPracticeSessions(userId: string, mode?: PracticeMode) {
  const query = supabase
    .from('practice_sessions')
    .select('id,mode,score,completed_at,raw_metrics,feedback,lesson:lessons(id,title,lesson_type,difficulty_level)')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false });

  if (mode) {
    query.eq('mode', mode);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return ((data ?? []) as unknown as PracticeSession[]).filter(Boolean);
}

export function usePracticeSessions(userId: string | null | undefined, mode?: PracticeMode) {
  return useQuery({
    queryKey: ['practice-sessions', userId, mode],
    queryFn: async () => {
      if (!userId) {
        return [] as PracticeSession[];
      }

      return await fetchPracticeSessions(userId, mode);
    },
    enabled: Boolean(userId)
  });
}

export type { PracticeMode, PracticeSession };
