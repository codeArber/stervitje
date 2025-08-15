### **Application Logic Blueprint: The Explore Manager**

**Core Responsibility:** Powers the public-facing discovery pages of your application. It handles the logic for searching, filtering, and displaying plans, professional teams, and coaches to all users, including those who may not be logged in.

---

### **1. Plan Discovery Workflow**

This is the primary workflow for users looking for new training programs.

*   **User Action:** Navigates to the "Explore Plans" page and interacts with various filter controls (search bar, difficulty buttons, muscle group selectors).
*   **Application Logic:**
    1.  The `ExplorePlans` component manages a local state object for all active filters (e.g., `{ difficulty: 2, muscles: ['chest', 'back'], searchTerm: 'strength' }`).
    2.  Whenever this filter state changes, TanStack Query's `useQuery` is automatically triggered to refetch the data.
    3.  The hook passes the entire filter state object to its data fetching function.
*   **Database Interaction: RPC is Absolutely Necessary**
    *   **Why?:** This is the most complex, multi-faceted "read" operation in your entire application. It involves:
        *   Conditional filtering across multiple `JOIN`ed tables (`plans`, `plan_weeks`, `plan_session_exercises`, `exercise_muscle`, etc.).
        *   Full-text search.
        *   Ranking/sorting by popularity (`like_count`).
        *   Pagination.
        Attempting to construct such a dynamic query on the client would be incredibly complex, slow, and insecure. An RPC encapsulates all this logic safely and efficiently on the server.
    *   **Implementation:**
        ```javascript
        const useFetchDiscoverablePlans = (filters) => {
          return useQuery({
            queryKey: ['plans', 'discover', filters], // Key includes filters for caching
            queryFn: () => supabase.rpc('get_filtered_plans', {
              difficulty_filter: filters.difficulty,
              muscle_groups_filter: filters.muscles,
              // ... map all other filters to RPC parameters
            }),
            keepPreviousData: true // For a smoother UX while filters change
          });
        }
        ```
    *   **RPC Name:** `get_filtered_plans(...)`
        *   **Responsibility:** As designed before, this is a powerful, all-in-one function that accepts numerous nullable filter parameters, builds the appropriate query, and returns a paginated list of ranked `plans`.

---

### **2. Team & Coach Discovery Workflow**

This workflow allows users to find professional teams and coaches offering services.

*   **User Action:** Clicks on the "Explore Teams" or "Find a Coach" tab.
*   **Application Logic:**
    1.  The component mounts and calls a dedicated `useQuery` hook.
    2.  Unlike plan discovery, this is typically a simpler "fetch all" operation without complex client-side filters (though you could add them later, like filtering by sport).
*   **Database Interaction: RPC is Recommended**
    *   **Why?:** The logic here is not about user-inputted filters, but about server-side **curation**. The RPC's job is to apply business rules to what is considered "discoverable." For example:
        *   Only return teams that are public (`is_private = false`).
        *   Prioritize (rank) teams that are on a "Pro" subscription tier.
        *   For coaches, only return users who have the 'coach' role within one of these public, pro teams.
        This curation logic should live on the server, not the client.
    *   **Implementation:**
        ```javascript
        // For Teams
        const useFetchDiscoverableTeams = () => {
          return useQuery({
            queryKey: ['teams', 'discover'],
            queryFn: () => supabase.rpc('get_discoverable_teams')
          });
        }

        // For Coaches
        const useFetchDiscoverableCoaches = () => {
          return useQuery({
            queryKey: ['users', 'coaches', 'discover'],
            queryFn: () => supabase.rpc('get_discoverable_coaches')
          });
        }
        ```
    *   **RPC Names:**
        *   `get_discoverable_teams()`: Returns a list of all public teams, potentially with a boolean flag or a ranking score to indicate which ones are "pro" or "featured."
        *   `get_discoverable_coaches()`: Returns a list of user profiles by joining `profiles`, `team_members`, and `teams` to find all coaches in public, pro teams.

---

### **3. Content Detail View Workflow**

This workflow handles when a user clicks on an item from any of the explore lists to see its detailed page.

*   **User Action:** Clicks on a Plan, Team, or Coach card from an explore list.
*   **Application Logic:**
    1.  The app navigates to a dynamic detail page (e.g., `/plans/[planId]`).
    2.  The detail page component extracts the `id` from the URL.
    3.  It uses this `id` to call the appropriate `useQuery` hook to fetch the detailed data for that specific item.
*   **Database Interaction: A Mix of Methods**
    *   **For Plans:** **RPC is Necessary.** A plan's detail view is a deep aggregation of the plan, all its weeks, days, sessions, exercises, and sets. This is too complex for a simple client call.
        *   **RPC Name:** `get_plan_details(p_plan_id UUID)`
    *   **For Teams:** **RPC is Necessary.** This reuses the `get_team_details_and_members` RPC from the Team Manager. It's the same aggregation problem: you need the team info and all of its members' profiles.
    *   **For Coaches (User Profiles):** **RPC is Necessary.** This reuses the `get_user_profile_details` RPC from the User Manager. Again, it's an aggregation of that user's profile, teams, etc.

---

### **Summary of Explore Manager Database Interactions**

The Explore Manager almost exclusively uses RPCs because its primary function is to handle **complex, curated, and aggregated "read" operations**. It acts as the public API for the best content your application has to offer, and that logic is best managed and secured on the server. Simple client calls are not well-suited for the dynamic filtering and business rule-based curation required for a high-quality discovery experience.