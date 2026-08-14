-- Migration: Initialize complete schema with all updates
-- This migration combines all previous migrations (001-014)

-- ============================================================================
-- 001: Initial schema setup - Profiles, Teams, Team Members, and Functions
-- ============================================================================

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
  gender text,
  undertaking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Teams table
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  join_code text not null unique,
  owner_id uuid not null references auth.users(id) on delete cascade,
  is_finalized boolean not null default false,
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

-- Function to join team by code
create or replace function public.join_team_by_code(p_join_code text)
returns public.teams
language plpgsql
security definer
as $$
declare
  v_team public.teams;
  v_member_count integer;
begin
  select * into v_team from public.teams where join_code = upper(p_join_code);
  if not found then
    raise exception 'Team not found' using errcode = 'P0001';
  end if;

  if v_team.is_finalized then
    raise exception 'This team has been finalized and cannot be joined.' using errcode = 'P0003';
  end if;

  select count(*) into v_member_count from public.team_members where team_id = v_team.id;
  if v_member_count >= 5 then
      raise exception 'Team is already full.' using errcode = 'P0005';
  end if;

  insert into public.team_members (team_id, user_id, role)
  values (v_team.id, auth.uid(), 'member')
  on conflict (team_id, user_id) do nothing;

  return v_team;
end;
$$;

-- This trigger automatically creates a profile for new users.
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_profile_update()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to update updated_at on profile change
create trigger on_profile_update
  before update on public.profiles
  for each row
  execute procedure public.handle_profile_update();

-- Function to get team members
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

-- Function to leave a team
create or replace function public.leave_team(p_team_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  delete from public.team_members
  where team_id = p_team_id and user_id = auth.uid();
end;
$$;

-- Function to finalize a team
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

  -- Check for exactly 5 members
  select count(*) into v_member_count from public.team_members where team_id = p_team_id;
  if v_member_count != 5 then
      raise exception 'Team must have exactly 5 members to finalize.' using errcode = 'P0004';
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

  -- Finalize the team
  update public.teams
  set is_finalized = true
  where id = p_team_id;
end;
$$;

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
for insert with check (auth.uid() = id);

create policy "modify own profile" on public.profiles
for update using (auth.uid() = id);

-- Teams RLS: members can select; owners can update; any auth can insert via function
create policy "select teams for members" on public.teams
for select using (
  exists(select 1 from public.team_members tm where tm.team_id = id and tm.user_id = auth.uid())
);

create policy "update teams for owners" on public.teams
for update using (
  owner_id = auth.uid() and is_finalized = false
);

-- Team members RLS: user can view their memberships and memberships of teams they belong to; insert via functions
create policy "select team_members for team" on public.team_members
for select using (
  exists(select 1 from public.team_members tm where tm.team_id = team_id and tm.user_id = auth.uid())
);

-- Helpful view to list teams by membership
create or replace view public.v_user_teams as
select t.*, tm.role
from public.teams t
join public.team_members tm on tm.team_id = t.id
where tm.user_id = auth.uid();

-- ============================================================================
-- 002: Add Red Bull signup functionality
-- ============================================================================

-- Add is_signed_up_for_red_bull to profiles table
ALTER TABLE public.profiles
ADD COLUMN is_signed_up_for_red_bull BOOLEAN DEFAULT FALSE;

-- Create redbull_submissions table
CREATE TABLE IF NOT EXISTS public.redbull_submissions (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS for the new table
ALTER TABLE public.redbull_submissions ENABLE ROW LEVEL SECURITY;

-- RLS policies for redbull_submissions
CREATE POLICY "Users can insert their own submission"
ON public.redbull_submissions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own submission"
ON public.redbull_submissions
FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 006: Add second image to Red Bull submissions
-- ============================================================================

-- Add image_url_2 to redbull_submissions table
ALTER TABLE public.redbull_submissions
ADD COLUMN image_url_2 TEXT;

-- ============================================================================
-- 007: Add parent undertaking URL
-- ============================================================================

ALTER TABLE public.profiles
ADD COLUMN parent_undertaking_url TEXT;

-- ============================================================================
-- 008: Add mentors table and functionality
-- ============================================================================

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

-- Policy to allow users to see their team's mentor if the team is finalized.
create policy "Allow team members to see their assigned mentor"
on public.mentors for select
using (
  id in (
    select mentor_id from public.teams t
    join public.team_members tm on t.id = tm.team_id
    where tm.user_id = auth.uid() and t.is_finalized = true
  )
);

-- Update the view to include mentor name and room info
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

-- ============================================================================
-- 011: Add day scholar onboarding check functionality
-- ============================================================================

-- Function to check if a day scholar's onboarding is complete
-- Returns true if user is a day scholar with all required fields and undertaking file
create or replace function public.is_day_scholar_onboarding_complete(user_uuid uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 
    from public.profiles 
    where id = user_uuid
    and (is_hosteler = false or is_hosteler is null) -- Day scholar
    and undertaking_url is not null 
    and undertaking_url != '' -- Undertaking file exists
    and display_name is not null -- Basic profile fields
    and handle is not null
    and mobile is not null
    and registration_number is not null
    and gender is not null
  );
end;
$$;

-- Function to get detailed onboarding status for any user
create or replace function public.get_user_onboarding_status(user_uuid uuid)
returns table (
  user_id uuid,
  display_name text,
  is_hosteler boolean,
  undertaking_url text,
  parent_undertaking_url text,
  onboarding_status text,
  is_complete boolean,
  missing_fields text[]
)
language plpgsql
security definer
as $$
declare
  profile_record public.profiles%rowtype;
  missing_fields_array text[] := '{}';
  status_text text;
  is_complete_flag boolean := false;
begin
  -- Get the profile record
  select * into profile_record from public.profiles where id = user_uuid;
  
  if not found then
    return query select 
      user_uuid,
      null::text,
      null::boolean,
      null::text,
      null::text,
      'Profile not found'::text,
      false,
      array['profile']::text[];
    return;
  end if;
  
  -- Check for missing fields
  if profile_record.display_name is null then
    missing_fields_array := array_append(missing_fields_array, 'display_name');
  end if;
  
  if profile_record.handle is null then
    missing_fields_array := array_append(missing_fields_array, 'handle');
  end if;
  
  if profile_record.mobile is null then
    missing_fields_array := array_append(missing_fields_array, 'mobile');
  end if;
  
  if profile_record.registration_number is null then
    missing_fields_array := array_append(missing_fields_array, 'registration_number');
  end if;
  
  if profile_record.gender is null then
    missing_fields_array := array_append(missing_fields_array, 'gender');
  end if;
  
  -- Check undertaking requirements based on hosteler status
  if profile_record.is_hosteler = true then
    -- Hosteler - check parent undertaking
    if profile_record.parent_undertaking_url is null or profile_record.parent_undertaking_url = '' then
      missing_fields_array := array_append(missing_fields_array, 'parent_undertaking_url');
    end if;
    
    -- Check hostel details
    if profile_record.hostel_name is null then
      missing_fields_array := array_append(missing_fields_array, 'hostel_name');
    end if;
    
    if profile_record.room_no is null then
      missing_fields_array := array_append(missing_fields_array, 'room_no');
    end if;
    
    if array_length(missing_fields_array, 1) is null then
      status_text := 'Hosteler profile complete';
      is_complete_flag := true;
    else
      status_text := 'Hosteler profile incomplete';
    end if;
    
  else
    -- Day scholar - check undertaking
    if profile_record.undertaking_url is null or profile_record.undertaking_url = '' then
      missing_fields_array := array_append(missing_fields_array, 'undertaking_url');
    end if;
    
    if array_length(missing_fields_array, 1) is null then
      status_text := 'Day scholar profile complete';
      is_complete_flag := true;
    else
      status_text := 'Day scholar profile incomplete';
    end if;
  end if;
  
  return query select 
    profile_record.id,
    profile_record.display_name,
    profile_record.is_hosteler,
    profile_record.undertaking_url,
    profile_record.parent_undertaking_url,
    status_text,
    is_complete_flag,
    missing_fields_array;
end;
$$;

-- Create a view for easy profile status checking
create or replace view public.v_user_onboarding_status as
select 
  p.id as user_id,
  p.display_name,
  p.handle,
  p.mobile,
  p.registration_number,
  p.gender,
  p.is_hosteler,
  p.undertaking_url,
  p.parent_undertaking_url,
  p.hostel_name,
  p.room_no,
  case 
    when p.is_hosteler = true then
      case 
        when p.display_name is not null 
             and p.handle is not null
             and p.mobile is not null
             and p.registration_number is not null
             and p.gender is not null
             and p.parent_undertaking_url is not null
             and p.parent_undertaking_url != ''
             and p.hostel_name is not null
             and p.room_no is not null
        then true
        else false
      end
    else -- Day scholar
      case 
        when p.display_name is not null 
             and p.handle is not null
             and p.mobile is not null
             and p.registration_number is not null
             and p.gender is not null
             and p.undertaking_url is not null
             and p.undertaking_url != ''
        then true
        else false
      end
  end as is_onboarding_complete,
  case 
    when p.is_hosteler = true then 'hosteler'
    when p.is_hosteler = false then 'day_scholar'
    else 'unknown'
  end as student_type,
  p.created_at,
  p.updated_at
from public.profiles p;

-- Grant usage permissions
grant execute on function public.is_day_scholar_onboarding_complete(uuid) to authenticated;
grant execute on function public.get_user_onboarding_status(uuid) to authenticated;

-- RLS for the view - users can only see their own onboarding status
alter view public.v_user_onboarding_status owner to postgres;

create policy "Users can view their own onboarding status"
on public.profiles for select
using (auth.uid() = id);

-- ============================================================================
-- 013: Add forms system for team submissions
-- ============================================================================

-- Forms table to store form definitions with JSON fields
CREATE TABLE public.forms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT false,
  is_locked boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  created_by uuid REFERENCES auth.users(id),
  CONSTRAINT forms_pkey PRIMARY KEY (id)
);

-- Form submissions table to track team submissions
CREATE TABLE public.form_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  form_id uuid NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  submitted_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  submitted_at timestamp with time zone NOT NULL DEFAULT now(),
  submitted_by uuid NOT NULL REFERENCES auth.users(id),
  CONSTRAINT form_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT form_submissions_unique_team_form UNIQUE (form_id, team_id)
);

-- RLS Policies
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

-- Forms policies: Anyone can read active forms, only authenticated users can see
CREATE POLICY "read_active_forms" ON public.forms
FOR SELECT USING (is_active = true AND auth.uid() IS NOT NULL);

-- Form submissions policies: Users can read their team's submissions
CREATE POLICY "read_team_submissions" ON public.form_submissions
FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = form_submissions.team_id 
    AND tm.user_id = auth.uid()
  )
);

-- Users can insert submissions for their team
CREATE POLICY "insert_team_submissions" ON public.form_submissions
FOR INSERT WITH CHECK (
  EXISTS(
    SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = form_submissions.team_id 
    AND tm.user_id = auth.uid()
  )
  AND submitted_by = auth.uid()
);

-- Function to check if team can submit to a form
CREATE OR REPLACE FUNCTION public.can_team_submit_form(p_form_id uuid, p_team_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  v_form_exists boolean;
  v_form_active boolean;
  v_form_locked boolean;
  v_has_submission boolean;
  v_user_in_team boolean;
BEGIN
  -- Check if user is in the team
  SELECT EXISTS(
    SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = p_team_id AND tm.user_id = auth.uid()
  ) INTO v_user_in_team;
  
  IF NOT v_user_in_team THEN
    RETURN false;
  END IF;

  -- Check form status
  SELECT 
    true,
    is_active,
    is_locked
  INTO 
    v_form_exists,
    v_form_active,
    v_form_locked
  FROM public.forms 
  WHERE id = p_form_id;

  IF NOT v_form_exists OR NOT v_form_active OR v_form_locked THEN
    RETURN false;
  END IF;

  -- Check if team already has a submission
  SELECT EXISTS(
    SELECT 1 FROM public.form_submissions fs 
    WHERE fs.form_id = p_form_id AND fs.team_id = p_team_id
  ) INTO v_has_submission;

  RETURN NOT v_has_submission;
END;
$$;

-- Function to submit form data
CREATE OR REPLACE FUNCTION public.submit_form(
  p_form_id uuid, 
  p_team_id uuid, 
  p_submission_data jsonb
)
RETURNS public.form_submissions
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  v_submission public.form_submissions;
BEGIN
  -- Check if team can submit
  IF NOT public.can_team_submit_form(p_form_id, p_team_id) THEN
    RAISE EXCEPTION 'Team cannot submit to this form' USING errcode = 'P0009';
  END IF;

  -- Insert submission
  INSERT INTO public.form_submissions (form_id, team_id, submitted_data, submitted_by)
  VALUES (p_form_id, p_team_id, p_submission_data, auth.uid())
  RETURNING * INTO v_submission;

  RETURN v_submission;
END;
$$;

-- Function to get forms available to user's team
CREATE OR REPLACE FUNCTION public.get_available_forms(p_team_id uuid)
RETURNS TABLE(
  id uuid,
  title text,
  description text,
  fields jsonb,
  is_locked boolean,
  has_submission boolean,
  submission_id uuid,
  submitted_at timestamptz
)
LANGUAGE plpgsql
SECURITY definer
AS $$
BEGIN
  -- Check if user is in the team
  IF NOT EXISTS(
    SELECT 1 FROM public.team_members tm 
    WHERE tm.team_id = p_team_id AND tm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User not in team' USING errcode = 'P0010';
  END IF;

  RETURN QUERY
  SELECT 
    f.id,
    f.title,
    f.description,
    f.fields,
    f.is_locked,
    fs.id IS NOT NULL as has_submission,
    fs.id as submission_id,
    fs.submitted_at
  FROM public.forms f
  LEFT JOIN public.form_submissions fs ON fs.form_id = f.id AND fs.team_id = p_team_id
  WHERE f.is_active = true
  ORDER BY f.created_at DESC;
END;
$$;

-- Function to update an existing form submission
CREATE OR REPLACE FUNCTION public.update_form_submission(
  p_submission_id uuid,
  p_submission_data jsonb
)
RETURNS public.form_submissions
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  v_submission public.form_submissions;
  v_user_id uuid;
BEGIN
  -- Get the user who submitted originally
  SELECT submitted_by INTO v_user_id
  FROM public.form_submissions
  WHERE id = p_submission_id;

  -- Check if current user is the original submitter or team owner
  IF v_user_id != auth.uid() THEN
    -- Check if user is team owner
    IF NOT EXISTS(
      SELECT 1 FROM public.team_members tm
      JOIN public.teams t ON t.id = tm.team_id
      WHERE tm.team_id = (
        SELECT team_id FROM public.form_submissions WHERE id = p_submission_id
      )
      AND tm.user_id = auth.uid()
      AND t.owner_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Only the original submitter or team owner can edit submissions' USING errcode = 'P0011';
    END IF;
  END IF;

  -- Update the submission
  UPDATE public.form_submissions
  SET submitted_data = p_submission_data,
      submitted_at = now()
  WHERE id = p_submission_id
  RETURNING * INTO v_submission;

  RETURN v_submission;
END;
$$;

-- Function to get form submission details for editing
CREATE OR REPLACE FUNCTION public.get_form_submission_for_edit(p_form_id uuid, p_team_id uuid)
RETURNS TABLE(
  submission_id uuid,
  submitted_data jsonb,
  submitted_at timestamptz,
  submitted_by uuid,
  can_edit boolean
)
LANGUAGE plpgsql
SECURITY definer
AS $$
DECLARE
  v_user_id uuid;
  v_team_owner uuid;
BEGIN
  -- Check if user is in the team
  IF NOT EXISTS(
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = p_team_id AND tm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'User not in team' USING errcode = 'P0010';
  END IF;

  -- Get team owner
  SELECT owner_id INTO v_team_owner
  FROM public.teams
  WHERE id = p_team_id;

  -- Get submission data
  RETURN QUERY
  SELECT
    fs.id as submission_id,
    fs.submitted_data,
    fs.submitted_at,
    fs.submitted_by,
    (fs.submitted_by = auth.uid() OR v_team_owner = auth.uid()) as can_edit
  FROM public.form_submissions fs
  WHERE fs.form_id = p_form_id AND fs.team_id = p_team_id;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_forms_active ON public.forms(is_active) WHERE is_active = true;
CREATE INDEX idx_form_submissions_form_team ON public.form_submissions(form_id, team_id);
CREATE INDEX idx_form_submissions_team ON public.form_submissions(team_id);

-- Sample form data (optional - for testing)
INSERT INTO public.forms (title, description, fields, is_active, is_locked) VALUES (
  'Team Project Proposal',
  'Submit your team''s project proposal for the hackathon',
  '[
    {
      "id": "project_name",
      "type": "text",
      "label": "Project Name",
      "required": true,
      "placeholder": "Enter your project name"
    },
    {
      "id": "description",
      "type": "textarea",
      "label": "Project Description",
      "required": true,
      "placeholder": "Describe your project in detail"
    },
    {
      "id": "tech_stack",
      "type": "text",
      "label": "Technology Stack",
      "required": true,
      "placeholder": "e.g., React, Node.js, MongoDB"
    },
    {
      "id": "github_repo",
      "type": "url",
      "label": "GitHub Repository",
      "required": false,
      "placeholder": "https://github.com/username/repo"
    }
  ]'::jsonb,
  true,
  false
);
