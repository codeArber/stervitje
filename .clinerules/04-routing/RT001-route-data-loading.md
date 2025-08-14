# Rule: Pre-fetch Data in Route Loaders

**Rule ID:** RT001
**Applies to:** `src/routes/**/*.tsx`

**Description:** Enforces the pre-fetching of data using Tanstack Router's `loader` functionality. This ensures data is available before a page component renders, providing a better user experience.

## The Rule

1.  Any route that needs to display data from the API **MUST** use the `loader` property in its `createFileRoute` definition.
2.  The `loader` function **MUST** use `queryClient.ensureQueryData` to pre-fetch the data.
3.  The `queryFn` passed to the loader **MUST** be the raw `async` function imported from the relevant `api/**/endpoint.ts` file.
4.  The page component **MUST** then access this data by calling the corresponding hook from `api/**/index.ts`.

## Rationale

This pattern is the cornerstone of our "fast by default" user experience strategy. It leverages Tanstack Router and Query to fetch data in parallel with the code for the page itself. This eliminates in-component loading spinners, prevents data-fetching waterfalls, and makes page transitions feel instantaneous to the user.

## Examples

### Correct (`src/routes/teams/index.tsx`)

The route `loader` fetches the data, and the component accesses it from the cache.

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { queryClient } from '@/lib/query-client';
import { getTeams } from '@/api/teams/endpoint'; // Import raw function for the loader
import { useGetTeams } from '@/api/teams/index'; // Import hook for the component

export const Route = createFileRoute('/teams/')({
    // Correct: Data is fetched BEFORE the component renders
    loader: () => queryClient.ensureQueryData({
        queryKey: ['teams'],
        queryFn: getTeams,
    }),
    component: TeamsPage,
});

function TeamsPage() {
    // Correct: Hook accesses the already-cached data instantly
    const { data: teams } = useGetTeams();

    return (
        <div>
            <h1>Teams</h1>
            <ul>
                {teams?.map((team) => (
                    <li key={team.id}>{team.name}</li>
                ))}
            </ul>
        </div>
    );
}
```

### Incorrect

The component fetches data on its own, ignoring the route loader. This will result in a loading spinner being shown to the user *after* the page has already navigated.

```typescript
import { createFileRoute } from '@tanstack/react-router';
import { useGetTeams } from '@/api/teams/index';

// Incorrect: The loader is missing, defeating the purpose of pre-fetching.
export const Route = createFileRoute('/teams/')({
    component: TeamsPage,
});

function TeamsPage() {
    // This will trigger a new fetch on component mount, which is too late.
    const { data: teams, isLoading } = useGetTeams();

    // Bad: The user will see this loading state.
    if (isLoading) return <div>Loading teams...</div>;

    // ... render logic
}
```