import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Proxy API route for session and onboarding status checking
 * This centralizes the authentication logic previously in middleware
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          profileIncomplete: false,
          isHosteler: false,
          user: null,
        },
        { status: 200 }
      );
    }

    // Check comprehensive onboarding status using custom function
    let profileIncomplete = true;
    let isHosteler = false;

    try {
      const { data: onboardingStatus, error } = await supabase.rpc(
        'get_user_onboarding_status',
        { user_uuid: session.user.id }
      );

      if (error) {
        console.error('Error checking onboarding status:', error);
        // Fall back to basic handle check
        const { data: profile } = await supabase
          .from('profiles')
          .select('handle, is_hosteler')
          .eq('id', session.user.id)
          .single();

        profileIncomplete = !profile || !profile.handle;
        isHosteler = profile?.is_hosteler === true;
      } else if (onboardingStatus && onboardingStatus.length > 0) {
        profileIncomplete = !onboardingStatus[0].is_complete;
        isHosteler = onboardingStatus[0].is_hosteler === true;
      }
    } catch (error) {
      console.error('Error in session proxy:', error);
      return NextResponse.json(
        { error: 'Failed to check session status' },
        { status: 500 }
      );
    }

    // Skip onboarding for hostelers
    if (isHosteler) {
      profileIncomplete = false;
    }

    return NextResponse.json(
      {
        authenticated: true,
        profileIncomplete,
        isHosteler,
        user: {
          id: session.user.id,
          email: session.user.email,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Session proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
