// src/types/workoutLogTypes.ts

// Details for a single performed set, now including targets and completion
export interface SetLogEntry {
  tempId: string; // Client-side temporary ID
  set_number: number;

  // --- Planned Target Values (from session plan) ---
  target_reps?: number | null;
  target_weight?: number | null;
  target_weight_unit?: 'kg' | 'lb' | null;
  target_duration_seconds?: number | null;
  target_distance_meters?: number | null;
  target_rest_seconds?: number | null; // Rest after *this planned* set

  // --- Actual Performed Values (user input) ---
  reps_performed?: number | null;
  weight_used?: number | null;
  // weight_unit_performed?: 'kg' | 'lb' | null; // Or reuse target_weight_unit if always the same
  duration_seconds_performed?: number | null; // Or reuse target_duration_seconds
  distance_meters_performed?: number | null; // Or reuse target_distance_meters
  notes?: string | null; // Notes for the *performed* set

  // --- Status ---
  isCompleted: boolean;
}

// ExerciseLogEntry remains mostly the same, just contains the updated SetLogEntry
export interface ExerciseLogEntry {
  tempId: string;
  exercise_id: string;
  plan_exercise_id?: string | null; // Link back to the planned exercise entry
  notes?: string | null; // Overall notes for the performed exercise
  order_index: number;
  setLogs: SetLogEntry[]; // Array of sets (planned/performed)
}

// WorkoutLogInfo remains the same
export interface WorkoutLogInfo {
  user_plan_id?: string | null;
  plan_day_id?: string | null;
  // Add sessionId if you want to store which session was logged
  sessionId?: string | null;
  date: string;
  title?: string | null;
  notes?: string | null;
  duration_minutes?: number | null;
  overall_feeling?: number | null;
  privacy_level?: 'private' | 'team' | 'public';
}

// Structure expected by log_workout RPC (Focus on performed data)
export interface WorkoutPayload {
  workoutLog: Omit<WorkoutLogInfo, 'sessionId' | 'date'> & { date: string | Date }; // Don't send sessionId?
  exerciseLogs: Array<Omit<ExerciseLogEntry, 'tempId' | 'setLogs'> & {
    // Send only the data the RPC needs for set_logs table
    setLogs: Array<{
        set_number: number;
        reps_performed?: number | null;
        weight_used?: number | null;
        weight_unit?: 'kg' | 'lb' | null; // Send the unit used
        duration_seconds?: number | null; // Send performed duration
        distance_meters?: number | null; // Send performed distance
        notes?: string | null;
        // Maybe send target_rest_seconds if RPC needs it? Or maybe rest isn't logged per set?
        // Check what your set_logs table actually stores
    }>;
  }>;
}

// Updated Zustand State shape
export interface WorkoutState {
  isLogging: boolean;
  workoutLog: WorkoutLogInfo | null;
  exerciseLogs: ExerciseLogEntry[];
  status: 'idle' | 'logging' | 'submitting' | 'error' | 'submitted';
  // Reference to the session plan being logged (optional)
  sourceSessionId?: string | null;

  // Actions
  startWorkout: (initialDetails?: Partial<WorkoutLogInfo>, sessionId?: string) => void; // Can now accept sessionId
  initializeFromSession: (sessionData: any) => void; // Type this properly later
  updateWorkoutLogDetails: (details: Partial<WorkoutLogInfo>) => void;
  addExerciseLog: (exercise: { exercise_id: string; plan_exercise_id?: string | null; order_index?: number }) => ExerciseLogEntry; // Return new entry
  updateExerciseLogNotes: (tempId: string, notes: string | null) => void;
  removeExerciseLog: (tempId: string) => void;
  addSetLog: (exerciseTempId: string, setDetails: Partial<Omit<SetLogEntry, 'set_number' | 'tempId' | 'isCompleted'>>) => void; // For unplanned sets
  updateSetLog: (exerciseTempId: string, setTempId: string, updates: Partial<SetLogEntry>) => void; // Can update any field now
  toggleSetCompleted: (exerciseTempId: string, setTempId: string) => void; // New action
  removeSetLog: (exerciseTempId: string, setTempId: string) => void;
  resetWorkout: () => void;
  setStatus: (status: WorkoutState['status']) => void;
  getWorkoutPayload: () => WorkoutPayload | null;
}