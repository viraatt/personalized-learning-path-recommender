-- ============================================================
-- User Profiles table: stores display name & email for
-- each authenticated user. Auto-populated by trigger on signup.
-- ============================================================

create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- Enable RLS — each user can only read and write their own row
alter table profiles enable row level security;

create policy "Users can view their own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Allow insert only via the trigger (service role) — not from the client
create policy "Service role can insert profiles"
  on profiles for insert
  to service_role
  with check (true);

-- ============================================================
-- Trigger: auto-create a profile row on new user signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;  -- safe to re-run if migration applied twice
  return new;
end;
$$;

-- Drop trigger if it already exists (safe for re-runs)
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Back-fill: create profile rows for any existing users
-- ============================================================
insert into public.profiles (id, email, full_name)
select
  id,
  email,
  coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do nothing;
