// FILE: src/stores/workout-store.ts

import { create } from 'zustand';
import type { SessionLog } from '@/types/workout/index';
import type { ActiveExercise, ActiveSet } from '@/types/workout/index';

// Define the shape of the store's state and actions
interface WorkoutState {
  sessionLog: SessionLog | null;
  activeExercises: ActiveExercise[];
  currentExerciseIndex: number;
  currentSetIndex: number;
  isCompleted: boolean;

  // --- ACTIONS ---
  // Initializes the store with data for a new workout session
  startWorkout: (sessionLog: SessionLog, exercises: ActiveExercise[]) => void;
  
  // Updates a set with the user's performed values
  updateSet: (reps: number, weight: number) => void;

  // Marks the current set as complete and moves to the next
  completeSet: () => void;
  
  // Moves to the next exercise
  nextExercise: () => void;
  
  // Ends the workout
  finishWorkout: () => void;
  
  // Resets the store to its initial state
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  // --- INITIAL STATE ---
  sessionLog: null,
  activeExercises: [],
  currentExerciseIndex: 0,
  currentSetIndex: 0,
  isCompleted: false,

  // --- ACTION IMPLEMENTATIONS ---
  startWorkout: (sessionLog, exercises) => {
    set({
      sessionLog,
      activeExercises: exercises,
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isCompleted: false,
    });
  },

  updateSet: (reps, weight) => {
    set((state) => {
      const newActiveExercises = [...state.activeExercises];
      const currentExercise = newActiveExercises[state.currentExerciseIndex];
      if (currentExercise) {
        const currentSet = currentExercise.sets[state.currentSetIndex];
        if (currentSet) {
          currentSet.performed_reps = reps;
          currentSet.performed_weight = weight;
        }
      }
      return { activeExercises: newActiveExercises };
    });
  },

  completeSet: () => {
    set((state) => {
      const newActiveExercises = [...state.activeExercises];
      const currentExercise = newActiveExercises[state.currentExerciseIndex];
      
      if (!currentExercise) return {};
      
      const currentSet = currentExercise.sets[state.currentSetIndex];
      if (currentSet) {
        currentSet.is_completed = true;
      }
      
      // Check if there are more sets in the current exercise
      if (state.currentSetIndex < currentExercise.sets.length - 1) {
        // Move to the next set
        return {
          activeExercises: newActiveExercises,
          currentSetIndex: state.currentSetIndex + 1,
        };
      } else {
        // It was the last set, move to the next exercise
        get().nextExercise();
        // Since nextExercise calls set(), we don't need to return state here.
        // But to be safe and explicit, let's return the updated exercises.
        return { activeExercises: newActiveExercises };
      }
    });
  },

  nextExercise: () => {
    set((state) => {
      // Check if there are more exercises in the workout
      if (state.currentExerciseIndex < state.activeExercises.length - 1) {
        return {
          currentExerciseIndex: state.currentExerciseIndex + 1,
          currentSetIndex: 0, // Reset set index for the new exercise
        };
      } else {
        // It was the last exercise, the workout is complete
        return { isCompleted: true };
      }
    });
  },
  
  finishWorkout: () => {
    set({ isCompleted: true });
  },
  
  reset: () => {
    set({
      sessionLog: null,
      activeExercises: [],
      currentExerciseIndex: 0,
      currentSetIndex: 0,
      isCompleted: false,
    });
  },
}));