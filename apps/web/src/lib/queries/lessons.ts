import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

type LessonRow = {
  id: string;
  title: string;
  description: string | null;
  lesson_code: string;
  lesson_type: string;
  difficulty_level: string | null;
  published_at: string | null;
};

async function fetchLessons(searchTerm: string | null) {
  let query = supabase
    .from('lessons')
    .select('id,title,description,lesson_code,lesson_type,difficulty_level,published_at')
    .eq('is_active', true)
    .order('published_at', { ascending: false })
    .limit(25);

  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data ?? []) as LessonRow[];
}

export function useLessons(searchTerm: string | null) {
  return useQuery({
    queryKey: ['lessons', searchTerm],
    queryFn: async () => await fetchLessons(searchTerm),
  });
}

export type { LessonRow };
