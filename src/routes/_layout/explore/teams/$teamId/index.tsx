// FILE: src/routes/_layout/teams/$teamId.tsx

import { useMemo } from 'react'; // Import useMemo for performance
import { createFileRoute, Link } from '@tanstack/react-router';
import { useTeamDetailsQuery } from '@/api/team';
import type { TeamMemberWithProfile } from '@/types/team/index';

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
import { Button } from '@/components/ui/button';

// Icons
import { Users, Dumbbell, ChevronRight, PlusCircle, ShieldCheck } from 'lucide-react';
import { MemberListCard } from '@/components/new/MemberListCard ';

// --- TanStack Router Route Definition ---
export const Route = createFileRoute('/_layout/explore/teams/$teamId/')({
  component: TeamDetailPage,
});


// --- The Main Page Component ---
function TeamDetailPage() {
  const { teamId } = Route.useParams();
  const { data: teamDetails, isLoading, isError } = useTeamDetailsQuery(teamId);

  // **NEW**: Filter the members list into two separate groups for display.
  // We use useMemo to prevent re-calculating this on every render.
  const coachingStaff = useMemo(
    () => teamDetails?.members?.filter(m => m.role === 'admin' || m.role === 'coach') || [],
    [teamDetails]
  );
  const teamMembers = useMemo(
    () => teamDetails?.members?.filter(m => m.role === 'member') || [],
    [teamDetails]
  );

  if (isLoading) {
    return <TeamDetailSkeleton />;
  }

  if (isError || !teamDetails) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Team Not Found</h1>
        <p className="text-destructive">Could not load the details for this team.</p>
      </div>
    );
  }

  const { team, plans } = teamDetails;

  return (
    <div className="container max-w-5xl py-8">
      {/* ... Breadcrumb and Header Sections are the same ... */}
      <Breadcrumb className="mb-6">
        {/* ... Breadcrumb items ... */}
      </Breadcrumb>
      <main className="space-y-8">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <Avatar className="w-24 h-24 border-2">
            <AvatarImage src={team.logo_url || ''} alt={team.name} />
            <AvatarFallback className="text-3xl">{team.name.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-4xl font-bold tracking-tight">{team.name}</h1>
            <p className="mt-2 text-lg text-muted-foreground">{team.description || 'No description provided.'}</p>
          </div>
          <Button variant="outline" className="shrink-0">
            <PlusCircle className="mr-2 h-4 w-4" />
            Join Team
          </Button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column: Member Lists */}
          <div className="lg:col-span-1 space-y-6">
            {/* **NEW**: Coaching Staff Card */}
            {coachingStaff.length > 0 && (
              <MemberListCard title="Coaching Staff" icon={ShieldCheck} members={coachingStaff} />
            )}
            
            {/* **NEW**: Team Members Card */}
            {teamMembers.length > 0 && (
              <MemberListCard title="Team Members" icon={Users} members={teamMembers} />
            )}

            {/* Empty State if there are no members at all */}
            {!teamDetails.members || teamDetails.members.length === 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /><span>Members (0)</span></CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground text-center py-4">This team has no members yet.</p>
                    </CardContent>
                 </Card>
            )}
          </div>

          {/* Right Column: Plans List (No changes here) */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5" />
                  <span>Training Plans ({plans?.length || 0})</span>
                </CardTitle>
                <CardDescription>Plans created by this team for its members.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {plans && plans.length > 0 ? (
                  plans.map(plan => (
                    <Link
                      key={plan.id}
                      to="/explore/plans/$planId"
                      params={{ planId: plan.id }}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted transition-colors hover:bg-accent"
                    >
                      <div>
                        <p className="font-semibold">{plan.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{plan.description}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">This team has not created any plans yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}


// --- Skeleton component (Updated for new layout) ---
const TeamDetailSkeleton = () => (
    <div className="container max-w-5xl py-8">
        <Skeleton className="h-6 w-1/3 mb-6" />
        <main className="space-y-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                </div>
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></div></div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></div></div>
                            <div className="flex items-center gap-3"><Skeleton className="w-10 h-10 rounded-full" /><div className="space-y-2 flex-1"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-1/2" /></div></div>
                        </CardContent>
                    </Card>
                </div>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader><Skeleton className="h-6 w-1/2" /><Skeleton className="h-4 w-3/4 mt-2" /></CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </main>
    </div>
);