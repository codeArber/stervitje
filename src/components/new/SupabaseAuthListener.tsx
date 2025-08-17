// src/components/new/SupabaseAuthListener.tsx
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';
import { supabase } from '@/lib/supabase/supabaseClient';

export function SupabaseAuthListener() {
  // Get the checkUserSession action from the store directly
  const { checkUserSession, setUser, setProfile, signOut } = useAuthStore.getState();

  useEffect(() => {
    // 1. On component mount, immediately check the user session.
    // This handles the initial load of the application.
    checkUserSession();

    // 2. Set up the real-time listener for auth state changes.
    // This handles login, logout, session refresh, and other events.
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase Auth Event:', event, 'Session:', session);
      if (session) {
        // If a session exists, re-check the user and profile
        // This will update user/profile and set isLoading to false
        checkUserSession(); // This will fetch user and profile based on the new session
      } else if (event === 'SIGNED_OUT') {
        // If signed out, explicitly clear the state using the store's signOut logic
        signOut(); // This ensures user, profile are null and isLoading is false
      }
      // For other events like 'INITIAL_SESSION', 'TOKEN_REFRESHED', checkUserSession covers it
    });

    // Clean up the listener when the component unmounts
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [checkUserSession, setUser, setProfile, signOut]); // Depend on actions from the store

  return null; // This component does not render any UI itself
}