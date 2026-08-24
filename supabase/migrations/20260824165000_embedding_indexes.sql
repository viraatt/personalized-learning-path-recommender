-- Phase 5.1: add vector similarity index on courses.embedding.
-- pgvector extension is already enabled (init_schema). These indexes make the
-- Phase 6 similarity search fast. HNSW is the recommended index for <10k rows;
-- ivfflat is a lighter fallback. Both are created (HNSW is used first).

-- HNSW index for approximate nearest-neighbor search.
create index if not exists idx_courses_embedding_hnsw
  on courses using hnsw (embedding vector_cosine_ops);

-- GIN-style exclusion is not applicable; the above is sufficient. The
-- vector_cosine_ops operator class matches the cosine distance used in retrieval.