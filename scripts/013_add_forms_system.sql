-- Add forms system for team submissions
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
