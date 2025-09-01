import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // If the user is logged in
  if (session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('handle')
      .eq('id', session.user.id)
      .single();

    const profileIncomplete = !profile || !profile.handle;

    // If profile is incomplete, and user is not on onboarding page, redirect to onboarding
    if (profileIncomplete && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // If profile is complete, and user is on onboarding or login page, redirect to dashboard
    if (!profileIncomplete && (pathname === '/onboarding' || pathname === '/')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } else { // User is not logged in
      // If trying to access a protected route that is not the login page, redirect to login
      if (pathname !== '/') {
        return NextResponse.redirect(new URL('/', request.url));
      }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|auth/callback|auth/auth-code-error).*)',
  ],
};
