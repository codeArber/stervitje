// store/selectedContextStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface SelectedContextState {
  /**
   * ID of the currently selected team.
   * `null` indicates the personal account context is active.
   * A `string` indicates a specific team context is active.
   */
  selectedTeamId: string | null;

}

export const useTeamStore = create<SelectedContextState>()(
  persist(
    (set) => ({
      // --- State ---
      selectedTeamId: null, // Default to the personal account context
    }),
    {
      name: 'selected-context-storage', // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // Or sessionStorage
      // No need to partialize, as we want to persist the entire simple state (just selectedTeamId)
    }
  )
);