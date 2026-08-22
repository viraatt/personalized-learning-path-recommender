# Master Onboarding Prompt — Paste This First, Every New Agent Session

You are joining an in-progress solo hackathon project. You have NO memory of prior
sessions. Before writing or changing anything, you MUST orient yourself using the
files in this repo — they are your only source of truth about what has already
been decided and built.

## Step 1 — Read these files, in this order, before doing anything else

1. `docs/PROJECT_BRIEF.md` — the problem statement, required deliverables, and
   judging criteria. This defines what "done" means. Do not deviate from it.
2. `docs/SCOPE.md` — explicit IN-SCOPE and OUT-OF-SCOPE feature lists. Anything
   in OUT-OF-SCOPE must never be built, touched, or "improved" — even if you
   see related code in the repo (some was selectively copied from a reference
   project and deliberately left unused/stripped).
3. `docs/ARCHITECTURE.md` — tech stack, folder structure, DB schema summary,
   and naming/coding conventions already in use. Match existing patterns;
   do not introduce a new state library, styling approach, or folder
   convention without a strong reason stated back to the user.
4. `docs/PROGRESS.md` — a running log with one row per sub-phase: status
   (done / in progress / blocked), what was actually built, any deviations
   from plan, and open issues. This is the most important file — it tells
   you exactly where the last session left off.
5. `git log --oneline -20` — cross-check the commit history against
   PROGRESS.md to confirm they agree. If they don't agree, say so before
   proceeding.

## Step 2 — Confirm before acting

After reading, respond with a short summary (5-8 lines max) covering:
- What phase/sub-phase the project is currently on
- What was completed last session
- What you understand THIS session's task to be (wait for the user to paste
  the specific phase/sub-phase prompt if they haven't yet — do not guess
  and start building)

Do not start writing code until the user confirms or pastes the sub-phase
task prompt.

## Step 3 — Execute only the scoped sub-phase

- Build ONLY what the pasted sub-phase prompt asks for. Do not "helpfully"
  extend into the next sub-phase or touch out-of-scope features, even if
  it seems like a small addition.
- Follow existing conventions (see ARCHITECTURE.md) rather than introducing
  your own style.
- If something is genuinely ambiguous or blocking, ask ONE clarifying
  question. Otherwise, make the most reasonable assumption, implement it,
  and clearly flag the assumption in your summary and in PROGRESS.md.
- Keep changes tightly scoped so the resulting commit is reviewable and
  reversible on its own.

## Step 4 — Before ending the session

1. Run whatever build/typecheck commands the project uses (check
   ARCHITECTURE.md or package.json scripts) and confirm they pass.
2. Update `docs/PROGRESS.md`: mark the sub-phase done (or blocked, with why),
   note any deviations, list what the NEXT sub-phase should be.
3. Commit with a clear, conventional message describing what this session
   actually did (not the phase name verbatim — the real change), e.g.
   `feat(profiling): parse chat intake into structured learner profile JSON`.
4. Do not push/deploy unless explicitly asked — deployment is optional and
   handled as its own separate sub-phase.

## Hard rules (never break these)

- Never build features listed as OUT-OF-SCOPE in `docs/SCOPE.md`.
- Never restructure or rewrite working code from a prior sub-phase unless
  the current task explicitly asks you to.
- Never skip updating `docs/PROGRESS.md` — the next agent session depends
  on it entirely.
- If you inherited code selectively copied from a reference project,
  preserve the attribution note in `docs/ARCHITECTURE.md` — do not remove it.
- If credits/context are about to run out mid-task, stop at a clean point,
  commit what works, and leave detailed notes in PROGRESS.md on exactly
  what's half-done and what the next step is — don't leave broken code
  uncommitted.
