# Rule: API Layer File Structure

**Rule ID:** DA001
**Applies to:** `src/api/`

**Description:** Defines the standard file and code structure for the API layer. This ensures that data-fetching logic is clearly separated from the hooks that manage its state, caching, and synchronization.

## The Rule

1.  Each data entity (e.g., "teams", "exercises") must have its own directory within `src/api/`.
2.  Inside each entity directory, there must be two files:
    - `endpoint.ts`: This file **MUST** contain and export the `async` functions that interact directly with the Supabase client for a specific entity.
    - `index.ts`: This file **MUST** contain and export the Tanstack Query/Mutation hooks that wrap the functions from `endpoint.ts`.
3.  UI Components **MUST NOT** import from or call functions in `endpoint.ts` directly. They **MUST** exclusively use the hooks exported from `index.ts`.

## Rationale

This structure creates a clean separation of concerns. The `endpoint.ts` file is responsible for the raw data communication, while the `index.ts` file is responsible for managing the state of that data (caching, loading, errors, etc.). This makes the code easier to test, reason about, and maintain.

## Examples

### Correct

The logic is correctly separated between the two files.

**File:** `src/api/teams/endpoint.ts`
```typescript
import { supabase } from '@/lib/supabase';
import { Team } from '@/types';

// Correct: Raw async function that performs the data fetching.
export const getTeams = async (): Promise<Team[]> => {
    const { data, error } = await supabase.from('teams').select('*');
    if (error) throw new Error(error.message);
    return data || [];
};
```

**File:** `src/api/teams/index.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { getTeams } from './endpoint';

// Correct: Tanstack Query hook that wraps the endpoint function.
export const useGetTeams = () => {
    return useQuery({
        queryKey: ['teams'],
        queryFn: getTeams,
    });
};
```

### Incorrect

A component bypasses the state management hook (`useGetTeams`) and calls the raw endpoint function directly. This forfeits all benefits of caching, automatic refetching, and loading state management provided by Tanstack Query.

**File:** `src/components/team-list.tsx`
```typescript
import { useEffect, useState } from 'react';
import { getTeams } from '@/api/teams/endpoint'; // Bad: Importing from endpoint.ts
import { Team } from '@/types';

function TeamList() {
    const [teams, setTeams] = useState<Team[]>([]);

    useEffect(() => {
        // Bad: Bypassing the custom hook and Tanstack Query.
        getTeams().then(data => {
            setTeams(data);
        });
    }, []);

    // ... render logic
}
```