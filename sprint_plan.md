# SignifyAI Rapid Build Plan

## Phase 0: Bootstrap & Environments

- Scaffold repos: `pnpm create vite`, install React 19, Tailwind, ShadCN, Zustand, React Query, React Router, Framer Motion.
- Initialize FastAPI microservice with Poetry, create `/inference` placeholder route returning mocked scores.
- Provision Supabase project, run `supabase_schema.sql`, configure service role secrets locally.
- Wire CI lint/test on push (ESLint, TypeScript, pytest) and deploy previews via Vercel/Fly.

## Phase 1: Authentication & Profiles

- Implement Supabase email/password + Google auth in frontend using Supabase JS v2.
- Subscribe to auth state, hydrate React Query cache, protect routes with layout guards.
- Verify trigger-created rows in `public.users`/`public.user_settings`, expose profile hook, allow nickname/theme edits.
- Seed initial lesson/test data via Supabase SQL seeds, confirm RLS with row-level queries and unit tests.

## Phase 2: Dashboard Skeleton & Data Plumbing

- Build dashboard shell: sidebar with Zustand state, XP bar, mode cards fed from React Query queries hitting Supabase PostgREST RPCs.
- Implement `/api/dashboard` FastAPI endpoint that aggregates practice/test metrics (mirrors `practice_metrics_daily`).
- Create settings page to toggle theme/assistive learning, persisting via Supabase patch and optimistic updates.
- Implement `increment_xp` RPC wrapper, add Cypress smoke test for onboarding → dashboard flow.

## Phase 3: Practice Engine Foundations

- Integrate WebRTC webcam capture component with MediaPipe Hands in a Web Worker, emit pose data to Zustand store.
- Call FastAPI `/inference` mock with recorded frames, display score/heatmap placeholder, log attempts into `public.practice_sessions`.
- Build lesson selector: query `public.lessons` by `lesson_type`, show completion badges using aggregated practice data.
- Implement materialized view refresh job via Supabase cron calling `refresh_practice_metrics_daily`.

## Phase 4: Freestyle & Tutor MVP

- Implement freestyle recorder with three-run playback, use mock inference to return ranked predictions, render animated confidence bars.
- Create Ask Tutor chat UI with streaming support (Supabase channel or SSE), persist sessions/messages, seed contextual prompt builder.
- Wire FastAPI stub to forward prompts to placeholder LLM (return canned responses), log interactions for future analytics.
- Add admin-only CLI script to ingest lessons/tests/media into Supabase storage + tables.

## Stabilization & Launch Readiness

- Optimize bundle (code-splitting practice modes, lazy-load MediaPipe worker), set up Sentry + Supabase logs dashboards.
- Harden RLS policies with integration tests, ensure 429 handling on inference and chat endpoints.
- Implement streak/badge computation in FastAPI + Supabase (scheduled job), surface UI badges.
- Execute end-to-end run-through: signup → dashboard → basic practice → freestyle → tutor, capture defects and ship fixes.

## Immediate Deliverables Checklist

- Authenticated React app with protected routes, theming, and persisted profiles.
- FastAPI service responding with mock inference/tutor payloads, ready for model drop-in.
- Supabase schema, triggers, RLS, and cron jobs deployed via `supabase_schema.sql`.
- Dashboard, practice, freestyle, and chat UIs wired to Supabase/FastAPI data sources with automated smoke tests.

---
Re-evaluate priorities after each phase, trim scope aggressively, and keep commits deployable so we can ship usable slices throughout the 36-hour burst.
