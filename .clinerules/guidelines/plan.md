Guideline for Training Plan Filters

This document outlines the filtering capabilities for the training plan discovery feature, based on the existing database schema.

------------------------------------

1. Plan-Level Filters

These are high-level filters that describe the overall plan. They are primarily sourced from the plans table.

    Filter: Difficulty Level
    Description: Filters plans based on their intended difficulty.
    Source: plans.difficulty_level (Number)
    UI Suggestion: A set of buttons or a dropdown (e.g., "Beginner", "Intermediate", "Advanced").

    Filter: Sport / Goal
    Description: Filters plans designed for a specific sport or primary fitness goal.
    Source: plans.sport (String)
    UI Suggestion: A dropdown or a searchable multi-select list with predefined options (e.g., "Football", "General Fitness", "Bodybuilding").

    Filter: Created By
    Description: Finds plans created by a specific user or coach.
    Source: plans.created_by -> profiles.username (String)
    UI Suggestion: A text search bar with autocomplete.

    Filter: Popularity
    Description: A sorting option presented as a filter to find popular or trending plans.
    Source: Sort by plans.like_count or plans.fork_count in descending order.
    UI Suggestion: A toggle or dropdown option (e.g., "Sort by: Most Liked").

------------------------------------

2. Plan Structure Filters

These filters relate to the composition and time commitment of the plan. They require calculations based on related tables.

    Filter: Plan Duration
    Description: Filters plans by their total length in weeks.
    Source: COUNT(plan_weeks) for each plan_id.
    UI Suggestion: A range slider (e.g., "4-12 weeks") or a multi-select list (e.g., "4 Weeks", "8 Weeks", "12+ Weeks").

    Filter: Training Frequency
    Description: Filters plans by the number of workout days per week.
    Source: Average COUNT(plan_days) where is_rest_day = false per plan_week.
    UI Suggestion: A multi-select list (e.g., "1-2 days/week", "3-4 days/week", "5+ days/week").

------------------------------------

3. Exercise & Content Filters

These filters inspect the specific exercises within a plan, requiring deep queries across multiple tables.

    Filter: Training Environment
    Description: Filters plans based on the location or equipment required for the exercises.
    Source: Checks for exercises.environment within a plan.
    UI Suggestion: A multi-select list (e.g., "Gym", "Home", "Outdoor").

    Filter: Targeted Muscle Groups
    Description: Filters plans that include exercises for specific muscle groups.
    Source: Checks for exercise_muscle.muscle_group (Enum: muscle_group_enum) within a plan.
    UI Suggestion: A multi-select list of all available muscles.

    Filter: Exercise Category
    Description: Filters plans by the primary training style of the included exercises.
    Source: Checks for exercise_to_category.category (Enum: exercise_category) within a plan.
    UI Suggestion: A multi-select list (e.g., "Strength", "Endurance", "Mobility").

    Filter: Exercise Type
    Description: Filters for more specific exercise mechanics within a plan.
    Source: Checks for exercise_to_type.type (Enum: exercise_type_enum) within a plan.
    UI Suggestion: A multi-select list (e.g., "Push", "Pull", "Plyometric").

    Filter: Includes Specific Exercise
    Description: A powerful search to find plans containing one or more specific exercises.
    Source: Searches for exercises.name within a plan.
    UI Suggestion: A searchable input field with autocomplete that allows adding multiple exercises as filter tags.