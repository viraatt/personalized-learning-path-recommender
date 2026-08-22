# Scope Boundaries

Any agent working on this project must treat this file as a hard boundary.
If a feature is not listed under IN-SCOPE, do not build it — even if it
seems small, related, or already partially present in copied reference code.

## IN-SCOPE

- Chat/form-based intake for learner goals, interests, experience level
- LLM-based parsing of intake into a structured learner profile (JSON)
- Course/skill catalog with prerequisite relationships (seeded data)
- Embedding-based retrieval of relevant courses (Gemini `text-embedding-004`
  + pgvector similarity search)
- Skill-gap computation (target skills vs. profile skills)
- Prerequisite-DAG-based path sequencing (topological sort) with milestone
  grouping
- Per-recommendation explanation generation, grounded in the learner's
  actual profile facts
- Tutor-style Q&A chat scoped to the current path/profile context
- Progress tracking (mark step complete, rate a course)
- Mastery-score updates from progress/feedback, triggering path re-sequencing
- Dashboard: profile summary, skill radar/bar chart, path timeline, next
  recommended action
- Basic auth (Supabase email/password) if needed for per-user persistence
- README, architecture doc, ZIP packaging

## OUT-OF-SCOPE (explicitly excluded — do not build)

- Text-to-speech / audio narration
- Podcast mode
- Presentation/slide mode
- Realtime voice / WebRTC voice tutor
- Mental-model image generation (Replicate or any image model)
- Public community feed / auto-generated daily topics
- Multi-step onboarding "wizard" UI (use a single simple form/chat instead)
- Admin panels / topic generation utilities
- Any second LLM/embedding provider beyond Gemini (no OpenAI, no OpenRouter,
  no multi-provider fallback chains)
- Dark mode / theme switching
- Any deployment work before Phase 12 is complete (deployment is optional
  and lives entirely in the buffer period, Aug 28–30)

## If in doubt

If a sub-phase prompt seems to imply something on the OUT-OF-SCOPE list,
stop and ask the user rather than building it. If reference-repo code
touching an out-of-scope feature is encountered while copying files, leave
it out entirely rather than copying and disabling it.
