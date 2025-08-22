// FILE: src/routes/_layout.tsx

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { AppSidebar } from '@/components/AppSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useWorkoutStore } from '@/stores/workout-store';
import { useEffect } from 'react';

export const Route = createFileRoute('/_layout')({
  loader: async ({ location }) => {
    // We use getState() here because this is outside a React component
    const { checkUserSession, user, profile } = useAuthStore.getState();

    // The loader runs on every navigation within the layout.
    // If we already have a user, we don't need to check the session again.
    if (!user) {
      await checkUserSession();
    }
    
    // Re-check state after the async session check
    const refreshedState = useAuthStore.getState();

    // 1. If no user, redirect to login
    if (!refreshedState.user) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }

    // 2. If user exists but is not onboarded, redirect to onboarding
    if (!refreshedState.profile || !refreshedState.profile.onboarding_completed) {
      if (location.pathname !== '/onboarding') {
        throw redirect({ to: '/onboarding' });
      }
      return null; // Stay on onboarding page
    }

    // 3. NEW & CRITICAL: If the user is fully onboarded and is trying to
    //    access the root of the layout (`/`), redirect them to the dashboard.
    if (location.pathname === '/') {
        throw redirect({ to: '/dashboard' });
    }

    // If all checks pass, allow rendering the requested page
    return null;
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  // We use the hook here because this is a React component
  const isLoading = useAuthStore((state) => state.isLoading);
  
  const checkForActiveSession = useWorkoutStore((state) => state.checkForActiveSession);

   useEffect(() => {
    checkForActiveSession();
  }, [checkForActiveSession]);

  // We show a skeleton while the initial session check in the loader is running.
  // The loader will handle redirects before this component ever truly mounts.
  if (isLoading) {
    return <AppLoadingSkeleton />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AppSidebar />
      <main className='flex-1 overflow-y-auto px-6'>
        <Outlet />
      </main>
    </div>
  );
}

const AppLoadingSkeleton = () => (
  <div className="flex h-screen w-screen">
    <Skeleton className="h-full w-64" />
    <div className="flex-1 p-8">
      <Skeleton className="h-10 w-1/2 mb-8" />
      <Skeleton className="h-64 w-full" />
    </div>
  </div>
);