import React, { createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { createPlanEditorStore, PlanEditorState } from './usePlanEditorStore';

// --- Define the Store's Type ---
// This is a bit of TypeScript magic to get the return type of our creator function.
type PlanEditorStore = ReturnType<typeof createPlanEditorStore>;

// --- Create the React Context ---
// This context will hold the instance of our store.
const PlanEditorContext = createContext<PlanEditorStore | null>(null);

// --- Create the Provider Component ---
// This component will be wrapped around our entire PlanEditPage.
// It creates a new store instance and provides it to all children.

interface PlanEditorProviderProps {
  children: React.ReactNode;
}

export const PlanEditorProvider: React.FC<PlanEditorProviderProps> = ({ children }) => {
  // useRef ensures that we only create the store *once* per component instance.
  // This is critical to prevent re-creating the store on every re-render.
  const storeRef = useRef<PlanEditorStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createPlanEditorStore();
  }

  return (
    <PlanEditorContext.Provider value={storeRef.current}>
      {children}
    </PlanEditorContext.Provider>
  );
};

// --- Create the Custom Hook (Fixed Version) ---
// This is the hook that all of our child components will use to access the store.

export const usePlanEditor = () => {
  const store = useContext(PlanEditorContext);
  if (!store) {
    throw new Error('usePlanEditor must be used within a PlanEditorProvider');
  }
  
  // Return the entire state - this avoids selector issues entirely
  return useStore(store);
};

// --- Individual selector hooks for better performance ---
// These can be used when you only need specific parts of the state
export const usePlanEditorPlan = () => {
  const store = useContext(PlanEditorContext);
  if (!store) {
    throw new Error('usePlanEditor must be used within a PlanEditorProvider');
  }
  
  return useStore(store, (state) => state.plan);
};

export const usePlanEditorOriginalPlan = () => {
  const store = useContext(PlanEditorContext);
  if (!store) {
    throw new Error('usePlanEditor must be used within a PlanEditorProvider');
  }
  
  return useStore(store, (state) => state.originalPlan);
};


export const usePlanEditorLoading = () => {
  const store = useContext(PlanEditorContext);
  if (!store) {
    throw new Error('usePlanEditor must be used within a PlanEditorProvider');
  }
  
  return useStore(store, (state) => state.isLoading);
};