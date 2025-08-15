// FILE: src/types/index.ts
// This file exports the most common, raw table types for easy access across the app.
// It should NOT contain complex, nested, or feature-specific relationship types.

import type { Tables, Enums } from './database.types';

// --- Base Table Types ---
export type Profile = Tables<'profiles'>;
export type Plan = Tables<'plans'>;
export type Team = Tables<'teams'>;
export type Exercise = Tables<'exercises'>;

// --- Base ENUM Types (Re-exporting for convenience) ---
export type TeamMemberRole = Enums<'team_member_role'>;
// ... you can re-export other common enums here if you wish ...