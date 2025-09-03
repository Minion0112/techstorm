create or replace function public.finalize_team(p_team_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_owner_id uuid;
  v_female_count integer;
  v_member_count integer;
  v_redbull_signed_up_count integer;
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

  -- Check if all members have signed up for Red Bull
  select count(*)
  into v_redbull_signed_up_count
  from public.team_members tm
  join public.profiles p on tm.user_id = p.id
  where tm.team_id = p_team_id and p.is_signed_up_for_red_bull = true;

  if v_redbull_signed_up_count < v_member_count then
    raise exception 'All team members must complete the Red Bull sign up to finalize the team.' using errcode = 'P0006';
  end if;

  -- Finalize the team
  update public.teams
  set is_finalized = true
  where id = p_team_id;
end;
$$;