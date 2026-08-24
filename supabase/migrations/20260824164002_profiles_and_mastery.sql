-- Learner profiles
create table if not exists learner_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  raw_intake_text text,
  goals text,
  experience_level text check (experience_level in ('beginner', 'intermediate', 'advanced')),
  interests text[] default '{}',
  completed_courses uuid[] default '{}',
  target_role text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Per-skill mastery tracking, updated by the adaptive feedback loop
create table if not exists skill_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  skill_name text not null,
  mastery_score numeric default 0 check (mastery_score >= 0 and mastery_score <= 100),
  updated_at timestamptz default now(),
  unique (user_id, skill_name)
);

-- Enable Row Level Security — each user only sees their own data
alter table learner_profiles enable row level security;
alter table skill_mastery enable row level security;

create policy "Users manage their own profile"
  on learner_profiles for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage their own mastery scores"
  on skill_mastery for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);