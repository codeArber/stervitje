# Rule: Component Structure and Organization

**Rule ID:** UI001
**Applies to:** `src/components/`, `src/routes/`

**Description:** Defines a consistent structure for creating, organizing, and locating React components to ensure the codebase is clean, maintainable, and easy to navigate.

## The Rule

1.  **Component Location:** Components MUST be organized into specific directories based on their purpose:
    -   `src/components/ui/`: Contains generic, reusable UI primitives, primarily those from **Shadcn/ui** (e.g., `Button`, `Input`, `Card`). These components should be application-agnostic.
    -   `src/components/layout/`: Contains major application layout components like `Navbar`, `Sidebar`, and `Footer`.
    -   `src/routes/...`: Components that represent an entire page or are specific to a single route SHOULD be co-located with their route file. Complex routes can have a `_components` sub-directory for child components used only by that route.

2.  **Naming:** Component files and the components themselves **MUST** be named using `PascalCase` (e.g., `TeamCard.tsx`).

3.  **Props:** Component props **MUST** be defined using a TypeScript `type` or `interface` with a `Props` suffix (e.g., `type TeamCardProps = { ... }`).

4.  **Separation of Concerns:** Components should focus on presentation. Complex business logic, state management, or direct data fetching calls are forbidden. This logic **MUST** be handled by custom hooks (e.g., `useGetTeams`, `useUiStore`).

## Rationale

A well-organized component structure is critical for scalability. By separating components based on their function (UI primitive, layout, feature-specific), we promote reusability and prevent the codebase from becoming a tangled mess. Enforcing a clean separation between presentation (the component) and logic (the hooks) makes components easier to read, test, and maintain.

## Examples

### Correct

A `TeamCard` component, which is a composite of several `ui` components, is created for a specific feature. It lives within the components directory of its associated route.

**File:** `src/routes/teams/_components/TeamCard.tsx`
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Team } from '@/types';
import { Link } from '@tanstack/react-router';

// 1. Props are clearly typed
type TeamCardProps = {
  team: Team;
};

// 2. Component is named with PascalCase
export function TeamCard({ team }: TeamCardProps) {
  // 3. Logic is minimal; the component's job is presentation.
  return (
    <Card>
      <CardHeader>
        <CardTitle>{team.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>A description of the team would go here.</p>
        <Button asChild className="mt-4">
          <Link to="/teams/$teamId" params={{ teamId: team.id }}>
            View Team
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
```

### Incorrect

A monolithic component that mixes concerns. It fetches its own data, contains business logic, and is difficult to reuse or test.

**File:** `src/components/TeamThing.jsx` (Bad location, bad naming)
```javascript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // Bad: Direct data access

// Bad: No TypeScript, props are not defined
export function TeamThing({ teamId }) {
    const [team, setTeam] = useState(null);

    // Bad: Data fetching logic is inside the component
    useEffect(() => {
        supabase.from('teams').select().eq('id', teamId).single().then(({data}) => {
            setTeam(data);
        });
    }, [teamId]);

    if (!team) return <p>Loading...</p>;

    return (
        // ... rendering logic
    );
}
```