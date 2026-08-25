# AI-Powered Personalized Learning Path Recommender

An AI-powered assistant that understands a learner's goals, interests, and
experience level, identifies skill gaps, and generates a structured,
explainable, adaptive learning roadmap — built for [Hackathon Name].

See `docs/PROJECT_BRIEF.md` for the full problem statement, deliverables,
and judging criteria.

## Features

- Conversational intake — describe your learning goals in plain English
- Learner profiling engine — captures interests, experience level,
  completed courses, and objectives
- AI-powered recommendation engine — retrieves relevant courses via
  semantic search over a curated course/skill catalog
- Personalized path generator — sequences recommendations using a
  prerequisite graph, with milestones
- Explainability — every recommendation comes with a grounded rationale
  tied to your actual profile
- Tutor Q&A — ask "why this" or "why not that" about your path
- Adaptive feedback loop — mark progress or rate a course, and the
  remaining path re-sequences based on updated skill mastery
- Dashboard — profile summary, skill progress chart, path timeline,
  next recommended action

See `docs/SCOPE.md` for what is explicitly in and out of scope.

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Vite + React 19 + JavaScript |
| UI | shadcn/ui (Radix UI) + Tailwind CSS |
| Charts | Recharts |
| State | Local React state (no global store needed) |
| Backend | Supabase Edge Functions (Deno) |
| Database | Supabase Postgres + pgvector |
| Auth | Supabase Auth |
| LLM + Embeddings | Google Gemini Flash + `gemini-embedding-001` (768-dim) |

Full architecture details in `docs/ARCHITECTURE.md`.

## Prerequisites

- Node.js 18+ and npm
- A free [Supabase](https://supabase.com) account and project
- A free [Google AI Studio](https://aistudio.google.com) API key (for Gemini)
- The [Supabase CLI](https://supabase.com/docs/guides/cli) (`npm install -g supabase`)

## Local Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/<your-username>/personalized-learning-path-recommender.git
   cd personalized-learning-path-recommender
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in `.env` with your Supabase project values (Dashboard → Settings → API):

   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_...
   ```

4. **Link the Supabase CLI to your project**

   ```bash
   npx supabase login
   npx supabase link --project-ref your-project-ref
   ```

5. **Apply database migrations**

   ```bash
   npx supabase db push
   ```

6. **Set your Gemini API key as a Supabase secret** (used by edge functions)

   ```bash
   npx supabase secrets set GEMINI_API_KEY=your-gemini-key
   ```

7. **Deploy edge functions to your Supabase project**

   ```bash
   npx supabase functions deploy
   ```

8. **Run the frontend locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173).

## Project Structure

```
src/
  components/    UI components (intake, path, profile, dashboard, tutor)
  hooks/         Data hooks (profile, path, progress, tutor)
  lib/           Supabase client, shared helpers
supabase/
  migrations/    SQL schema migrations
  functions/     Edge functions (profiling, retrieval, path generation,
                 explanation, tutor chat, progress updates)
scripts/         Catalog seeding and embedding generation scripts
docs/            Project brief, scope, architecture, progress tracker
```

Full breakdown in `docs/ARCHITECTURE.md`.

## Seeding the Course Catalog

```bash
node scripts/seed-catalog.js
node scripts/embed-catalog.js
```

(Run after migrations are applied — populates the `courses` table and
generates embeddings for semantic search.)

## End-to-End QA

With all migrations applied, functions deployed, and the catalog seeded +
embedded, run:

```bash
node scripts/qa-e2e.js
```

This creates a throwaway test user, signs in, and exercises every edge
function (`parse-profile` → `generate-path` → `explain-step` → `tutor-chat`
→ `retrieve-courses`) with pass/fail checks. Note: on the Gemini free tier,
the daily request quota is small — if you see `Gemini API returned 429`,
wait for the quota reset and re-run.

## Development Notes

This project was built solo, agent-assisted, over a 6-day sprint
(Aug 22–27). See `docs/PROGRESS.md` for the full phase-by-phase build log
and commit history for development progression.

Architecture patterns (edge function structure, AI provider abstraction)
were referenced from the open-source
[AI Learning Path Generator](https://github.com/Enterprise-DNA-OS/ai-learning-path-generator)
by Enterprise DNA (MIT licensed). Core recommendation logic, path-generation
algorithm, explanation prompts, and the adaptive feedback loop were built
independently for this project.

## License

MIT