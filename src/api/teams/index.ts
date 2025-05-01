// src/api/teams/index.ts
import { useQuery, useMutation, useQueryClient, QueryKey } from '@tanstack/react-query';
import * as teamsApi from './endpoint';
import type { Team, TeamMemberWithProfile } from '@/types'; // Define these types
import { useUserQuery } from '@/api/user'; // Import user context hook if needed for checks
import { useSession } from '@supabase/auth-helpers-react';

// --- Query Keys ---
const teamKeys = {
    all: ['teams'] as const,
    details: (teamId: string | null | undefined) => [...teamKeys.all, 'detail', teamId] as const,
    members: (teamId: string | null | undefined) => [...teamKeys.all, 'members', teamId] as const,
    // Maybe add a key for teams the user is a member of (derived from userContext?)
};

// --- Hooks ---

/** Hook to fetch all teams for a specific member */
export const useFetchAllTeamsForMember = (userId: string | null | undefined) => {
    return useQuery<Team[], Error>({
        queryKey: [...teamKeys.all, 'forMember', userId],
        queryFn: () => teamsApi.fetchAllTeamsForMember(userId),
        enabled: !!userId, // Only fetch if userId is provided
    });
};

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

// Define a clear payload type (adjust optionality based on your API)
export interface CreateTeamPayload {
    name: string;
    description?: string;
    sport?: string;
    is_private?: boolean;
    logo_url?: string;
}

/** Hook to create a new team */
export const useCreateTeam = (userId: string) => {
    const queryClient = useQueryClient();
    // const { data: userContext } = useUserContext(); // Keep if you *really* need to invalidate ['userContext']

    return useMutation<Team, Error, CreateTeamPayload>({ // Use the dedicated payload type
        mutationFn: teamsApi.createTeam, // This function likely takes CreateTeamPayload
        onSuccess: (newTeam, variables) => {
            console.log('Team created successfully:', newTeam);

            // --- Invalidate queries ---

            // 1. Most Important: Invalidate the list of teams the user is a member of
            if (userId) {
                // *** Replace with the ACTUAL query key used by useFetchAllTeamsForMember ***
                queryClient.invalidateQueries({ queryKey: ['teams', 'member', userId] });
                queryClient.invalidateQueries({ queryKey: ['teams', 'forMember', userId] });
                // Example alternative key structures: ['userTeams', userId], ['teams', { userId }]
            } else {
                console.warn('User ID not found, could not invalidate team list query.');
            }

            // 2. Optional: Invalidate user context if it depends on the team list
            // queryClient.invalidateQueries({ queryKey: ['userContext'] });

            // 3. Optional: You could potentially add the newTeam to the cache optimistically here
            // using queryClient.setQueryData(['teams', 'member', userId], (oldData) => ...);
        },
        onError: (error) => {
            // Log the error for debugging. Avoid alert().
            console.error("Mutation Error - useCreateTeam:", error);
            // The component calling mutate should handle user-facing error messages (e.g., toasts)
        },
    });
};
/** Hook to add a member to a team */
export const useAddTeamMember = () => {
    const queryClient = useQueryClient();

    return useMutation<any, Error, { teamId: string, userId: string, role: string}>({
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

/** Hook to fetch all public teams */
export const usePublicTeams = () => {
    return useQuery<Team[], Error>({
        queryKey: [...teamKeys.all, 'public'],
        queryFn: teamsApi.fetchAllPublicTeams,
    });
};


// New Hook: useMemberInTeam
/**
 * Fetches members for a given team and finds a specific member by userId.
 * @param teamId The ID of the team to check.
 * @param userId The ID of the user to find within the team.
 * @returns The team member object if found, otherwise undefined.
 */
export const useMemberInTeam = (teamId: string | null, userId?: string) => {
    const user = useSession()?.user
    const { data: members, isLoading, error } = useTeamMembers(teamId);
    if (isLoading || error || !members || !user?.id) {
      return undefined; // Return undefined during loading, on error, or if data/userId is missing
    }
  
    // Find the member with the matching user ID
    const member = members.find(m => m.user_id === userId);
  
    return member; // Returns the found member object or undefined
  };
  

  
// New Hook: useMemberInTeam
/**
 * Fetches members for a given team and finds a specific member by userId.
 * @param teamId The ID of the team to check.
 * @param userId The ID of the user to find within the team.
 * @returns The team member object if found, otherwise undefined.
 */
export const useActiveMemberInTeam = (teamId: string | null) => {
    const user = useSession()?.user
    const { data: members, isLoading, error } = useTeamMembers(teamId);
    if (isLoading || error || !members || !user?.id) {
      return undefined; // Return undefined during loading, on error, or if data/userId is missing
    }
  
    // Find the member with the matching user ID
    const member = members.find(m => m.user_id === user.id);
  
    return member; // Returns the found member object or undefined
  };
  