// src/types/index.ts (or wherever you define your types)

// Based on public.profiles table
export interface UserProfile {
    id: string; // UUID
    username: string;
    full_name?: string | null;
    bio?: string | null;
    profile_image_url?: string | null;
    updated_at?: string | null; // ISO Date String
    created_at?: string | null; // ISO Date String
}

// Based on public.teams table
export interface Team {
    id: string; // UUID
    name: string;
    description?: string | null;
    logo_url?: string | null;
    sport?: string | null;
    is_private?: boolean;
    created_at?: string | null;
    updated_at?: string | null;
    created_by?: string | null; // UUID
}

// For get_user_context RPC result
export interface TeamMembershipSummary {
    role: 'coach' | 'assistant_coach' | 'member';
    joined_at: string; // ISO Date String
    team: Team; // Nested team object
}

export interface UserContext {
    profile: UserProfile | null;
    teams: TeamMembershipSummary[];
}

// Base Plan type (list view)
export interface Plan {
    id: string;
    title: string;
    description?: string | null;
    difficulty_level?: number | null;
    duration_weeks?: number | null;
    sport?: string | null;
    created_by?: string | null;
    team_id?: string | null;
    visibility: 'public' | 'team' | 'private';
    allow_public_forking: boolean;
    origin_type: 'user' | 'admin' | 'ai' | 'coach';
    is_featured: boolean;
    view_count: number;
    fork_count: number;
    like_count: number;
    forked_from?: string | null;
    created_at: string; // ISO Date String
    updated_at?: string | null;
}

// Type for discoverable plans RPC (includes creator/team names)
export interface DiscoverablePlan extends Plan {
     team_name?: string | null;
     created_by_username?: string | null;
     created_by_profile_image_url?: string | null;
}

// Type for Exercise (basic info)
export interface ExerciseSummary {
    id: string;
    name: string;
    image_url?: string | null;
    video_url?: string | null;
}

// Type for Plan Exercise Detail
export interface PlanExerciseDetail {
    id: string;
    plan_day_id: string;
    exercise_id: string;
    order_index: number;
    sets?: string | null;
    reps?: string | null;
    duration?: string | null;
    distance?: string | null;
    rest_time?: string | null;
    target_sets_min?: number | null;
    target_sets_max?: number | null;
    // ... other target fields ...
    notes?: string | null;
    exercises: ExerciseSummary; // Nested Exercise info
}

// Type for Plan Day Detail
export interface PlanDayDetail {
    id: string;
    plan_week_id: string;
    day_number: number;
    title?: string | null;
    description?: string | null;
    is_rest_day: boolean;
    plan_exercises: PlanExerciseDetail[]; // Nested exercises
}

// Type for Plan Week Detail
export interface PlanWeekDetail {
    id: string;
    plan_id: string;
    week_number: number;
    description?: string | null;
    plan_days: PlanDayDetail[]; // Nested days
}

// Type for Full Plan Detail (used in fetchPlanDetails)
export interface PlanDetail extends Plan {
    profiles?: Pick<UserProfile, 'username' | 'profile_image_url'> | null; // Creator profile subset
    teams?: Pick<Team, 'name' | 'logo_url'> | null; // Team subset
    plan_weeks: PlanWeekDetail[]; // Fully nested structure
}

// Type for Set Log
export interface SetLog {
    id: string;
    exercise_log_id: string;
    set_number: number;
    reps_performed?: number | null;
    weight_used?: number | null; // Assuming DECIMAL becomes number
    weight_unit?: string | null;
    duration_seconds?: number | null;
    distance_meters?: number | null; // Assuming DECIMAL becomes number
    notes?: string | null;
    created_at: string;
}

// Type for Exercise Log (nested within WorkoutLog)
export interface ExerciseLog {
    id: string;
    notes?: string | null;
    order_index?: number | null;
    exercises: Pick<ExerciseSummary, 'id' | 'name'>; // Reference to the exercise
    set_logs: SetLog[];
}

// Type for Workout Log History Item
export interface WorkoutLog {
    id: string;
    date: string; // Date string YYYY-MM-DD
    title?: string | null;
    notes?: string | null;
    duration_minutes?: number | null;
    overall_feeling?: number | null;
    created_at: string;
    privacy_level: 'private' | 'team' | 'public';
    exercise_logs: ExerciseLog[]; // Nested exercise logs
}

// Type for the payload sent to log_workout RPC
export interface WorkoutLogPayload {
    workoutLog: Omit<WorkoutLog, 'id' | 'created_at' | 'exercise_logs' | 'user_id'> & { user_plan_id?: string | null, plan_day_id?: string | null };
    exerciseLogs: Array<Omit<ExerciseLog, 'id' | 'exercises' | 'set_logs'> & { exercise_id: string, plan_exercise_id?: string | null, setLogs: Array<Omit<SetLog, 'id' | 'exercise_log_id' | 'created_at'>> }>;
}


// Type for Team Member with Profile info
export interface TeamMemberWithProfile {
    role: 'coach' | 'assistant_coach' | 'member';
    joined_at: string;
    user_id: string; // The user's ID
    profile: Pick<UserProfile, 'id' | 'username' | 'full_name' | 'profile_image_url'> | null; // Nested Profile subset
}

// Add other types as needed...