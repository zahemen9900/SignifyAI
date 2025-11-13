import { motion } from 'framer-motion';
import { CalendarDays, Star, Timer } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type LessonCardProps = {
  title: string;
  lessonType: string;
  difficulty: string | null;
  lastCompletedAt: string | null;
  mode: string;
  score: number | null;
};

function formatDate(input: string | null) {
  if (!input) {
    return 'No session logged yet';
  }

  const date = new Date(input);
  if (Number.isNaN(date.getTime())) {
    return 'No session logged yet';
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

export function LessonCard({ title, lessonType, difficulty, lastCompletedAt, mode, score }: LessonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <Card className="h-full border-border/70 bg-muted/20 hover:border-brand/50 hover:bg-brand/5">
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="brand" className="uppercase tracking-[0.35em]">
              {lessonType}
            </Badge>
            {difficulty ? <Badge variant="accent">{difficulty}</Badge> : null}
          </div>
          <CardTitle className="text-xl text-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-foreground">
            <Timer size={16} />
            <span className="capitalize">Mode: {mode.replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={16} className="text-highlight" />
            <span>{score !== null ? `${Math.round(score)}% last score` : 'Score pending'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={16} />
            <span>{formatDate(lastCompletedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
