-- Mentor table to store mentor information
create table if not exists public.mentors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Add mentor_id and assignment timestamp to teams table
alter table public.teams
add column mentor_id uuid references public.mentors(id) on delete set null;

alter table public.teams
add column mentor_assigned_at timestamptz;

-- RLS for mentors table
alter table public.mentors enable row level security;

-- Policy to allow users to see their team''s mentor if the team is finalized.
create policy "Allow team members to see their assigned mentor"
on public.mentors for select
using (
  id in (
    select mentor_id from public.teams t
    join public.team_members tm on t.id = tm.team_id
    where tm.user_id = auth.uid() and t.is_finalized = true
  )
);

-- Update the view to include mentor name
drop view if exists public.v_user_teams;
create or replace view public.v_user_teams as
select
  t.id,
  t.name,
  t.join_code,
  t.owner_id,
  t.is_finalized,
  t.created_at,
  t.mentor_id,
  m.name as mentor_name,
  t.mentor_assigned_at,
  tm.role
from public.teams t
join public.team_members tm on tm.team_id = t.id
left join public.mentors m on t.mentor_id = m.id
where tm.user_id = auth.uid();
