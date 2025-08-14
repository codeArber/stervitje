## Tasks

# Task
In the sidebar, i want tto have a Explore section. TThis section will have tthree underitems:
- Teams
- Plans
- People

When you click on Explore, an overview opens, where tthere are 3 rows, one for each underittem. 
For now, i would like only to have tthe page created:
- /explore
- /explore/teams
- /explore/plans
- /explore/people

I dontt want code in these pages yet, just creatte the pages please.

# Task
Tthis is thte explore page, plan section, where one can search differentt plans. 
Here, i want to show plans, only public ones ofc (but this will be done witth RSL, not manually in code).
Layout of page:
- breadcrum
- Filters for plans
    - TBS
- List the plans
    - In card fomat
        - fixed height
        - Show weeks in a row
            - For each week show: body diagram  (muscles targeted )
These plan cards should be wrapped in a link that directs to: /explore/plans/planId/


# Task
This is the plan dettails page. Here, one can see all he infos for the plan. 
Layout of page:
- breadcrum
- 2 columns
    - plan info:
        - creator, team(if it has)
    - stast
        - liked, performed, forked
- container (if user scrolls, it continues down)
    - Weeks in a row (accordion)
        - closed: 7 conttainers inside(one for each day), with stats for the day
            - rest day = small circle
            - other days = small summary
        - opened: each day has all tthe info
            - The container for the week should be scrollable, horizontally
            - Each day has a column, fixed width and height, with max height too

        
# Task
Create the page for Teams in explore. Show all the teams, as a list.
Layout of page:
- breadcrum
- Filters for Teams
    - TBS
- List of teams in a card (if click, go to: /explore/teams/teamId)
    - Card contains: info for team (TBD)


# Task
Create the page for People in explore. Show all the people, as a list.
Layout of page:
- breadcrum
- Filters for people
    - Role
    - Other info
- List of people in a card (if click, go to: /explore/people/peopleId)
    - Card contains: info for people (TBD)


# Task
PlanDetails
For the PlanDetails