drop function if exists public.get_team_members(uuid);

create or replace function public.get_team_members(p_team_id uuid)
returns table (user_id uuid, display_name text, handle text, role text, is_signed_up_for_red_bull boolean)
language sql
security definer
as $$
  select p.id, p.display_name, p.handle, tm.role, p.is_signed_up_for_red_bull
  from public.team_members tm
  join public.profiles p on p.id = tm.user_id
  where tm.team_id = p_team_id;
$$;