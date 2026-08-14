'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSessionProxy } from '@/hooks/use-session-proxy';

/**
 * Session Provider component
 * Handles routing based on session status via proxy API
 * Wraps the entire app to ensure auth checks happen on every route change
 */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { sessionStatus, isLoading } = useSessionProxy();

  // Handle initial route redirects based on session status
  useEffect(() => {
    if (isLoading || !sessionStatus) return;

    const isAuthPage = pathname === '/' || pathname?.startsWith('/auth');
    const isOnboardingPage = pathname === '/onboarding';
    const isCallbackPage = pathname?.startsWith('/auth/callback');

    // Skip redirects for callback pages
    if (isCallbackPage) return;

    if (sessionStatus.authenticated && sessionStatus.user) {
      // User is logged in
      if (sessionStatus.profileIncomplete && !isOnboardingPage) {
        // Redirect to onboarding if profile incomplete
        router.push('/onboarding');
      } else if (!sessionStatus.profileIncomplete && isAuthPage) {
        // Redirect to dashboard if profile complete and on auth pages
        router.push('/dashboard');
      }
    } else {
      // User is not logged in
      if (!isAuthPage && !isCallbackPage) {
        // Redirect to login if accessing protected route
        router.push('/');
      }
    }
  }, [sessionStatus, pathname, isLoading, router]);

  return children;
}
