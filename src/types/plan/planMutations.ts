// FILE: src/types/plan/planMutations.ts

import { Tables } from "../database.types";


// Assuming you have a way to define temporary IDs on the client side,
// which are typically strings (e.g., 'temp-week-123')
type ClientSideTempId = string;

/**
 * @description Represents a payload for a single added item in a plan hierarchy.
 * It includes a client-side temporary ID for tracking before the database assigns a real UUID.
 * Changed from `interface extends T` to `type = T & { ... }` for better compatibility
 * with complex generic types like Omit.
 */
export type AddedHierarchyItem<T> = T & {
  id: ClientSideTempId; // Client-side temporary ID
};

/**
 * @description Represents the structure of changes applied to a plan's hierarchy.
 * This is used by the `save_plan_changes` RPC to manage additions and deletions across all levels.
 *
 * NOTE: The RPC currently handles 'added' and 'deleted' arrays. 'Updated' can be added later
 * if the RPC is extended for partial updates within the hierarchy (rather than full re-creation).
 */
export interface PlanChangeset {
  planId: string; // The UUID of the plan being modified

  weeks?: {
    added?: AddedHierarchyItem<Omit<Tables<'plan_weeks'>, 'id' | 'plan_id' | 'created_at' | 'updated_at'>>[];
    deleted?: string[]; // Array of UUIDs for deleted weeks
  };

  days?: {
    added?: AddedHierarchyItem<Omit<Tables<'plan_days'>, 'id' | 'plan_week_id' | 'created_at'>>[];
    deleted?: string[]; // Array of UUIDs for deleted days
  };

  sessions?: {
    added?: AddedHierarchyItem<Omit<Tables<'plan_sessions'>, 'id' | 'plan_day_id' | 'created_at' | 'updated_at'>>[];
    deleted?: string[]; // Array of UUIDs for deleted sessions
  };

  exercises?: {
    added?: AddedHierarchyItem<Omit<Tables<'plan_session_exercises'>, 'id' | 'plan_session_id' | 'created_at' | 'updated_at'>>[];
    deleted?: string[]; // Array of UUIDs for deleted exercises
  };

  sets?: {
    added?: AddedHierarchyItem<Omit<Tables<'plan_session_exercise_sets'>, 'id' | 'plan_session_exercise_id' | 'created_at' | 'updated_at'>>[];
    deleted?: string[]; // Array of UUIDs for deleted sets
  };

  // You can extend this for other nested items or for updates if your RPC supports it
  // updated?: {
  //   weeks?: Partial<Tables<'plan_weeks'>>[];
  //   // ... etc.
  // };
}