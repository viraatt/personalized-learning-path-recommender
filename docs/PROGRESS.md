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
| 1.1 | Init repo, selective-copy shadcn/ui + ai-provider boilerplate, set folder structure | Not started | |
| 1.2 | Supabase project created, `.env` configured | Not started | |
| 1.3 | Apply trimmed base migrations, verify connection | Not started | |

### Phase 2: Data Model
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 2.1 | Schema: `courses` + `prerequisites` tables/migration | Not started | |
| 2.2 | Schema: `learner_profiles` + `skill_mastery` tables/migration | Not started | |
| 2.3 | Seed script: catalog data (courses + prerequisite edges) | Not started | |

## Day 2 (Aug 23) — Profiling

### Phase 3: Chat Intake UI
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 3.1 | Chat/form component skeleton | Not started | |
| 3.2 | Wire input to backend call (stubbed response first) | Not started | |
| 3.3 | Loading/error UI states | Not started | |

### Phase 4: Profiling Logic
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 4.1 | Edge function: Gemini parses chat -> structured profile JSON | Not started | |
| 4.2 | Persist profile to DB | Not started | |
| 4.3 | Retrieve + display profile in UI, verify parsing accuracy | Not started | |

## Day 3 (Aug 24) — Recommendation Engine

### Phase 5: Embeddings
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 5.1 | Enable pgvector, add embedding column migration | Not started | |
| 5.2 | Script: generate embeddings for catalog courses (Gemini text-embedding-004) | Not started | |
| 5.3 | Function: embed learner goal text on demand | Not started | |

### Phase 6: Retrieval + Skill Gaps
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 6.1 | Similarity search function (top-N course matches) | Not started | |
| 6.2 | Skill gap computation logic | Not started | |
| 6.3 | Integration check: profile in -> ranked courses out | Not started | |

## Day 4 (Aug 25) — Path Generator

### Phase 7: Graph Logic
| # | Sub-phase | Status | Notes |
|---|---|---|---|
| 7.1 | Prerequisite DAG structure + topological sort function | Not started | |
| 7.2 | Merge retrieval results into DAG, resolve valid ordering | Not started | |
| 7.3 | Milestone grouping logic (chunk path into checkpoints) | Not started | |

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
| | | | | |
