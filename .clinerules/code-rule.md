# Code Style and Practices

## General Rules
1. All generated code MUST adhere strictly to the project's Prettier and ESLint configurations. DO NOT deviate from formatting rules.
2. Code should be clean, concise, and easy to read.

## Frontend (React, Vite, Shadcn/Tailwind)

### Component Structure
1. Components MUST be functional components using React Hooks. NO class components.
2. Components should be organized by feature or domain, not just type.
3. Every component MUST have explicit PropTypes for all incoming props.

### Styling
1. Use components provided by the `shadcn/ui` library whenever possible.
2. Styling MUST be done using Tailwind CSS utility classes.
3. Use the `clsx` or `cn` helper functions (from `shadcn/ui/lib/utils.ts`) for conditional classes or combining class strings.
4. Tailwind classes should be ordered consistently (e.g., using the `prettier-plugin-tailwindcss` sort order).

### Hooks and State
1. Use `useState` for local component state and `useContext` or a similar solution for global state (e.g., authentication status).
2. Avoid over-complicating state management. Start with simple hooks.

## Hooks and State Management
1. Server State MUST be managed by TanStack Query (React Query).
2. All data fetching from the Supabase database MUST use the useQuery hook.
3. All operations that create, update, or delete data in the Supabase database MUST use the useMutation hook.
4. This approach handles caching, background refetching, and stale-while-revalidate logic automatically. DO NOT use useEffect with fetch to get server data.
5. Global Client State SHOULD use useContext.
6. Use React's Context API for global, client-side state that is not retrieved from the server.
7. A primary example is managing the user's authentication status and profile information after login.
8. Local Component State MUST use useState.
9. Use the useState hook for state that is local to a single component and does not need to be shared.
10. Examples include managing form input values, tracking open/closed states of modals or accordions, and other UI-specific state.