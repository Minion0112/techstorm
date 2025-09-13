-- Add form editing functionality
-- Make sure you run the base forms migration (013_add_forms_system.sql) first!

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
