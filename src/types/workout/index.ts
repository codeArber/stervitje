import { Tables, TablesInsert } from "../database.types";

// --- Base Types ---
// These types are now correct based on your updated database schema.
export type SessionLog = Tables<'session_logs'>;
export type SetLog = Tables<'set_logs'>;
export type PlanSessionExercise = Tables<'plan_session_exercises'>;
export type PlanSessionExerciseSet = Tables<'plan_session_exercise_sets'>;
export type Exercise = Tables<'exercises'>;
export type PlanSession = Tables<'plan_sessions'>;

// The type for data needed to create a new set log.
export type NewSetLog = TablesInsert<'set_logs'>;


// --- RPC Response Type for get_workout_details ---

// Performed Workout Types
type PerformedSet = SetLog;

// CORRECTED: Based on session_exercise_logs table, not plan_session_exercises
type PerformedExercise = Tables<'session_exercise_logs'> & {
  exercise_details: Exercise;
  sets: PerformedSet[] | null;
};

// CORRECTED: Only 'log_summary' and 'performed_exercises' are returned
export type WorkoutDetails = {
  log_summary: SessionLog; // Changed from 'performed' to 'log_summary' to match RPC
  performed_exercises: PerformedExercise[] | null; // Changed from 'exercises' to 'performed_exercises' to match RPC
};

// Planned Workout Types (These are NOT returned by get_workout_details RPC)
// If you have another RPC that returns this, keep these types.
// Otherwise, they might be for internal UI state and don't need to match RPC output directly.
// For now, I'm assuming they're potentially for UI or another planned RPC.
type PlannedSet = PlanSessionExerciseSet;

type PlannedExercise = PlanSessionExercise & {
  exercise_details: Exercise;
  sets: PlannedSet[] | null;
};

type PlannedSession = {
    session: PlanSession;
    exercises: PlannedExercise[] | null;
};

export type ActiveSet = {
  id: string; // The ID of the plan_session_exercise_sets record
  set_number: number;
  // Planned values
  target_reps: number | null;
  target_weight: number | null;
  // Performed values (initially null)
  performed_reps: number | null;
  performed_weight: number | null;
  is_completed: boolean;
};

/**
 * **NEW:** Represents a single exercise within a live workout session.
 */
export type ActiveExercise = {
  id: string; // The ID of the plan_session_exercises record
  exercise_details: Exercise;
  sets: ActiveSet[];
};