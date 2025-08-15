import { useAuthStore } from '@/stores/auth-store';
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- START: ZUSTAND AUTH LISTENER ---

// 1. Get the initial session right away
supabase.auth.getSession().then(({ data: { session } }) => {
  // Use .getState() to call actions from outside a React component
  useAuthStore.getState().setUserAndSession(session);
  useAuthStore.getState().setIsLoading(false);
});

// 2. Set up a listener for any future auth changes
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setUserAndSession(session);
  useAuthStore.getState().setIsLoading(false);
});
