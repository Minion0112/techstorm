-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  handle text unique,
  mobile text,
  registration_number text,
  is_hosteler boolean,
  hostel_name text,
  room_no text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Teams table
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Team members junction
create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (team_id, user_id)
);

-- Function to create team and add owner as admin
create or replace function public.create_team_with_owner(p_name text)
returns public.teams
language plpgsql
security definer
as $
declare
  v_team public.teams;
  v_join_code text;
begin
  -- simple 6-char uppercase code
  v_join_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  insert into public.teams (name, join_code, owner_id)
  values (p_name, v_join_code, auth.uid())
  returning * into v_team;

  insert into public.team_members (team_id, user_id, role)
  values (v_team.id, auth.uid(), 'owner');

  return v_team;
end $;

-- Function to join team by code
create or replace function public.join_team_by_code(p_join_code text)
returns public.teams
language plpgsql
security definer
as $
declare
  v_team public.teams;
begin
  select * into v_team from public.teams where join_code = upper(p_join_code);
  if not found then
    raise exception 'Team not found' using errcode = 'P0001';
  end if;

  insert into public.team_members (team_id, user_id, role)
  values (v_team.id, auth.uid(), 'member')
  on conflict (team_id, user_id) do nothing;

  return v_team;
end $;

-- This trigger automatically creates a profile for new users.
create function public.handle_new_user()
returns trigger as $
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_profile_update()
returns trigger as $
begin
  new.updated_at = now();
  return new;
end;
$ language plpgsql security definer;

-- Trigger to update updated_at on profile change
create trigger on_profile_update
  before update on public.profiles
  for each row
  execute procedure public.handle_profile_update();

-- Realtime (Supabase) is enabled per table by default; ensure replica identity
alter table public.team_members replica identity full;

-- RLS
alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;

-- Profiles RLS: owner can read/write own profile, others can read handles/display_name
create policy "read profiles" on public.profiles
for select using (true);

create policy "update own profile" on public.profiles
for insert with check (auth.uid() = id)
;

create policy "modify own profile" on public.profiles
for update using (auth.uid() = id);

-- Teams RLS: members can select; owners can update; any auth can insert via function
create policy "select teams for members" on public.teams
for select using (
  exists(select 1 from public.team_members tm where tm.team_id = id and tm.user_id = auth.uid())
);

-- Team members RLS: user can view their memberships and memberships of teams they belong to; insert via functions
create policy "select team_members for team" on public.team_members
for select using (
  exists(select 1 from public.team_members tm where tm.team_id = team_id and tm.user_id = auth.uid())
);

-- Helpful view to list teams by membership (optional)
create or replace view public.v_user_teams as
select t.*, tm.role
from public.teams t
join public.team_members tm on tm.team_id = t.id
where tm.user_id = auth.uid();
