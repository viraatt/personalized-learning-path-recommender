-- ============================================================
-- Add username (unique) to profiles & update trigger
-- ============================================================

alter table profiles
  add column if not exists username text unique;

-- Index for fast username lookups
create unique index if not exists idx_profiles_username on profiles(username);

-- Update the trigger to also capture username from metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_username text;
  v_full_name text;
  v_avatar_url text;
begin
  v_full_name  := coalesce(new.raw_user_meta_data->>'full_name',  split_part(new.email, '@', 1));
  v_username   := coalesce(new.raw_user_meta_data->>'username',   split_part(new.email, '@', 1));
  -- Default avatar: DiceBear Avataaars generated from username (no upload needed)
  v_avatar_url := coalesce(
    new.raw_user_meta_data->>'avatar_url',
    'https://api.dicebear.com/9.x/avataaars/svg?seed=' || v_username
  );

  insert into public.profiles (id, email, full_name, username, avatar_url)
  values (new.id, new.email, v_full_name, v_username, v_avatar_url)
  on conflict (id) do update
    set full_name  = excluded.full_name,
        username   = excluded.username,
        avatar_url = excluded.avatar_url,
        updated_at = now();

  return new;
end;
$$;

-- Re-create trigger (it was already created in the previous migration)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Back-fill existing users with a default avatar & username
update public.profiles
set
  username   = coalesce(username, split_part(email, '@', 1)),
  avatar_url = coalesce(avatar_url, 'https://api.dicebear.com/9.x/avataaars/svg?seed=' || coalesce(username, split_part(email, '@', 1)))
where username is null or avatar_url is null;
