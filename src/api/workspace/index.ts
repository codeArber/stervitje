import { useQuery } from '@tanstack/react-query';
import { fetchWorkspaceData } from './endpoint';
import type { WorkspaceData } from '@/types/workspace/index'; // Keep this type

const workspaceKeys = {
  all: ['workspace'] as const,
  details: () => [...workspaceKeys.all, 'details'] as const,
  detail: (teamId: string) => [...workspaceKeys.details(), teamId] as const,
};

/**
 * Hook for fetching all the necessary data for a given workspace view.
 * @param teamId - The ID of the workspace (team) to fetch.
 */
export const useWorkspaceDataQuery = (teamId: string | undefined) => {
  return useQuery<WorkspaceData | null, Error>({
    queryKey: workspaceKeys.detail(teamId!),
    queryFn: () => fetchWorkspaceData(teamId!),
    enabled: !!teamId, // Only runs when a teamId is provided
  });
};
