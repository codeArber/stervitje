// FILE: src/components/layout/workspace-selector.tsx

import React from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useDashboardSummaryQuery } from '@/api/dashboard';
import { useSetCurrentUserWorkspaceMutation } from '@/api/user';
import { toast } from 'sonner';

// shadcn/ui components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Icons
import { Building, ChevronDown, CheckCircle, PlusCircle, Home, Users } from 'lucide-react';

interface WorkspaceSelectorProps {
  // Add any props if needed
}

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = () => {
  const navigate = useNavigate();
  const { data: summary, isLoading, isError, error } = useDashboardSummaryQuery();
  const { mutate: setCurrentWorkspace, isPending } = useSetCurrentUserWorkspaceMutation();

  const currentWorkspace = summary?.my_teams?.find(
    (team) => team.id === summary?.current_workspace_id
  );

  const handleSelectWorkspace = (workspaceId: string | null, workspaceName: string) => { // <--- CHANGED: workspaceId can be null
    // If selecting the current one, or if it's already null and trying to select null again
    if (workspaceId === summary?.current_workspace_id && workspaceId !== null) {
      toast.info(`'${workspaceName}' is already your current workspace.`);
      return;
    }
    // If current is null and we are trying to set to null, don't re-navigate
    if (workspaceId === null && summary?.current_workspace_id === null) {
      toast.info('No workspace is currently selected.');
      navigate({ to: '/workspace' }); // Ensure we are on the selection page
      return;
    }

    const toastId = toast.loading(`Switching to '${workspaceName || 'no workspace'}'...`);
    setCurrentWorkspace(workspaceId, {
      onSuccess: () => {
        toast.success(`Switched to '${workspaceName || 'no workspace'}'!`, { id: toastId });
        // --- ADD NAVIGATION TO THE CORRECT PAGE ---
        if (workspaceId === null) {
          navigate({ to: '/workspace' }); // Go to the selection page if cleared
        } else {
          navigate({ to: '/workspace/$teamId', params: { teamId: workspaceId } }); // Go to the specific team's page
        }
      },
      onError: (err) => {
        toast.error(`Failed to switch: ${err.message}`, { id: toastId });
      }
    });
  };

  if (isLoading) {
    return <Skeleton className="h-10 w-40" />;
  }

  if (isError || !summary || !summary.my_teams || summary.my_teams.length === 0) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link to="/teams/create">
          <PlusCircle className="mr-2 h-4 w-4" /> Create Team
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 pr-2">
          {currentWorkspace ? (
            <>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {(currentWorkspace.name || 'W').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold">{currentWorkspace.name}</span>
            </>
          ) : (
            <>
              <Building className="h-4 w-4" />
              <span>No Workspace Selected</span> {/* <--- UPDATED LABEL */}
            </>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
        <DropdownMenuLabel>Your Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {summary.my_teams.map((team) => (
          <DropdownMenuItem
            key={team.id}
            onClick={() => handleSelectWorkspace(team.id, team.name)}
            disabled={isPending}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {team.is_personal_workspace ? <Home className="h-4 w-4" /> : <Users className="h-4 w-4" />}
              <span>{team.name}</span>
            </div>
            {team.id === summary.current_workspace_id && (
              <CheckCircle className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {/* NEW: Option to clear the current workspace */}
        {summary.current_workspace_id && (
          <DropdownMenuItem
            onClick={() => handleSelectWorkspace(null, 'No Workspace')}
            disabled={isPending}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Building className="h-4 w-4" /> Manage All Workspaces
          </DropdownMenuItem>
        )}
        <DropdownMenuItem asChild>
          <Link to="/teams/create" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Create New Team
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};