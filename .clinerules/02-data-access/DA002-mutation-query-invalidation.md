# Rule: Invalidate Queries After Mutations

**Rule ID:** DA002
**Applies to:** `src/api/**/index.ts`

**Description:** Ensures that the UI is automatically updated after data is created, updated, or deleted on the server.

## The Rule

Every Tanstack Mutation hook (defined in an `index.ts` file) that modifies data **MUST** invalidate the relevant query keys in its `onSuccess` callback using `queryClient.invalidateQueries`.

## Rationale

Manually refetching data after a mutation is error-prone and inefficient. By invalidating the query cache, we delegate the responsibility of refetching and re-rendering to Tanstack Query. This guarantees that the UI will always reflect the latest state from the database after a successful mutation.

## Examples

### Correct

The `useCreateTeam` mutation hook in `index.ts` correctly invalidates the `['teams']` query key after a new team is successfully created.

**File:** `src/api/teams/endpoint.ts`
```typescript
import { supabase } from '@/lib/supabase';
import { Team } from '@/types';

export const createTeam = async (newTeam: Omit<Team, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('teams')
        .insert(newTeam)
        .single();

    if (error) throw new Error(error.message);
    return data;
};
```

**File:** `src/api/teams/index.ts`
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTeam } from './endpoint';

export const useCreateTeam = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createTeam,
        // Correct: Invalidate the 'teams' list after a new team is created.
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
    });
};
```

### Incorrect

The `onSuccess` callback is missing from the mutation hook. The list of teams will become stale after a new one is added, and the user will not see their change reflected in the UI without a manual page refresh.

**File:** `src/api/teams/index.ts`
```typescript
import { useMutation } from '@tanstack/react-query';
import { createTeam } from './endpoint';

export const useCreateTeam = () => {
    return useMutation({
        mutationFn: createTeam,
        // Incorrect: Missing invalidation. The UI will not update automatically.
    });
};
```