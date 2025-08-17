// FILE: /src/routes/_layout.tsx

import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { useAuthStore } from '@/stores/auth-store';
import { useWorkoutStore } from '@/stores/workout-store'; // Import the unified workout store
import { AppSidebar } from '@/components/AppSidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { useEffect } from 'react';

export const Route = createFileRoute('/_layout/')({
  loader: async ({ location }) => {
    const { checkUserSession, user, profile } = useAuthStore.getState();

    if (!user) {
      await checkUserSession();
    }
    
    const refreshedState = useAuthStore.getState();

    if (!refreshedState.user) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }

    if (!refreshedState.profile || !refreshedState.profile.onboarding_completed) {
      if (location.pathname !== '/onboarding') {
        throw redirect({ to: '/onboarding' });
      }
    }
    
    // Redirect from the base authenticated route to the dashboard
    if (location.pathname === '/_layout' || location.pathname === '/_layout/') {
        throw redirect({ to: '/dashboard' });
    }

    return null;
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkGlobalActiveSession = useWorkoutStore((state) => state.checkGlobalActiveSession);

  // This useEffect will run ONLY ONCE when the layout first mounts.
  useEffect(() => {
    checkGlobalActiveSession();
  }, [checkGlobalActiveSession]);


  if (isLoading) {
    return <AppLoadingSkeleton />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <AppSidebar />
      <main className='flex-1 overflow-y-auto'>
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