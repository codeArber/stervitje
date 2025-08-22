// FILE: src/stores/workoutStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/supabaseClient';
import type { PlanSession, PlanExercise, LoggedExercise, LoggedSet } from '@/types/plan';
import type { Tables } from '@/types/database.types';
import { finishWorkoutSession } from '@/api/plan/endpoint';

// Define types
type SessionLog = Tables<'session_logs'>;
// WorkoutStatus not used currently

// --- STATE INTERFACE ---
interface WorkoutState {
  activeSessionLog: SessionLog | null;
  plannedSession: PlanSession | null;
  groupedExercises: PlanExercise[][];
  loggedExercises: LoggedExercise[];
  startedAt: string | null;
  isCompleted: boolean;
  isLoading: boolean;

  // NEW: UI position state
  currentExerciseIndex: number;
  currentSetIndex: number;


  // --- ACTIONS ---
  checkForActiveSession: () => Promise<void>;
  startWorkout: (sessionLog: SessionLog, plannedSession: PlanSession | null) => void;
  finishWorkout: () => Promise<void>;
  clearWorkout: () => void;
  addLoggedExercise: (newExercise: LoggedExercise) => void;
  deleteLoggedExercise: (tempId: string) => void;
  addLoggedSet: (exerciseTempId: string) => void;
  updateLoggedSet: (exerciseTempId: string, setTempId: string, setData: Partial<LoggedSet>) => void;
  deleteLoggedSet: (exerciseTempId: string, setTempId: string) => void;

  // NEW: UI position actions
  setCurrentPosition: (exerciseIndex: number, setIndex: number) => void;
  moveToNextSet: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  moveToPreviousSet: () => void;
}

// --- HELPER FUNCTION ---
const groupAndSortExercises = (exercises: PlanExercise[] | null | undefined): PlanExercise[][] => {
  if (!exercises) return [];
  const groups = exercises.reduce((acc, exercise) => {
    const groupKey = exercise.execution_group;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(exercise);
    return acc;
  }, {} as Record<number, PlanExercise[]>);
  return Object.values(groups).slice().sort((a, b) => a[0].order_within_session - b[0].order_within_session);
};
const calculateWorkoutPosition = (exercises: PlanExercise[], loggedData: Record<string, LoggedSet[]>) => {
  for (let exerciseIndex = 0; exerciseIndex < exercises.length; exerciseIndex++) {
    const exercise = exercises[exerciseIndex];
    // FIX: Use exercise_id instead of id
    const loggedSets = loggedData[exercise.exercise_id] || [];
    const totalSetsForExercise = exercise.sets?.length || 0;

    // If this exercise has incomplete logged sets, return this position
    if (loggedSets.length < totalSetsForExercise) {
      return {
        exerciseIndex,
        setIndex: loggedSets.length // Next set to complete
      };
    }
  }

  // If all exercises are complete, stay at the last position
  const lastExerciseIndex = exercises.length - 1;
  const lastExercise = exercises[lastExerciseIndex];
  const lastSetIndex = (lastExercise?.sets?.length || 1) - 1;

  return {
    exerciseIndex: lastExerciseIndex,
    setIndex: lastSetIndex
  };
};

// --- STORE IMPLEMENTATION ---
export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      // --- INITIAL STATE ---
      activeSessionLog: null,
      plannedSession: null,
      groupedExercises: [],
      loggedExercises: [],
      startedAt: null,
      isCompleted: false,
      isLoading: true,
      currentExerciseIndex: 0,
      currentSetIndex: 0,

      // ... inside your useWorkoutStore create function ...

      checkForActiveSession: async () => {
        set({ isLoading: true });
        try {
          const { data: { user } } = await supabase.auth.getUser();

          if (!user) {
            // Handle no user logged in
            set({ isLoading: false, activeSessionLog: null /* clear other state */ });
            return;
          }

          // THIS IS THE FINAL FIX: Changed .single() to .maybeSingle()
          const { data: result, error } = await supabase
            .rpc('get_active_session_for_user', { p_user_id: user.id })
            .single<SessionLog>(); // Now we always get exactly 1 row

          const activeLog = result;
          if (activeLog) {
            // Active session found
          } else {
            // No active session (normal case)
          }
          // This error will now only trigger for real database problems, not for "not found".
          if (error) throw error;

          // The rest of your logic now works perfectly.
          // If no session is found, `activeLog` will be `null`, and your `else` block will run.
          if (activeLog) {
            // ... your logic for when a session IS found
          } else {
            console.log('No active session found in DB for this user. Clearing state.');
            set({
              activeSessionLog: null, plannedSession: null, groupedExercises: [], loggedExercises: [],
              startedAt: null, isLoading: false, isCompleted: false, currentExerciseIndex: 0, currentSetIndex: 0,
            });
          }
        } catch (err) {
          // ... your error handling
        } finally {
          set({ isLoading: false });
        }
      },

      // ... rest of your store actions ...
      startWorkout: (sessionLog, plannedSession) => {
        set({
          activeSessionLog: sessionLog,
          plannedSession: plannedSession,
          groupedExercises: plannedSession ? groupAndSortExercises(plannedSession.exercises) : [],
          loggedExercises: [], // Always start a fresh workout with an empty log
          startedAt: new Date().toISOString(),
          isCompleted: false,
          isLoading: false,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
        });
      },

      finishWorkout: async () => {
        const { activeSessionLog } = get();
        if (!activeSessionLog) {
          console.warn("finishWorkout called but no active session found.");
          return;
        }

        try {
          // THIS IS THE FIX: Call the new, secure endpoint function.
          await finishWorkoutSession(activeSessionLog.id);

          set({ isCompleted: true }); // Move to summary screen
          // The rest of your logic remains the same.
        } catch (err) {
          console.error("Error finishing workout", err);
          // Optionally, add a user-facing toast notification here.
        }
      },

      clearWorkout: () => {
        set({
          activeSessionLog: null, plannedSession: null, groupedExercises: [],
          loggedExercises: [], startedAt: null, isCompleted: false, isLoading: false,
          currentExerciseIndex: 0, currentSetIndex: 0,
        });
      },

      // --- NEW: UI Position Actions ---
      setCurrentPosition: (exerciseIndex, setIndex) => {
        set({ currentExerciseIndex: exerciseIndex, currentSetIndex: setIndex });
      },

      moveToNextSet: () => {
        const { currentExerciseIndex, currentSetIndex, plannedSession } = get();
        if (!plannedSession) return;

        const exercises = plannedSession.exercises.slice().sort((a, b) => a.order_within_session - b.order_within_session);
        const currentExercise = exercises[currentExerciseIndex];

        const isLastSet = currentSetIndex >= (currentExercise.sets?.length ?? 0) - 1;
        const isLastExercise = currentExerciseIndex >= exercises.length - 1;

        if (isLastSet && isLastExercise) {
          // This should trigger finishWorkout instead
          get().finishWorkout();
        } else if (isLastSet) {
          set({
            currentExerciseIndex: currentExerciseIndex + 1,
            currentSetIndex: 0
          });
        } else {
          set({ currentSetIndex: currentSetIndex + 1 });
        }
      },

      moveToPreviousSet: () => {
        const { currentExerciseIndex, currentSetIndex, plannedSession } = get();
        if (!plannedSession) return;

        const exercises = plannedSession.exercises.slice().sort((a, b) => a.order_within_session - b.order_within_session);

        if (currentSetIndex > 0) {
          set({ currentSetIndex: currentSetIndex - 1 });
        } else if (currentExerciseIndex > 0) {
          const prevExercise = exercises[currentExerciseIndex - 1];
          set({
            currentExerciseIndex: currentExerciseIndex - 1,
            currentSetIndex: (prevExercise.sets?.length ?? 1) - 1
          });
        }
      },

      // --- Ad-Hoc Actions ---
      addLoggedExercise: (newExercise) => set((state) => ({
        loggedExercises: [...state.loggedExercises, newExercise]
      })),

      deleteLoggedExercise: (tempId) => set((state) => ({
        loggedExercises: state.loggedExercises.filter(ex => ex._tempId !== tempId)
      })),

      addLoggedSet: (exerciseTempId) => set((state) => ({
        loggedExercises: state.loggedExercises.map(ex => {
          if (ex._tempId === exerciseTempId) {
            const nextSetNumber = ex.sets.length > 0 ? Math.max(...ex.sets.map(s => s.set_number)) + 1 : 1;
            return {
              ...ex,
              sets: [
                ...ex.sets,
                {
                  _tempId: `temp_set_${Date.now()}`,
                  set_number: nextSetNumber,
                  reps_performed: null,
                  weight_used_kg: null,
                }
              ]
            };
          }
          return ex;
        })
      })),

      updateLoggedSet: (exerciseTempId, setTempId, setData) => set((state) => ({
        loggedExercises: state.loggedExercises.map(ex => {
          if (ex._tempId === exerciseTempId) {
            return {
              ...ex,
              sets: ex.sets.map(s => {
                if (s._tempId === setTempId) {
                  return { ...s, ...setData };
                }
                return s;
              })
            };
          }
          return ex;
        })
      })),


      // Replace your goToNext function with this corrected version:

      goToNext: () => {
        const { groupedExercises, currentExerciseIndex, currentSetIndex, finishWorkout, loggedExercises } = get();
        if (!groupedExercises.length) return;

        const currentGroup = groupedExercises[currentExerciseIndex];
        const currentExercise = currentGroup[0]; // Assuming one exercise per group for simplicity now
        const setsInCurrentExercise = currentExercise.sets ?? [];

        // Ensure the current exercise/set is present in the persisted `loggedExercises`.
        // This saves a placeholder entry so refreshing retains the position and the fact
        // that the user progressed past this set.
        try {
          // FIX: Use exercise_id instead of id
          const exerciseId = currentExercise.exercise_id; // This is the actual exercise ID, not plan session exercise ID

          const existingLogged = loggedExercises.find(le => le.exercise_id === exerciseId);
          const setNumber = currentSetIndex + 1;

          if (!existingLogged) {
            const newLogged: any = {
              _tempId: `temp_ex_${Date.now()}`,
              exercise_id: exerciseId, // Correct exercise ID
              exercise_details: {
                id: exerciseId, // Use exercise_id here too
                name: currentExercise.exercise_details.name
              },
              sets: [
                {
                  _tempId: `temp_set_${Date.now()}_0`,
                  set_number: setNumber,
                  reps_performed: null,
                  weight_used_kg: null,
                }
              ]
            };
            set(state => ({ loggedExercises: [...state.loggedExercises, newLogged] }));
          } else {
            // Ensure the specific set exists on the logged exercise
            const hasSet = (existingLogged.sets || []).some((s: any) => s.set_number === setNumber);
            if (!hasSet) {
              const newSet = {
                _tempId: `temp_set_${Date.now()}_1`,
                set_number: setNumber,
                reps_performed: null,
                weight_used_kg: null,
              };
              set(state => ({
                loggedExercises: state.loggedExercises.map(ex => ex.exercise_id === exerciseId ? { ...ex, sets: [...(ex.sets || []), newSet] } : ex)
              }));
            }
          }
        } catch (err) {
          // Non-blocking: if saving placeholder fails, still continue navigation.
          console.error('Error ensuring logged exercise on goToNext:', err);
        }

        if (currentSetIndex < setsInCurrentExercise.length - 1) {
          // More sets in this exercise -> advance set index
          set({ currentSetIndex: currentSetIndex + 1 });
        } else if (currentExerciseIndex < groupedExercises.length - 1) {
          // Last set of an exercise, but more exercises exist -> advance exercise, reset set
          set({
            currentExerciseIndex: currentExerciseIndex + 1,
            currentSetIndex: 0,
          });
        } else {
          // Last set of the last exercise -> finish the workout
          finishWorkout();
        }
      },
      goToPrevious: () => {
        const { groupedExercises, currentExerciseIndex, currentSetIndex } = get();
        if (currentSetIndex > 0) {
          // Go back one set in the current exercise
          set({ currentSetIndex: currentSetIndex - 1 });
        } else if (currentExerciseIndex > 0) {
          // First set of an exercise, go to the last set of the previous exercise
          const prevGroup = groupedExercises[currentExerciseIndex - 1];
          const prevExercise = prevGroup[0];
          set({
            currentExerciseIndex: currentExerciseIndex - 1,
            currentSetIndex: (prevExercise.sets?.length ?? 1) - 1,
          });
        }
      },

      deleteLoggedSet: (exerciseTempId, setTempId) => set((state) => ({
        loggedExercises: state.loggedExercises.map(ex => {
          if (ex._tempId === exerciseTempId) {
            return {
              ...ex,
              sets: ex.sets.filter(s => s._tempId !== setTempId)
            };
          }
          return ex;
        })
      })),
    }),
    {
      // --- PERSISTENCE CONFIGURATION ---
      name: 'workout-in-progress-storage', // Key in localStorage
      storage: createJSONStorage(() => localStorage),
      // Only persist the state needed to resume a workout
      partialize: (state) => ({
        activeSessionLog: state.activeSessionLog,
        plannedSession: state.plannedSession,
        groupedExercises: state.groupedExercises,
        loggedExercises: state.loggedExercises, // This is the crucial part for ad-hoc
        startedAt: state.startedAt,
        currentExerciseIndex: state.currentExerciseIndex, // NEW: Persist UI position
        currentSetIndex: state.currentSetIndex, // NEW: Persist UI position
      }),
      // This function runs after the store is created and rehydrated from localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoading = false; // Mark loading as false once rehydration is complete
        }
      }
    }
  )
);