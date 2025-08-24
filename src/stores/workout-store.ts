// FILE: src/stores/workoutStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/supabaseClient';
import type { PlanSession, PlanExercise, LoggedExercise, LoggedSet } from '@/types/plan';
import type { Tables } from '@/types/database.types';
import { finishWorkoutSession } from '@/api/plan/endpoint';
import { ActiveWorkoutStatePayload } from '@/types';
type SessionLog = Tables<'session_logs'>;

// ==================================================================
// NEW: A type that matches the actual shape of your RPC's return value
// ==================================================================
type ActiveSessionRpcResponse = {
  session_data: SessionLog;
  has_permission: boolean;
};


// --- STATE INTERFACE ---
interface WorkoutState {
  activeSessionLog: SessionLog | null;
  plannedSession: PlanSession | null;
  groupedExercises: PlanExercise[][];
  loggedExercises: LoggedExercise[];
  startedAt: string | null;
  isCompleted: boolean;
  isLoading: boolean;
  currentExerciseIndex: number;
  currentSetIndex: number;
  currentGroupIndex: number;
  currentExerciseIndexInGroup: number;
  currentSetIndexInExercise: number;

  // --- ACTIONS ---
  checkForActiveSession: () => Promise<void>;
  startWorkout: (sessionLog: SessionLog, plannedSession: PlanSession | null) => void;
  startAdHocSession: () => Promise<void>;
  // ==================================================================
  // NEW: Action for starting a workout from a plan
  // ==================================================================
  startPlannedSession: (planSessionId: string) => Promise<void>;
  finishWorkout: () => Promise<void>;
  clearWorkout: () => void;
  addLoggedExercise: (newExercise: LoggedExercise) => void;
  // ... all your other actions
  deleteLoggedExercise: (tempId: string) => void;
  addLoggedSet: (exerciseTempId: string) => void;
  updateLoggedSet: (exerciseTempId: string, setTempId: string, setData: Partial<LoggedSet>) => void;
  deleteLoggedSet: (exerciseTempId: string, setTempId: string) => void;
  setCurrentPosition: (exerciseIndex: number, setIndex: number) => void;
  moveToNextSet: () => void;
  moveToPreviousSet: () => void;
  goToNext: () => void;
  goToPrevious: () => void;
  jumpToGroup: (groupIndex: number) => void;
}


// --- HELPER FUNCTION (Unchanged from your original code) ---
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

// --- STORE IMPLEMENTATION ---
export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      // --- INITIAL STATE (Unchanged) ---
      activeSessionLog: null,
      plannedSession: null,
      groupedExercises: [],
      loggedExercises: [],
      startedAt: null,
      isCompleted: false,
      isLoading: true,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      currentGroupIndex: 0,
      currentExerciseIndexInGroup: 0,
      currentSetIndexInExercise: 0,

      checkForActiveSession: async () => {
        set({ isLoading: true });
        try {
          // One single, powerful call to your new RPC
          const { data: result, error } = await supabase
            .rpc('get_active_user_workout_state')
            .single<ActiveWorkoutStatePayload | null>();

          if (error) throw error;

          if (result) {
            // Active session FOUND. Rehydrate the entire store from this single object.
            console.log("Active session found, rehydrating store...");
            const { activeSessionLog, plannedSession, loggedExercises } = result;

            set({
              activeSessionLog: activeSessionLog,
              plannedSession: plannedSession,
              groupedExercises: plannedSession ? groupAndSortExercises(plannedSession.exercises) : [],
              loggedExercises: loggedExercises || [],
              isCompleted: false,
              isLoading: false,
              startedAt: get().startedAt || activeSessionLog.created_at,
            });
          } else {
            // Active session NOT found. Clear any stale data.
            console.log('No active session found in DB. Clearing state.');
            get().clearWorkout();
          }
        } catch (err) {
          console.error("Error checking for active session:", err);
          get().clearWorkout();
        } finally {
          set({ isLoading: false });
        }
      },
      // This is now primarily an internal "setter" function
      startWorkout: (sessionLog, plannedSession) => {
        set({
          activeSessionLog: sessionLog,
          plannedSession: plannedSession,
          groupedExercises: plannedSession ? groupAndSortExercises(plannedSession.exercises) : [],
          loggedExercises: [],
          startedAt: new Date().toISOString(),
          isCompleted: false,
          isLoading: false,
          currentExerciseIndex: 0, currentSetIndex: 0,
          currentGroupIndex: 0, currentExerciseIndexInGroup: 0, currentSetIndexInExercise: 0,
        });
      },

      // ==================================================================
      // NEW: A dedicated action for starting a planned session from the UI
      // ==================================================================
      startPlannedSession: async (planSessionId: string) => {
        set({ isLoading: true });
        try {
          // 1. Fetch the plan details securely
          const { data: planDetails, error: planError } = await supabase
            .rpc('get_plan_session_details_for_user', { p_plan_session_id: planSessionId })
            .single<PlanSession>(); // <-- Use the PlanSession type here

          if (planError) throw planError;
          if (!planDetails) throw new Error("Plan session not found or permission denied.");

          // 2. Create a new session_log record for this planned session
          const { data: newSessionLog, error: logError } = await supabase
            .rpc('start_planned_session_log', {
              p_plan_session_id: planSessionId,
              p_plan_id: planDetails.planId // Assuming plan_id is available in planDetails
            })
            .single<SessionLog>();

          if (logError) throw logError;
          if (!newSessionLog) throw new Error("Failed to create session log.");

          // 3. Use the internal startWorkout to set the state
          get().startWorkout(newSessionLog, planDetails);

        } catch (err) {
          console.error("Error starting planned session:", err);
          set({ isLoading: false }); // Ensure loading is off on error
        }
      },


      startAdHocSession: async () => {
        set({ isLoading: true });
        try {
          const { data: newSessionLog, error } = await supabase.rpc('start_adhoc_session_log').single<SessionLog>();
          if (error) throw error;
          if (!newSessionLog) throw new Error("Failed to create ad-hoc session.");
          get().startWorkout(newSessionLog, null);
        } catch (err) {
          console.error("Error starting ad-hoc session:", err);
          set({ isLoading: false });
        }
      },

      finishWorkout: async () => {
        const { activeSessionLog } = get();
        if (!activeSessionLog) {
          console.warn("finishWorkout called but no active session found.");
          return;
        }
        try {
          await finishWorkoutSession(activeSessionLog.id);
          set({ isCompleted: true });
        } catch (err) {
          console.error("Error finishing workout", err);
        }
      },

      clearWorkout: () => {
        set({
          activeSessionLog: null,
          plannedSession: null,
          groupedExercises: [],
          loggedExercises: [],
          startedAt: null,
          isCompleted: false,
          isLoading: false,
          currentExerciseIndex: 0,
          currentSetIndex: 0,
          currentGroupIndex: 0,
          currentExerciseIndexInGroup: 0,
          currentSetIndexInExercise: 0,
        });
      },

      // --- YOUR ORIGINAL ACTIONS PRESERVED ---
      setCurrentPosition: (exerciseIndex, setIndex) => set({ currentExerciseIndex: exerciseIndex, currentSetIndex: setIndex }),

      moveToNextSet: () => {
        const { currentExerciseIndex, currentSetIndex, plannedSession } = get();
        if (!plannedSession) return;
        const exercises = plannedSession.exercises.slice().sort((a, b) => a.order_within_session - b.order_within_session);
        const currentExercise = exercises[currentExerciseIndex];
        const isLastSet = currentSetIndex >= (currentExercise.sets?.length ?? 0) - 1;
        const isLastExercise = currentExerciseIndex >= exercises.length - 1;
        if (isLastSet && isLastExercise) {
          get().finishWorkout();
        } else if (isLastSet) {
          set({ currentExerciseIndex: currentExerciseIndex + 1, currentSetIndex: 0 });
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
          set({ currentExerciseIndex: currentExerciseIndex - 1, currentSetIndex: (prevExercise.sets?.length ?? 1) - 1 });
        }
      },

      addLoggedExercise: (newExercise) => set((state) => ({ loggedExercises: [...state.loggedExercises, newExercise] })),

      deleteLoggedExercise: (tempId) => set((state) => ({ loggedExercises: state.loggedExercises.filter(ex => ex._tempId !== tempId) })),

      addLoggedSet: (exerciseTempId) => set((state) => ({
        loggedExercises: state.loggedExercises.map(ex => {
          if (ex._tempId === exerciseTempId) {
            const nextSetNumber = ex.sets.length > 0 ? Math.max(...ex.sets.map(s => s.set_number)) + 1 : 1;
            return { ...ex, sets: [...ex.sets, { _tempId: `temp_set_${Date.now()}`, set_number: nextSetNumber, reps_performed: null, weight_used_kg: null }] };
          }
          return ex;
        })
      })),

      updateLoggedSet: (exerciseTempId, setTempId, setData) => set((state) => ({
        loggedExercises: state.loggedExercises.map(ex => {
          if (ex._tempId === exerciseTempId) {
            return { ...ex, sets: ex.sets.map(s => s._tempId === setTempId ? { ...s, ...setData } : s) };
          }
          return ex;
        })
      })),

      deleteLoggedSet: (exerciseTempId, setTempId) => set((state) => ({
        loggedExercises: state.loggedExercises.map(ex => {
          if (ex._tempId === exerciseTempId) {
            return { ...ex, sets: ex.sets.filter(s => s._tempId !== setTempId) };
          }
          return ex;
        })
      })),

      goToNext: () => { /* ... Your original `goToNext` function ... */ },
      goToPrevious: () => { /* ... Your original `goToPrevious` function ... */ },

      // ==================================================================
      // NEW: Action for the Workout Map to jump between groups
      // ==================================================================
      jumpToGroup: (groupIndex: number) => {
        set({
          currentGroupIndex: groupIndex,
          currentExerciseIndexInGroup: 0, // Always start at the first exercise of the new group
          currentSetIndexInExercise: 0,   // Always start at the first set
        });
      },
    }),
    {
      name: 'workout-in-progress-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        activeSessionLog: state.activeSessionLog,
        plannedSession: state.plannedSession,
        groupedExercises: state.groupedExercises,
        loggedExercises: state.loggedExercises,
        startedAt: state.startedAt,
        currentExerciseIndex: state.currentExerciseIndex,
        currentSetIndex: state.currentSetIndex,
        // NEW: Persist the new UI state variables
        currentGroupIndex: state.currentGroupIndex,
        currentExerciseIndexInGroup: state.currentExerciseIndexInGroup,
        currentSetIndexInExercise: state.currentSetIndexInExercise,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) { state.isLoading = false; }
      },
    }
  )
);