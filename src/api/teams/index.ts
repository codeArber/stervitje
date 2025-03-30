// src/api/teams/index.ts
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import * as teamsApi from './endpoint';
import type { Team, TeamMemberWithProfile } from '@/types'; // Define these types
import { useUserContext } from '@/api/user'; // Import user context hook if needed for checks

// --- Query Keys ---
const teamKeys = {
    all: ['teams'] as const,
    details: (teamId: string | null | undefined) => [...teamKeys.all, 'detail', teamId] as const,
    members: (teamId: string | null | undefined) => [...teamKeys.all, 'members', teamId] as const,
    // Maybe add a key for teams the user is a member of (derived from userContext?)
};

// --- Hooks ---

/** Hook to fetch details of a specific team */
export const useTeamDetails = (teamId: string | null | undefined) => {
    return useQuery<Team | null, Error>({ // Specify return type
        queryKey: teamKeys.details(teamId),
        queryFn: () => teamsApi.fetchTeamDetails(teamId),
        enabled: !!teamId, // Only fetch if teamId is provided
    });
};

/** Hook to fetch members of a specific team */
export const useTeamMembers = (teamId: string | null | undefined) => {
    return useQuery<TeamMemberWithProfile[], Error>({ // Specify return type
        queryKey: teamKeys.members(teamId),
        queryFn: () => teamsApi.fetchTeamMembers(teamId),
        enabled: !!teamId,
    });
};

/** Hook to create a new team */
export const useCreateTeam = () => {
    const queryClient = useQueryClient();
    const { data: userContext } = useUserContext(); // Get user context for invalidation

    return useMutation<Team, Error, Pick<Team, 'name' | 'description' | 'sport' | 'is_private' | 'logo_url'>>({
        mutationFn: teamsApi.createTeam,
        onSuccess: (newTeam) => {
            // Invalidate user context because their team list has changed
            queryClient.invalidateQueries({ queryKey: ['userContext'] }); // Invalidate user context
            // Optional: Add the new team to a cached list of user's teams if applicable
        },
        onError: (error) => {
            console.error("Mutation Error useCreateTeam:", error);
             alert(`Create Team Error: ${error.message}`);
        },
    });
};

/** Hook to add a member to a team */
export const useAddTeamMember = () => {
    const queryClient = useQueryClient();

    return useMutation<any, Error, { teamId: string, userId: string, role: 'assistant_coach' | 'member'}>({
        mutationFn: teamsApi.addTeamMember,
        onSuccess: (data, variables) => {
            // Invalidate the members list for the specific team
            queryClient.invalidateQueries({ queryKey: teamKeys.members(variables.teamId) });
        },
         onError: (error) => {
            console.error("Mutation Error useAddTeamMember:", error);
             alert(`Add Member Error: ${error.message}`);
        },
    });
};

/** Hook to remove a member from a team */
export const useRemoveTeamMember = () => {
    const queryClient = useQueryClient();

    return useMutation<{ success: boolean }, Error, { teamId: string, userId: string }>({
        mutationFn: teamsApi.removeTeamMember,
         onSuccess: (data, variables) => {
            // Invalidate the members list for the specific team
            queryClient.invalidateQueries({ queryKey: teamKeys.members(variables.teamId) });
        },
         onError: (error) => {
            console.error("Mutation Error useRemoveTeamMember:", error);
             alert(`Remove Member Error: ${error.message}`);
        },
    });
};

// Add hooks for updateTeam, updateMemberRole etc.