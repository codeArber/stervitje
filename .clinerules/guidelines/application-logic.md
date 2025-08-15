# Application Logic Blueprint: The Team Management System

This is the "organizational brain" of your application. It manages how users form groups, share plans, and how coaches interact with clients.

---

## 1. Core Feature: The "Team & Membership" Engine

This logic handles the creation, modification, and lifecycle of teams and their members.

### A. Team Lifecycle Logic:

*   **`createTeam(name, sport, etc.)` function:**
    *   Creates a new record in the `teams` table.
    *   Must also create the first `team_members` record, adding the creator as the "owner" or "admin".
*   **`updateTeamDetails(...)` function:**
    *   Standard logic for editing a team's name, description, etc. (requires admin permissions).
*   **`deleteTeam(...)` function:**
    *   Logic that deletes a team and must also handle the cleanup (e.g., removing all associated `team_members` records).

### B. Membership & Invitation Logic:

*   **Architectural Note:** This logic strongly suggests a new database table: `team_invitations`. An invitation system is more secure and user-friendly than direct additions. This table would store `team_id`, `invited_email` (or `user_id`), `inviter_id`, `role`, and a `status` (pending, accepted, declined).
*   **`inviteMember(team_id, user_email, role)` function:**
    *   Checks if the inviter has permission (is a coach/admin).
    *   Creates a new record in the `team_invitations` table.
    *   (Optional) Triggers a notification to the invited user.
*   **`acceptInvite(invite_id)` function:**
    *   Verifies the current user is the one who was invited.
    *   Creates a new `team_members` record with the correct `user_id`, `team_id`, and `role`.
    *   Updates or deletes the record in `team_invitations`.
*   **`updateMemberRole(...)` & `removeMember(...)` functions:**
    *   Admin/coach-only functions to manage the `team_members` table.
*   **`leaveTeam()` function:**
    *   Allows a member to remove themselves from the `team_members` table.

---

## 2. Core Feature: The "Coach-Client Interaction" Engine

This is the specialized logic that defines the power of the team feature, focusing on what a coach can do and what a client can see. This will heavily rely on permissions and role-based access control.

### A. Plan Assignment & Management (Coach's Logic):

*   **`assignPlanToMember(plan_id, user_id, start_date)` function:**
    *   This is a critical workflow that will likely call a dedicated Supabase RPC function (e.g., your existing `assign_team_plan_to_member`). The logic might involve forking the plan to create a unique, assignable copy.
*   **`createTeamPlan(...)` function:**
    *   Logic for a coach to create a plan that is "owned" by the team (i.e., has a `team_id` in the `plans` table), making it accessible to other coaches in the same team.
*   **`viewAllTeamPlans()` function:**
    *   A function for coaches to see all personal and team-owned plans available for assignment.

### B. Progress Monitoring (Coach's Logic):

*   **Architectural Note:** This requires specialized API endpoints or RPCs that strictly enforce team boundaries and permissions.
*   **`get_team_members_summary(team_id)` RPC:**
    *   A function that fetches all members of a team and includes their key activity stats (e.g., their active plan's name, last workout date, maybe a calculated adherence score).
*   **`get_client_workout_details(session_log_id)` RPC:**
    *   A protected version of the analytics function. This function **MUST** check if the user making the request is a coach in the same team as the client whose log they are trying to view. This is a critical security concern, best enforced with Supabase Row Level Security (RLS) policies.

### C. Client's View Logic:

*   **`fetchAssignedPlans()` function:**
    *   Logic to fetch and display plans that have been assigned to the user by a coach. This may simply be a filter on their main plans list.
*   **`fetchTeamDetails()` function:**
    *   Logic for a client to see the basic information of their team, including a list of members and coaches.