// FILE: src/routes/login/index.tsx

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Auth } from '@/components/Auth'; // Your Supabase Auth UI component
import { useAuthStore } from '@/stores/auth-store';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton'; // Assuming you have a Skeleton component

export const Route = createFileRoute('/login/')({
  component: LoginPage,
});

function LoginPage() {
  const { user, profile, isLoading } = useAuthStore(); // Get user, profile, and isLoading
  const navigate = useNavigate();

  // This useEffect ensures that if the user somehow lands on /login while authenticated,
  // or becomes authenticated while on /login, they are redirected to the dashboard or onboarding.
  useEffect(() => {
    if (isLoading) {
      // Do nothing while still checking auth status
      return;
    }

    if (user) {
      // If user is logged in
      if (profile?.onboarding_completed) {
        // If onboarding is complete, go to dashboard
        navigate({ to: '/' });
      } else {
        // If user is logged in but onboarding is NOT complete, go to onboarding
        navigate({ to: '/onboarding' });
      }
    }
  }, [user, profile, isLoading, navigate]); // Depend on user, profile, isLoading

  // Render a loading state while the authentication check is in progress.
  // This prevents rendering the <Auth /> component until we know the stable auth state.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted">
        <Skeleton className="h-64 w-96 rounded-lg" /> {/* Simple loading skeleton */}
      </div>
    );
  }

  // Only render the Auth component if isLoading is false AND there's no user.
  // This ensures the Auth UI doesn't try to re-initialize or do weird things
  // if a user is technically logged in but the state is still syncing.
  // Since the useEffect above will navigate if a user is found, this point means user is null.
  return <Auth />;
}