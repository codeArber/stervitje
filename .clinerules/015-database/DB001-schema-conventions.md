# Rule: Defining Relationships and Managing the Type Pipeline

**Rule ID:** DB002
**Applies to:** Supabase Dashboard, Terminal/CLI, `src/types/` directory.

**Description:** Defines the mandatory process for establishing relationships between tables in the database and piping the resulting data shapes into our frontend application's type system. This is the core workflow that connects our database schema to our code.

## The Rule

1.  **Define Relationships in Supabase:** All relationships between tables **MUST** be defined using **Foreign Key constraints** in the Supabase Dashboard. Do not rely on naming conventions alone; the database must be explicitly aware of the relationship.

2.  **Generate Types from the Source:** After any change to the database schema (creating tables, adding columns, defining relationships), you **MUST** run the Supabase CLI to regenerate the types for the entire project. The command is:
    ```bash
    npx supabase gen types typescript --project-id <your-project-id> > src/types/supabase.ts
    ```

3.  **The Generated File is Sacred:** The output file, `src/types/supabase.ts`, **MUST NOT** be edited manually. It is a direct reflection of the database schema and is considered a build artifact.

4.  **Create the "App Layer" Types:** All custom, application-specific types (like `TeamWithMembers`) **MUST** be defined in `src/types/index.ts`. These types **MUST** be composed by importing the base types from the auto-generated `src/types/supabase.ts` file.

## Rationale

This strict process ensures that our application's "understanding" of the data shape is never out of sync with the database itself. By defining relationships in the database, we enable Supabase to provide powerful query capabilities. By auto-generating the types from that schema, we eliminate an entire class of bugs caused by manually written types becoming stale. The "App Layer" then allows us to create convenient, reusable data shapes for our components without breaking the link to the source of truth.

## Examples

### Correct

The developer defines a foreign key in Supabase, regenerates types, and then uses those types to build a custom application type.

**Step 1: Define Foreign Key in Supabase UI**
- Go to Table Editor -> `team_members` table -> `team_id` column.
- Click the "link" icon to add a foreign key constraint that references the `id` column of the `teams` table.

**Step 2: Run the CLI command**
```bash
npx supabase gen types typescript --project-id my-proj-ref > src/types/supabase.ts
```

**Step 3: Create the App Layer type in `src/types/index.ts`**
```typescript
// Import the raw, generated types
import { Tables } from './supabase';

// Define base types for clarity
export type Team = Tables<'teams'>;
export type TeamMember = Tables<'team_members'>;

// Correct: Compose a new type for the application's needs
// This shape matches what you'd get from a JOIN query.
export type TeamWithMembers = Team & {
    team_members: TeamMember[];
};
```

### Incorrect

The developer skips the process and manually creates types, breaking the link to the database.

**File:** `src/types/index.ts`
```typescript
// Incorrect: These types are handwritten and "best guesses".
// They will not update if the database schema changes, leading to runtime errors.
export type Team = {
    id: string;
    name: string;
};

export type TeamWithMembers = {
    id: string;
    name: string;
    // The shape of members is also a guess, disconnected from the 'team_members' table.
    members: { user_id: string; role: string }[];
};
```