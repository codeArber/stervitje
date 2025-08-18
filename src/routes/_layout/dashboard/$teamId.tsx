// FILE: src/routes/_layout/teams/$teamId.tsx

import { createFileRoute, Link } from '@tanstack/react-router';
import { useTeamDetailsQuery } from '@/api/team'; // Import the existing hook
import { useAuthStore } from '@/stores/auth-store'; // To get current user for roles
import { toast } from 'sonner'; // For user feedback

// Types
import type { TeamDetails, TeamMemberRole } from '@/types/team';
import type { Plan } from '@/types/plan'; // Assuming Plan is also used here
import type { Profile } from '@/types'; // Assuming Profile is also used here

// shadcn/ui components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Icons
import { Users, LayoutDashboard, Calendar, Trophy, Lock, Unlock, UserPlus, FileText } from 'lucide-react'; // Add relevant icons

export const Route = createFileRoute('/_layout/dashboard/$teamId')({
  component: TeamDetailsPage,
});

function TeamDetailsPage() {
  const { teamId } = Route.useParams();
  const { data: teamDetails, isLoading, isError, error } = useTeamDetailsQuery(teamId);
  const { user } = useAuthStore(); // Get the current authenticated user

  if (isLoading) return <TeamDetailsSkeleton />;
  if (isError || !teamDetails) return (
    <div className="container mx-auto py-8 text-destructive text-center">
      Error loading team: {error?.message || "Team not found."}
    </div>
  );

  const { team, members, plans, current_user_role } = teamDetails;

  // Determine if the current user can invite members (admin or coach)
  const canInviteMembers = current_user_role === 'admin' || current_user_role === 'coach';

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      {/* Team Header */}
      <header className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter">{team.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {team.is_private ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                <span>{team.is_private ? 'Private Team' : 'Public Team'}</span>
              </div>
              <span>|</span>
              <div className="flex items-center gap-1"><Users className="h-4 w-4" /><span>{members?.length || 0} Members</span></div>
              {team.sport && (
                <>
                  <span>|</span>
                  <Badge variant="secondary">{team.sport}</Badge>
                </>
              )}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Example: Link to Team Dashboard (if applicable) */}
            <Button asChild variant="outline">
              <Link to="/dashboard"> {/* Adjust target if team has its own dashboard */}
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Link>
            </Button>
            {/* Example: Invite Member Button (conditional) */}
            {canInviteMembers && (
              <Button asChild>
                <Link to="/teams/$teamId" params={{ teamId: team.id }}> {/* Assuming an invite page */}
                  <UserPlus className="mr-2 h-4 w-4" /> Invite Member
                </Link>
              </Button>
            )}
          </div>
        </div>
        <p className="text-lg text-muted-foreground">{team.description || "No description provided for this team."}</p>
        <Badge variant="secondary" className="capitalize">Your Role: {current_user_role || 'Not a Member'}</Badge>
      </header>

      <Separator />

      {/* Team Members */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Members</h2>
        {members && members.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {members.map(member => (
              <MemberCard key={member.profile.id} profile={member.profile} role={member.role} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No members found for this team.</p>
        )}
      </section>

      <Separator />

      {/* Team Plans */}
      <section>
        <h2 className="text-3xl font-bold tracking-tight mb-4">Plans</h2>
        {plans && plans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans.map(planItem => (
              <PlanOverviewCard key={planItem.id} plan={planItem} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No plans created for this team yet.</p>
        )}
      </section>
    </div>
  );
}

// --- Sub-components for TeamDetailsPage ---

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

function PlanOverviewCard({ plan }: { plan: Plan }) {
    return (
        <Link to="/plans/$planId" params={{ planId: plan.id }}>
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

function TeamDetailsSkeleton() {
  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-8">
      <header className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-1/2" />
      </header>

      <Skeleton className="h-0.5 w-full" /> {/* Separator */}

      <section>
        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="flex items-center p-3 gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16 mt-1" />
              </div>
            </Card>
          ))}
        </div>
      </section>

      <Skeleton className="h-0.5 w-full" /> {/* Separator */}

      <section>
        <Skeleton className="h-8 w-1/4 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm text-muted-foreground">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}