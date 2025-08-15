# AI Task: Aggregate Data for User Profile View

## Objective

Create the data-fetching logic for a user's profile page within the "Explorer" section. The goal is to gather all required information from multiple database tables and provide it to the client in a single, efficient API call.

## Key Information to Display on the Profile

The final view must show the following information about the user:

1.  **User Roles**:
    -   Identify all distinct roles the user holds across all their teams (e.g., "coach", "client").
    -   If the user has multiple roles in different teams, show both.

2.  **Team Memberships**:
    -   List all the teams the user is a member of.

3.  **Active Training Plan**:
    -   Based on the user's most recent workout log (`session_logs`), determine their current, active plan.

4.  **Current Position**:
    -   For the active plan, calculate and show the user's current position (e.g., "Week 3, Day 1").

5.  **Performed Plans History**:
    -   List all other unique plans the user has completed or worked on in the past.

## Recommended Technical Approach

-   **Problem**: The required data is scattered across multiple tables (`profiles`, `team_members`, `session_logs`, `plans`, etc.). Fetching this data with separate client-side calls would be slow and inefficient.

-   **Solution**: Create a single **Supabase Database Function (RPC)** named `get_user_profile_details`.

-   **Implementation Details**:
    -   The function should accept a `user_id` as its only parameter.
    -   Inside the function, perform the necessary `JOIN`s to gather all the key information listed above.
    -   The function must return a **single JSON object** that contains all the aggregated data, ready for the client to display.