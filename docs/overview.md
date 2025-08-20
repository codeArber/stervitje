# Application Route Summary

## Core User Pages

### `/dashboard`
**Summary:** Your personal homepage. It shows your currently active workout plan with a button to start your next session. You can also see your current workspace, team memberships, and any pending invitations.

### `/workout`
**Summary:** The live workout player. This is where you go when a workout is in progress. You can log your reps and weight for each set, follow rest timers, and navigate through the exercises of your current session.
Also, if no workout is active, the user can see the next sessions from the active plans, or can start an ad hoc session.

### `/settings`
**Summary:** Manage your profile. You can edit your full name, username, bio, and choose your preferred measurement system (Metric or Imperial).

---

## Profile & Performance Section

### `/profile`
**Summary:** Your personal profile overview. It displays your main profile information and provides navigation cards to view your detailed performance history and body measurements.
Both the cards of performance and meassurement, include graphs and pictures, a sneak peak of the detailed page.

### `/profile/performance`
**Summary:** Your main performance dashboard. You can switch between three views:
- **Overall Trends:** A heatmap calendar of your workout consistency and lifetime stats.
- **By Plan:** A summary of your performance and adherence for each plan you've started.
- **Logbook:** A complete, reverse-chronological list of every workout you have ever completed.

### `/profile/measurements`
**Summary:** Track your body's progress. This page shows graphs of your measurement history (like weight over time) and a detailed log of all your past entries. You can also navigate to add new measurements.

---

## Exploration & Discovery Section

### `/explore`
**Summary:** The main discovery hub. It shows a curated preview of popular plans, featured teams, and top coaches to help you find new content and people to follow.

### `/explore/plans`
**Summary:** The plan library. You can browse, search, and filter through all public workout plans created by the community.

### `/explore/plans/:planId`
**Summary:** The detailed public page for a specific plan. You can review its entire workout schedule week by week, see what equipment is needed, and read about its goals. If you like the plan, you can click "Start This Plan" to add it to your dashboard.

### `/explore/teams`
**Summary:** The team directory. You can search and browse through all public teams and coaching groups on the platform.

### `/explore/teams/:teamId`
**Summary:** The public profile for a specific team. You can see the team's description, view its public workout plans, and see a list of its coaches and administrators.

### `/explore/users`
**Summary:** The community directory. You can search and browse through all public user and coach profiles.

---

## Workspace & Editing Section

### `/workspace`
**Summary:** Your workspace hub. If you have a primary workspace selected, you'll be taken directly to it. If not, this page lets you see all your teams and choose which one to focus on.

### `/workspace/:teamId`
**Summary:** The management dashboard for a specific workspace you are a member of. You can see all the plans and members associated with that team.

### `/workspace/:teamId/plans`
**Summary:** The plan list for a specific workspace. If you have permission, you can create a new plan for your team from this page.

### `/workspace/:teamId/plans/:planId/edit`
**Summary:** The powerful plan editor. This is where you build and modify every detail of a workout plan, from adding weeks and days to defining the specific reps, weight, and type for every single set.