// FILE: src/routes/_layout/explore/users/$userId.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useUserProfileDetailsQuery } from '@/api/user'; // Reusing the powerful hook from our User Manager

// shadcn/ui components
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';

// Icons
import { Dumbbell, Users, ChevronRight } from 'lucide-react';
import { PlanHistoryCard } from '@/components/new/PlanHistory';

// --- TanStack Router Route Definition ---
export const Route = createFileRoute('/_layout/explore/users/$userId/')({
  component: PublicProfilePage,
});


// --- The Main Page Component ---
function PublicProfilePage() {
  const { userId } = Route.useParams();
  const { data: profileData, isLoading, isError } = useUserProfileDetailsQuery(userId);

  if (isLoading) {
    return <PublicProfileSkeleton />;
  }

  if (isError || !profileData) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">User Not Found</h1>
        <p className="text-destructive">Could not load the profile for this user.</p>
      </div>
    );
  }

  const { profile, teams, active_plan } = profileData;

  // Aggregate all roles from the teams array for display
  const roles = teams ? [...new Set(teams.map(t => t.role))] : [];

  return (
    <div className="container max-w-4xl py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/explore/users">Users</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{profile.username}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Profile Info */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4 border-2">
                <AvatarImage src={profile.profile_image_url || ''} alt={profile.username} />
                <AvatarFallback>{profile.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {roles.map(role => (
                  <Badge key={role} variant={role === 'coach' || role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                    {role}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-sm text-center text-muted-foreground">{profile.bio || 'No bio provided.'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Dashboard Cards */}
        <div className="md:col-span-2 space-y-6">
          {/* Active Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle>Current Activity</CardTitle>
              <CardDescription>The user's most recently active training plan.</CardDescription>
            </CardHeader>
            <CardContent>
              {active_plan ? (
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                  <div>
                    <p className="font-semibold">{active_plan.plan_details.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Currently on: Week {active_plan.current_position.week}, Day {active_plan.current_position.day}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">This user has no publicly active plan.</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Teams Card */}
          <Card>
            <CardHeader>
              <CardTitle>Team Memberships</CardTitle>
              <CardDescription>Public teams this user is a member of.</CardDescription>
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
                  <p className="text-sm text-muted-foreground">Not a member of any public teams.</p>
                </div>
              )}
            </CardContent>
          </Card>
          <PlanHistoryCard userId={userId} />
        </div>
      </main>
    </div>
  );
}


// --- A skeleton component for a better loading experience ---
const PublicProfileSkeleton = () => (
  <div className="container max-w-4xl py-8">
    <Skeleton className="h-6 w-1/3 mb-6" />
    <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column Skeleton */}
      <div className="md:col-span-1">
        <Card>
            <CardContent className="pt-6 flex flex-col items-center">
                <Skeleton className="w-24 h-24 rounded-full mb-4" />
                <Skeleton className="h-7 w-40 mb-2" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-2 mt-4">
                    <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full mt-4" />
                <Skeleton className="h-4 w-5/6 mt-2" />
            </CardContent>
        </Card>
      </div>
      {/* Right Column Skeleton */}
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-16 w-full" />
          </CardContent>
        </Card>
      </div>
    </main>
  </div>
);