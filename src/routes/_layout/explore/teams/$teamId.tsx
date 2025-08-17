// FILE: /src/routes/_layout/explore/teams/$teamId.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useTeamDetailsQuery } from '@/api/team'; // We can reuse this hook
import type { Plan } from '@/types';
import type { TeamMemberWithProfile } from '@/types/team';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Icons
import { Users, Dumbbell, UserPlus, ArrowRight } from 'lucide-react';

export const Route = createFileRoute('/_layout/explore/teams/$teamId')({
  component: PublicTeamProfilePage,
});

function PublicTeamProfilePage() {
  const { teamId } = Route.useParams();
  const { data: details, isLoading, isError, error } = useTeamDetailsQuery(teamId);

  if (isLoading) {
    return <TeamDetailsSkeleton />;
  }

  if (isError || !details) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Team Not Found</h1>
        <p className="text-destructive">{error?.message || "The requested team could not be loaded."}</p>
      </div>
    );
  }

  const { team, members, plans } = details;

  // For a public page, we might only want to show coaches and admins
  const publicMembers = members?.filter(m => m.role === 'admin' || m.role === 'coach');

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row gap-6 items-start">
        <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center shrink-0">
          {team.logo_url ? (
            <img src={team.logo_url} alt={`${team.name} logo`} className="h-full w-full object-cover rounded-lg" />
          ) : (
            <Users className="h-16 w-16 text-muted-foreground" />
          )}
        </div>
        <div className="space-y-2 flex-grow">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">{team.name}</h1>
            </div>
            {/* The primary call to action on a public page */}
            <Button size="lg">
              <UserPlus className="mr-2 h-4 w-4" /> Join Team
            </Button>
          </div>
          <p className="text-lg text-muted-foreground">{team.description}</p>
        </div>
      </header>
      
      {/* Main Content Tabs */}
      <main>
        <Tabs defaultValue="plans">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
            <TabsTrigger value="plans">Public Plans</TabsTrigger>
            <TabsTrigger value="members">Coaches & Admins</TabsTrigger>
          </TabsList>
          <TabsContent value="plans" className="mt-6">
            <PlansTab plans={plans} />
          </TabsContent>
          <TabsContent value="members" className="mt-6">
            <MembersTab members={publicMembers} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// --- Tab Components ---

function PlansTab({ plans }: { plans: Plan[] | null }) {
  // On a public page, we should only show public plans
  const publicPlans = plans?.filter(p => !p.private);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Plans</CardTitle>
        <CardDescription>Public plans designed by this team's coaches.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {publicPlans && publicPlans.length > 0 ? (
          publicPlans.map(plan => (
            <Link key={plan.id} to="/plans/$planId" params={{ planId: plan.id }}>
              <div className="p-3 rounded-md hover:bg-muted transition-colors flex justify-between items-center">
                <div>
                  <p className="font-semibold">{plan.title}</p>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-6">This team has not published any public plans yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

function MembersTab({ members }: { members: TeamMemberWithProfile[] | undefined | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Leadership</CardTitle>
        <CardDescription>The coaches and administrators of this team.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {members && members.length > 0 ? (
          members.map(member => (
            <Link key={member.profile.id} to="/users/$userId" params={{ userId: member.profile.id }}>
              <div className="p-3 rounded-md hover:bg-muted transition-colors flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.profile.profile_image_url || undefined} alt={member.profile.full_name || 'Member'} />
                    <AvatarFallback>{(member.profile.full_name || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{member.profile.full_name}</p>
                    <p className="text-sm text-muted-foreground">@{member.profile.username}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="capitalize">{member.role}</Badge>
              </div>
            </Link>
          ))
        ) : (
          <p className="text-center text-muted-foreground py-6">This team has no public-facing coaches or admins.</p>
        )}
      </CardContent>
    </Card>
  );
}


// --- Skeleton Component ---

function TeamDetailsSkeleton() {
  return (
    <div className="container mx-auto py-8 animate-pulse">
      <header className="mb-8 flex flex-col md:flex-row gap-6 items-start">
        <Skeleton className="w-32 h-32 rounded-lg shrink-0" />
        <div className="space-y-3 flex-grow">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </header>
      <main>
        <div className="w-full md:w-[400px] flex gap-2 mb-6">
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-1/2" />
        </div>
        <Skeleton className="h-64 w-full" />
      </main>
    </div>
  );
}