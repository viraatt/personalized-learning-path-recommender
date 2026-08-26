-- Add lightweight support for projects and assessments as catalog resource types.
-- Reuses existing courses table, embeddings, and DAG pipeline.

ALTER TABLE courses ADD COLUMN IF NOT EXISTS resource_type text NOT NULL DEFAULT 'course' CHECK (resource_type IN ('course','project','assessment'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS deliverable text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS pass_criteria text;

CREATE INDEX IF NOT EXISTS idx_courses_resource_type ON courses(resource_type);

-- Update match_courses function to return resource_type, deliverable, and pass_criteria
create or replace function match_courses(
  query_embedding vector(768),
  match_count integer default 10
)
returns table (
  id uuid,
  title text,
  description text,
  domain text,
  difficulty text,
  duration_hours numeric,
  skills text[],
  resource_type text,
  deliverable text,
  pass_criteria text,
  similarity double precision
)
language sql
stable
set search_path = public, extensions
as $$
  select
    c.id,
    c.title,
    c.description,
    c.domain,
    c.difficulty,
    c.duration_hours,
    c.skills,
    c.resource_type,
    c.deliverable,
    c.pass_criteria,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.courses c
  where c.embedding is not null
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

grant execute on function match_courses(vector(768), integer)
  to anon, authenticated, service_role;
