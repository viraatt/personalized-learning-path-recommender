# Progress Tracker

Every agent session must update this file before ending: mark status, note
what was actually built, flag deviations/assumptions, and state what the
next sub-phase should be. This file + `git log` are how a new agent session
(or a different agent tool) picks up the project with zero prior context.

**Status values**: Not started / In Progress / Blocked / Done

---

## Day 1 (Aug 22) — Foundation

### Phase 1: Repo & Environment
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 1.1 | Init repo, selective-copy shadcn/ui + ai-provider boilerplate, set folder structure | Done | |
| 1.2 | Supabase project created, `.env` configured | Done| |
| 1.3 | Apply trimmed base migrations, verify connection | Done | |

### Phase 2: Data Model
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 2.1 | Schema: `courses` + `prerequisites` tables/migration | Done| |
| 2.2 | Schema: `learner_profiles` + `skill_mastery` tables/migration | Done | |
| 2.3 | Seed script: catalog data (courses + prerequisite edges) | Done | `scripts/seed-catalog.js`: curated 13-course catalog (data-science, web-dev, cloud) + 14 prerequisite edges, idempotent insert/update by title, verified against linked Supabase. Assumption: reference repo has no transferable catalog, so content is ours. |

## Day 2 (Aug 23) — Profiling

### Phase 3: Chat Intake UI
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 3.1 | Chat/form component skeleton | Done | `src/components/intake/IntakeChat.jsx` single chat form (no wizard, per SCOPE), local message state only — no backend yet. Added `src/lib/utils.js` (`cn` helper). Replaced Vite boilerplate App.jsx; neutralized centered `#root` CSS. Build passes, oxlint clean. |
| 3.2 | Wire input to backend call (stubbed response first) | Done | Added `src/hooks/profile/submitIntake.js` calling `supabase.functions.invoke('parse-profile')`; stub edge function `supabase/functions/parse-profile/index.js` (+ `_shared/cors.js`) returns canned profile. `IntakeChat` now sends user message and shows parsed profile (or error). Deploy of function intentionally deferred to buffer (per SCOPE) — wiring verified via build + lint. |
| 3.3 | Loading/error UI states | Done | `IntakeChat` adds a `status` state (idle/loading/error/success): disabling form while loading, spinner "Parsing your profile…", styled error message + dismissible error banner (role=alert), retry via re-enable. Build + lint clean. |

### Phase 4: Profiling Logic
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 4.1 | Edge function: Gemini parses chat -> structured profile JSON | Done | Replaced stub in `supabase/functions/parse-profile/index.js` with real Gemini call via new shared `supabase/functions/_shared/ai.js` (REST chat + embed, retry/backoff, JSON-schema mode). Runtime shape validation (no TS). `completed_courses` returned as titles (strings) — mapped to UUIDs at persist (4.2). Deferred deploys; validated via node --check + stubbed-fetch smoke test of JSON path. |
| 4.2 | Persist profile to DB | Done | `parse-profile` now upserts into `learner_profiles` scoped to the caller's JWT (RLS) using new shared `_shared/supabase.js` (`createAuthedClient`). Maps `completed_courses` titles -> course UUIDs via service-role catalog lookup; unknown titles dropped. Returns `{ profile }` incl. `id`. Syntax-checked + oxlint clean. Deploy of functions deferred to buffer (per SCOPE). |
| 4.3 | Retrieve + display profile in UI, verify parsing accuracy | Done | Added `src/hooks/profile/getProfile.js` (reads `learner_profiles` via RLS) and `src/components/profile/ProfileDisplay.jsx` (goal, target role, experience, interests, completed courses). `IntakeChat` fetches saved profile on mount and shows the structured card after each parse (replacing the raw JSON blob). Build + lint clean. Live parity of LLM output pending function deploy (buffer). |

## Day 3 (Aug 24) — Recommendation Engine

### Phase 5: Embeddings
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 5.1 | Enable pgvector, add embedding column migration | Done | pgvector + `courses.embedding vector(768)` already existed from earlier migrations. Added `20260824165000_embedding_indexes.sql` with an HNSW index (`vector_cosine_ops`) on the embedding column for Phase 6 similarity search. Not applied to remote yet — `db push` needs live DB credentials (run in buffer/deploy step). |
| 5.2 | Script: generate embeddings for catalog courses (Gemini text-embedding-004) | Done | `scripts/embed-catalog.js`: fetches all courses, embeds a title+domain+difficulty+description+skills blob per course via Gemini REST, updates `courses.embedding` (service-role). Idempotent. Needs `GEMINI_API_KEY` in .env to run — not present locally yet (key lives as a Supabase secret), so live run deferred. Syntax + lint clean. |
| 5.3 | Function: embed learner goal text on demand | Done | `supabase/functions/embed-goal/index.js`: accepts `{ text }`, returns the 768-dim embedding via shared `_shared/ai.js` embed(). Consumed by Phase 6 retrieval. Syntax + lint clean; deploy deferred to buffer (per SCOPE). |

### Phase 6: Retrieval + Skill Gaps
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 6.1 | Similarity search function (top-N course matches) | Done | `match_courses(query_embedding, match_count)` Postgres RPC (cosine `<=>`, backed by HNSW index) in `20260824170000_match_courses_rpc.sql` with explicit grants. Edge function `retrieve-courses` embeds the goal via `ai.embed` and calls the RPC. RPC not yet applied to remote (`db push` needs credentials — buffer step). |
| 6.2 | Skill gap computation logic | Done | `_shared/skillGap.js` pure module: `computeSkillGap(targetSkills, existingSkills)` -> `{ gaps, covered, coverage }` (case-insensitive, deduped) + `collectCourseSkills(courses)`. Verified via stubbed node smoke test (dedup, case-insensitivity, coverage math, empty case). |
| 6.3 | Integration check: profile in -> ranked courses out | Done (static) | `retrieve-courses` ties it together: reads saved profile (RLS) + optional goal text -> embedding -> match_courses RPC -> skill gap vs. completed-course skills -> returns `{ matches, skillGap, profileUsed }`. Live end-to-end pending DB push + function deploy (buffer). Syntax + lint clean. |

## Day 4 (Aug 25) — Path Generator

### Phase 7: Graph Logic
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 7.1 | Prerequisite DAG structure + topological sort function | Done | `_shared/pathGraph.js`: `buildPrereqLookup` (courseId -> prereq ids) + `topoSort` (Kahn's algorithm; edges outside the path set treated as met; cycle-safe — logs a warning and appends stuck nodes rather than dropping them). |
| 7.2 | Merge retrieval results into DAG, resolve valid ordering | Done | `resolvePathOrder(catalog, matchedIds, edges, completedIds)`: drops completed matches, transitively pulls unmet catalog prerequisites, returns prerequisite-valid order with `source: 'matched'\|'prerequisite'` tags. Verified via node smoke test (ordering, filtering, pull-in, cycle fallback). |
| 7.3 | Milestone grouping logic (chunk path into checkpoints) | Done | `groupIntoMilestones(entries, groupSize=3)` -> 1-based `milestone_group`. Wired into new `generate-path` edge function: profile/goal -> embed -> match_courses RPC -> DAG ordering -> milestones -> JSON `{ path }` (persistence is 8.1). Syntax + lint clean; live run deferred to buffer deploys. |

### Phase 8: Path Persistence + UI
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 8.1 | Persist generated path/steps to DB | Not started | |
| 8.2 | Frontend: render path as timeline/list | Not started | |
| 8.3 | Frontend: milestone markers | Not started | |

## Day 5 (Aug 26) — Explainability, Tutor, Adaptive Loop

### Phase 9: Explainability
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 9.1 | Per-step grounded "why recommended" generation function | Not started | |
| 9.2 | Frontend: explanation card per step | Not started | |
| 9.3 | Sanity-check grounding on 5+ test profiles | Not started | |

### Phase 10: Tutor + Adaptive Loop
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 10.1 | Tutor chat function (scoped to path/profile context) + frontend widget | Not started | |
| 10.2 | Progress tracking UI (mark complete/rate) + DB writes | Not started | |
| 10.3 | Mastery update -> re-run path generator, verify visible re-sequencing | Not started | |

## Day 6 (Aug 27) — Dashboard + Packaging

### Phase 11: Dashboard
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 11.1 | Skill radar/bar chart wired to mastery data | Not started | |
| 11.2 | "Next recommended action" widget | Not started | |
| 11.3 | Full UI polish pass (loading/error/empty states across app) | Not started | |

### Phase 12: Packaging
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 12.1 | End-to-end manual QA, bug fixes | Not started | |
| 12.2 | Finalize README + docs/ files (all current) | Not started | |
| 12.3 | Clean ZIP export + final commit | Not started | |

---

## Buffer (Aug 28–30) — not phase-tracked here

No new core-scope sub-phases. Use for: bug fixes surfaced in QA, optional
deployment, demo video recording, solution doc (PDF/PPT) finalization.
Log any significant buffer-period work below as it happens.

| Date | What was done |
|---|---|
| | |

---

## Session Log

Add one entry per agent session, most recent first.

| Date | Sub-phase(s) worked | Agent/tool used | Outcome | Next step |
|---|---|---|---|---|
| Aug 24 | 7.1–7.3 (graph logic) | Cline (agent) | Added `_shared/pathGraph.js` (topoSort, resolvePathOrder, groupIntoMilestones — smoke-tested) + `generate-path` edge function returning ordered, milestone-grouped path JSON. Persistence next. | Phase 8: persist generated path to learning_paths/path_steps (8.1), then timeline UI (8.2–8.3). |
| Aug 24 | 6.1–6.3 (retrieval + skill gaps) | Cline (agent) | Added match_courses RPC migration, `_shared/skillGap.js` (smoke-tested), `retrieve-courses` edge function integrating profile->embedding->similarity->gaps. Live run deferred to buffer. | Day 4 / Phase 7: graph logic — topological sort over prerequisite DAG, merge retrieval results into DAG. |
| Aug 24 | 5.1–5.3 (embeddings) | Cline (agent) | Added HNSW index migration, `scripts/embed-catalog.js` (needs local GEMINI_API_KEY to run), and `embed-goal` edge function reusing `ai.embed`. Syntax + lint clean; live run/deploy deferred. | Phase 6: retrieval + skill gaps (similarity search over courses.embedding + skill-gap computation from profile). |
| Aug 24 | 4.3 (display profile) | Cline (agent) | Added getProfile hook + ProfileDisplay card; IntakeChat loads saved profile on mount and shows structured card after parse. Build + lint clean. | Day 3 / Phase 5: embeddings (pgvector column exists; add embed-catalog script + ai.embed via text-embedding-004). |
| Aug 24 | 4.2 (persist profile) | Cline (agent) | parse-profile upserts to learner_profiles (RLS-scoped via JWT) via new `_shared/supabase.js`; maps course titles->UUIDs. Syntax + lint clean. | Phase 4.3: retrieve + display profile in UI, verify parsing accuracy. |
| Aug 24 | 4.1 (real Gemini profiling) | Cline (agent) | Replaced stub parse-profile with Gemini call via new `_shared/ai.js`; JSON-schema mode + runtime validation. Validated via syntax check + stubbed smoke test. | Phase 4.2: persist parsed profile to `learner_profiles` (map completed_course titles -> course UUIDs). |
| Aug 24 | 3.3 (loading/error states) | Cline (agent) | Added status state + spinner + error banner + form disable to IntakeChat. Build + lint clean. | Phase 4.1: parse-profile edge function (real Gemini via _shared/aiProvider). |
| Aug 24 | 3.2 (backend wiring, stub) | Cline (agent) | Added `submitIntake` hook + stub `parse-profile` edge function + `_shared/cors.js`; wired IntakeChat. Build + lint clean. Function deploy deferred to buffer. | Phase 3.3: loading/error UI states. |
| Aug 24 | 3.1 (chat skeleton) | Cline (agent) | Added `IntakeChat.jsx` skeleton + `lib/utils.js` `cn` helper; replaced boilerplate app. Build + lint pass. | Phase 3.2: wire input to profiling backend call (stub first). |
| Aug 24 | 2.3 (seed script) | Cline (agent) | Built + ran `scripts/seed-catalog.js` (13 courses, 14 edges), verified persisted. Build passes. | Phase 3.1 was next. Note: 2.1/2.2 Done marks were pre-existing uncommitted edits (committed with 2.3). |
