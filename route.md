Consolidated Route Structure Reference
Here is the refined and consolidated route structure you've outlined, with my understanding of each section's purpose:
/dashboard
Purpose: The user's personal, aggregate overview. This is where they see a summary of all their activities, potentially across all their teams and plans. It's their central home page.
/workspace
Purpose: This is the user's personal hub for managing and interacting with their own teams/workspaces and the plans they are directly involved with (either as creator, member, or plans they have "started" for themselves). This distinguishes owned/managed content from publicly discoverable content.
/workspace/:teamId
Purpose: The detailed view for a specific team/workspace that the user is a member of. This is where they manage members, see team-specific plans, and potentially team-level dashboards/data if applicable.
/workspace/:teamId/plans/:planId
Purpose: The detailed view of a specific plan that is part of this workspace or has been started by the user within this context. This page would display the plan's weeks, days, sessions, and exercises. This is where the "Start Session" buttons live (once the plan itself has been started by the user).
/workspace/:teamId/plans/:planId/edit
Purpose: The dedicated page for editing a plan (accessible if the user has appropriate permissions like coach or admin within that team/workspace).
/workspace/:teamId/invite
Purpose: A page specifically for inviting new members to this particular team/workspace.
/exercises
Purpose: The main library listing all available exercises.
/exercises/:exerciseId
Purpose: The detailed view for a single exercise, showing its description, instructions, muscle groups, references, etc.
/explore
Purpose: This acts as the public hub for discovering content within the platform. Users come here to find new teams, plans, or other users/coaches. It leads to canonical public detail pages.
/explore/teams
Purpose: A list of discoverable (public) teams. Users can search, filter, and see summary cards here.
/explore/plans
Purpose: A list of discoverable (public) workout plans. Users can search, filter, and see summary cards here.
/explore/users
Purpose: A list of discoverable (public) user profiles, including coaches and other students.
/teams/:teamId
Purpose: This is the canonical public detail page for ANY team. It's linked from /explore/teams. It shows publicly available information about the team, its public plans, members (if visible), etc. It's distinct from /workspace/:teamId which is for your own teams.
/plans/:planId
Purpose: This is the canonical public detail page for ANY plan. It's linked from /explore/plans. This page displays the plan's content to the public. If a user decides to "start" this plan for themselves (meaning they haven't done so yet), a "Start Plan" button would appear here, which, when clicked, initiates tracking of this plan for the user and makes it accessible in their /workspace.
/users/:userId
Purpose: The canonical public detail page for ANY user or coach profile. It's linked from /explore/users. It displays public profile information, potentially public plans they've created, and public performance data.
/workout/:workoutId
Purpose: This is the dedicated page for executing a live workout session. It's linked from the "Start Session" buttons found within a plan's sessions (e.g., from /workspace/:teamId/plans/:planId). This page handles the real-time tracking, set logging, and ultimately saves the completed workout data to the database. It can also serve as the detailed view for a completed workout log.
/profile
Purpose: The user's main personal profile page, showing their basic information.
/profile/performance
Purpose: Displays the user's aggregated performance history, trends, and statistics across all their workouts and plans.
/profile/measurements
Purpose: Displays the user's body measurements, including the ability to input new data and visualize changes (e.g., biceps circumference with corresponding images via diagrams).