create table if not exists learning_paths (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  generated_at timestamptz default now()
);

create table if not exists path_steps (
  id uuid primary key default gen_random_uuid(),
  path_id uuid references learning_paths(id) on delete cascade,
  course_id uuid references courses(id),
  order_index int not null,
  milestone_group int,
  status text default 'pending' check (status in ('pending', 'in_progress', 'complete')),
  rationale_text text,
  created_at timestamptz default now()
);

alter table learning_paths enable row level security;
alter table path_steps enable row level security;

create policy "Users manage their own paths"
  on learning_paths for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage steps of their own paths"
  on path_steps for all
  using (exists (select 1 from learning_paths where learning_paths.id = path_steps.path_id and learning_paths.user_id = auth.uid()));