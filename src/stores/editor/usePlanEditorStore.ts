// FILE: src/stores/editor/usePlanEditorStore.ts

import { createStore } from 'zustand';
import { produce } from 'immer';
import type { FullPlan, PlanWeek, PlanDay, PlanSession, PlanExercise, PlanSet } from '@/types/plan';

// --- State and Actions Interface (Corrected) ---

export interface PlanEditorState {
  plan: FullPlan | null;
  originalPlan: FullPlan | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadPlan: (planDetails: FullPlan) => void;
  clearPlan: () => void;
  updatePlanDetail: <K extends keyof FullPlan['plan']>(field: K, value: FullPlan['plan'][K]) => void;
  addWeek: (newWeek: PlanWeek) => void;
  updateWeek: (weekIndex: number, updatedWeek: Partial<PlanWeek>) => void;
  deleteWeek: (weekIndex: number) => void;
  addDay: (weekIndex: number, newDay: PlanDay) => void;
  updateDay: (weekIndex: number, dayIndex: number, updatedDay: Partial<PlanDay>) => void;
  deleteDay: (weekIndex: number, dayIndex: number) => void;
  addSession: (weekIndex: number, dayIndex: number, newSession: PlanSession) => void;
  updateSession: (weekIndex: number, dayIndex: number, sessionIndex: number, updatedSession: Partial<PlanSession>) => void;
  deleteSession: (weekIndex: number, dayIndex: number, sessionIndex: number) => void;
  addExercise: (weekIndex: number, dayIndex: number, sessionIndex: number, newExercise: PlanExercise) => void;
  
  deleteExercise: (weekIndex: number, dayIndex: number, sessionIndex: number, exerciseIndex: number) => void;
  // --- SET-LEVEL ACTIONS ARE NOW DEFINED HERE ---
  addSet: (weekIndex: number, dayIndex: number, sessionIndex: number, exerciseIndex: number, newSet: PlanSet) => void;
  updateSet: (weekIndex: number, dayIndex: number, sessionIndex: number, exerciseIndex: number, setIndex: number, updatedSet: Partial<PlanSet>) => void;
  deleteSet: (weekIndex: number, dayIndex: number, sessionIndex: number, exerciseIndex: number, setIndex: number) => void;
}

// --- Store Creator Function (Corrected) ---

export const createPlanEditorStore = () => createStore<PlanEditorState>((set) => ({
  // --- Initial State ---
  plan: null,
  originalPlan: null,
  isLoading: true,
  error: null,

  // --- Action Implementations ---
 loadPlan: (planDetails) => {
    // We MUST create two independent copies of the incoming data.
    const mutablePlan = JSON.parse(JSON.stringify(planDetails));
    const originalSnapshot = JSON.parse(JSON.stringify(planDetails));
    
    set({
      plan: mutablePlan,
      originalPlan: originalSnapshot,
      isLoading: false,
      error: null,
    });
  },
  clearPlan: () => set({ plan: null, originalPlan: null, isLoading: true, error: null }),
  updatePlanDetail: (field, value) => set(produce((state: PlanEditorState) => { if (state.plan) { state.plan.plan[field] = value; } })),

  updateWeek: (weekIndex, updatedWeek) => set(produce((state: PlanEditorState) => { if (state.plan) { Object.assign(state.plan.hierarchy.weeks[weekIndex], updatedWeek); } })),

  
  updateDay: (weekIndex, dayIndex, updatedDay) => set(produce((state: PlanEditorState) => { if (state.plan) { Object.assign(state.plan.hierarchy.weeks[weekIndex].days[dayIndex], updatedDay); } })),

  updateSession: (weekIndex, dayIndex, sessionIndex, updatedSession) => set(produce((state: PlanEditorState) => { if (state.plan) { Object.assign(state.plan.hierarchy.weeks[weekIndex].days[dayIndex].sessions[sessionIndex], updatedSession); } })),

  // Updated actions in your usePlanEditorStore.ts

addWeek: (newWeek) => set(produce((state: PlanEditorState) => {
  if (!state.plan) return;
  // Use splice or push instead of assignment to avoid frozen array issues
  if (!state.plan.hierarchy.weeks) {
    state.plan.hierarchy.weeks = [];
  }
  state.plan.hierarchy.weeks.push(newWeek);
})),

addDay: (weekIndex, newDay) => set(produce((state: PlanEditorState) => {
  const week = state.plan?.hierarchy.weeks[weekIndex];
  if (!week) return;
  
  // Initialize days array if it doesn't exist
  if (!week.days) {
    week.days = [];
  }
  
  // Use push instead of assignment
  week.days.push(newDay);
})),

addSession: (weekIndex, dayIndex, newSession) => set(produce((state: PlanEditorState) => {
  const day = state.plan?.hierarchy.weeks[weekIndex]?.days[dayIndex];
  if (!day) return;
  
  if (!day.sessions) {
    day.sessions = [];
  }
  
  day.sessions.push(newSession);
})),

addExercise: (weekIndex, dayIndex, sessionIndex, newExercise) => set(produce((state: PlanEditorState) => {
  const session = state.plan?.hierarchy.weeks[weekIndex]?.days[dayIndex]?.sessions[sessionIndex];
  if (!session) return;
  
  if (!session.exercises) {
    session.exercises = [];
  }
  
  session.exercises.push(newExercise);
})),

addSet: (weekIndex, dayIndex, sessionIndex, exerciseIndex, newSet) => set(produce((state: PlanEditorState) => {
  const exercise = state.plan?.hierarchy.weeks[weekIndex]?.days[dayIndex]?.sessions[sessionIndex]?.exercises[exerciseIndex];
  if (!exercise) return;
  
  // If sets doesn't exist or is null, create a new array
  if (!exercise.sets) {
    exercise.sets = [newSet];
  } else {
    // If sets exists, push to it
    exercise.sets.push(newSet);
  }
})),

deleteWeek: (weekIndex) => set(produce((state: PlanEditorState) => {
  if (!state.plan?.hierarchy.weeks) return;
  state.plan.hierarchy.weeks.splice(weekIndex, 1);
})),

// Fix deleteDay - use splice instead of filter assignment
deleteDay: (weekIndex, dayIndex) => set(produce((state: PlanEditorState) => {
  const week = state.plan?.hierarchy.weeks[weekIndex];
  if (!week?.days) return;
  week.days.splice(dayIndex, 1);
})),

// Fix deleteSession - use splice instead of filter assignment
deleteSession: (weekIndex, dayIndex, sessionIndex) => set(produce((state: PlanEditorState) => {
  const day = state.plan?.hierarchy.weeks[weekIndex]?.days[dayIndex];
  if (!day?.sessions) return;
  day.sessions.splice(sessionIndex, 1);
})),

// Fix deleteExercise - use splice instead of filter assignment
deleteExercise: (weekIndex, dayIndex, sessionIndex, exerciseIndex) => set(produce((state: PlanEditorState) => {
  const session = state.plan?.hierarchy.weeks[weekIndex]?.days[dayIndex]?.sessions[sessionIndex];
  if (!session?.exercises) return;
  session.exercises.splice(exerciseIndex, 1);
})),

// Fix updateSet - use direct array indexing instead of map assignment
updateSet: (weekIndex, dayIndex, sessionIndex, exerciseIndex, setIndex, updatedSet) => set(produce((state: PlanEditorState) => {
  const exercise = state.plan?.hierarchy.weeks[weekIndex]?.days[dayIndex]?.sessions[sessionIndex]?.exercises[exerciseIndex];
  if (!exercise?.sets?.[setIndex]) return;
  Object.assign(exercise.sets[setIndex], updatedSet);
})),

// Fix deleteSet - use splice instead of filter assignment
deleteSet: (weekIndex, dayIndex, sessionIndex, exerciseIndex, setIndex) => set(produce((state: PlanEditorState) => {
  const exercise = state.plan?.hierarchy.weeks[weekIndex]?.days[dayIndex]?.sessions[sessionIndex]?.exercises[exerciseIndex];
  if (!exercise?.sets) return;
  exercise.sets.splice(setIndex, 1);
})),
}));