# Rule: Validate Data with Zod Before Mutations

**Rule ID:** DA003
**Applies to:** `src/api/**/endpoint.ts`

**Description:** Enforces client-side data validation using Zod before any create or update operation is sent to the Supabase database.

## The Rule

1.  For every data entity that can be created or updated, a corresponding Zod schema **MUST** be defined in `src/validation/schemas.ts`.
2.  The `async` function in `endpoint.ts` that handles the create or update operation **MUST** accept the raw data payload as its argument.
3.  Before sending the data to Supabase, this function **MUST** use the appropriate Zod schema's `.parse()` method to validate the payload.

## Rationale

Relying solely on database constraints is not enough. Validating the data shape on the client before a mutation provides immediate, clear feedback if the data is malformed and prevents invalid data from ever reaching the API endpoint. This creates a more secure and robust application and improves the developer experience by catching errors early.

## Examples

### Correct

The `createTeam` function in `endpoint.ts` uses the `teamSchema` to validate the incoming data *before* attempting to insert it into the database.

**File:** `src/validation/schemas.ts`
```typescript
import { z } from 'zod';

// Zod schema defines the expected shape and constraints.
export const teamSchema = z.object({
    name: z.string().min(3, 'Team name must be at least 3 characters long.'),
    description: z.string().optional(),
});
```

**File:** `src/api/teams/endpoint.ts`
```typescript
import { supabase } from '@/lib/supabase';
import { teamSchema } from '@/validation/schemas';
import { z } from 'zod';

// The function accepts the raw payload.
export const createTeam = async (payload: z.infer<typeof teamSchema>) => {
    // Correct: The data is parsed and validated before being sent.
    // If validation fails, this will throw an error that Tanstack Query can catch.
    const validatedTeam = teamSchema.parse(payload);

    const { data, error } = await supabase
        .from('teams')
        .insert(validatedTeam)
        .single();

    if (error) throw new Error(error.message);
    return data;
};
```

### Incorrect

The `createTeam` function blindly trusts the incoming payload and sends it directly to Supabase. If the payload is missing the `name` field, this will result in a potentially cryptic database error instead of a clear validation error.

**File:** `src/api/teams/endpoint.ts`
```typescript
import { supabase } from '@/lib/supabase';
import { Team } from '@/types'; // This might just be a type, offering no runtime protection.

// The payload type here is not a Zod schema, just a TS type.
export const createTeam = async (payload: Omit<Team, 'id' | 'created_at'>) => {
    // Incorrect: No validation is performed. Invalid data is sent to the database.
    const { data, error } = await supabase
        .from('teams')
        .insert(payload)
        .single();

    if (error) throw new Error(error.message);
    return data;
};
```