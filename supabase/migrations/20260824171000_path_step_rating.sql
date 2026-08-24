-- Phase 10.2: allow learners to rate a course step (1-5).
alter table path_steps
  add column if not exists rating integer
    check (rating >= 1 and rating <= 5);