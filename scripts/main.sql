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
CREATE TABLE public.team_room_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  room_id uuid NOT NULL,
  assigned_at timestamp with time zone NOT NULL DEFAULT now(),
  assigned_by uuid,
  CONSTRAINT team_room_assignments_pkey PRIMARY KEY (id),
  CONSTRAINT team_room_assignments_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_room_assignments_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
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
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id),
  CONSTRAINT teams_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.mentors(id)
);