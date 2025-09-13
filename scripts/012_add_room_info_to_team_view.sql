-- Add room information to v_user_teams view
-- This allows displaying room number next to mentor name for finalized teams

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
  tm.role,
  r.name as room_name,
  r.building,
  r.floor,
  tra.assigned_at as room_assigned_at
from public.teams t
join public.team_members tm on tm.team_id = t.id
left join public.mentors m on t.mentor_id = m.id
left join public.team_room_assignments tra on tra.team_id = t.id
left join public.rooms r on r.id = tra.room_id
where tm.user_id = auth.uid();
