import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';

type ChatSession = {
  id: string;
  chat_name: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  source_lesson_id: string | null;
};

async function fetchChatSessions(userId: string) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('id,chat_name,created_at,updated_at,is_active,source_lesson_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return (data ?? []) as ChatSession[];
}

export function useChatSessions(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['chat-sessions', userId],
    queryFn: async () => {
      if (!userId) {
        return [] as ChatSession[];
      }

      return await fetchChatSessions(userId);
    },
    enabled: Boolean(userId)
  });
}

export type { ChatSession };
