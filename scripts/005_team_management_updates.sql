-- Update create_team_with_owner to handle re-joining
create or replace function public.create_team_with_owner(p_name text)
returns public.teams
language plpgsql
security definer
as $$
declare
  v_team public.teams;
  v_join_code text;
  v_owned_team public.teams;
  v_is_member boolean;
begin
  -- Check if the user already owns a team
  select * into v_owned_team from public.teams where owner_id = auth.uid();

  if v_owned_team is not null then
    -- User owns a team. Check if they are a member.
    select exists(select 1 from public.team_members where team_id = v_owned_team.id and user_id = auth.uid()) into v_is_member;

    if v_is_member then
      -- User is already in the team they own. They can't create another.
      raise exception 'You already own a team.' using errcode = 'P0007';
    else
      -- User owns a team but is not a member. Re-join them.
      insert into public.team_members (team_id, user_id, role)
      values (v_owned_team.id, auth.uid(), 'owner');
      return v_owned_team;
    end if;
  end if;

  -- No team owned, create a new one.
  v_join_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  insert into public.teams (name, join_code, owner_id)
  values (p_name, v_join_code, auth.uid())
  returning * into v_team;

  insert into public.team_members (team_id, user_id, role)
  values (v_team.id, auth.uid(), 'owner');

  return v_team;
end;
$$;

-- Function to update team name
create or replace function public.update_team_name(p_team_id uuid, p_new_name text)
returns void
language plpgsql
security definer
as $$
declare
  v_owner_id uuid;
begin
  -- Check if user is the owner
  select owner_id into v_owner_id from public.teams where id = p_team_id;
  if v_owner_id is null or v_owner_id != auth.uid() then
    raise exception 'Only the team owner can edit the team name.' using errcode = 'P0008';
  end if;

  -- Update the team name
  update public.teams
  set name = p_new_name
  where id = p_team_id;
end;
$$;
