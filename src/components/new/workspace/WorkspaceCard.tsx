// FILE: src/components/new/workspace/WorkspaceCard.tsx (Conceptual)

import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users,  CheckCircle, Play, Dumbbell } from 'lucide-react'; // Added Play icon
import { Link } from '@tanstack/react-router';
import { useSetCurrentUserWorkspaceMutation } from '@/api/user';
import { toast } from 'sonner';

import type { DashboardMyTeam } from '@/types/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

interface WorkspaceCardProps {
  team: DashboardMyTeam; // This is the new, enriched type
  currentWorkspaceId: string | null | undefined;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ team, currentWorkspaceId }) => {
  const setCurrentUserWorkspaceMutation = useSetCurrentUserWorkspaceMutation();

  const isCurrentWorkspace = currentWorkspaceId === team.id;

  const handleSetAsCurrent = async () => {
    try {
      await setCurrentUserWorkspaceMutation.mutateAsync(team.id);
      toast.success(`'${team.name}' set as your current workspace.`);
    } catch (error: any) {
      toast.error(`Failed to set workspace: ${error.message}`);
    }
  };

  return (
    <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <Link to={`/workspace/$teamId`} params={{teamId: team.id}} className="hover:underline">
            {team.name}
          </Link>
          {isCurrentWorkspace && (
            <span className="text-sm text-green-500 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" /> Current
            </span>
          )}
        </CardTitle>
        <CardDescription>{team.description || 'No description provided.'}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Members: <span className="font-semibold text-foreground">{team.members_count}</span>
          </p>
          <p className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Plans: <span className="font-semibold text-foreground">{team.plans_count}</span>
          </p>
          <p className="flex items-center gap-2">
            Your Role: <span className="font-semibold text-foreground capitalize">{team.role}</span>
          </p>
          {/* NEW: Display active plan status for this team */}
          {team.has_active_plan_for_user && (
            <p className="flex items-center gap-2 text-blue-600 font-medium">
              <Play className="h-4 w-4" />
              Active Plan Here!
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        {!isCurrentWorkspace && (
          <Button variant="outline" onClick={handleSetAsCurrent} disabled={setCurrentUserWorkspaceMutation.isPending}>
            Set as Current
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export const WorkspaceCardSkeleton: React.FC = () => (
  <Card className="flex flex-col h-full animate-pulse">
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </CardHeader>
    <CardContent className="flex-grow space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </CardContent>
    <CardFooter className="flex justify-end">
      <Skeleton className="h-10 w-28" />
    </CardFooter>
  </Card>
);