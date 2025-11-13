import { motion } from 'framer-motion';
import { MessageCircle, Plus, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatSessions } from '@/lib/queries/chat';
import { useAuth } from '@/state/auth-provider';

export function AskPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useChatSessions(user?.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="space-y-8"
    >
      <section className="rounded-3xl border border-border/60 bg-background/90 p-6 shadow-lg backdrop-blur">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Badge variant="brand">Ask Signify</Badge>
            <h2 className="mt-3 font-display text-3xl uppercase text-foreground">Chat with the SignTalk tutor</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Continue previous tutoring sessions or spark a new conversation about vocabulary, grammar, or Ghanaian Sign
              Language culture.
            </p>
          </div>
          <Button type="button" className="gap-2">
            <Plus size={16} /> New session
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl border border-border/50 bg-background/40 animate-pulse" />
          ))
        ) : error ? (
          <div className="col-span-full rounded-3xl border border-highlight/40 bg-highlight/10 p-6 text-sm text-highlight-foreground">
            We could not load your tutor history right now. Please refresh to try again.
          </div>
        ) : data.length > 0 ? (
          data.map((session) => (
            <Card key={session.id} className="border-border/60 bg-muted/30">
              <CardHeader className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <MessageCircle size={18} className="text-brand" />
                  {session.chat_name ?? 'Untitled session'}
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDate(session.updated_at)}
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{session.is_active ? 'Active' : 'Archived'}</span>
                <Badge variant="accent">Started {formatDate(session.created_at)}</Badge>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full border-border/60 bg-muted/30">
            <CardHeader className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                <Sparkles size={18} /> Ready when you are
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ask SignifyAI anything about GSL or practise conversational flow. Start a session to see it appear here.
              </p>
            </CardHeader>
          </Card>
        )}
      </section>
    </motion.div>
  );
}

function formatDate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'recently';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}
