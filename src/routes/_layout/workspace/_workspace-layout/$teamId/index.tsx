// FILE: src/routes/_layout/workspace/$teamId/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useTeamDetailsQuery } from '@/api/team'; // To fetch detailed team info
import { useAuthStore } from '@/stores/auth-store'; // To get current user for roles

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Icons
import {
  Users, Calendar, Trophy, Lock, Unlock, UserPlus, FileText,
  Building as BuildingIcon, Settings, PlusCircle, LayoutDashboard,
  Home,
  Activity,
  GitFork,
  Heart,
  Star,
  KanbanSquareDashed,
  CheckCircle,
  GitBranch,
  ThumbsUp,
  User
} from 'lucide-react'; // Added LayoutDashboard icon

// Types
import type { TeamDetails } from '@/types/team';
import type { Plan } from '@/types/plan';
import type { Profile, TeamMemberRole } from '@/types'; // Assuming Profile is also used here
import { CreatePlanDialog } from '@/components/new/plan/CreatePlanDialog';
import { InviteMemberDialog } from '@/components/new/InviteMemberDialog';
import { Breadcrumb } from '@/components/new/TopNavigation';
import PlanMuscleDiagram from '@/components/new/exercise/PlanMuscleDiagram';
import { Label } from '@/components/ui/label';
import { PlanActionButton } from '@/components/new/plan/PlanActionButton';
import { InfoCard } from '@/routes/_layout/explore/plans/$planId';
import { PlanCardExplore } from '@/components/new/explore/plans/PlanCardExplore';
import { PlanCardTeam } from '@/components/new/workspace/TeamCardPlan';
import { MemberCard } from '@/components/new/workspace/MemberCard';

export const Route = createFileRoute('/_layout/workspace/_workspace-layout/$teamId/')({
  component: SpecificWorkspaceManagementPage, // Renamed for clarity: this is the management hub
});

function SpecificWorkspaceManagementPage() {
  const { teamId } = Route.useParams();
  const { data: teamDetails, isLoading, isError, error } = useTeamDetailsQuery(teamId);
  const { user: authUser } = useAuthStore(); // Get the current authenticated user
  console.log(teamDetails)
  if (isLoading) return <SpecificWorkspaceManagementPageSkeleton />;
  if (isError || !teamDetails || !teamDetails.team) return (
    <div className="container mx-auto py-8 text-destructive text-center">
      Error loading workspace details: {error?.message || "Workspace not found."}
    </div>
  );

  const { team, members, plans, current_user_role } = teamDetails;

  // Determine if the current user can manage members/plans for this team
  const canManageTeam = current_user_role === 'admin' || current_user_role === 'coach';

  return (
    <div className='relative h-screen'>
      <Breadcrumb items={[
        { label: 'Home', href: '/', icon: Home },
        { label: 'Workspace', href: `/workspace/${team.id}`, icon: BuildingIcon },
        { label: team.name, icon: Settings }
      ]} className=' absolute -top-[68.5px] ml-4' />

      <div className="pb-6 relative px-4 h-full overflow-y-auto py-4">

        <div className='flex flex-row justify-between w-full h-fit gap-4'>
          <div className="border-0 shadow-xl bg-muted backdrop-blur-sm overflow-hidden rounded-2xl w-full">
            <div className="p-0 flex flex-col gap-0">
              <div className="flex justify-between items-start p-4 pb-2">
                <div className='flex flex-row justify-between w-full'>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-row gap-2 items-center">
                      <Label variant={'exerciseTitleBig'}>hey</Label>

                    </div>
                    <span className='text-muted-foreground text-xs flex flex-row gap-1'>By <Link to={'/explore/users/$userId'} params={{ userId: 'creator.id' }} className="flex items-center gap-2 hover:underline">dsf</Link></span>
                  </div>
                  <div className='flex flex-row gap-4 items-center'>
                    <div className="flex flex-row gap-2 items-center">
                      {/* TODO */}
                      {/* <PlanActionButton planId={'sda'} /> */}

                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              </div>
              <p className="text-md text-muted-foreground px-4 py-3">desc</p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            {/* Glassmorphism card */}
            <Card className="relative w-full max-w-md bg-background/80 dark:bg-background/20 backdrop-blur-lg border border-border/50 shadow-2xl overflow-hidden">
              {/* Animated gradient background inside card - subtle and theme-aware */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20 animate-pulse"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-muted/30 via-primary/10 to-secondary/20 opacity-60 animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-accent/15 via-muted/20 to-primary/15 opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

              {/* Moving gradient orbs inside card - very subtle */}
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-bounce"></div>
              <div className="absolute top-8 -right-8 w-24 h-24 bg-gradient-to-r from-accent/20 to-muted/20 rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-bounce" style={{ animationDelay: '2s' }}></div>
              <div className="absolute -bottom-8 left-8 w-28 h-28 bg-gradient-to-r from-secondary/20 to-primary/20 rounded-full mix-blend-overlay filter blur-xl opacity-30 animate-bounce" style={{ animationDelay: '4s' }}></div>

              <CardContent className="relative z-10 space-y-1 gap-1 pt-6">

                <div className="flex flex-col w-full justify-between w-full px-4">
                  <div className="flex items-center gap-1 pb-2 w-32">
                    <User className="h-4 w-4 text-blue-500" />
                    <span>{team.total_active_users_on_team_plans} Active</span>
                  </div>
                  {/* Like Count */}
                  <div className="flex items-center space-x-2 pb-2 w-32">
                    <ThumbsUp className="w-4 h-4 text-red-500" />
                    <span>{team.total_likes_across_team_plans} Likes</span>
                  </div>

                  {/* Fork Count with Button */}
                  <div className="flex items-center space-x-2 pb-2 w-32">
                    <GitBranch className="w-4 h-4 text-foreground" />
                    <span>{team.total_forks_across_team_plans} Forks</span>
                  </div>

                  {/* Completed Sessions Count */}
                  <div className="flex items-center space-x-2 pb-2 w-32">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{team.total_completed_sessions_on_team_plans} Completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>



        {/* Members Section */}
        <section className='py-2 pt-6 gap-2 flex flex-col'>
          <Label variant={'sectionTitle'}>Members</Label>
          {members && members.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {members.map(member => (
                <MemberCard key={member.profile.id} data={member} role={member.role} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              <p>No members found for this workspace. {canManageTeam && 'Invite some!'}</p>
            </Card>
          )}
        </section>

        {/* Plans Section */}
        <section className='pt-2 pb-2 flex flex-col gap-2'>
          <div className="flex flex-row justify-between items-center pb-2">
            <Label variant={'sectionTitle'}>Plans</Label>
            <Link to='/workspace/$teamId/plans' params={{ teamId: teamId }} className="text-sm text-muted-foreground">View All</Link>
          </div>
          {plans && plans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plans.map(planItem => (
                <PlanCardTeam planData={planItem} key={planItem.id} teamId={teamId} />
              ))}
            </div>
          ) : (
            <Card className="p-6 text-center text-muted-foreground">
              <p>No plans created for this workspace yet. {canManageTeam && 'Create your first plan!'}</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
// --- Skeleton Component for SpecificWorkspaceManagementPage ---
function SpecificWorkspaceManagementPageSkeleton() {
  return (
    <div className="container mx-auto max-w-6xl py-8 space-y-8">
      <header className="space-y-4">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex gap-2 mt-4">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </header>
      <Separator />
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent><Skeleton className="h-20 w-1/3" /></CardContent>
          </Card>
        ))}
      </section>
      <Separator />
      <Skeleton className="h-8 w-1/4 mb-4" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}