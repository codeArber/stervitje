# Rule: Guiding Principles

**Rule ID:** PRN001
**Applies to:** The entire project and all contributors.

**Description:** This document outlines the core philosophy for building this application. All other rules are derived from these principles. When a specific situation is not covered by a rule, these principles should be used to guide the decision.

## The Principles

**1. The Database is the Single Source of Truth.**
All data originates from and is owned by our Supabase database. The frontend application is a reactive reflection of the database state. We do not invent or store server-side data on the client.

**2. Server State and Client State are Strictly Separate.**
We make a clear distinction between two types of state:
- **Server State:** Data that lives in the database. It is managed exclusively by Tanstack Query.
- **Client State:** UI-specific state that is not persisted. It is managed by Zustand (for global state) or React's `useState` (for local component state).
This separation is critical for stability and avoids data synchronization bugs.

**3. Follow the "Golden Path" for Feature Development.**
There is a defined, step-by-step process for adding new data-driven features, outlined in the rules for Data Access (DA), Typing (TYP), and Routing (RT). Following this path ensures consistency, reduces bugs, and makes the codebase predictable.

**4. Type Safety is Not Optional.**
All data flowing from the database, through the API layer, and into our components must be strongly typed. We use Supabase's auto-generated types as our baseline and Zod for validation to ensure data integrity at every step.

**5. Convention Over Configuration.**
We adhere to the established file structures and naming conventions defined in these rules. This predictability makes the codebase easier to navigate, understand, and contribute to.