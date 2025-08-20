// FILE: src/lib/goal-metrics.ts

import type { Enums } from "@/types/database.types";

// A single source of truth for all possible goal metrics
export const ALL_GOAL_METRICS: Enums<'goal_metric'>[] = [
    "one_rep_max_kg",
    "max_weight_for_reps_kg",
    "total_volume_kg",
    "max_reps_at_weight",
    "max_reps_bodyweight",
    "time_to_complete_distance",
    "distance_in_time",
    "max_duration_seconds",
    "avg_pace_seconds_per_km",
    "avg_speed_kmh",
    "avg_heart_rate_bpm",
    "vo2_max",
    "max_vertical_jump_cm",
    "max_box_jump_height_cm",

    "throw_distance_m",
    "successful_attempts_percent",
    "balance_duration_seconds",
    "bodyweight_kg",
    "body_fat_percent",
    "muscle_mass_kg",
    "waist_circumference_cm",
    "sessions_completed_count",
    "adherence_percent",
    "total_active_time_minutes"
];

// Define a type for our category structure for better type safety
export type GoalCategory = {
    name: string;
    metrics: {
        value: Enums<'goal_metric'>;
        label: string; // A human-readable label for the UI
        unit: string; // The unit for the target_value input
    }[];
};

// --- The Main Categorized List ---
export const GOAL_CATEGORIES: GoalCategory[] = [
    {
        name: "Strength & Power",
        metrics: [
            { value: "one_rep_max_kg", label: "One Rep Max (1RM)", unit: "kg" },
            { value: "max_weight_for_reps_kg", label: "Max Weight for Reps", unit: "kg" },
            { value: "total_volume_kg", label: "Total Volume", unit: "kg" },
            { value: "max_reps_at_weight", label: "Max Reps at Weight", unit: "reps" },
            { value: "max_reps_bodyweight", label: "Max Reps (Bodyweight)", unit: "reps" },
        ]
    },
    {
        name: "Explosiveness",
        metrics: [
            { value: "max_vertical_jump_cm", label: "Max Vertical Jump", unit: "cm" },
            { value: "max_box_jump_height_cm", label: "Max Box Jump Height", unit: "cm" },
            { value: "throw_distance_m", label: "Throw Distance", unit: "m" },
        ]
    },
    {
        name: "Endurance & Cardio",
        metrics: [
            { value: "time_to_complete_distance", label: "Time to Complete Distance", unit: "seconds" },
            { value: "distance_in_time", label: "Distance in Time", unit: "meters" },
            { value: "max_duration_seconds", label: "Max Duration", unit: "seconds" },
            { value: "avg_pace_seconds_per_km", label: "Average Pace", unit: "s/km" },
            { value: "avg_speed_kmh", label: "Average Speed", unit: "km/h" },
            { value: "avg_heart_rate_bpm", label: "Average Heart Rate", unit: "bpm" },
            { value: "vo2_max", label: "VO2 Max", unit: "ml/kg/min" },
        ]
    },
    {
        name: "Body Composition",
        metrics: [
            { value: "bodyweight_kg", label: "Bodyweight", unit: "kg" },
            { value: "body_fat_percent", label: "Body Fat", unit: "%" },
            { value: "muscle_mass_kg", label: "Muscle Mass", unit: "kg" },
            { value: "waist_circumference_cm", label: "Waist Circumference", unit: "cm" },
        ]
    },
    {
        name: "Skill & Consistency",
        metrics: [
            { value: "successful_attempts_percent", label: "Successful Attempts", unit: "%" },
            { value: "balance_duration_seconds", label: "Balance Duration", unit: "seconds" },
            { value: "sessions_completed_count", label: "Sessions Completed", unit: "sessions" },
            { value: "adherence_percent", label: "Adherence", unit: "%" },
            { value: "total_active_time_minutes", label: "Total Active Time", unit: "minutes" },
        ]
    }
];

// Helper function to find a metric by its value
export const findMetricByValue = (value: string | undefined) => {
    if (!value) return null;
    for (const category of GOAL_CATEGORIES) {
        const metric = category.metrics.find(m => m.value === value);
        if (metric) return metric;
    }
    return null;
};