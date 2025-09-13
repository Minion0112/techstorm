-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.mentors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT mentors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  display_name text,
  handle text UNIQUE,
  mobile text,
  registration_number text,
  is_hosteler boolean,
  hostel_name text,
  room_no text,
  gender text,
  undertaking_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  is_signed_up_for_red_bull boolean DEFAULT false,
  parent_undertaking_url text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.redbull_submissions (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  image_url_2 text,
  CONSTRAINT redbull_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT redbull_submissions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  capacity integer NOT NULL DEFAULT 1 CHECK (capacity > 0),
  location text,
  building text,
  floor text,
  room_type text DEFAULT 'meeting_room'::text,
  amenities ARRAY,
  is_available boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone,
  CONSTRAINT rooms_pkey PRIMARY KEY (id)
);
CREATE TABLE public.team_members (
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member'::text,
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (team_id, user_id),
  CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  join_code text NOT NULL UNIQUE,
  owner_id uuid NOT NULL,
  is_finalized boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  mentor_id uuid,
  mentor_assigned_at timestamp with time zone,
  room_id uuid,
  room_assigned_at timestamp with time zone,
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id),
  CONSTRAINT teams_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentors(id),
  CONSTRAINT teams_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);

-- Day scholar onboarding check functions
CREATE OR REPLACE FUNCTION public.is_day_scholar_onboarding_complete(user_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = user_uuid
    AND (is_hosteler = false OR is_hosteler IS NULL) -- Day scholar
    AND undertaking_url IS NOT NULL 
    AND undertaking_url != '' -- Undertaking file exists
    AND display_name IS NOT NULL -- Basic profile fields
    AND handle IS NOT NULL
    AND mobile IS NOT NULL
    AND registration_number IS NOT NULL
    AND gender IS NOT NULL
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_onboarding_status(user_uuid uuid)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  is_hosteler boolean,
  undertaking_url text,
  parent_undertaking_url text,
  onboarding_status text,
  is_complete boolean,
  missing_fields text[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_record public.profiles%ROWTYPE;
  missing_fields_array text[] := '{}';
  status_text text;
  is_complete_flag boolean := false;
BEGIN
  -- Get the profile record
  SELECT * INTO profile_record FROM public.profiles WHERE id = user_uuid;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      user_uuid,
      null::text,
      null::boolean,
      null::text,
      null::text,
      'Profile not found'::text,
      false,
      ARRAY['profile']::text[];
    RETURN;
  END IF;
  
  -- Check for missing fields
  IF profile_record.display_name IS NULL THEN
    missing_fields_array := array_append(missing_fields_array, 'display_name');
  END IF;
  
  IF profile_record.handle IS NULL THEN
    missing_fields_array := array_append(missing_fields_array, 'handle');
  END IF;
  
  IF profile_record.mobile IS NULL THEN
    missing_fields_array := array_append(missing_fields_array, 'mobile');
  END IF;
  
  IF profile_record.registration_number IS NULL THEN
    missing_fields_array := array_append(missing_fields_array, 'registration_number');
  END IF;
  
  IF profile_record.gender IS NULL THEN
    missing_fields_array := array_append(missing_fields_array, 'gender');
  END IF;
  
  -- Check undertaking requirements based on hosteler status
  IF profile_record.is_hosteler = true THEN
    -- Hosteler - check parent undertaking
    IF profile_record.parent_undertaking_url IS NULL OR profile_record.parent_undertaking_url = '' THEN
      missing_fields_array := array_append(missing_fields_array, 'parent_undertaking_url');
    END IF;
    
    -- Check hostel details
    IF profile_record.hostel_name IS NULL THEN
      missing_fields_array := array_append(missing_fields_array, 'hostel_name');
    END IF;
    
    IF profile_record.room_no IS NULL THEN
      missing_fields_array := array_append(missing_fields_array, 'room_no');
    END IF;
    
    IF array_length(missing_fields_array, 1) IS NULL THEN
      status_text := 'Hosteler profile complete';
      is_complete_flag := true;
    ELSE
      status_text := 'Hosteler profile incomplete';
    END IF;
    
  ELSE
    -- Day scholar - check undertaking
    IF profile_record.undertaking_url IS NULL OR profile_record.undertaking_url = '' THEN
      missing_fields_array := array_append(missing_fields_array, 'undertaking_url');
    END IF;
    
    IF array_length(missing_fields_array, 1) IS NULL THEN
      status_text := 'Day scholar profile complete';
      is_complete_flag := true;
    ELSE
      status_text := 'Day scholar profile incomplete';
    END IF;
  END IF;
  
  RETURN QUERY SELECT 
    profile_record.id,
    profile_record.display_name,
    profile_record.is_hosteler,
    profile_record.undertaking_url,
    profile_record.parent_undertaking_url,
    status_text,
    is_complete_flag,
    missing_fields_array;
END;
$$;