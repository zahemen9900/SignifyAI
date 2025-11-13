import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search as SearchIcon, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLessons, type LessonRow } from '@/lib/queries/lessons';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { data, isLoading, error } = useLessons(debouncedQuery || null);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);

    return () => window.clearTimeout(handle);
  }, [query]);

  const groupedLessons = useMemo(() => {
    const groups = new Map<string, LessonRow[]>();
    (data ?? []).forEach((lesson) => {
      const key = lesson.lesson_type ?? 'general';
      const existing = groups.get(key) ?? [];
      existing.push(lesson);
      groups.set(key, existing);
    });
    return groups;
  }, [data]);

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
            <Badge variant="brand">Search the studio</Badge>
            <h2 className="mt-3 font-display text-3xl uppercase text-foreground">Find lessons, missions, and prompts</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Type keywords, lesson codes, or difficulty levels to surface Ghanaian Sign Language content from the library.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
            <Filter size={16} /> Filter by code, title, or type
          </div>
        </div>
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border/60 bg-background px-4 py-3 text-sm text-muted-foreground">
          <SearchIcon size={16} className="text-brand" />
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for lessons e.g. 'greetings' or 'culture stories'"
            className="w-full border-none bg-transparent text-base text-foreground focus-visible:ring-0"
          />
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-32 rounded-2xl border border-border/50 bg-background/40 animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-highlight/40 bg-highlight/10 p-6 text-sm text-highlight-foreground">
          We could not load lessons just yet. Please refresh to try again.
        </div>
      ) : (data ?? []).length > 0 ? (
        <div className="space-y-6">
          {Array.from(groupedLessons.entries()).map(([lessonType, lessons]) => (
            <Card key={lessonType} className="border-border/60 bg-muted/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-lg text-foreground">
                  <Sparkles size={18} className="text-brand" />
                  {lessonType}
                </CardTitle>
                <Badge variant="muted">{lessons?.length ?? 0} results</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {lessons?.map((lesson) => (
                  <div key={lesson.id} className="rounded-2xl border border-border/60 bg-background/80 px-4 py-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-base font-semibold text-foreground">{lesson.title}</p>
                      <Badge variant="accent">{lesson.difficulty_level ?? 'intro'}</Badge>
                    </div>
                    <p className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">Code: {lesson.lesson_code}</p>
                    {lesson.description ? (
                      <p className="mt-2 text-sm text-muted-foreground">{lesson.description}</p>
                    ) : null}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-border/60 bg-muted/20">
          <CardHeader className="space-y-2">
            <CardTitle className="flex items-center gap-2 text-lg text-foreground">
              <Sparkles size={18} className="text-brand" />
              Try a different query
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              We could not find matches for that search. Try filtering by lesson type such as “word” or “sentence”.
            </p>
          </CardHeader>
        </Card>
      )}
    </motion.div>
  );
}
