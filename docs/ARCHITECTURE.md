# Architecture

## Stack

| Layer | Choice |
|---|---|
| Frontend framework | Vite + React 18 + JavaScript (JSX, no TypeScript) |
| UI components | shadcn/ui + Radix UI |
| Styling | Tailwind CSS |
| Charts | Recharts |
| State management | Zustand (client state) + TanStack Query (server state/caching) |
| Backend/API | Supabase Edge Functions (Deno runtime, JavaScript) |
| Database | Supabase Postgres, with `pgvector` extension enabled |
| Auth | Supabase Auth (email/password) |
| LLM (chat, profiling, explanations, tutor) | Gemini 2.5 Flash, via Google AI Studio API key |
| Embeddings | Gemini `text-embedding-004`, same API key |
| Deployment (optional, buffer-phase only) | Netlify or Vercel (frontend) + Supabase (backend, already hosted) |

Single external credential required: `GEMINI_API_KEY`.

## Conventions

- No TypeScript — plain JS/JSX throughout, frontend and edge functions.
- Because there's no compile-time type checking, validate LLM JSON output at
  runtime before using it (simple shape checks, or `zod` if needed) —
  especially in profiling and path-generation functions, since malformed
  LLM output is the highest-risk failure point.
- Follow existing file/folder naming patterns once Phase 1 establishes them
  — don't introduce a new convention mid-project.
- Every edge function that calls the LLM goes through a single shared
  `aiProvider` module (see below) — never call the Gemini SDK directly from
  an individual function.
- Commit messages: conventional format, e.g.
  `feat(profiling): parse chat intake into structured profile JSON`,
  `fix(path): correct topological sort edge case`.

## AI Provider Abstraction

A single shared module (`supabase/functions/_shared/aiProvider.js`) wraps
all Gemini calls:

- `chat(messages, options)` — text/JSON generation (profiling, explanations,
  tutor responses). Use Gemini's structured-output/JSON-schema mode for
  anything that must return parseable JSON (profile extraction, explanation
  objects) rather than parsing free text.
- `embed(text)` — returns an embedding vector via `text-embedding-004`.
- Includes basic retry/backoff for Gemini's free-tier rate limits, added in
  Phase 1 setup, not deferred.

Every edge function imports and calls this module rather than reimplementing
API calls, so a provider or model swap later only touches one file.

## Folder Structure (target)

```
src/
  components/
    intake/         Chat/form intake UI
    path/            Path timeline, milestone display, step cards
    dashboard/       Skill chart, progress summary, next-action widget
    tutor/           Tutor chat widget
    ui/              shadcn/ui primitives
  hooks/
    profile/         Profile fetch/update hooks
    path/             Path fetch/regenerate hooks
    progress/         Progress tracking hooks
  lib/                Supabase client, shared helpers
  pages/              Route-level pages
  store/              Zustand stores
supabase/
  migrations/         SQL schema migrations
  functions/
    _shared/
      aiProvider.js    Gemini client wrapper (chat + embed)
      cors.js
    parse-profile/     Chat -> structured learner profile
    generate-path/      Retrieval + DAG sequencing -> ordered path
    explain-step/        Grounded per-step recommendation rationale
    tutor-chat/          Scoped Q&A on current path/profile
    update-progress/    Mark complete/rate -> mastery update -> path re-run
scripts/
  seed-catalog.js       Seeds courses + prerequisite edges
  embed-catalog.js       Generates + stores embeddings for catalog
docs/
  PROJECT_BRIEF.md
  SCOPE.md
  ARCHITECTURE.md
  PROGRESS.md
```

## Database Schema (summary)

- **courses** — id, title, description, domain, difficulty, duration,
  embedding (vector)
- **prerequisites** — course_id, prerequisite_course_id (edges of the DAG)
- **learner_profiles** — user_id, goals, experience_level, interests,
  completed_courses, raw_intake_text
- **skill_mastery** — user_id, skill_name, mastery_score, updated_at
- **learning_paths** — id, user_id, generated_at
- **path_steps** — path_id, course_id, order_index, milestone_group,
  status (pending/in_progress/complete), rationale_text

Row Level Security enabled on all user-facing tables (profiles, paths,
steps, mastery) so users only see their own data — mirrors the reference
project's pattern.

## Reuse Note

Edge function folder structure and the AI-provider-wrapper pattern are
based on the open-source AI Learning Path Generator by Enterprise DNA
(MIT licensed). Implementation is Gemini-based and independently written
for this project. See `docs/PROJECT_BRIEF.md` for full disclosure text.
