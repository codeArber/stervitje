### **Application Logic Blueprint: The Workout Manager**

**Core Responsibility:** Manages the entire lifecycle of an active workout for a user. This includes initiating the session, logging sets in real-time, handling deviations, completing the session, and viewing the detailed historical record.

---

### **1. Session Initiation Workflow**

This workflow handles the transition from viewing a plan to starting an active workout.

*   **User Action:** Clicks the "Start Workout" button on a specific day's plan.
*   **Application Logic:**
    1.  The `onClick` handler is triggered.
    2.  It initiates a `useMutation` hook to create the session log on the backend.
    3.  Crucially, on `onSuccess`, the mutation must return the `id` of the newly created session log.
    4.  This `session_log_id` is then used to initialize a client-side state (e.g., in Zustand or Redux) that will manage the entire live workout. The app then navigates to the "Active Workout" screen.
*   **Database Interaction: RPC is Recommended**
    *   **Why?:** Starting a session isn't just a simple `INSERT`. The RPC can contain logic to pre-populate the `session_log` with data from the plan (like the title), and most importantly, it can `RETURN` the `id` of the new row in a single, efficient network request. This is cleaner than an `insert()` followed by a separate `select()` to get the new ID.
    *   **Implementation:**
        ```javascript
        const startSessionMutation = useMutation({
          mutationFn: (planSessionId) => supabase.rpc('start_session_log', { p_plan_session_id: planSessionId }),
          onSuccess: (newSessionLog) => {
            // Initialize the live workout state with newSessionLog.id
            initializeWorkoutState(newSessionLog.id);
            router.push('/workout');
          }
        });
        ```
    *   **RPC Name:** `start_session_log(p_plan_session_id UUID)`
        *   **Responsibility:** Creates a new record in `session_logs`, linking it to the `plan_sessions` via the `session_id` field. It returns the newly created `session_logs` row, specifically its `id`.

---

### **2. Live Workout Logging Workflow**

This is the core loop of the active workout experience.

*   **User Action:** Fills in their reps and weight for a set and clicks "Save" or a checkmark.
*   **Application Logic:**
    1.  The `onSaveSet` handler is triggered.
    2.  It calls a `useMutation` to save this single set's data.
    3.  On `onSuccess`, the logic updates the local client-side state to mark the set as "complete" and visually advances the user to the next set or starts a rest timer.
*   **Database Interaction: Simple Client Call is Best**
    *   **Why?:** This is a high-frequency, simple `INSERT` into a single table (`set_logs`). The data being sent is just the foreign key (`exercise_session_id`), reps, weight, etc. There is no complex transaction or data aggregation needed. A direct client call is lightweight and perfectly suited for this task. An RPC would be unnecessary overhead for such a simple, repetitive action.
    *   **Security:** This is made secure by a **Row Level Security (RLS)** policy on the `set_logs` table. The policy must state that a user can only `INSERT` a `set_log` if they are the owner of the parent `session_log`.
    *   **Implementation:**
        ```javascript
        const saveSetMutation = useMutation({
          mutationFn: (setData) => supabase.from('set_logs').insert(setData),
          onSuccess: (savedSet) => {
            // Update the local workout state with the saved data
            updateLocalSetState(savedSet);
          }
        });
        ```

---

### **3. Session Completion Workflow**

This workflow finalizes the workout session.

*   **User Action:** Clicks the "Finish Workout" button.
*   **Application Logic:**
    1.  The logic calculates the total workout duration based on the start time stored in the local state.
    2.  It prompts the user for any final notes or an overall feeling rating.
    3.  It triggers a `useMutation` to send this final data to the backend.
    4.  On `onSuccess`, it clears the local "live workout" state and navigates the user to a summary screen or back to their dashboard.
*   **Database Interaction: Simple Client Call is Sufficient**
    *   **Why?:** Similar to logging a set, this is a simple `UPDATE` on a single row in the `session_logs` table. There's no complex logic involved. A direct client call is clean and efficient.
    *   **Security:** This is secured by an RLS policy on the `session_logs` table that allows a user to `UPDATE` a row only if their `auth.uid()` matches the `user_id` on that row.
    *   **Implementation:**
        ```javascript
        const finishWorkoutMutation = useMutation({
          mutationFn: (finalData) => supabase
            .from('session_logs')
            .update({
              duration_minutes: finalData.duration,
              notes: finalData.notes,
              overall_feeling: finalData.feeling
            })
            .eq('id', activeSessionLogId),
          onSuccess: () => {
            clearWorkoutState();
            router.push('/dashboard');
          }
        });
        ```

---

### **4. History Review Workflow**

This workflow allows the user to look back at a completed workout in detail.

*   **User Action:** Clicks on a past workout from their calendar or history list.
*   **Application Logic:**
    1.  The app navigates to a "Workout Detail" page.
    2.  It uses the `session_log_id` from the URL to call a `useQuery` hook to fetch all the rich data for that session.
*   **Database Interaction: RPC is Absolutely Necessary**
    *   **Why?:** This is the most complex "read" operation in the entire manager. The goal is to show a "Planned vs. Performed" view. This requires fetching:
        1.  The `session_log` itself.
        2.  All related `set_logs` (performed).
        3.  The original `plan_sessions` record.
        4.  All *its* related sets (`plan_session_exercise_sets`) (planned).
        Trying to stitch this data together on the client would be slow and complex. An RPC can perform all the necessary `JOIN`s on the server and return a single, perfectly structured JSON object, which is vastly more efficient.
    *   **Implementation:**
        ```javascript
        const useFetchWorkoutDetails = (logId) => {
          return useQuery({
            queryKey: ['workouts', 'detail', logId],
            queryFn: () => supabase.rpc('get_workout_log_details_with_plan_comparison', { p_log_id: logId })
          });
        }
        ```
    *   **RPC Name:** `get_workout_log_details_with_plan_comparison(p_log_id UUID)`
        *   **Responsibility:** Fetches the complete historical record of a workout, including both the actual performed sets and the original planned targets, and returns it as a single object.