-- Add day scholar onboarding completion check functionality

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
