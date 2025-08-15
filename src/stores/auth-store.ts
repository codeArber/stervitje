// FILE: src/stores/auth-store.ts
import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';

// Define the shape of the store's state and actions
interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUserAndSession: (session: Session | null) => void;
  setIsLoading: (loading: boolean) => void;
}

// Create the Zustand store
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true, // Start in a loading state
  
  // Action to update both the session and the user
  setUserAndSession: (session) => set({
    session: session,
    user: session?.user ?? null,
  }),

  // Action to explicitly set the loading state
  setIsLoading: (loading) => set({ isLoading: loading }),
}));