// FILE: src/routes/_layout/profile/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
// Import all necessary hooks at the top of the component
import { useCurrentUserQuery, useUserProfileDetailsQuery, useUserMeasurementsQuery } from '@/api/user';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from 'sonner';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge'; // Make sure Badge is imported if used in My Teams section

// Icons
import { User, Activity, Ruler, Edit } from 'lucide-react';
import { MiniMeasurementGraph } from '@/components/new/measurements/MiniMeasurementGraph';
import { Breadcrumb } from '@/components/new/TopNavigation';


export const Route = createFileRoute('/_layout/profile/')({
  component: ProfilePage,
});

function ProfilePage() {
  const { user: authUser } = useAuthStore(); // Get the ID of the currently authenticated user

  // --- Call all hooks unconditionally at the top level ---
  const { data: profile, isLoading: isLoadingProfile, isError: isProfileError, error: profileError } = useCurrentUserQuery();
  const { data: userDetails, isLoading: isLoadingDetails, isError: isDetailsError, error: detailsError } = useUserProfileDetailsQuery(authUser?.id);
  const { data: measurements, isLoading: isLoadingMeasurements, isError: isMeasurementsError, error: measurementsError } = useUserMeasurementsQuery(authUser?.id);


  // Overall loading state: if any key data is loading, show skeleton
  const overallLoading = isLoadingProfile || isLoadingDetails || isLoadingMeasurements;
  const overallError = isProfileError || isDetailsError || isMeasurementsError;
  const anyError = profileError || detailsError || measurementsError;

  if (overallLoading) {
    return <ProfilePageSkeleton />;
  }
  if (overallError || !profile || !userDetails) {
    const errorMessage = anyError?.message || "Profile not found.";
    toast.error(`Failed to load profile: ${errorMessage}`);
    return (
      <div className="container mx-auto py-8 text-destructive text-center">
        Error loading profile: {errorMessage}
      </div>
    );
  }

  const { username, full_name, bio, profile_image_url, email, unit } = profile;
  const { teams } = userDetails;

  return (
    <div className="">
      <Breadcrumb currentPath={location.pathname} />
      {/* Profile Header */}
      <header className="space-y-4">
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-2">
            <AvatarImage src={profile_image_url || undefined} alt={`${full_name || username}'s profile`} />
            <AvatarFallback className="text-4xl">{(full_name || username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter">{full_name || username}</h1>
            <p className="text-muted-foreground text-lg">{username}</p>
            {email && <p className="text-muted-foreground text-sm">{email}</p>}
          </div>
        </div>
        <p className="text-lg text-muted-foreground">{bio || "No bio yet."}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <User className="h-4 w-4" />
          <span>Preferred Unit: <span className="capitalize">{unit || 'Metric'}</span></span>
        </div>
        <Button variant="outline" className="mt-4">
          <Edit className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      </header>

      <Separator />

      {/* Navigation Cards to Sub-pages */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5 text-primary" /> Performance History</CardTitle>
            <CardDescription>Review your workout data, progress, and personal records.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/profile/performance">View Performance</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Body Measurements Card with Mini Graph */}
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Ruler className="h-5 w-5 text-green-500" /> Body Measurements</CardTitle>
            <CardDescription>Track your physical changes over time with detailed measurements.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Display Mini Graph Here */}
            {measurements && measurements.length > 0 ? (
              <MiniMeasurementGraph measurements={measurements} />
            ) : (
              <div className="text-muted-foreground text-xs text-center py-4">
                No measurements to graph yet.
              </div>
            )}
            <Button asChild variant="secondary" className="w-full">
              <Link to="/profile/measurements">View Measurements</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* My Teams (from userDetails) */}
      {teams && teams.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold tracking-tight mb-4">My Teams</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teams.map(teamMembership => (
              <Card key={teamMembership.team.id} className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{teamMembership.team.name}</h3>
                  <Badge variant="outline" className="capitalize">{teamMembership.role}</Badge>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/workspace/$teamId" params={{ teamId: teamMembership.team.id }}>
                    Go to Team
                  </Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// --- Skeleton Component (Adjusted for Mini Graph) ---
function ProfilePageSkeleton() {
  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-8">
      <header className="space-y-4">
        <div className="flex items-center gap-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-10 w-32 mt-4" />
      </header>

      <Separator />

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card><CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader><CardContent><Skeleton className="h-10 w-full" /></CardContent></Card>
        {/* Skeleton for the Measurements Card with Mini Graph */}
        <Card>
          <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-[100px] w-full" /> {/* Skeleton for the graph */}
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section>
        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-4 flex items-center justify-between">
              <div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20 mt-1" />
              </div>
              <Skeleton className="h-8 w-24" />
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}