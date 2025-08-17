// src/stores/auth-store.ts
import { create } from 'zustand';
import type { User } from '@supabase/supabase-js'; // Import User type from Supabase
import { supabase } from '@/lib/supabase/supabaseClient';

// Define your Profile type based on your Supabase 'profiles' table
export interface Profile { // Ensure 'export' is here
  id: string;
  onboarding_completed: boolean;
  full_name: string | null;
  username: string | null;
  // Add any other profile fields you use in your 'profiles' table
}

interface AuthState {
  user: User | null; // Use Supabase User type
  profile: Profile | null; // Use your defined Profile type
  isLoading: boolean;
  checkUserSession: () => Promise<void>;
  signOut: () => Promise<void>;
  setProfile: (profile: Profile | null) => void; // Explicitly type the profile
  setUser: (user: User | null) => void; // Add a setUser for consistency
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true, // Start as loading

  checkUserSession: async () => {
    try {
      console.log('Checking user session...');
      set({ isLoading: true }); // Ensure loading is true at the start of the check

      // Get current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        set({ user: null, profile: null, isLoading: false });
        return;
      }

      if (!session?.user) {
        console.log('No session found');
        set({ user: null, profile: null, isLoading: false });
        return;
      }

      console.log('Session found, fetching profile...');
      set({ user: session.user });

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        set({ profile: null, isLoading: false });
        return;
      }

      console.log('Profile loaded:', profileData);
      set({ profile: profileData, isLoading: false });
      
    } catch (error) {
      console.error('Check session error:', error);
      set({ user: null, profile: null, isLoading: false });
    }
  },

  setProfile: (profile) => {
    set({ profile });
  },

  setUser: (user) => { // Added for explicit user updates if needed
    set({ user });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, isLoading: false }); // Reset state after sign out
  },
}));