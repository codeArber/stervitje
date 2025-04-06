// src/types/scheduleTypes.ts (or src/types/planTypes.ts)

/**
 * Represents the summary of a plan day scheduled for today for the user.
 */
export interface TodayPlanSummary {
    user_plan_id: string; // ID of the user_plans entry
    plan_id: string;      // ID of the plan
    plan_title: string;   // Title of the plan
    plan_day_id: string;  // ID of the specific plan_days entry for today
    day_title?: string | null; // Title of the scheduled day (e.g., "Push Day")
    day_number: number;   // Day number within the week (1-7)
    week_number: number;  // Week number within the plan
}