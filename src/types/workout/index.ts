// src/types/workout/index.ts

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

type PerformedExercise = PlanSessionExercise & {
  exercise_details: Exercise;
  sets: PerformedSet[] | null;
};

type PerformedSession = SessionLog & {
  exercises: PerformedExercise[] | null;
};

// Planned Workout Types
type PlannedSet = PlanSessionExerciseSet;

type PlannedExercise = PlanSessionExercise & {
  exercise_details: Exercise;
  sets: PlannedSet[] | null;
};

type PlannedSession = {
    session: PlanSession;
    exercises: PlannedExercise[] | null;
};

// The main type for the get_workout_details function response.
export type WorkoutDetails = {
  performed: PerformedSession;
  planned: PlannedSession | null;
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