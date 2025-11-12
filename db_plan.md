# SignifyAI Database Blueprint (Supabase / Postgres)

## 1. Guiding Principles

- **Security first:** Leverage Supabase row-level security (RLS) on every table in `public` schema, expose only through policies.
- **Observability:** Add created/updated timestamps, soft-delete flags when needed, and event triggers for audit logging.
- **Extensibility:** Support future lesson types, media assets, and analytics with flexible enums and JSONB columns where appropriate.
- **Performance:** Index foreign keys, use materialized views or edge functions for aggregated dashboards, and plan for partitioning high-volume tables.
- **DX alignment:** Keep schema migrations versioned (Supabase CLI), document contracts for FastAPI services, and provide seed scripts for local dev.

## 2. Schema Overview

```
auth (managed by Supabase)
└── users                       -- Authentication identities (UUID pk)

public
├── users                       -- Profile and XP data (1:1 with auth.users)
├── user_settings               -- Per-user preferences (1:1)
├── lessons                     -- Lesson metadata (owner, type, status)
├── notes                       -- Lesson notes and tool call traces (1:many)
├── tests                       -- Test containers tied to lessons (1:many)
├── tests_content               -- Test items/questions (1:many)
├── chat_sessions               -- Tutor conversation sessions (1:many)
├── chat_messages               -- Individual chat messages (1:many)
├── practice_sessions           -- Raw practice attempts (word/sentence/freestyle)
├── practice_metrics_daily      -- Aggregated metrics for dashboards (materialized view)
└── media_assets                -- References to video/image storage objects
```

## 3. Core Tables

### 3.1 `public.users`
- **Purpose:** Store gameified profile data post-auth.
- **Columns:**
  - `id UUID PRIMARY KEY REFERENCES auth.users(id)`
  - `email CITEXT UNIQUE NOT NULL`
  - `full_name TEXT`
  - `nickname TEXT NOT NULL CHECK (char_length(nickname) BETWEEN 2 AND 50)`
  - `xp BIGINT DEFAULT 0 CHECK (xp >= 0)`
  - `level SMALLINT GENERATED ALWAYS AS (xp / 1000)::SMALLINT STORED`
  - `streak_count SMALLINT DEFAULT 0`
  - `last_active_at TIMESTAMPTZ`
  - `created_at TIMESTAMPTZ DEFAULT now()`
  - `updated_at TIMESTAMPTZ DEFAULT now()`
- **Indexes:**
  - `users_email_key` (unique) for login resolution.
  - `idx_users_last_active` on `last_active_at` for engagement queries.
- **Policies:** Users may select/update only their row; service role can read for admin dashboards.
- **Notes:** Mirror selected fields into Supabase auth metadata for quick access in edge functions.

### 3.2 `public.user_settings`
- **Purpose:** Persist per-user preferences.
- **Columns:**
  - `user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE`
  - `app_theme TEXT DEFAULT 'light' CHECK (app_theme IN ('light', 'dark'))`
  - `prefers_assistive_learning BOOLEAN DEFAULT FALSE`
  - `notifications JSONB DEFAULT '{}'::JSONB`
  - `time_zone TEXT DEFAULT 'UTC'`
  - `created_at TIMESTAMPTZ DEFAULT now()`
  - `updated_at TIMESTAMPTZ DEFAULT now()`
- **Indexes:**
  - Implicit primary key on `user_id`.
- **Policies:** Same as users (owner-only access).

### 3.3 `public.lessons`
- **Purpose:** Canonical lesson definitions across modes.
- **Columns:**
  - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
  - `author_id UUID REFERENCES public.users(id)`
  - `lesson_code TEXT UNIQUE NOT NULL`
  - `title TEXT NOT NULL`
  - `description TEXT`
  - `lesson_type TEXT NOT NULL CHECK (lesson_type IN ('word', 'sentence', 'freestyle'))`
  - `difficulty_level TEXT CHECK (difficulty_level IN ('intro', 'intermediate', 'advanced'))`
  - `cover_media_id UUID REFERENCES public.media_assets(id)`
  - `is_active BOOLEAN DEFAULT TRUE`
  - `published_at TIMESTAMPTZ`
  - `created_at TIMESTAMPTZ DEFAULT now()`
  - `updated_at TIMESTAMPTZ DEFAULT now()`
- **Indexes:**
  - `idx_lessons_type_active` on (`lesson_type`, `is_active`).
  - `idx_lessons_author` on `author_id` for contributions.
- **Policies:** General users read active lessons; authors/service roles can insert/update.

### 3.4 `public.notes`
- **Purpose:** Rich lesson notes with streaming/tool call fidelity.
- **Columns:**
  - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
  - `lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE`
  - `title TEXT`
  - `note_content TEXT NOT NULL`
  - `tool_calls JSONB DEFAULT '[]'::JSONB`
  - `tool_calls_content JSONB DEFAULT '[]'::JSONB`
  - `language_code TEXT DEFAULT 'en'`
  - `version INT DEFAULT 1`
  - `created_at TIMESTAMPTZ DEFAULT now()`
  - `updated_at TIMESTAMPTZ DEFAULT now()`
- **Indexes:**
  - `idx_notes_lesson` on `lesson_id`.
- **Policies:** Read for all authenticated users; write limited to authors/content team.

### 3.5 `public.tests`
- **Purpose:** Group related test items per lesson and mode.
- **Columns:**
  - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
  - `lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE`
  - `title TEXT`
  - `passing_score SMALLINT DEFAULT 70`
  - `time_limit_seconds INT`
  - `created_at TIMESTAMPTZ DEFAULT now()`
  - `updated_at TIMESTAMPTZ DEFAULT now()`
- **Indexes:**
  - `idx_tests_lesson` on `lesson_id`.

### 3.6 `public.tests_content`
- **Purpose:** Store each question or evaluation unit.
- **Columns:**
  - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
  - `test_id UUID REFERENCES public.tests(id) ON DELETE CASCADE`
  - `sequence SMALLINT NOT NULL`
  - `test_type TEXT CHECK (test_type IN ('vid2text', 'text2vid', 'illustration', 'ordering'))`
  - `test_content JSONB NOT NULL`
  - `test_options JSONB`
  - `test_ref UUID`
  - `correct_answer JSONB`
  - `created_at TIMESTAMPTZ DEFAULT now()`
- **Indexes:**
  - `idx_tests_content_test_sequence` on (`test_id`, `sequence`).
- **Notes:** Add partial index for `test_type` if heavy filtering occurs.

### 3.7 `public.chat_sessions`
- **Purpose:** Persist Ask Tutor conversation containers.
- **Columns:**
  - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
  - `user_id UUID REFERENCES public.users(id) ON DELETE CASCADE`
  - `chat_name TEXT`
  - `context_snapshot JSONB`
  - `source_lesson_id UUID REFERENCES public.lessons(id)`
  - `is_active BOOLEAN DEFAULT TRUE`
  - `created_at TIMESTAMPTZ DEFAULT now()`
  - `updated_at TIMESTAMPTZ DEFAULT now()`
- **Indexes:**
  - `idx_chat_sessions_user_created` on (`user_id`, `created_at DESC`).

### 3.8 `public.chat_messages`
- **Purpose:** Store streaming AI + user messages.
- **Columns:**
  - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
  - `chat_id UUID REFERENCES public.chat_sessions(id) ON DELETE CASCADE`
  - `sender TEXT NOT NULL CHECK (sender IN ('user', 'tutor', 'system'))`
  - `message_content TEXT`
  - `tool_calls JSONB DEFAULT '[]'::JSONB`
  - `tool_calls_content JSONB DEFAULT '[]'::JSONB`
  - `attachments JSONB DEFAULT '[]'::JSONB`
  - `sequence INT GENERATED BY DEFAULT AS IDENTITY`
  - `created_at TIMESTAMPTZ DEFAULT now()`
- **Indexes:**
  - `idx_chat_messages_chat_sequence` on (`chat_id`, `sequence` DESC`).
  - Partial index where `sender = 'tutor'` for analytics.

### 3.9 `public.practice_sessions`
- **Purpose:** Track each practice attempt for analytics and feedback history.
- **Columns:**
  - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
  - `user_id UUID REFERENCES public.users(id) ON DELETE CASCADE`
  - `lesson_id UUID REFERENCES public.lessons(id)`
  - `mode TEXT CHECK (mode IN ('word', 'sentence', 'freestyle'))`
  - `score NUMERIC(5,2)`
  - `raw_metrics JSONB`
  - `media_id UUID REFERENCES public.media_assets(id)`
  - `feedback JSONB`
  - `started_at TIMESTAMPTZ DEFAULT now()`
  - `completed_at TIMESTAMPTZ`
- **Indexes:**
  - `idx_practice_user_completed` on (`user_id`, `completed_at DESC`).
  - `idx_practice_mode` on `mode` for aggregate queries.
- **Notes:** Use `raw_metrics` to store MediaPipe skeleton data references or summary stats.

### 3.10 `public.media_assets`
- **Purpose:** Track storage objects (videos, images) for lessons/practice.
- **Columns:**
  - `id UUID DEFAULT gen_random_uuid() PRIMARY KEY`
  - `owner_id UUID REFERENCES public.users(id)`
  - `bucket TEXT NOT NULL`
  - `path TEXT NOT NULL`
  - `media_type TEXT`
  - `duration_seconds NUMERIC`
  - `metadata JSONB`
  - `created_at TIMESTAMPTZ DEFAULT now()`
- **Indexes:**
  - `idx_media_owner` on `owner_id`.
- **Integration:** Link with Supabase Storage policies to ensure only owners or admins can access raw media.

## 4. Derived Structures

- **Materialized view `practice_metrics_daily`:** Aggregates per-user XP gain, session counts, average score by mode. Refresh nightly or on demand.
- **Supabase function `increment_xp(user_id UUID, delta INT)`:** Centralize XP calculations with validation.
- **Edge function `sync_chat_context`:** Builds tutor context (recent lessons, streak) before LLM call.
- **Enums:** Store lesson types, difficulty, test types as Postgres enums or check constraints for clarity.

## 5. Query Patterns

### 5.1 Dashboard Progress Snapshot
```sql
SELECT
  u.nickname,
  u.xp,
  u.level,
  COALESCE(SUM(ps.score)::NUMERIC / NULLIF(COUNT(ps.id), 0), 0) AS avg_score,
  COUNT(DISTINCT CASE WHEN ps.completed_at > now() - INTERVAL '7 days' THEN ps.id END) AS sessions_this_week,
  COUNT(DISTINCT l.id) FILTER (WHERE l.lesson_type = 'word') AS word_lessons_completed,
  COUNT(DISTINCT l.id) FILTER (WHERE l.lesson_type = 'sentence') AS sentence_lessons_completed
FROM public.users u
LEFT JOIN public.practice_sessions ps ON ps.user_id = u.id AND ps.completed_at IS NOT NULL
LEFT JOIN public.lessons l ON l.id = ps.lesson_id
WHERE u.id = auth.uid()
GROUP BY u.nickname, u.xp, u.level;
```

### 5.2 Recent Tutor Conversations
```sql
SELECT cs.id, cs.chat_name, cs.created_at,
       jsonb_build_object(
         'last_message', cm.message_content,
         'updated_at', cm.created_at
       ) AS last_message
FROM public.chat_sessions cs
JOIN LATERAL (
  SELECT message_content, created_at
  FROM public.chat_messages
  WHERE chat_id = cs.id
  ORDER BY sequence DESC
  LIMIT 1
) cm ON TRUE
WHERE cs.user_id = auth.uid()
ORDER BY cs.updated_at DESC
LIMIT 10;
```

### 5.3 Practice History Feed
```sql
SELECT ps.id,
       ps.mode,
       ps.score,
       ps.feedback ->> 'summary' AS feedback_summary,
       ps.completed_at,
       l.title
FROM public.practice_sessions ps
LEFT JOIN public.lessons l ON l.id = ps.lesson_id
WHERE ps.user_id = auth.uid()
ORDER BY ps.completed_at DESC
LIMIT 20;
```

## 6. Performance & Maintenance

- **Index hygiene:** Review via `pg_stat_user_indexes` monthly; drop unused indexes to save on write overhead.
- **Partitioning:** Consider time-based partitioning for `practice_sessions` and `chat_messages` if volume exceeds 10M rows.
- **Caching:** Use Supabase PostgREST caching for read-heavy endpoints (dashboard metrics) with `cache-control` headers.
- **Migrations:** Standardize with Supabase CLI (`supabase db diff`, `supabase db push`), test migrations in staging before production.
- **Backups:** Enable PITR in Supabase, schedule weekly logical backups for off-site storage.
- **Monitoring:** Collect query performance metrics via pg_stat_statements, set alerts on slow queries (>300ms) and high CPU.

## 7. Security & RLS Policies

- **Ownership policies:**
  - `USING (id = auth.uid())` on `public.users`.
  - `USING (user_id = auth.uid())` on `user_settings`, `chat_sessions`, `practice_sessions`.
- **Lesson visibility:** Allow all authenticated users to `SELECT` where `is_active = TRUE`; restrict `INSERT/UPDATE` to roles checking `author_id = auth.uid()` or designated service role.
- **Chat messages:** `USING (chat_id IN (SELECT id FROM public.chat_sessions WHERE user_id = auth.uid()))`.
- **Admin operations:** Use Supabase service key or custom role for content editors; keep separate API route.
- **Storage rules:** Align `media_assets` with Supabase Storage policies (bucket level) so that practice recordings remain private.

## 8. Data Lifecycle & Automation

- **Retention:**
  - Archive or anonymize `practice_sessions` older than 18 months (unless user opts in).
  - Expire inactive `chat_sessions` after 90 days to control costs.
- **Cron jobs:**
  - Nightly job to refresh `practice_metrics_daily` and recompute streaks.
  - Weekly job to send re-engagement nudges for users with `last_active_at` > 14 days.
- **Data quality:** Validate JSONB columns with Supabase database triggers or FastAPI validators before insert/update.

## 9. Developer Experience

- Provide SQL seed scripts for base lessons/tests in `/supabase/seed.sql` and update them as new content is produced.
- Document every breaking schema change in `CHANGELOG.md` and update TypeScript types (via Supabase codegen) simultaneously.
- Mock services: use local Supabase stack (`supabase start`) and `pgTAP` or Jest for integration tests of stored procedures.
- Versioned ERD diagrams maintained in `/docs/erd.png` (exported from dbdiagram or Supabase Studio) to keep engineers aligned.

---
This blueprint expands the initial concept into a production-ready schema that balances growth, analytics, and security. Review quarterly to incorporate new learning modes, social features, and reporting requirements.

