-- Phase 6.1: similarity search over the course catalog.
-- Cosine distance via pgvector (<=>); HNSW index backs this (see
-- 20260824165000_embedding_indexes.sql).
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
    1 - (c.embedding <=> query_embedding) as similarity
  from public.courses c
  where c.embedding is not null
  order by c.embedding <=> query_embedding
  limit greatest(match_count, 1);
$$;

-- Explicit grants so PostgREST exposes the RPC to all API roles regardless of
-- the project's auto-expose setting.
grant execute on function match_courses(vector(768), integer)
  to anon, authenticated, service_role;