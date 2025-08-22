// FILE: src/routes/_layout/workspace/$teamId/index.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useTeamDetailsQuery } from '@/api/team'; // To fetch detailed team info
import { useAuthStore } from '@/stores/auth-store'; // To get current user for roles
import { toast } from 'sonner'; // For user feedback

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
  Building as BuildingIcon, Settings, PlusCircle, LayoutDashboard
} from 'lucide-react'; // Added LayoutDashboard icon

// Types
import type { TeamDetails, TeamMemberRole } from '@/types/team';
import type { Plan } from '@/types/plan';
import type { Profile } from '@/types'; // Assuming Profile is also used here
import { CreatePlanDialog } from '@/components/new/plan/CreatePlanDialog';
import { InviteMemberDialog } from '@/components/new/InviteMemberDialog';

export const Route = createFileRoute('/_layout/workspace/_workspace-layout/$teamId/')({
  component: SpecificWorkspaceManagementPage, // Renamed for clarity: this is the management hub
});

function SpecificWorkspaceManagementPage() {
  const { teamId } = Route.useParams();
  const { data: teamDetails, isLoading, isError, error } = useTeamDetailsQuery(teamId);
  const { user: authUser } = useAuthStore(); // Get the current authenticated user

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
    <div className="container mx-auto max-w-6xl py-8 space-y-8">
      {/* Workspace Details Header */}
      <header className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter flex items-center gap-3">
              <BuildingIcon className="h-9 w-9" /> {team.name}
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              Manage and view details for this workspace.
            </p>
            <Badge variant="secondary" className="capitalize mt-2">Your Role: {current_user_role || 'Not a Member'}</Badge>
          </div>
          {/* Action Buttons for this specific team */}
          <div className="flex flex-col sm:flex-row gap-2">
            {canManageTeam && (
              <InviteMemberDialog teamId={team.id} teamName={team.name} />
            )}
            {canManageTeam && (
              <CreatePlanDialog teamId={team.id} />
            )}
          </div>
        </div>
        <p className="text-lg text-muted-foreground">{team.description || "No description provided for this workspace."}</p>
      </header>

      <Separator />

      {/* Members Section */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Members</h2>
        {members && members.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map(member => (
              <MemberCard key={member.profile.id} profile={member.profile} role={member.role} />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-muted-foreground">
            <p>No members found for this workspace. {canManageTeam && 'Invite some!'}</p>
          </Card>
        )}
      </section>

      <Separator />

      {/* Plans Section */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Plans</h2>
        {plans && plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map(planItem => (
              <PlanOverviewCard key={planItem.id} plan={planItem} teamId={team.id} />
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center text-muted-foreground">
            <p>No plans created for this workspace yet. {canManageTeam && 'Create your first plan!'}</p>
          </Card>
        )}
      </section>
    </div>
  );
}

// --- Sub-components (Moved here for self-containment, can be moved to shared components later) ---

function MemberCard({ profile, role }: { profile: Profile; role: TeamMemberRole }) {
  return (
    <Card className="flex items-center p-3 gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={profile.profile_image_url || undefined} />
        <AvatarFallback>{(profile.full_name || profile.username || 'U').charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div>
        <p className="font-semibold">{profile.full_name || profile.username}</p>
        <Badge variant="outline" className="capitalize">{role}</Badge>
      </div>
    </Card>
  );
}

function PlanOverviewCard({ plan, teamId }: { plan: Plan; teamId: string }) { // Added teamId prop
  return (
    // Link to the plan's detail page within the workspace context
    <Link to="/workspace/$teamId/plans/$planId" params={{ teamId: teamId, planId: plan.id }}>
      <Card className="hover:border-primary transition-colors duration-200">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5 text-muted-foreground" />
            {plan.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {plan.description || "No description."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            <span>Level {plan.difficulty_level}/5</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>Created: {new Date(plan.created_at || '').toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
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