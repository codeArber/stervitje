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

export function diffPlan(original: FullPlan, current: FullPlan): PlanChangeset {
  const changeset: PlanChangeset = {
    planId: current.plan.id,
    weeks: { added: [], deleted: [] },
    days: { added: [], deleted: [] },
    sessions: { added: [], deleted: [] },
    exercises: { added: [], deleted: [] },
    sets: { added: [], deleted: [] },
  };

  const originalIds = {
    weeks: new Set(original.hierarchy.weeks.map(w => w.id)),
    days: new Set(original.hierarchy.weeks.flatMap(w => w.days ?? []).map(d => d.id)),
    sessions: new Set(original.hierarchy.weeks.flatMap(w => w.days ?? []).flatMap(d => d.sessions ?? []).map(s => s.id)),
    exercises: new Set(original.hierarchy.weeks.flatMap(w => w.days ?? []).flatMap(d => d.sessions ?? []).flatMap(s => s.exercises ?? []).map(e => e.id)),
    sets: new Set(original.hierarchy.weeks.flatMap(w => w.days ?? []).flatMap(d => d.sessions ?? []).flatMap(s => s.exercises ?? []).flatMap(e => e.sets ?? []).map(s => s.id)),
  };
  
  // --- Find ADDED items (Corrected, Cleaner Logic) ---
  
  // Flatten all current items into lists
  const currentWeeks = current.hierarchy.weeks;
  const currentDays = currentWeeks.flatMap(w => w.days ?? []);
  const currentSessions = currentDays.flatMap(d => d.sessions ?? []);
  const currentExercises = currentSessions.flatMap(s => s.exercises ?? []);
  const currentSets = currentExercises.flatMap(e => e.sets ?? []);

  // Find and clean added items for each level
  changeset.weeks.added = currentWeeks.filter(w => w.id.startsWith('temp-')).map(({ days, ...rest }) => rest);
  changeset.days.added = currentDays.filter(d => d.id.startsWith('temp-')).map(({ sessions, ...rest }) => rest);
  changeset.sessions.added = currentSessions.filter(s => s.id.startsWith('temp-')).map(({ exercises, ...rest }) => rest);
  changeset.exercises.added = currentExercises.filter(e => e.id.startsWith('temp-')).map(({ sets, exercise_details, ...rest }) => rest);
  changeset.sets.added = currentSets.filter(s => s.id.startsWith('temp-'));

  // --- Find DELETED items (Logic remains the same) ---
  originalIds.weeks.forEach(id => { if (!currentWeeks.some(w => w.id === id)) changeset.weeks.deleted.push(id); });
  originalIds.days.forEach(id => { if (!currentDays.some(d => d.id === id)) changeset.days.deleted.push(id); });
  originalIds.sessions.forEach(id => { if (!currentSessions.some(s => s.id === id)) changeset.sessions.deleted.push(id); });
  originalIds.exercises.forEach(id => { if (!currentExercises.some(e => e.id === id)) changeset.exercises.deleted.push(id); });
  originalIds.sets.forEach(id => { if (!currentSets.some(s => s.id === id)) changeset.sets.deleted.push(id); });

  return changeset;
}