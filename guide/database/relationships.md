# To create a basic type from a table
TABLE ExerciseList = Exercises[]
TABLE plan = Plans
TABLE exercise = Exercises
TABLE team = Teams
TABLE profile = Profiles

# To create a type for a form payload
PAYLOAD ExerciseReferenceGlobal
PAYLOAD Exercise
PAYLOAD ExerciseMuscle
PAYLOAD ExerciseToType
PAYLOAD ExerciseToCategory
PAYLOAD Plans
PAYLOAD Teams
PAYLOAD UserMeasurements
PAYLOAD ProfileUpdate
PAYLOAD PlanWeek
PAYLOAD PlanDay
PAYLOAD PlanSession
PAYLOAD PlanSessionExercise
PAYLOAD PlanSessionExerciseSet
PAYLOAD SessionLog # For logging a completed workout session
PAYLOAD SetLog # For logging a single set within a workout

# --- Unit-Aware Types ---
# Generic type to handle values that have associated units
TYPE Measurement<T, U> = {
    value: T,
    unit: U
}

# Define specific measurement unit types used in the application
TYPE WeightUnit = "kg" | "lb"
TYPE DistanceUnit = "m" | "km" | "ft" | "mi"
TYPE LengthUnit = "cm" | "in"
TYPE UserPreferenceUnit = "metric" | "imperial" # From the profiles table

# Define composite types for measurements that combine a value and a unit
TYPE Weight = Measurement<number, WeightUnit>
TYPE Distance = Measurement<number, DistanceUnit>
TYPE BodyMeasurement = Measurement<number, LengthUnit>


# --- NEW: Display-Ready Transformed Types ---
# These types take all fields from a source table (*) but transform specific
# columns into unit-aware types for display purposes.

# Transforms UserMeasurements into a display-ready format
TYPE DisplayReadyMeasurements = ALL_FIELDS_FROM<UserMeasurements> BUT_REPLACE {
    weight_kg -> weight: Weight,
    height_cm -> height: BodyMeasurement,
    chest_cm -> chest: BodyMeasurement,
    waist_cm -> waist: BodyMeasurement,
    hips_cm -> hips: BodyMeasurement,
    biceps_left_cm -> biceps_left: BodyMeasurement,
    biceps_right_cm -> biceps_right: BodyMeasurement,
    forearm_left_cm -> forearm_left: BodyMeasurement,
    forearm_right_cm -> forearm_right: BodyMeasurement,
    thigh_left_cm -> thigh_left: BodyMeasurement,
    thigh_right_cm -> thigh_right: BodyMeasurement,
    calf_left_cm -> calf_left: BodyMeasurement,
    calf_right_cm -> calf_right: BodyMeasurement
}

# Transforms SetLogs into a display-ready format
TYPE DisplayReadySetLog = ALL_FIELDS_FROM<SetLogs> BUT_REPLACE {
    weight_used -> weight_used_display: Weight,
    distance_meters -> distance_display: Distance
}


# To create a custom type with relationships
TYPE ExerciseList = Exercises[] & {
    exercise_type: ExerciseToType[],
    exercise_category: ExerciseToCategory[]
}

TYPE Exercise = exercise & {
    exercise_type: ExerciseToType[],
    exercise_category: ExerciseToCategory[],
    exercise_muscles: ExerciseMuscle[],
    exercise_references: ExerciseSavedReferences[]
}

TYPE ExerciseReferences = Exercises & { 
    exercise_global_references: ExerciseReferenceGlobal[],
    exercise_references: ExerciseSavedReferences[]
}

TYPE PlanDetail = plan & {
    weeks: PlanWeeks[] & {
        days: PlanDays[] & {
            sessions: PlanSessions[] & {
                exercises: (PlanSessionExercises & {
                    details: exercise,
                    sets: (PlanSessionExerciseSets & {
                        target_weight_display: Weight,
                        target_distance_display: Distance
                    })[]
                })[]
            }
        }
    }
}

TYPE PlansOverview = Plans[] & {
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

TYPE TeamDetail = team & {
    members: (team_members & {
        profile: profile
    })[],
    plans: PlansOverview[]
}

# UPDATED to use the new DisplayReadyMeasurements type
TYPE ProfilePerformance = profile & {
    # Processed measurements, ready for display in user's preferred units
    measurements: DisplayReadyMeasurements[]
}

TYPE ProfileWorkoutHistory = profile & {
    workouts: LoggedWorkout[]
}

# UPDATED to use the new DisplayReadySetLog type
TYPE LoggedWorkout = SessionLogs & {
    logged_exercises: (plan_session_exercises & {
        exercise: exercise,
        sets_logged: DisplayReadySetLog[] 
    })[] 
}