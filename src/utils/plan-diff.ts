// FILE: src/lib/plan-diff.ts

import type { FullPlan, PlanWeek, PlanDay, PlanSession, PlanExercise, PlanSet } from "@/types/plan";

// The Changeset interface can be simplified
export interface PlanChangeset {
  planId: string;
  [key: string]: any; // Allow dynamic keys for simplicity
  weeks: { added: any[]; deleted: string[]; };
  days: { added: any[]; deleted: string[]; };
  sessions: { added: any[]; deleted: string[]; };
  exercises: { added: any[]; deleted: string[]; };
  sets: { added: any[]; deleted: string[]; };
}
// ... (keep the PlanChangeset interface the same)


// FILE: src/lib/plan-diff.ts



export function diffPlan(original: FullPlan, current: FullPlan): PlanChangeset {
  console.log(original, current);
  const changeset: PlanChangeset = {
    planId: current.plan.id,
    weeks: { added: [], deleted: [] },
    days: { added: [], deleted: [] },
    sessions: { added: [], deleted: [] },
    exercises: { added: [], deleted: [] },
    sets: { added: [], deleted: [] },
  };

  // --- Step 1: Flatten everything from both original and current states ---
  const originalWeeks = original.hierarchy?.weeks ?? [];
  const originalDays = originalWeeks.flatMap(w => w.days ?? []);
  const originalSessions = originalDays.flatMap(d => d.sessions ?? []);
  const originalExercises = originalSessions.flatMap(s => s.exercises ?? []);
  const originalSets = originalExercises.flatMap(e => e.sets ?? []);

  const currentWeeks = current.hierarchy?.weeks ?? [];
  const currentDays = currentWeeks.flatMap(w => w.days ?? []);
  const currentSessions = currentDays.flatMap(d => d.sessions ?? []);
  const currentExercises = currentSessions.flatMap(s => s.exercises ?? []);
  const currentSets = currentExercises.flatMap(e => e.sets ?? []);
  
  // --- Step 2: Find all DELETED items by comparing ID sets ---
  const currentIds = {
      weeks: new Set(currentWeeks.map(w => w.id)),
      days: new Set(currentDays.map(d => d.id)),
      sessions: new Set(currentSessions.map(s => s.id)),
      exercises: new Set(currentExercises.map(e => e.id)),
      sets: new Set(currentSets.map(s => s.id)),
  };

  changeset.weeks.deleted = originalWeeks.filter(w => !currentIds.weeks.has(w.id)).map(w => w.id);
  changeset.days.deleted = originalDays.filter(d => !currentIds.days.has(d.id)).map(d => d.id);
  changeset.sessions.deleted = originalSessions.filter(s => !currentIds.sessions.has(s.id)).map(s => s.id);
  changeset.exercises.deleted = originalExercises.filter(e => !currentIds.exercises.has(e.id)).map(e => e.id);
  changeset.sets.deleted = originalSets.filter(s => !currentIds.sets.has(s.id)).map(s => s.id);

  // --- Step 3: Find all ADDED items ---
  // An item is new if its ID starts with 'temp-'. We create clean objects for the payload.
  changeset.weeks.added = currentWeeks
    .filter(w => w.id.startsWith('temp-'))
    .map(({ days,  ...rest }) => rest);
    
  changeset.days.added = currentDays
    .filter(d => d.id.startsWith('temp-'))
    .map(({ sessions, ...rest }) => rest);

  changeset.sessions.added = currentSessions
    .filter(s => s.id.startsWith('temp-'))
    .map(({ exercises, created_at, updated_at, is_completed_by_user, ...rest }) => rest);

  changeset.exercises.added = currentExercises
    .filter(e => e.id.startsWith('temp-'))
    .map(({ sets, exercise_details, created_at, updated_at, ...rest }) => rest);

  changeset.sets.added = currentSets
    .filter(s => s.id.startsWith('temp-'))
    .map(({ created_at, updated_at, intent, ...rest }) => rest);

  // --- We will add UPDATED items logic here in the future ---

  return changeset;
}