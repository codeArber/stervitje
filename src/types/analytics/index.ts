// src/types/analytics/index.ts

import type { Tables } from "../database.types";

// These types directly correspond to the structure of our Materialized Views.

export type PlanAnalyticsSummary = Tables<'plan_analytics_summary'>;

export type CoachAnalyticsSummary = Tables<'coach_analytics_summary'>;