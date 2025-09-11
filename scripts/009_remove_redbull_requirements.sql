-- Remove Red Bull signup requirements from database functions

-- Update finalize_team function to remove Red Bull signup check
create or replace function public.finalize_team(p_team_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_owner_id uuid;
  v_female_count integer;
  v_member_count integer;
begin
  -- Check if user is the owner
  select owner_id into v_owner_id from public.teams where id = p_team_id;
  if v_owner_id is null or v_owner_id != auth.uid() then
    raise exception 'Only the team owner can finalize the team.' using errcode = 'P0001';
  end if;

  -- Check for member count
  select count(*) into v_member_count from public.team_members where team_id = p_team_id;
  if v_member_count < 1 or v_member_count > 5 then
      raise exception 'Team must have between 1 and 5 members to finalize.' using errcode = 'P0004';
  end if;

  -- Check for at least one female member
  select count(*)
  into v_female_count
  from public.team_members tm
  join public.profiles p on tm.user_id = p.id
  where tm.team_id = p_team_id and p.gender = 'female';

  if v_female_count < 1 then
    raise exception 'Team must have at least one female member to finalize.' using errcode = 'P0002';
  end if;

  -- Finalize the team (Red Bull signup check removed)
  update public.teams
  set is_finalized = true
  where id = p_team_id;
end;
$$;

-- Update get_team_members function to remove Red Bull field
drop function if exists public.get_team_members(uuid);

create or replace function public.get_team_members(p_team_id uuid)
returns table (user_id uuid, display_name text, handle text, role text)
language sql
security definer
as $$
  select p.id, p.display_name, p.handle, tm.role
  from public.team_members tm
  join public.profiles p on p.id = tm.user_id
  where tm.team_id = p_team_id;
$$;
