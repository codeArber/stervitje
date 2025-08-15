### **Application Logic Blueprint: The Team Manager**

**Core Responsibility:** Manages the creation and lifecycle of teams, membership, invitations, and the specific interactions between coaches and clients, including plan assignment and progress monitoring.

---

### **1. Team Creation Workflow**

This workflow handles the process of a user starting a new team.

*   **User Action:** Fills out a form with the team name, sport, etc., and clicks "Create Team".
*   **Application Logic:**
    1.  The `onSubmit` handler of the form triggers a `useMutation` hook.
    2.  The mutation function passes the form data to the database.
*   **Database Interaction: RPC is Necessary**
    *   **Why?:** Creating a team is a **transactional** event. You must perform two separate actions that have to succeed or fail together:
        1.  `INSERT` a new row into the `teams` table.
        2.  `INSERT` a new row into the `team_members` table to make the creator the owner/admin.
        If the second step fails, you'd have an orphaned team with no members. An RPC can perform both actions atomically within a single database transaction.
    *   **Implementation:**
        ```javascript
        const createTeamMutation = useMutation({
          mutationFn: (teamData) => supabase.rpc('create_team_with_owner', teamData),
          onSuccess: (newTeam) => {
            // Invalidate queries to refetch the user's list of teams
            queryClient.invalidateQueries({ queryKey: ['teams', 'list', userId] });
            // Redirect to the new team's page
            router.push(`/teams/${newTeam.id}`);
          }
        });
        ```
    *   **RPC Name:** `create_team_with_owner(team_name TEXT, description TEXT, ...)`
        *   **Responsibility:** Executes a transaction that first creates the team, then uses the `id` of the new team and the `auth.uid()` of the caller to create the initial membership record with an "admin" role. Returns the new team's data.

---

### **2. Viewing Team Data Workflow**

This workflow handles displaying a team's main page, including its members.

*   **User Action:** Navigates to a specific team's page (e.g., `/teams/[teamId]`).
*   **Application Logic:**
    1.  The `TeamPage` component uses the `teamId` from the URL.
    2.  It calls a `useQuery` hook to fetch all the necessary data for the dashboard.
*   **Database Interaction: RPC is Necessary**
    *   **Why?:** This is another **aggregation** task. A simple `select` on the `teams` table is not enough. You also need to fetch the profile information for *every member* of the team. An RPC can perform the required `JOIN` between `teams`, `team_members`, and `profiles` in a single, efficient database query, preventing a waterfall of client-side requests.
    *   **Implementation:**
        ```javascript
        const useFetchTeamData = (teamId) => {
          return useQuery({
            queryKey: ['teams', 'detail', teamId],
            queryFn: () => supabase.rpc('get_team_details_and_members', { p_team_id: teamId })
          });
        }
        ```
    *   **RPC Name:** `get_team_details_and_members(p_team_id UUID)`
        *   **Responsibility:** Fetches the core details from the `teams` table and joins to `team_members` and `profiles` to return a nested JSON object containing team info and an array of member profiles with their roles.

---

### **3. Invitation Workflow**

This two-part workflow manages inviting new members and their response.

#### **Part A: Sending an Invitation (Coach/Admin)**

*   **User Action:** A coach enters a user's email/username and clicks "Invite".
*   **Application Logic:** A `useMutation` hook is triggered, sending the identifier and role.
*   **Database Interaction: RPC is Recommended**
    *   **Why?:** This involves business logic and validation that should live on the server. The RPC can check permissions (is the inviter an admin?), check if the user is already in the team, and check if a pending invite already exists, all before creating the invitation. This is much more secure and robust than client-side checks.
    *   **Implementation:**
        ```javascript
        const inviteMemberMutation = useMutation({
          mutationFn: (inviteData) => supabase.rpc('invite_member_to_team', inviteData)
        });
        ```
    *   **RPC Name:** `invite_member_to_team(p_team_id UUID, p_invited_email TEXT, p_role TEXT)`
        *   **Responsibility:** Performs permission checks, finds the `user_id` from the email, and creates a record in the `team_invitations` table with a 'pending' status.

#### **Part B: Responding to an Invitation (Invited User)**

*   **User Action:** The invited user sees a notification and clicks "Accept" or "Decline".
*   **Application Logic:** A `useMutation` hook is triggered with the `invitation_id` and the response.
*   **Database Interaction: RPC is Necessary**
    *   **Why?:** This is a **transactional** event. On "Accept", you must `INSERT` into `team_members` and `UPDATE` or `DELETE` the `team_invitations` record. An RPC ensures this happens atomically.
    *   **RPC Name:** `respond_to_team_invitation(p_invitation_id UUID, p_accepted BOOLEAN)`
        *   **Responsibility:** If `p_accepted` is true, it creates the membership and cleans up the invite. If false, it just cleans up the invite. It must verify the caller is the invited user.

---

### **4. Client Progress Review Workflow (Coach-side)**

This workflow allows a coach to view the detailed workout history of a client in their team.

*   **User Action:** A coach clicks on a client's name in the team dashboard.
*   **Application Logic:** The app navigates to a client-specific page and uses a `useQuery` hook to fetch that client's progress data.
*   **Database Interaction: RPC is Absolutely Necessary**
    *   **Why?:** **Security is the #1 concern here.** You are accessing another user's private data. An RPC provides a secure, auditable entry point. The very first step inside the RPC must be a security check: "Is the `auth.uid()` of the person calling this function a coach in the same team as the `client_user_id` they are requesting data for?" Only if this check passes should the function proceed to aggregate and return the client's `session_logs` and other data. RLS can supplement this, but an explicit check in an RPC is clearer and safer.
    *   **Implementation:**
        ```javascript
        const useFetchClientProgress = (clientId) => {
          return useQuery({
            queryKey: ['teams', 'clientProgress', clientId],
            queryFn: () => supabase.rpc('get_client_progress_for_coach', { p_client_id: clientId })
          });
        }
        ```
    *   **RPC Name:** `get_client_progress_for_coach(p_client_id UUID)`
        *   **Responsibility:** First, performs a critical permission check. If successful, it fetches and returns the specified client's workout history, active plan, and other relevant progress metrics.