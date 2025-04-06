// src/store/useWorkoutStore.ts
import { create } from 'zustand';
import type { WorkoutState, WorkoutLogInfo, ExerciseLogEntry, SetLogEntry, WorkoutPayload } from '@/types/workoutTypes'; // Adjust path
// Import the type for your fetched session data
import type { PlanSessionDetails } from '@/types/planTypes'; // Adjust path for YOUR session detail type
import { nanoid } from 'nanoid';

const initialState = {
  isLogging: false,
  workoutLog: null,
  exerciseLogs: [],
  status: 'idle' as WorkoutState['status'],
  sourceSessionId: null,
};

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  ...initialState,

  // --- Actions ---
  startWorkout: (initialDetails = {}, sessionId = null) => {
    const today = new Date().toISOString().split('T')[0];
    set({
      isLogging: true,
      workoutLog: {
        date: today,
        privacy_level: 'private',
        ...initialDetails,
        sessionId: sessionId, // Store the session ID if provided
      },
      exerciseLogs: [],
      status: 'logging',
      sourceSessionId: sessionId,
    });
    console.log("Workout started, Session ID:", sessionId);
  },

  // --- NEW ACTION ---
  initializeFromSession: (sessionData: PlanSessionDetails) => { // Use your actual session type
      if (!sessionData) {
          console.error("Cannot initialize from null session data");
          return;
      }
      console.log("Initializing workout store from session:", sessionData.id);

      const initialExerciseLogs: ExerciseLogEntry[] = (sessionData.plan_session_exercises || []).map((planEx, exIndex): ExerciseLogEntry => {
          const plannedSets: SetLogEntry[] = (planEx.plan_session_exercise_sets || []).map((planSet, setIndex): SetLogEntry => {
              // Map planned set data to the SetLogEntry structure
              return {
                  tempId: nanoid(8),
                  set_number: planSet.set_number || (setIndex + 1), // Use planned number or fallback
                  // --- Copy Target Values ---
                  target_reps: planSet.target_reps,
                  target_weight: planSet.target_weight,
                  target_weight_unit: planSet.target_weight_unit,
                  target_duration_seconds: planSet.target_duration_seconds,
                  target_distance_meters: planSet.target_distance_meters,
                  target_rest_seconds: planSet.target_rest_seconds, // Rest after planned set
                  // --- Initialize Performed Values (e.g., to null or copy targets) ---
                  reps_performed: null, // Start empty
                  weight_used: null,    // Start empty
                  // weight_unit_performed: planSet.target_weight_unit, // Or null? Depends on UI
                  duration_seconds_performed: null,
                  distance_meters_performed: null,
                  notes: null, // Start with no notes for performed set
                  // --- Initial Status ---
                  isCompleted: false,
              };
          });

          return {
              tempId: nanoid(8),
              exercise_id: planEx.exercise_id,
              plan_exercise_id: planEx.id, // Link back to the plan_session_exercise ID
              notes: planEx.notes || null, // Copy overall planned notes initially?
              order_index: planEx.order_index || (exIndex + 1),
              setLogs: plannedSets,
          };
      });

      set((state) => ({
          exerciseLogs: initialExerciseLogs,
          // Optionally update workoutLog details from sessionData if needed
          // workoutLog: {
          //     ...state.workoutLog!, // Assume workoutLog exists if initializing
          //     title: state.workoutLog?.title || sessionData.title || `Workout from Session`,
          //     plan_day_id: sessionData.plan_day_id // If available on sessionData
          // }
      }));
  },

  updateWorkoutLogDetails: (details) => { /* ... (keep as before) ... */ },

  // Updated addExerciseLog to return the created entry
  addExerciseLog: ({ exercise_id, plan_exercise_id = null, order_index }) => {
      let newExerciseLog: ExerciseLogEntry | null = null;
      set((state) => {
          if (!state.isLogging) return {};
          const determinedOrder = order_index ?? state.exerciseLogs.length + 1;
          newExerciseLog = {
              tempId: nanoid(8),
              exercise_id,
              plan_exercise_id,
              notes: null,
              order_index: determinedOrder,
              setLogs: [],
          };
          return { exerciseLogs: [...state.exerciseLogs, newExerciseLog] };
      });
      console.log("Unplanned Exercise added:", newExerciseLog);
      return newExerciseLog!; // Return the newly created log
  },

  updateExerciseLogNotes: (tempId, notes) => { /* ... (keep as before) ... */ },
  removeExerciseLog: (tempId) => { /* ... (keep as before) ... */ },

  // addSetLog is now primarily for *unplanned* sets
  addSetLog: (exerciseTempId, setDetails) => {
      set((state) => ({
          exerciseLogs: state.exerciseLogs.map((exLog) => {
              if (exLog.tempId === exerciseTempId) {
                  const nextSetNumber = exLog.setLogs.length + 1;
                  const newSet: SetLogEntry = {
                      tempId: nanoid(8),
                      set_number: nextSetNumber,
                      // Targets would likely be null for unplanned sets unless copied
                      target_reps: null, target_weight: null, target_weight_unit: null,
                      target_duration_seconds: null, target_distance_meters: null, target_rest_seconds: null,
                      // Performed values from input
                      reps_performed: setDetails.reps_performed ?? null,
                      weight_used: setDetails.weight_used ?? null,
                      // weight_unit_performed: setDetails.weight_unit_performed ?? null,
                      duration_seconds_performed: setDetails.duration_seconds_performed ?? null,
                      distance_meters_performed: setDetails.distance_meters_performed ?? null,
                      notes: setDetails.notes ?? null,
                      isCompleted: false, // Start as not completed
                  };
                  return { ...exLog, setLogs: [...exLog.setLogs, newSet] };
              }
              return exLog;
          }),
      }));
       console.log("Unplanned Set added to exercise:", exerciseTempId);
  },

  // updateSetLog can now update any part of the SetLogEntry
  updateSetLog: (exerciseTempId, setTempId, updates) => {
      set((state) => ({
          exerciseLogs: state.exerciseLogs.map((exLog) =>
              exLog.tempId === exerciseTempId
                  ? { ...exLog, setLogs: exLog.setLogs.map(setLog =>
                        setLog.tempId === setTempId ? { ...setLog, ...updates } : setLog
                    )}
                  : exLog
          ),
      }));
       console.log("Set updated:", setTempId, "in exercise:", exerciseTempId, "Updates:", updates);
  },

  // --- NEW ACTION ---
  toggleSetCompleted: (exerciseTempId, setTempId) => {
      set((state) => ({
          exerciseLogs: state.exerciseLogs.map((exLog) =>
              exLog.tempId === exerciseTempId
                  ? { ...exLog, setLogs: exLog.setLogs.map(setLog =>
                        setLog.tempId === setTempId ? { ...setLog, isCompleted: !setLog.isCompleted } : setLog
                    )}
                  : exLog
          ),
      }));
       console.log("Set completion toggled:", setTempId);
  },

  removeSetLog: (exerciseTempId, setTempId) => { /* ... (keep logic, including re-numbering) ... */ },

  resetWorkout: () => { set(initialState); console.log("Workout store reset."); },
  setStatus: (status) => set({ status }),

  // --- UPDATED getWorkoutPayload ---
  getWorkoutPayload: (): WorkoutPayload | null => {
    const state = get();
    if (!state.isLogging || !state.workoutLog) { return null; }

    const payload: WorkoutPayload = {
      workoutLog: {
          // Exclude client-side stuff like sessionId if not needed by RPC
          user_plan_id: state.workoutLog.user_plan_id,
          plan_day_id: state.workoutLog.plan_day_id,
          date: state.workoutLog.date,
          title: state.workoutLog.title,
          notes: state.workoutLog.notes,
          duration_minutes: state.workoutLog.duration_minutes,
          overall_feeling: state.workoutLog.overall_feeling,
          privacy_level: state.workoutLog.privacy_level,
      },
      exerciseLogs: state.exerciseLogs.map(exLog => {
          const { tempId, setLogs, ...restOfExLog } = exLog;
          return {
              ...restOfExLog, // contains exercise_id, plan_exercise_id, notes, order_index
              setLogs: setLogs.map(sLog => {
                  // Map ONLY the fields expected by the RPC for the 'set_logs' table insert
                  return {
                      set_number: sLog.set_number,
                      reps_performed: sLog.reps_performed,
                      weight_used: sLog.weight_used,
                      // Send the unit used (assuming target_weight_unit holds it or you add weight_unit_performed)
                      weight_unit: sLog.target_weight_unit,
                      // Send performed duration/distance if they exist
                      duration_seconds: sLog.duration_seconds_performed ?? sLog.target_duration_seconds,
                      distance_meters: sLog.distance_meters_performed ?? sLog.target_distance_meters,
                      notes: sLog.notes,
                       // Decide if you log target_rest_seconds or actual rest (usually not logged per set)
                  };
              })
          };
      })
    };
    return payload;
  }

}));