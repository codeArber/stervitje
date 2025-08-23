// FILE: src/routes/_layout/dashboard.tsx

import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';

// --- API & State ---
import { useDashboardSummaryQuery } from '@/api/dashboard';
import { useAuthStore } from '@/stores/auth-store';
import type { FullPlan, PlanSession } from '@/types/plan';

// --- UI Components & Icons ---
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dumbbell, Users, Mail, Compass, PlayCircle, ArrowRight, Building, Home } from 'lucide-react';
import { usePendingInvitationsQuery } from '@/api/team';
import { InvitationCard } from '@/components/new/team/InvitationCard';
import { Breadcrumb } from '@/components/new/TopNavigation';

// --- Main Route Component ---
export const Route = createFileRoute('/_layout/dashboard/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { profile } = useAuthStore();
  const { data: summary, isLoading, isError, error } = useDashboardSummaryQuery();

  const { data: pendingInvitations, isLoading: isLoadingInvitations, isError: isErrorInvitations, error: invitationsError } = usePendingInvitationsQuery();
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return <div className="p-8 text-destructive">Error loading dashboard: {error.message}</div>;
  }

  const currentWorkspace = summary?.my_teams?.find(
    team => team.id === summary.current_workspace_id
  );
  console.log(pendingInvitations);


  return (
    <div className="container mx-auto">
      <Breadcrumb items={[
        { label: 'Home', icon: Home },
      ]}
      />


      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome back, {profile?.full_name?.split(' ')[0] || profile?.username}!
        </h1>
        <p className="text-lg text-muted-foreground">Here's your summary for today.</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* --- Main Column --- */}
        <div className="lg:col-span-2 space-y-8">
          <ActivePlanCard activePlan={summary?.active_plan_details} />
          {/* You could add other main components here, like a weekly workout overview */}
        </div>

        {/* --- Side Column --- */}
        {isLoadingInvitations ? (
          <section className="space-y-4 mt-8">
            <h2 className="text-2xl font-bold tracking-tight text-center flex items-center justify-center gap-2">
              <Mail className="h-6 w-6" /> Pending Invitations
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="w-full">
                  <CardContent className="flex items-center p-4 space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-9 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : isErrorInvitations ? (
          <section className="space-y-4 mt-8 text-center text-destructive">
            Error loading invitations: {invitationsError?.message}
          </section>
        ) : pendingInvitations && pendingInvitations.length > 0 ? (
          <section className="space-y-4 mt-8">
            <h2 className="text-2xl font-bold tracking-tight text-center flex items-center justify-center gap-2">
              <Mail className="h-6 w-6" /> Pending Invitations
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {pendingInvitations.map((invite) => (
                <InvitationCard key={invite.id} invitation={invite} />
              ))}
            </div>
          </section>
        ) : null /* Don't render section if no invites */
        }
      </main>
    </div>
  );
}


// --- Sub-components for the Dashboard Page ---

const ActivePlanCard: React.FC<{ activePlan: FullPlan | null | undefined }> = ({ activePlan }) => {
  if (!activePlan) {
    return (
      <Card className="p-8 text-center">
        <Compass className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <CardTitle className="mb-2">No Active Plan</CardTitle>
        <CardDescription>You haven't started a training plan yet. Explore plans to find one that fits your goals.</CardDescription>
        <Button asChild className="mt-4">
          <Link to="/explore/plans">Explore Plans</Link>
        </Button>
      </Card>
    );
  }

  // A simple heuristic to find the "next" workout day (can be improved)
  const nextWorkoutDay = activePlan.hierarchy.weeks
    .flatMap(w => w.days)
    .find(d => !d.is_rest_day && d.sessions && d.sessions.length > 0);

  return (
    <Card>
      <CardHeader>
        <p className="text-sm font-semibold text-primary mb-1">Your Active Plan</p>
        <CardTitle className="text-2xl">{activePlan.plan.title}</CardTitle>
        <CardDescription>{activePlan.plan.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <h4 className="font-semibold mb-3">Next Workout: {nextWorkoutDay?.title || 'Upcoming Session'}</h4>
        <div className="space-y-3">
          {nextWorkoutDay?.sessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const SessionCard: React.FC<{ session: PlanSession }> = ({ session }) => {
  // This would ideally re-use the component from the plan display page
  return (
    <div className="p-4 border rounded-lg flex justify-between items-center">
      <div>
        <p className="font-semibold">{session.title}</p>
        <p className="text-sm text-muted-foreground">{session.exercises?.length || 0} exercises</p>
      </div>
      <Button size="sm" asChild>
        <Link to="/plans/$planId" params={{ planId: session.plan_day_id }}>
          <PlayCircle className="mr-2 h-4 w-4" /> Start
        </Link>
      </Button>
    </div>
  );
};

const CurrentWorkspaceCard: React.FC<{ team: any }> = ({ team }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Building className="h-5 w-5" /> Current Workspace
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="font-semibold">{team.name}</p>
      <p className="text-sm text-muted-foreground capitalize">Your Role: {team.role}</p>
      <Button variant="outline" size="sm" className="mt-3 w-full" asChild>
        <Link to="/workspace/$teamId" params={{ teamId: team.id }}>Manage Workspace <ArrowRight className="ml-2 h-4 w-4" /></Link>
      </Button>
    </CardContent>
  </Card>
);

const PendingInvitationsCard: React.FC<{ count: number }> = ({ count }) => (
  <Alert>
    <Mail className="h-4 w-4" />
    <AlertTitle>You have {count} pending invitation{count > 1 ? 's' : ''}!</AlertTitle>
    <AlertDescription className="flex justify-between items-center mt-2">
      Join new teams to collaborate.
      <Button variant="link" className="p-0 h-auto" asChild>
        <Link to="/onboarding">View Invites</Link>
      </Button>
    </AlertDescription>
  </Alert>
);

const MyTeamsList: React.FC<{ teams: any[] }> = ({ teams }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg flex items-center gap-2">
        <Users className="h-5 w-5" /> My Teams
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-2">
      {teams.map(team => (
        <Link key={team.id} to="/workspace/$teamId" params={{ teamId: team.id }}>
          <div className="p-2 flex items-center gap-3 rounded-md hover:bg-muted">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">{team.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{team.role}</p>
            </div>
          </div>
        </Link>
      ))}
    </CardContent>
  </Card>
);


// --- Skeleton Component ---
const DashboardSkeleton = () => (
  <div className="container mx-auto py-8 animate-pulse">
    <header className="mb-8">
      <Skeleton className="h-10 w-1/2 mb-2" />
      <Skeleton className="h-5 w-1/3" />
    </header>
    <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-2 space-y-8">
        <Skeleton className="h-80 w-full" />
      </div>
      <div className="lg:col-span-1 space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    </main>
  </div>
);