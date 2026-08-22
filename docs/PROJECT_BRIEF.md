# Project Brief — AI-Powered Personalized Learning Path Recommender

## Problem Statement

Online learning platforms offer thousands of courses, but learners struggle to
find the right *sequence* of resources to reach a specific goal. Different
learners have different skill levels, interests, and preferences, so a
one-size-fits-all recommendation is ineffective. This project builds an
AI-powered assistant that understands a learner's profile, identifies skill
gaps, and generates a structured, explainable, adaptive learning roadmap.

## Required Deliverables (build scope)

1. **Conversational interface** — learner describes goals in natural language.
2. **Learner profiling engine** — captures interests, experience level,
   completed courses, objectives.
3. **Recommendation engine** — suggests relevant courses/projects/resources.
4. **Personalized path generator** — sequenced roadmap with prerequisites and
   milestones.
5. **Explainability + Q&A assistant** — explains *why* each recommendation was
   made, answers learner questions.
6. **Dashboard** — visualizes progress, skill development, milestones, next
   recommended actions.

## Submission Deliverables (packaging, due separately from build)

1. Source code ZIP (clean, no venv/build artifacts, with README)
2. GitHub repo link (accessible, real commit history)
3. Solution documentation (PDF/PPT): problem understanding, approach,
   architecture, AI/ML techniques, features, workflows, challenges
4. Demo video (3–5 minutes)
5. Deployed app URL (optional) or clear local setup instructions

## Judging Criteria (weights)

| Criterion | Weight |
|---|---|
| Problem Understanding & Solution Design | 20% |
| Functionality & Feature Completeness | 25% |
| AI/ML Implementation | 20% |
| Innovation & Creativity | 15% |
| User Experience & Interface | 10% |
| Performance & Code Quality | 10% |

**Implication for prioritization**: Functionality + AI/ML + Problem
Understanding = 65% of the score. Dashboard polish and deployment are real
but lower-weighted — never let them consume time owed to the core engine
(profiling → retrieval → path graph → explanation → adaptive loop).

## Timeline

- **Build window**: Aug 22 – Aug 27 (6 days), 12 phases / 36 sub-phases.
- **Buffer**: Aug 28 – Aug 30. No new core-scope features added here — only
  bug fixes, optional deployment, demo video, and final documentation.
- **Deadline**: Aug 30.

## Team

Solo build, agent-assisted (AI coding agents doing implementation work under
human direction). Occasional collaborator may take specific sub-phases if
available — see `docs/PROGRESS.md` for assignable, self-contained tasks.

## Reuse Disclosure

Architecture patterns (Supabase edge function structure, AI provider
abstraction pattern) were referenced from the open-source project
**AI Learning Path Generator** by Enterprise DNA
(github.com/Enterprise-DNA-OS/ai-learning-path-generator, MIT licensed).
Core recommendation logic, path-generation algorithm, explanation prompts,
and adaptive feedback loop are built independently for this project. This
disclosure must be carried into the final solution documentation.
