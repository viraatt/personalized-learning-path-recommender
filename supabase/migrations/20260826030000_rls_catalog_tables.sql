-- ============================================================
-- Security fix: Enable RLS on catalog tables
-- ============================================================
-- The `courses` and `prerequisites` tables are public read-only
-- catalog data. Edge functions write to them using the service
-- role key (which bypasses RLS), so client-side access is
-- restricted to SELECT only for authenticated users.
-- ============================================================

-- Enable Row Level Security
alter table courses       enable row level security;
alter table prerequisites enable row level security;

-- Allow authenticated users to read the full course catalog
create policy "Authenticated users can read courses"
  on courses for select
  to authenticated
  using (true);

-- Allow authenticated users to read prerequisite edges
create policy "Authenticated users can read prerequisites"
  on prerequisites for select
  to authenticated
  using (true);

-- No INSERT / UPDATE / DELETE policies are created for the
-- anonymous or authenticated roles, so only the service role
-- (used by edge functions and seeding scripts) can modify
-- catalog data. This closes the publicly accessible table
-- security advisory raised by Supabase.
