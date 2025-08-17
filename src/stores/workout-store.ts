// FILE: /src/stores/workout-store.ts

import { create } from 'zustand';
import { supabase } from '@/lib/supabase/supabaseClient';
import type { PlanSession } from '@/types/plan';
import type { Tables } from '@/types/database.types';

// Internal helper to call the RPC with proper typing
const fetchActiveSessionRpc = async (): Promise<Tables<'session_logs'> | null> => {
    const { data, error } = await supabase.rpc('get_active_session_for_user').single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means 0 rows, which is a valid result
        throw error;
    }

    // THE CRITICAL FIX IS HERE: We explicitly cast the returned data.
    return data as Tables<'session_logs'> | null;
};


// --- Main Store Interface ---

interface WorkoutState {
  // --- GLOBAL STATE ---
  globalActiveSession: Tables<'session_logs'> | null;
  isCheckingGlobalSession: boolean;
  checkGlobalActiveSession: () => Promise<void>;

  // --- WORKOUT PLAYER STATE ---
  playerSessionLog: Tables<'session_logs'> | null;
  playerActiveSession: PlanSession | null;
  isPlayerCompleted: boolean;
  initializePlayer: (sessionLog: Tables<'session_logs'>, session: PlanSession) => void;
  finishPlayer: () => void;
  resetPlayer: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  // --- INITIAL STATE ---
  globalActiveSession: null,
  isCheckingGlobalSession: true,
  playerSessionLog: null,
  playerActiveSession: null,
  isPlayerCompleted: false,

  // --- ACTION IMPLEMENTATIONS ---

  /**
   * Fetches the globally active session from the database.
   */
  checkGlobalActiveSession: async () => {
    set({ isCheckingGlobalSession: true });
    try {
      const session = await fetchActiveSessionRpc();
      set({ globalActiveSession: session, isCheckingGlobalSession: false });
    } catch (error) {
      console.error("Failed to fetch active session:", error);
      set({ globalActiveSession: null, isCheckingGlobalSession: false });
    }
  },

  /**
   * Populates the store with the data needed for the workout player UI.
   */
  initializePlayer: (sessionLog, session) => {
    set({
      playerSessionLog: sessionLog,
      playerActiveSession: session,
      isPlayerCompleted: false,
    });
  },
  
  /**
   * Marks the player as completed and clears the global active session state.
   */
  finishPlayer: () => {
    set({ isPlayerCompleted: true, globalActiveSession: null });
    // We can also trigger a re-check to be safe, but clearing it locally is faster for the UI
    // useWorkoutStore.getState().checkGlobalActiveSession(); 
  },
  
  /**
   * Resets only the player-specific state when the user leaves the workout page.
   */
  resetPlayer: () => {
    set({
      playerSessionLog: null,
      playerActiveSession: null,
      isPlayerCompleted: false,
    });
  },
}));