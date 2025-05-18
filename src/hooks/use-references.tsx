import { supabase } from '@/lib/supabase/supabaseClient'; // Adjust path
import { useUser } from '@supabase/auth-helpers-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from './useAuthStore';
import { useFetchExerciseById } from '@/api/exercises';
import { useMemo } from 'react';


export function useExerciseReferenceLists(exerciseId: string) {
  const {
    data: exercise,
    isLoading,
    error,
  } = useFetchExerciseById(exerciseId);

  /** -------- saved refs: map saved rows → their global record ---- */
  const savedRefs = useMemo(() => {
    if (!exercise) return [];

    // If Row-Level Security already limits these rows to the user,
    // you can keep this line; otherwise filter by user_id as you noted.
    const mineOnly = exercise.exercise_saved_references;      // RLS version
    // const userId   = supabase.auth.getSession().data?.session?.user.id;
    // const mineOnly = exercise.exercise_saved_references.filter(r => r.user_id === userId);

    return mineOnly?.map(row => ({
      savedReferenceId: row.id,
      globalReference: row.exercise_reference_global,
    })) ?? [];
  }, [exercise]);

  /** -------- global refs: EXCLUDE the ones in savedRefs ---------- */
  const globalRefs = useMemo(() => {
    if (!exercise) return [];

    // Build a Set of the saved global-reference IDs for O(1) lookups
    const savedIds = new Set(savedRefs.map(ref => ref?.globalReference?.id));

    // Keep only those globals that are *not* in the saved set
    return (exercise.exercise_reference_global ?? []).filter(
      ref => !savedIds.has(ref?.id),
    );
  }, [exercise, savedRefs]);

  return { globalRefs, savedRefs, isLoading, error: error as Error | null };
}
