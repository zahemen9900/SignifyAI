-- SignifyAI Supabase schema and automation
-- Run with the Supabase CLI or in the dashboard SQL editor.

-- Extensions ---------------------------------------------------------------
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- Helper function to maintain updated_at columns -------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Core tables -------------------------------------------------------------
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext unique not null,
  full_name text,
  nickname text not null check (char_length(nickname) between 2 and 50),
  xp bigint not null default 0 check (xp >= 0),
  level smallint generated always as ((xp / 1000)::smallint) stored,
  streak_count smallint not null default 0,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_last_active on public.users (last_active_at);

create table if not exists public.user_settings (
  user_id uuid primary key references public.users(id) on delete cascade,
  app_theme text not null default 'light' check (app_theme in ('light', 'dark')),
  prefers_assistive_learning boolean not null default false,
  notifications jsonb not null default '{}'::jsonb,
  time_zone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.users(id) on delete set null,
  bucket text not null,
  path text not null,
  media_type text,
  duration_seconds numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_assets_bucket_path_key unique (bucket, path)
);

create index if not exists idx_media_owner on public.media_assets (owner_id);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.users(id) on delete set null,
  lesson_code text unique not null,
  title text not null,
  description text,
  lesson_type text not null check (lesson_type in ('word', 'sentence', 'freestyle')),
  difficulty_level text check (difficulty_level in ('intro', 'intermediate', 'advanced')),
  cover_media_id uuid references public.media_assets(id) on delete set null,
  is_active boolean not null default true,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lessons_type_active on public.lessons (lesson_type, is_active);
create index if not exists idx_lessons_author on public.lessons (author_id);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text,
  note_content text not null,
  tool_calls jsonb not null default '[]'::jsonb,
  tool_calls_content jsonb not null default '[]'::jsonb,
  language_code text not null default 'en',
  version int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_notes_lesson on public.notes (lesson_id);

create table if not exists public.tests (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  title text,
  passing_score smallint not null default 70,
  time_limit_seconds int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tests_lesson on public.tests (lesson_id);

create table if not exists public.tests_content (
  id uuid primary key default gen_random_uuid(),
  test_id uuid references public.tests(id) on delete cascade,
  sequence smallint not null,
  test_type text not null check (test_type in ('vid2text', 'text2vid', 'illustration', 'multiple_choice', 'ordering')),
  test_content jsonb not null,
  test_options jsonb,
  test_ref uuid,
  correct_answer jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint tests_content_test_sequence_key unique (test_id, sequence)
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  chat_name text,
  context_snapshot jsonb,
  source_lesson_id uuid references public.lessons(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_chat_sessions_user_created on public.chat_sessions (user_id, created_at desc);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chat_sessions(id) on delete cascade,
  sender text not null check (sender in ('user', 'tutor', 'system')),
  message_content text,
  tool_calls jsonb not null default '[]'::jsonb,
  tool_calls_content jsonb not null default '[]'::jsonb,
  attachments jsonb not null default '[]'::jsonb,
  sequence int generated by default as identity,
  created_at timestamptz not null default now()
);

create index if not exists idx_chat_messages_chat_sequence on public.chat_messages (chat_id, sequence desc);
create index if not exists idx_chat_messages_sender on public.chat_messages (sender) where sender = 'tutor';

create table if not exists public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  mode text not null check (mode in ('word', 'sentence', 'freestyle')),
  score numeric(5,2) check (score between 0 and 100),
  raw_metrics jsonb,
  media_id uuid references public.media_assets(id) on delete set null,
  feedback jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_practice_user_completed on public.practice_sessions (user_id, completed_at desc);
create index if not exists idx_practice_mode on public.practice_sessions (mode);

-- Materialized view -------------------------------------------------------
create materialized view if not exists public.practice_metrics_daily as
select
  user_id,
  date_trunc('day', completed_at) as metric_day,
  count(*) filter (where completed_at is not null) as sessions_completed,
  avg(score) filter (where completed_at is not null) as avg_score,
  sum(score) filter (where completed_at is not null) as score_sum
from public.practice_sessions
where completed_at is not null
group by user_id, date_trunc('day', completed_at);

create unique index if not exists idx_practice_metrics_daily on public.practice_metrics_daily (user_id, metric_day);

-- XP helper ---------------------------------------------------------------
create or replace function public.increment_xp(p_user_id uuid, p_delta integer)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_new_xp bigint;
begin
  update public.users
  set xp = greatest(0, xp + p_delta),
      updated_at = now()
  where id = p_user_id
  returning xp into v_new_xp;

  return v_new_xp;
end;
$$;

-- Updated_at triggers -----------------------------------------------------
drop trigger if exists trigger_set_updated_at_on_users on public.users;
create trigger trigger_set_updated_at_on_users
before update on public.users
for each row
execute function public.set_updated_at();

drop trigger if exists trigger_set_updated_at_on_user_settings on public.user_settings;
create trigger trigger_set_updated_at_on_user_settings
before update on public.user_settings
for each row
execute function public.set_updated_at();

drop trigger if exists trigger_set_updated_at_on_media_assets on public.media_assets;
create trigger trigger_set_updated_at_on_media_assets
before update on public.media_assets
for each row
execute function public.set_updated_at();

drop trigger if exists trigger_set_updated_at_on_lessons on public.lessons;
create trigger trigger_set_updated_at_on_lessons
before update on public.lessons
for each row
execute function public.set_updated_at();

drop trigger if exists trigger_set_updated_at_on_notes on public.notes;
create trigger trigger_set_updated_at_on_notes
before update on public.notes
for each row
execute function public.set_updated_at();

drop trigger if exists trigger_set_updated_at_on_tests on public.tests;
create trigger trigger_set_updated_at_on_tests
before update on public.tests
for each row
execute function public.set_updated_at();

drop trigger if exists trigger_set_updated_at_on_tests_content on public.tests_content;
create trigger trigger_set_updated_at_on_tests_content
before update on public.tests_content
for each row
execute function public.set_updated_at();

drop trigger if exists trigger_set_updated_at_on_chat_sessions on public.chat_sessions;
create trigger trigger_set_updated_at_on_chat_sessions
before update on public.chat_sessions
for each row
execute function public.set_updated_at();

drop trigger if exists trigger_set_updated_at_on_practice_sessions on public.practice_sessions;
create trigger trigger_set_updated_at_on_practice_sessions
before update on public.practice_sessions
for each row
execute function public.set_updated_at();

-- Auth hook to create profiles -------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_full_name text;
  v_nickname text;
begin
  v_email := coalesce(new.email, new.raw_user_meta_data->>'email');
  v_full_name := nullif(new.raw_user_meta_data->>'full_name', '');

  v_nickname := coalesce(
    nullif(new.raw_user_meta_data->>'nickname', ''),
    nullif(split_part(coalesce(v_full_name, v_email), ' ', 1), ''),
    nullif(split_part(coalesce(v_email, ''), '@', 1), ''),
    left(gen_random_uuid()::text, 8)
  );

  insert into public.users (id, email, full_name, nickname, created_at, updated_at)
  values (
    new.id,
    coalesce(v_email, gen_random_uuid()::text),
    v_full_name,
    v_nickname,
    now(),
    now()
  )
  on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name),
      nickname = excluded.nickname,
      updated_at = now();

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists trigger_handle_new_auth_user on auth.users;
create trigger trigger_handle_new_auth_user
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

-- Row level security -----------------------------------------------------
alter table public.users enable row level security;
alter table public.user_settings enable row level security;
alter table public.lessons enable row level security;
alter table public.notes enable row level security;
alter table public.tests enable row level security;
alter table public.tests_content enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.media_assets enable row level security;

-- Users policies
drop policy if exists "Users select own profile" on public.users;
create policy "Users select own profile" on public.users
for select
using (id = auth.uid());

drop policy if exists "Users update own profile" on public.users;
create policy "Users update own profile" on public.users
for update
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "Service role manages users" on public.users;
create policy "Service role manages users" on public.users
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

-- User settings policies
drop policy if exists "Users manage own settings" on public.user_settings;
create policy "Users manage own settings" on public.user_settings
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Lessons and related content policies
drop policy if exists "Authenticated users read lessons" on public.lessons;
create policy "Authenticated users read lessons" on public.lessons
for select
using (is_active = true);

drop policy if exists "Authors manage lessons" on public.lessons;
create policy "Authors manage lessons" on public.lessons
for all
using (author_id = auth.uid())
with check (author_id = auth.uid());

-- Notes
drop policy if exists "Lesson content readable" on public.notes;
create policy "Lesson content readable" on public.notes
for select
using (true);

drop policy if exists "Lesson editors manage notes" on public.notes;
create policy "Lesson editors manage notes" on public.notes
for all
using (
  exists (
    select 1
    from public.lessons
    where public.lessons.id = notes.lesson_id
      and public.lessons.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lessons
    where public.lessons.id = notes.lesson_id
      and public.lessons.author_id = auth.uid()
  )
);

-- Tests
drop policy if exists "Lesson tests readable" on public.tests;
create policy "Lesson tests readable" on public.tests
for select
using (true);

drop policy if exists "Lesson editors manage tests" on public.tests;
create policy "Lesson editors manage tests" on public.tests
for all
using (
  exists (
    select 1
    from public.lessons
    where public.lessons.id = tests.lesson_id
      and public.lessons.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lessons
    where public.lessons.id = tests.lesson_id
      and public.lessons.author_id = auth.uid()
  )
);

-- Tests content
drop policy if exists "Lesson tests content readable" on public.tests_content;
create policy "Lesson tests content readable" on public.tests_content
for select
using (true);

drop policy if exists "Lesson editors manage tests content" on public.tests_content;
create policy "Lesson editors manage tests content" on public.tests_content
for all
using (
  exists (
    select 1
    from public.tests
    join public.lessons on public.lessons.id = public.tests.lesson_id
    where public.tests.id = tests_content.test_id
      and public.lessons.author_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.tests
    join public.lessons on public.lessons.id = public.tests.lesson_id
    where public.tests.id = tests_content.test_id
      and public.lessons.author_id = auth.uid()
  )
);

-- Chat sessions/messages
drop policy if exists "Users manage own chat sessions" on public.chat_sessions;
create policy "Users manage own chat sessions" on public.chat_sessions
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users manage own chat messages" on public.chat_messages;
create policy "Users manage own chat messages" on public.chat_messages
for all
using (
  chat_id in (select id from public.chat_sessions where user_id = auth.uid())
  or auth.role() = 'service_role'
)
with check (
  chat_id in (select id from public.chat_sessions where user_id = auth.uid())
  or auth.role() = 'service_role'
);

-- Practice sessions
drop policy if exists "Users manage own practice sessions" on public.practice_sessions;
create policy "Users manage own practice sessions" on public.practice_sessions
for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Media assets
drop policy if exists "Users access own media" on public.media_assets;
create policy "Users access own media" on public.media_assets
for all
using (
  owner_id is null or owner_id = auth.uid() or auth.role() = 'service_role'
)
with check (
  owner_id = auth.uid() or auth.role() = 'service_role'
);

-- Refresh helper for the materialized view --------------------------------
create or replace function public.refresh_practice_metrics_daily()
returns void
language sql
security definer
set search_path = public
as $$
refresh materialized view concurrently public.practice_metrics_daily;
$$;
