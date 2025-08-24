// FILE: /src/api/plan/queryKeys.ts

import type { PlanFilters } from "@/types/plan";
import type { DiscoverableUserFilters } from "@/types/user";

export const planKeys = {
  all: ['plans'] as const,
  lists: () => [...planKeys.all, 'list'] as const,
  list: (filters: PlanFilters) => [...planKeys.lists(), filters] as const,
  details: () => [...planKeys.all, 'details'] as const,
  detail: (planId: string) => [...planKeys.details(), planId] as const, // For FullPlan
  performanceLists: () => [...planKeys.all, 'performance', 'list'] as const,
  performanceList: (planId: string) => [...planKeys.performanceLists(), planId] as const,
  sessionLogs: () => [...planKeys.all, 'sessionLog'] as const, // For individual session logs
  sessionLog: (sessionId: string) => [...planKeys.sessionLogs(), sessionId] as const,
  teamPlans: (teamId: string) => [...planKeys.all, 'team', teamId] as const, // For plans belonging to a specific team

  // Hierarchy specific keys (can be part of detail or separate)
  planGoals: (planId: string) => [...planKeys.detail(planId), 'goals'] as const, // For a plan's goals
  planWeeks: (planId: string) => [...planKeys.detail(planId), 'weeks'] as const, // For a plan's weeks
  planDays: (weekId: string) => [...planKeys.all, 'week', weekId, 'days'] as const, // For a week's days
  planSessions: (dayId: string) => [...planKeys.all, 'day', dayId, 'sessions'] as const, // For a day's sessions
  planSessionExercises: (sessionId: string) => [...planKeys.all, 'session', sessionId, 'exercises'] as const, // For a session's exercises
  planSessionExerciseSets: (exerciseId: string) => [...planKeys.all, 'exercise', exerciseId, 'sets'] as const, // For an exercise's sets

  // Workout/Baseline related keys
  pendingBaselines: (sessionId: string) => [...planKeys.all, 'pending-baselines', sessionId] as const,
};

export const tagKeys = {
  all: ['tags'] as const,
  lists: () => [...tagKeys.all, 'list'] as const,
  list: (type: string) => [...tagKeys.lists(), { type }] as const,
};