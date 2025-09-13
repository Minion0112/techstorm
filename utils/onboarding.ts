import { createClient } from '@/utils/supabase/server'

export interface OnboardingCheckResult {
  isComplete: boolean
  isDayScholar: boolean
  isHosteler: boolean
  status: string
  missingFields: string[]
}

/**
 * Server-side function to check if a user's onboarding is complete
 * Uses the custom SQL function we created
 */
export async function checkUserOnboardingStatus(userId: string): Promise<OnboardingCheckResult> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .rpc('get_user_onboarding_status', { user_uuid: userId })

    if (error) {
      console.error('Error checking onboarding status:', error)
      // Fall back to basic check if function fails
      const { data: profile } = await supabase
        .from('profiles')
        .select('handle, is_hosteler')
        .eq('id', userId)
        .single()

      return {
        isComplete: !!(profile?.handle),
        isDayScholar: profile?.is_hosteler === false || profile?.is_hosteler === null,
        isHosteler: profile?.is_hosteler === true,
        status: profile?.handle ? 'Basic profile complete' : 'Profile incomplete',
        missingFields: profile?.handle ? [] : ['handle']
      }
    }

    if (data && data.length > 0) {
      const status = data[0]
      return {
        isComplete: status.is_complete,
        isDayScholar: status.is_hosteler === false || status.is_hosteler === null,
        isHosteler: status.is_hosteler === true,
        status: status.onboarding_status,
        missingFields: status.missing_fields || []
      }
    }

    return {
      isComplete: false,
      isDayScholar: true,
      isHosteler: false,
      status: 'Profile not found',
      missingFields: ['profile']
    }
  } catch (error) {
    console.error('Error in checkUserOnboardingStatus:', error)
    return {
      isComplete: false,
      isDayScholar: true,
      isHosteler: false,
      status: 'Error checking profile',
      missingFields: ['unknown']
    }
  }
}

/**
 * Server-side function to check if a day scholar's onboarding is complete
 */
export async function isDayScholarOnboardingComplete(userId: string): Promise<boolean> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .rpc('is_day_scholar_onboarding_complete', { user_uuid: userId })

    if (error) {
      console.error('Error checking day scholar status:', error)
      return false
    }

    return data === true
  } catch (error) {
    console.error('Error in isDayScholarOnboardingComplete:', error)
    return false
  }
}

/**
 * Middleware helper to check onboarding status
 */
export async function getOnboardingRedirect(userId: string, currentPath: string): Promise<string | null> {
  const status = await checkUserOnboardingStatus(userId)
  
  // If profile is incomplete and not on onboarding page, redirect to onboarding
  if (!status.isComplete && currentPath !== '/onboarding') {
    return '/onboarding'
  }
  
  // If profile is complete and on onboarding page, redirect to dashboard
  if (status.isComplete && currentPath === '/onboarding') {
    return '/dashboard'
  }
  
  return null
}
