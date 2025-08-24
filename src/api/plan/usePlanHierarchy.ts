// FILE: /src/api/plan/usePlanHierarchy.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { planKeys } from './queryKeys'; // Import centralized query keys
import { savePlanChanges, savePlanHierarchy } from './planHierarchy.endpoint';
import type { PlanHierarchy } from '@/types/plan';
import { PlanChangeset } from '@/types/plan/planMutations';

// --- MUTATIONS ---

/**
 * @description Hook for saving a complete set of changes (additions, deletions, updates) to a plan's hierarchy.
 */
export const useSavePlanChangesMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<Record<string, string>, Error, PlanChangeset>({
    mutationFn: (changeset) => savePlanChanges(changeset),
    onSuccess: (data, variables) => {
      toast.success("Plan saved successfully!");
      // After a successful save, we MUST refetch the plan details
      // to get the real database IDs and latest data.
      queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
    },
    onError: (error) => {
      console.error("Save plan mutation error:", error);
      toast.error(`Failed to save plan: ${error.message}`);
    }
  });
};

/**
 * @description Hook for overwriting a plan's entire hierarchy with a new structure.
 */
export const useSavePlanHierarchyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { planId: string; hierarchy: PlanHierarchy }>({
    mutationFn: (payload) => savePlanHierarchy(payload),
    onSuccess: (data, variables) => {
      toast.success("Plan hierarchy saved successfully!");
      // After a successful save, we MUST refetch the plan details.
      // This gets the real DB IDs for any new items and confirms the structure.
      queryClient.invalidateQueries({ queryKey: planKeys.detail(variables.planId) });
    },
    onError: (error) => {
      console.error("Save plan hierarchy mutation error:", error);
      toast.error(`Failed to save plan hierarchy: ${error.message}`);
    }
  });
};