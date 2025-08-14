import { Tables } from './database.types';

// --- Basic Table Types ---
export type ExerciseList = Tables<'exercises'>[];
export type Plan = Tables<'plans'>;
export type Exercise = Tables<'exercises'>;
export type Team = Tables<'teams'> & {
  plans_count: number;
  members_count: number;
};
export type Profile = Tables<'profiles'>;

// --- Payload Types for Form Data ---
export type ExerciseReferenceGlobal = Tables<'exercise_reference_global'>;
export type ExercisePayload = Omit<Tables<'exercises'>, 'id' | 'created_at' | 'created_by'>;
export type ExerciseMuscle = Tables<'exercise_muscle'>;
export type ExerciseToType = Tables<'exercise_to_type'>;
export type ExerciseToCategory = Tables<'exercise_to_category'>;
export type PlansPayload = Omit<Tables<'plans'>, 'id' | 'created_at' | 'created_by'>;
export type TeamsPayload = Omit<Tables<'teams'>, 'id' | 'created_at' | 'created_by'>;
export type UserMeasurements = Tables<'user_measurements'>;
export type ProfileUpdate = Omit<Tables<'profiles'>, 'id' | 'created_at'>;
export type PlanWeek = Tables<'plan_weeks'>;
export type PlanDay = Tables<'plan_days'>;
export type PlanSession = Tables<'plan_sessions'>;
export type PlanSessionExercise = Tables<'plan_session_exercises'>;
export type PlanSessionExerciseSet = Tables<'plan_session_exercise_sets'>;
export type SessionLog = Tables<'session_logs'>;
export type SetLog = Tables<'set_logs'>;

// --- Unit-Aware Types ---
// Generic type to handle values that have associated units
export type Measurement<T, U> = {
  value: T,
  unit: U
}

// Define specific measurement unit types used in the application
export type WeightUnit = "kg" | "lb";
export type DistanceUnit = "m" | "km" | "ft" | "mi";
export type LengthUnit = "cm" | "in";
export type UserPreferenceUnit = "metric" | "imperial"; // From the profiles table

// Define composite types for measurements that combine a value and a unit
export type Weight = Measurement<number, WeightUnit>;
export type Distance = Measurement<number, DistanceUnit>;
export type BodyMeasurement = Measurement<number, LengthUnit>;

// --- Display-Ready Transformed Types ---
// Transforms UserMeasurements into a display-ready format
export type DisplayReadyMeasurements = {
  weight_kg: number | null;
  height_cm: number | null;
  chest_cm: number | null;
  waist_cm: number | null;
  hips_cm: number | null;
  biceps_left_cm: number | null;
  biceps_right_cm: number | null;
  forearm_left_cm: number | null;
  forearm_right_cm: number | null;
  thigh_left_cm: number | null;
  thigh_right_cm: number | null;
  calf_left_cm: number | null;
  calf_right_cm: number | null;
  weight: Weight;
  height: BodyMeasurement;
  chest: BodyMeasurement;
  waist: BodyMeasurement;
  hips: BodyMeasurement;
  biceps_left: BodyMeasurement;
  biceps_right: BodyMeasurement;
  forearm_left: BodyMeasurement;
  forearm_right: BodyMeasurement;
  thigh_left: BodyMeasurement;
  thigh_right: BodyMeasurement;
  calf_left: BodyMeasurement;
  calf_right: BodyMeasurement;
};

// Transforms SetLogs into a display-ready format
export type DisplayReadySetLog = {
  id: string;
  exercise_log_id: string;
  set_number: number;
  reps_performed: number | null;
  weight_used: number | null;
  weight_unit: string | null;
  distance_meters: number | null;
  duration_seconds: number | null;
  notes: string | null;
  created_at: string | null;
  weight_used_display: Weight;
  distance_display: Distance;
};

// --- Relationship Types ---
// ExerciseList with relationships
export type ExerciseListWithRelations = ExerciseList & {
  exercise_to_type: ExerciseToType[],
  exercise_to_category: ExerciseToCategory[]
};

// Exercise with relationships
export type ExerciseWithRelations = Exercise & {
  exercise_to_type: ExerciseToType[],
  exercise_to_category: ExerciseToCategory[],
  exercise_muscles: ExerciseMuscle[],
  exercise_references: Tables<'exercise_saved_references'>[]
};

// ExerciseReferences with relationships
export type ExerciseReferences = Exercise & { 
  exercise_global_references: ExerciseReferenceGlobal[],
  exercise_references: Tables<'exercise_saved_references'>[]
};

// PlanDetail with nested relationships
export type PlanDetail = Plan & {
  weeks: PlanWeek[] & {
    days: PlanDay[] & {
      sessions: PlanSession[] & {
        exercises: (PlanSessionExercise & {
          details: Exercise,
          sets: (PlanSessionExerciseSet & {
            target_weight_display: Weight,
            target_distance_display: Distance
          })[]
        })[]
      }
    }
  }
};

// PlansOverview with counts
export type PlansOverview = Plan[] & {
  weeks: {
    count: number;
    days: {
      count: number;
      sessions: {
        count: number;
        exercises: {
          count: number;
        };
      };
    };
  };
};

// TeamDetail with members and plans
export type TeamDetail = Team & {
  team_members: (Tables<'team_members'> & {
    profiles: Profile
  })[],
  plans: PlansOverview[]
};

// ProfilePerformance with processed measurements
export type ProfilePerformance = Profile & {
  measurements: DisplayReadyMeasurements[]
};

// ProfileWorkoutHistory with workouts
export type ProfileWorkoutHistory = Profile & {
  workouts: SessionLog[]
};

// LoggedWorkout with display-ready set logs
export type LoggedWorkout = SessionLog & {
  logged_exercises: (PlanSessionExercise & {
    exercise: Exercise,
    sets_logged: DisplayReadySetLog[] 
  })[] 
};
