// FILE: src/routes/_layout/profile.tsx
// Make sure you have `lucide-react` installed: `npm install lucide-react`

import { createFileRoute, Link } from '@tanstack/react-router';
import { useUserProfileDetailsQuery } from '@/api/user';
import { useAuthStore } from '@/stores/auth-store';

// shadcn/ui components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Icons
import { Settings, ChevronRight, Dumbbell, Users } from 'lucide-react';

// --- TanStack Router Route Definition ---
export const Route = createFileRoute('/_layout/profile/')({
  component: MyProfilePage,
});


// --- The Main Page Component ---
function MyProfilePage() {
  // 1. Get the current user directly from our Zustand store
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const userId = user?.id;

  // 2. Fetch the detailed profile data using the user's ID
  // The 'enabled' option handles the case where the user is still loading.
  const { data: profileData, isLoading: isProfileLoading, isError } = useUserProfileDetailsQuery(userId);

  // Combine loading states for a seamless experience
  const isLoading = isAuthLoading || isProfileLoading;

  if (isLoading) {
    return <ProfilePageSkeleton />;
  }

  if (isError || !profileData) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Error</h1>
        <p className="text-destructive">Could not load your profile data.</p>
      </div>
    );
  }

  const { profile, teams, active_plan } = profileData;

  return (
    <div className="container max-w-4xl py-8">
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 border-2">
              <AvatarImage src={profile.profile_image_url || ''} alt={profile.username} />
              <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            <p className="mt-4 text-sm text-center">{profile.bio || 'No bio provided.'}</p>
          </div>
          <Button asChild className="w-full">
            <Link to="/profile">
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile & Settings
            </Link>
          </Button>
        </div>

        {/* Right Column: Dashboard Cards */}
        <div className="md:col-span-2 space-y-6">
          {/* Active Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle>Active Plan</CardTitle>
              <CardDescription>Your current training focus.</CardDescription>
            </CardHeader>
            <CardContent>
              {active_plan ? (
                <Link
                  to="/profile" // This could link to a dedicated plan page later
                  className="flex items-center justify-between p-4 rounded-lg bg-muted transition-colors hover:bg-accent"
                >
                  <div>
                    <p className="font-semibold">{active_plan.plan_details.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Current Position: Week {active_plan.current_position.week}, Day {active_plan.current_position.day}
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Link>
              ) : (
                <div className="text-center py-4">
                  <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No active plan found.</p>
                  <Button variant="link" asChild className="mt-1">
                    <Link to="/explore">Explore Plans</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Teams Card */}
          <Card>
            <CardHeader>
              <CardTitle>My Teams</CardTitle>
              <CardDescription>Teams you are a member of.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {teams && teams.length > 0 ? (
                teams.map(({ team, role }) => (
                  <Link
                    key={team.id}
                    to="/explore/teams/$teamId"
                    params={{ teamId: team.id }}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted transition-colors hover:bg-accent"
                  >
                    <div>
                      <p className="font-semibold">{team.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{role}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </Link>
                ))
              ) : (
                 <div className="text-center py-4">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">You are not a member of any teams.</p>
                  <Button variant="link" asChild className="mt-1">
                    <Link to="/explore">Explore Teams</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}


// --- A skeleton component for a better loading experience ---
const ProfilePageSkeleton = () => (
  <div className="container max-w-4xl py-8">
    <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column Skeleton */}
      <div className="md:col-span-1 space-y-6 flex flex-col items-center">
        <Skeleton className="w-24 h-24 rounded-full" />
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-full mt-4" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full" />
      </div>
      {/* Right Column Skeleton */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
);