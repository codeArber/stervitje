import { Metric, TeamMembershipSummary, UserContext, UserProfile } from '@/types';
import { create } from 'zustand';
// Remove Supabase User import if no longer used directly
// import { User } from '@supabase/supabase-js';
// Keep randomHexColor import ONLY if the getColor logic (which likely needs changing) still uses it
// import { randomHexColor } from '@/cad/editor/lib/utils';

// --- Define the NEW data structures based on your UserContext ---



// --- Updated AuthState Interface for Zustand ---

interface AuthState {
    token: string | undefined | null; // Keep token if Zustand manages it
    profile: UserProfile | null | undefined; // Replaces 'user', uses new type
    teams: TeamMembershipSummary[] | undefined; // Added teams state

    // Action to set the new context data
    setUserContext: (context: UserContext) => void;
    // Action to clear the user data (replaces dispose)
    clearUserContext: () => void;

    // Selectors - Signatures remain mostly the same, but implementation *must* change
    canAccessProtectedRoutes: () => boolean;
    isReadOnly: () => boolean; // Implementation needs new logic based on profile/teams
    getId: () => string | undefined;
    // getUserId removed as duplicate
    getEmail: () => string | undefined; // Implementation needs new logic (email not in UserProfile)
    getAvatarUrl: () => string | null | undefined;
    getUserName: () => string | undefined;
    getFullName: () => string | null | undefined;
    getFirstName: () => string | undefined;
    getLastName: () => string | undefined;
    getPreferredUnit: () => Metric | undefined; // Added selector for 'unit'
    getColor: () => `#${string}` | undefined; // Implementation needs review (random might be bad)
}

// --- Adapted Zustand Store Creation ---

export const useAuthStore = create<AuthState>((set, get) => ({
    // Initial state
    token: null,
    profile: null,    // Initialize new profile state
    teams: undefined, // Initialize new teams state

    // Actions
    setUserContext: (context) => {
        // Sets the profile and teams based on the UserContext structure
        set({ profile: context.profile, teams: context.teams });
    },

    clearUserContext: () => {
        // Clears profile, teams, and potentially token on logout/dispose
        set({ profile: null, teams: undefined, token: null });
    },

    // Selectors - **IMPLEMENTATION LOGIC ADAPTED** to use `profile` and `teams`
    // Note: Even just adapting types requires changing how data is accessed inside selectors.

    canAccessProtectedRoutes() {
        // Checks if profile exists now
        return !!get().profile;
    },

    isReadOnly() {
        // !!! Original logic based on user.user_metadata.isReadOnly is invalid.
        // !!! This selector needs new logic based on UserProfile or Teams data.
        const profile = get().profile;
        const teams = get().teams;
        console.warn("AuthState: isReadOnly() needs specific logic based on profile/teams.");
        // Placeholder: return false. Implement your actual logic here.
        return false;
    },

    getEmail() {
        // !!! Original logic based on user.email is invalid. UserProfile has no email.
        const profile = get().profile;
        console.warn("AuthState: getEmail() needs specific logic as UserProfile has no email. Returning username or undefined.");
        // Consider returning profile?.username if that serves as email, otherwise undefined
        return profile?.username; // Or return undefined;
    },

    getId() {
        // Access profile.id
        return get().profile?.id;
    },

    getUserName() {
        // Access profile.username directly
        // Fallback logic from original might be removed or adapted if necessary
        return get().profile?.username;
    },

    getAvatarUrl() {
        // Access profile.profile_image_url
        return get().profile?.profile_image_url;
    },

    getFullName() {
        // Access profile.full_name
        return get().profile?.full_name;
    },

    getFirstName() {
        // Derives from getFullName() which now uses profile.full_name
        return get().getFullName()?.split(' ')[0];
    },

    getLastName() {
        // Derives from getFullName(), handles multiple parts
        return get().getFullName()?.split(' ').slice(1).join(' ');
    },

    getPreferredUnit(): Metric | undefined {
        // Access profile.unit
        return get().profile?.unit;
    },

    getColor() {
        // !!! Original random logic might be undesirable.
        // !!! Needs new logic if a stable color is required (e.g., from profile or derived).
        console.warn("AuthState: getColor() needs specific logic if required. Random generation removed/commented.");
        // return randomHexColor(); // Keep only if random color is explicitly desired
        return undefined; // Defaulting to undefined
    },

}));