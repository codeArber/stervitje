// FILE: /src/utils/plan-helpers.ts

import type { PlanHierarchy, PlanSession } from "@/types/plan";

/**
 * Traverses a plan's hierarchy to find a specific session by its ID.
 * @param hierarchy - The nested weeks, days, and sessions of a plan.
 * @param sessionId - The ID of the session to find.
 * @returns The session object if found, otherwise null.
 */
export const findSessionInPlan = (
  hierarchy: PlanHierarchy,
  sessionId: string
): PlanSession | null => {
  for (const week of hierarchy.weeks) {
    for (const day of week.days) {
      for (const session of day.sessions) {
        if (session.id === sessionId) {
          return session;
        }
      }
    }
  }
  return null;
};