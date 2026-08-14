import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

/**
 * Proxy function for Next.js 16
 * Handles authentication cookie refresh and delegates routing to /api/auth/session proxy API
 * This replaces the deprecated middleware.ts pattern
 */
export async function proxy(request: NextRequest) {
  const { response } = createClient(request);

  // Proxy only refreshes auth session cookies
  // All routing logic is delegated to the client-side SessionProvider + /api/auth/session API
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (handled by route handlers)
     * - anything with a dot (static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*?).*)',
  ],
};
