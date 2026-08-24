-- Courses / catalog items
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  domain text not null,              -- e.g. 'data-science', 'web-dev', 'cloud'
  difficulty text not null check (difficulty in ('beginner', 'intermediate', 'advanced')),
  duration_hours numeric,
  skills text[] default '{}',        -- skills this course teaches, e.g. {'python','pandas'}
  embedding vector(768),             -- populated in Phase 5, Gemini text-embedding-004
  created_at timestamptz default now()
);

-- Prerequisite edges (DAG): course_id requires prerequisite_course_id first
create table if not exists prerequisites (
  course_id uuid references courses(id) on delete cascade,
  prerequisite_course_id uuid references courses(id) on delete cascade,
  primary key (course_id, prerequisite_course_id),
  check (course_id <> prerequisite_course_id)
);

create index if not exists idx_courses_domain on courses(domain);
create index if not exists idx_prerequisites_course on prerequisites(course_id);