// FILE: src/routes/_layout/workspace/$teamId/plans/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useTeamDetailsQuery } from '@/api/team'; // To get team's plans
import { useAuthStore } from '@/stores/auth-store'; // For user role check
import { toast } from 'sonner';

// shadcn/ui components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Icons
import { FileText, PlusCircle, Trophy, Calendar, Lock, Unlock, ArrowRight, Home, BuildingIcon, Settings } from 'lucide-react';

// Types
import type { Plan } from '@/types/plan';
import type { TeamMemberRole } from '@/types/team';
import dayjs from 'dayjs';
import { CreatePlanDialog } from '@/components/new/plan/CreatePlanDialog';
import { Breadcrumb } from '@/components/new/TopNavigation';

// Import the new CreatePlanDialog component

export const Route = createFileRoute('/_layout/workspace/_workspace-layout/$teamId/plans/')({
  component: WorkspacePlansPage,
});

function WorkspacePlansPage() {
  const { teamId } = Route.useParams();
  const { data: teamDetails, isLoading, isError, error } = useTeamDetailsQuery(teamId);
  const { user: authUser } = useAuthStore(); // Get current user for role check

  if (isLoading) return <WorkspacePlansSkeleton />;
  if (isError || !teamDetails || !teamDetails.team) return (
    <div className="container mx-auto py-8 text-destructive text-center">
      Error loading plans for this workspace: {error?.message || "Workspace not found."}
    </div>
  );

  const { team, plans, current_user_role } = teamDetails;

  // Determine if the current user can create new plans in this team
  const canCreatePlans = current_user_role === 'admin' || current_user_role === 'coach';

  return (
    <div className="pb-6 relative">
      <Breadcrumb items={[
        { label: 'Home', href: '/', icon: Home },
        { label: 'Workspace', href: `/workspace/${team.id}`, icon: BuildingIcon },
        { label: team.name, icon: Settings, href: `/workspace/${team.id}` },
        { label: 'Plans', icon: FileText }
      ]} className=' absolute -top-[68.5px]'/>

      <header className="space-y-2 pt-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="h-9 w-9" /> Plans for "{team.name}"
          </h1>
          {/* Integrate the CreatePlanDialog component here */}
          <CreatePlanDialog teamId={team.id} />
        </div>
        <p className="text-lg text-muted-foreground">
          View and manage all workout plans created for this workspace.
        </p>
      </header>

      {/* Plans List */}
      <section>
        {plans && plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map(plan => (
              <WorkspacePlanCard key={plan.id} plan={plan} teamId={team.id} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-muted-foreground">
            <div className="space-y-2">
              <FileText className="h-12 w-12 mx-auto" />
              <h3 className="text-lg font-semibold">No plans found for this workspace.</h3>
              <p>
                {canCreatePlans
                  ? 'Start by creating your first workout plan!'
                  : 'Plans will appear here once created by an admin or coach.'
                }
              </p>
              {canCreatePlans && (
                <CreatePlanDialog teamId={team.id} />
              )}
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}

// --- Sub-component for a single plan card in this list (remains unchanged) ---
function WorkspacePlanCard({ plan, teamId }: { plan: Plan; teamId: string }) {
  return (
    <Link to="/workspace/$teamId/plans/$planId" params={{ teamId: teamId, planId: plan.id }}>
      <Card className="h-full flex flex-col hover:border-primary transition-colors duration-200">
        <CardHeader className="flex-grow">
          <div className="flex items-center gap-3 text-muted-foreground mb-2">
            {plan.private ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
            <span className="font-semibold text-sm">
              {plan.private ? "Private Plan" : "Public Plan"}
            </span>
          </div>
          <CardTitle>{plan.title}</CardTitle>
          <CardDescription className="line-clamp-2 min-h-[40px]">
            {plan.description || "No description provided."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>Level {plan.difficulty_level}/5</span>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 p-3 flex justify-between items-center text-sm">
          <span>Created: {dayjs(plan.created_at).format('MMM D, YYYY')}</span>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/workspace/$teamId/plans/$planId" params={{ teamId: teamId, planId: plan.id }}>
              View Plan <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}


// --- Skeleton for the Plans Page (remains unchanged) ---
function WorkspacePlansSkeleton() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <header className="space-y-2">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full" />
        <div className="flex justify-end mt-4">
          <Skeleton className="h-10 w-40" />
        </div>
      </header>
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="h-full flex flex-col">
              <CardHeader className="flex-grow">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Skeleton className="h-4 w-20" />
              </CardContent>
              <CardFooter className="bg-muted/50 p-3 flex justify-between items-center text-sm">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}