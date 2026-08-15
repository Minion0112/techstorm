import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface SessionStatus {
  authenticated: boolean;
  profileIncomplete: boolean;
  isHosteler: boolean;
  user: {
    id: string;
    email: string;
  } | null;
}

/**
 * Hook to proxy session checking through API
 * Handles routing logic based on authentication and onboarding status
 */
export function useSessionProxy() {
  const router = useRouter();
  const pathname = usePathname();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/session');
      const data = await response.json();
      
      setSessionStatus(data);

      // Routing logic based on session status
      if (data.authenticated && data.user) {
        // User is logged in
        if (data.profileIncomplete && pathname !== '/onboarding') {
          // Redirect to onboarding if profile incomplete
          router.push('/onboarding');
        } else if (!data.profileIncomplete && (pathname === '/onboarding' || pathname === '/')) {
          // Redirect to dashboard if profile complete and on auth pages
          router.push('/dashboard');
        }
      } else {
        // User is not logged in
        if (pathname !== '/' && !pathname.startsWith('/auth')) {
          // Redirect to login if accessing protected route
          router.push('/');
        }
      }
    } catch (error) {
      console.error('Failed to check session via proxy:', error);
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    checkSession();
    // Recheck session periodically (every 5 minutes)
    const interval = setInterval(checkSession, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkSession]);

  return {
    sessionStatus,
    isLoading,
    checkSession,
  };
}
