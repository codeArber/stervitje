// FILE: src/routes/_layout/dashboard/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useDashboardSummaryQuery } from '@/api/dashboard';
import { usePendingInvitationsQuery, useRespondToInvitationMutation } from '@/api/team';
import type { FullPlan } from '@/types/plan';
import type { MyTeam } from '@/types/dashboard';
import type { Plan } from '@/types/index';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from "sonner";

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Icons
import { ArrowRight, PlusCircle, Star, PlayCircle, Mail, Check, X } from 'lucide-react';

// CORRECTED: The route is now explicitly '/_layout/dashboard/'
export const Route = createFileRoute('/_layout/dashboard/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { user } = useAuthStore();
  const { data: summary, isLoading, isError, error } = useDashboardSummaryQuery();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !summary) {
    return (
      <div className="container py-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Error Loading Dashboard</h1>
        <p className="text-destructive">{error?.message || "Could not load your dashboard. Please try again later."}</p>
      </div>
    );
  }

  const { active_plan_details, my_teams, my_created_plans } = summary;

  return (
    <div className="container py-8 space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome back, {user?.user_metadata.full_name || user?.email}!</h1>
        <p className="text-xl text-muted-foreground">Here's a summary of your workspace.</p>
      </header>
      
      <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-8">
          <PendingInvitationsCard />
          <ActivePlanCard activePlanDetails={active_plan_details} />
          <MyCreatedPlansCard plans={my_created_plans} />
        </div>
        <div className="lg:col-span-1">
          <MyTeamsCard teams={my_teams} />
        </div>
      </main>
    </div>
  );
}


// --- Sub-components ---

export const PendingInvitationsCard = () => {
    const { data: invitations, isLoading } = usePendingInvitationsQuery();
    const { mutate: respond, isPending } = useRespondToInvitationMutation();

    const handleResponse = (invitationId: string, accept: boolean, teamName: string) => {
        const promise = new Promise((resolve, reject) =>
            respond({ invitationId, accept }, { onSuccess: resolve, onError: reject })
        );
        toast.promise(promise, {
            loading: 'Responding to invitation...',
            success: `Successfully ${accept ? 'joined' : 'declined'} ${teamName}!`,
            error: (err) => `Error: ${(err as Error).message}`,
        });
    };

    if (isLoading || !invitations || invitations.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-blue-500" /><span>You Have Pending Invitations!</span></CardTitle>
                <CardDescription>Respond to join new teams and start collaborating.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {invitations.map(invite => (
                    <div key={invite.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg bg-muted gap-4">
                        <p className="text-sm">
                            <span className="font-semibold">{invite.profiles.full_name || invite.profiles.username}</span> invited you to join
                            {/* CORRECTED LINK: The route for a team's details is now /teams/$teamId */}
                            <Link to="/teams/$teamId" params={{ teamId: invite.teams.id }} className="font-semibold hover:underline px-1">{invite.teams.name}</Link> as a {invite.role}.
                        </p>
                        <div className="flex gap-2 shrink-0">
                            <Button size="icon" variant="outline" onClick={() => handleResponse(invite.id, false, invite.teams.name)} disabled={isPending}><X className="h-4 w-4" /><span className="sr-only">Decline</span></Button>
                            <Button size="icon" onClick={() => handleResponse(invite.id, true, invite.teams.name)} disabled={isPending}><Check className="h-4 w-4" /><span className="sr-only">Accept</span></Button>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const ActivePlanCard = ({ activePlanDetails }: { activePlanDetails: FullPlan | null }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-500" /><span>Your Active Plan</span></CardTitle>
      <CardDescription>This is your current training focus. Let's get to work!</CardDescription>
    </CardHeader>
    <CardContent>
      {activePlanDetails ? (
        <div className="p-4 border rounded-lg">
          <h3 className="font-bold text-lg">{activePlanDetails.plan.title}</h3>
          <p className="text-sm text-muted-foreground">
            Created by <span className="font-medium">{activePlanDetails.creator.full_name || activePlanDetails.creator.username}</span>
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline">Level: {activePlanDetails.plan.difficulty_level}/5</Badge>
            {activePlanDetails.goals && activePlanDetails.goals.length > 0 && (
                <Badge variant="secondary">{activePlanDetails.goals[0].title}</Badge>
            )}
          </div>
          <Button asChild className="mt-4 w-full">
            {/* CORRECTED LINK: The workout player route is now /workout/$sessionId */}
            {/* We'll use a placeholder 'new' for now, but this would eventually come from an active session log */}
            <Link to="/workout/$sessionId" params={{ sessionId: 'new' }} >
              <PlayCircle className="mr-2 h-4 w-4" /> Continue Workout
            </Link>
          </Button>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted-foreground mb-4">You don't have an active plan. Why not start one?</p>
          <Button asChild>
            <Link to="/explore/plans">Explore Plans <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

const MyTeamsCard = ({ teams }: { teams: MyTeam[] | null }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div className="space-y-1"><CardTitle>My Teams</CardTitle><CardDescription>Teams you are a member of.</CardDescription></div>
      {/* CORRECTED LINK: Create new team should go to the team explore page to find or create a team */}
      <Button variant="ghost" size="sm" asChild><Link to="/explore/teams"><PlusCircle className="h-4 w-4" /></Link></Button>
    </CardHeader>
    <CardContent className="space-y-2">
      {teams && teams.length > 0 ? (
        teams.map(team => (
          <Link key={team.id} to="/teams/$teamId" params={{ teamId: team.id }} className="block p-3 rounded-lg hover:bg-muted">
            <div className="flex justify-between items-center">
              <span className="font-semibold">{team.name}</span>
              {team.is_personal_workspace ? (
                <Badge variant="secondary">Workspace</Badge>
              ) : (
                <Badge variant="outline">{team.role}</Badge>
              )}
            </div>
          </Link>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">You are not a member of any teams yet.</p>
      )}
    </CardContent>
  </Card>
);

const MyCreatedPlansCard = ({ plans }: { plans: Plan[] | null }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
       <div className="space-y-1"><CardTitle>My Created Plans</CardTitle><CardDescription>Plans you have designed.</CardDescription></div>
       {/* CORRECTED LINK: Creating a new plan goes to the new plan route */}
      <Button variant="ghost" size="sm" asChild><Link to="/plans/new"><PlusCircle className="h-4 w-4" /></Link></Button>
    </CardHeader>
    <CardContent className="space-y-2">
       {plans && plans.length > 0 ? (
        plans.map(plan => (
            <Link key={plan.id} to="/plans/$planId" params={{ planId: plan.id }} className="block p-3 rounded-lg hover:bg-muted">
                <div className="flex justify-between items-center">
                    <span className="font-semibold">{plan.title}</span>
                    <div className="flex items-center gap-2">
                        {plan.private ? <Badge variant="outline">Private</Badge> : <Badge variant="default" className="bg-green-600">Public</Badge>}
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>
            </Link>
        ))
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">You haven't created any plans yet.</p>
      )}
    </CardContent>
  </Card>
);

const DashboardSkeleton = () => (
    <div className="container py-8 space-y-8">
        <header className="space-y-2">
            <Skeleton className="h-10 w-3/5" />
            <Skeleton className="h-6 w-2/5" />
        </header>
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-8">
                <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
                <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
            </div>
            <div className="lg:col-span-1">
                 <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader><CardContent className="space-y-2"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent></Card>
            </div>
        </main>
    </div>
);