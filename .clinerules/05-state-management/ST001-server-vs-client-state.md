# Rule: Server State vs. Client State Separation

**Rule ID:** ST001
**Applies to:** Entire `src` directory.

**Description:** Establishes a strict separation between data that originates from the server (server state) and data that is local to the UI (client state). This is one of the most important architectural principles in the project.

## The Rule

1.  **Server State** (any data that is fetched, cached, and synchronized with the Supabase database) **MUST** be managed exclusively by **Tanstack Query** via the custom hooks in `src/api/`.

2.  **Global Client State** (UI state that needs to be accessed by multiple, distant components but is *not* persisted in the database) **MUST** be managed by **Zustand**. Examples include: UI theme (dark/light mode), visibility of a navigation sidebar, or the state of a multi-step form wizard.

3.  **Local Client State** (state only needed by a single component or a component and its direct children) **SHOULD** be managed by React's built-in `useState` or `useReducer` hooks. Examples include: the value of an input field, or whether a dropdown menu is open.

4.  Server state data **MUST NOT** be stored directly in a Zustand store.

## Rationale

Storing server data in client-side stores (like Zustand or useState) creates complex synchronization problems: When should the store refetch? How does it handle caching? How does it know when data has been mutated elsewhere?

Tanstack Query is purpose-built to solve exactly these problems. By delegating all server state management to it, we get caching, automatic refetching, and effortless query invalidation for free. This separation drastically simplifies our state management logic and improves application stability.

## Examples

### Correct

The application uses the right tool for each job.

```typescript
// --- Accessing Server State in a Component ---
import { useGetTeams } from '@/api/teams';

function TeamsList() {
    // Correct: Server state is managed by Tanstack Query.
    const { data: teams, isLoading } = useGetTeams();
    // ...
}


// --- Managing Global Client State with Zustand ---
// src/store/ui.store.ts
import { create } from 'zustand';

interface UiState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}
export const useUiStore = create<UiState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}));


// --- Managing Local Client State in a Component ---
import { useState } from 'react';

function SearchBar() {
    // Correct: The input's value is transient, local state.
    const [searchTerm, setSearchTerm] = useState('');
    // ...
}
```

### Incorrect

A Zustand store is created to hold server data. This is a major anti-pattern.

**File:** `src/store/team.store.ts`
```typescript
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Team } from '@/types';

interface TeamState {
  teams: Team[];
  // Bad: This duplicates the role of Tanstack Query and will become stale.
  // It has no caching, no automatic invalidation, and no background refetching.
  fetchTeams: () => Promise<void>;
}

export const useTeamStore = create<TeamState>((set) => ({
  teams: [],
  fetchTeams: async () => {
    const { data } = await supabase.from('teams').select('*');
    set({ teams: data || [] });
  },
}));
```