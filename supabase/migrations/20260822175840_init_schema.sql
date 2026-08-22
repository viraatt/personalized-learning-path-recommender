-- Enable pgvector for embeddings (used in Phase 5)
create extension if not exists vector;

-- Sanity-check table to confirm migrations apply correctly
create table if not exists _connection_test (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now()
);