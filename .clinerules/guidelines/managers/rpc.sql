CREATE OR REPLACE FUNCTION get_user_profile_details(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
BEGIN
    WITH
    -- Find the most recent logged session to determine the active plan
    latest_activity AS (
        SELECT
            p.id AS plan_id,
            pw.week_number,
            pd.day_number
        FROM session_logs sl
        JOIN plan_sessions ps ON sl.session_id = ps.id
        JOIN plan_days pd ON ps.plan_day_id = pd.id
        JOIN plan_weeks pw ON pd.plan_week_id = pw.id
        JOIN plans p ON pw.plan_id = p.id
        WHERE sl.user_id = p_user_id
        ORDER BY sl.date DESC, sl.created_at DESC
        LIMIT 1
    )
    -- Assemble the final JSON object
    SELECT jsonb_build_object(
        'profile', to_jsonb(prof),
        'teams', (
            SELECT jsonb_agg(jsonb_build_object('team', t, 'role', tm.role))
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            WHERE tm.user_id = p_user_id
        ),
        'active_plan', (
            SELECT jsonb_build_object(
                'plan_details', to_jsonb(p),
                'current_position', jsonb_build_object('week', la.week_number, 'day', la.day_number)
            )
            FROM latest_activity la
            JOIN plans p ON la.plan_id = p.id
        )
    )
    INTO result
    FROM profiles prof
    WHERE prof.id = p_user_id;

    RETURN result;
END;
$$;




CREATE OR REPLACE FUNCTION get_team_details_and_members(p_team_id UUID)
RETURNS JSONB
LANGUAGE sql
AS $$
    SELECT jsonb_build_object(
        'team', to_jsonb(t),
        'members', (
            SELECT jsonb_agg(jsonb_build_object('profile', p, 'role', tm.role))
            FROM team_members tm
            JOIN profiles p ON tm.user_id = p.id
            WHERE tm.team_id = p_team_id
        )
    )
    FROM teams t
    WHERE t.id = p_team_id;
$$;



CREATE OR REPLACE FUNCTION get_client_progress_for_coach(p_client_id UUID)
RETURNS SETOF session_logs
LANGUAGE sql
AS $$
    SELECT sl.*
    FROM session_logs sl
    WHERE sl.user_id = p_client_id
      -- SECURITY CHECK: This query will only return rows if the person calling the function...
      AND EXISTS (
        SELECT 1
        FROM team_members caller_membership
        JOIN team_members client_membership ON caller_membership.team_id = client_membership.team_id
        WHERE
            -- ...is a coach or admin in the same team as the client.
            caller_membership.user_id = auth.uid()
            AND client_membership.user_id = p_client_id
            AND caller_membership.role IN ('admin', 'coach')
      );
$$;

CREATE OR REPLACE FUNCTION get_workout_details(p_log_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT
        jsonb_build_object(
            -- Section 1: The Performed Workout Data
            'performed', sl_details.log_data,

            -- Section 2: The Planned Workout Data (will be NULL if it was an ad-hoc workout)
            'planned', ps_details.plan_data
        )
    INTO result
    FROM
        session_logs sl
        -- Aggregate all the performed exercises and their sets for this log
        LEFT JOIN LATERAL (
            SELECT
                to_jsonb(sl) || jsonb_build_object(
                    'exercises', (
                        SELECT jsonb_agg(el_agg)
                        FROM (
                            SELECT
                                to_jsonb(el) || jsonb_build_object(
                                    'exercise_details', to_jsonb(ex),
                                    'sets', (
                                        SELECT jsonb_agg(stl)
                                        FROM set_logs stl
                                        WHERE stl.exercise_session_id = el.id
                                    )
                                )
                            FROM plan_session_exercises el -- Changed from exercise_logs to match schema
                            JOIN exercises ex ON el.exercise_id = ex.id
                            WHERE el.plan_session_id = sl.session_id -- Changed from workout_log_id
                        ) AS el_agg
                    )
                ) AS log_data
        ) AS sl_details ON TRUE
        -- If this was a planned session, aggregate all the planned exercises and their sets
        LEFT JOIN LATERAL (
            SELECT
                jsonb_build_object(
                    'session', to_jsonb(ps),
                    'exercises', (
                        SELECT jsonb_agg(pse_agg)
                        FROM (
                            SELECT
                                to_jsonb(pse) || jsonb_build_object(
                                    'exercise_details', to_jsonb(ex),
                                    'sets', (
                                        SELECT jsonb_agg(pses)
                                        FROM plan_session_exercise_sets pses
                                        WHERE pses.plan_session_exercise_id = pse.id
                                    )
                                )
                            FROM plan_session_exercises pse
                            JOIN exercises ex ON pse.exercise_id = ex.id
                            WHERE pse.plan_session_id = ps.id
                        ) AS pse_agg
                    )
                ) AS plan_data
            FROM plan_sessions ps
            WHERE ps.id = sl.session_id
        ) AS ps_details ON TRUE
    WHERE
        sl.id = p_log_id;

    RETURN result;
END;
$$;



-- FILE: Supabase SQL Editor
-- NAME: start_workout_session (Corrected Version)

CREATE OR REPLACE FUNCTION start_workout_session(
    p_plan_session_id UUID DEFAULT NULL -- Will be NULL if starting a blank, unplanned workout
)
RETURNS SETOF session_logs -- Using SETOF returns the full table row
LANGUAGE sql
AS $$
    INSERT INTO public.session_logs (
        user_id,
        session_id,
        date,
        privacy_level -- CORRECTED: Use the 'privacy_level' ENUM column
    )
    VALUES (
        auth.uid(),
        p_plan_session_id,
        now(),
        'private' -- CORRECTED: Use the ENUM value 'private' instead of the boolean 'true'
    )
    RETURNING *; -- This returns the entire new row, including the generated ID
$$;



-- FILE: Supabase SQL Editor
-- NAME: get_filtered_exercises

CREATE OR REPLACE FUNCTION get_filtered_exercises(
    p_search_term TEXT DEFAULT NULL,
    p_muscle_groups TEXT[] DEFAULT NULL,
    p_categories TEXT[] DEFAULT NULL,
    p_environments TEXT[] DEFAULT NULL,
    p_page_limit INT DEFAULT 20,
    p_page_offset INT DEFAULT 0
)
RETURNS JSON -- Returning JSON gives us flexibility to include related data
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (
        SELECT
            json_agg(ex_data)
        FROM (
            SELECT
                -- Select all columns from the exercise table
                e.*,
                -- Aggregate related muscle groups into a JSON array
                (
                    SELECT json_agg(em.muscle_group)
                    FROM exercise_muscle em
                    WHERE em.exercise_id = e.id
                ) AS muscle_groups,
                -- Aggregate related categories into a JSON array
                (
                    SELECT json_agg(etc.category)
                    FROM exercise_to_category etc
                    WHERE etc.exercise_id = e.id
                ) AS categories
            FROM
                exercises e
            WHERE
                -- Conditional search term filter (searches name and description)
                (
                    p_search_term IS NULL OR
                    e.name ILIKE ('%' || p_search_term || '%') OR
                    e.description ILIKE ('%' || p_search_term || '%')
                )
                -- Conditional environment filter
                AND (p_environments IS NULL OR e.environment::TEXT = ANY(p_environments))
                -- Conditional muscle group filter (checks for existence)
                AND (
                    p_muscle_groups IS NULL OR
                    EXISTS (
                        SELECT 1 FROM exercise_muscle em
                        WHERE em.exercise_id = e.id AND em.muscle_group::TEXT = ANY(p_muscle_groups)
                    )
                )
                -- Conditional category filter (checks for existence)
                AND (
                    p_categories IS NULL OR
                    EXISTS (
                        SELECT 1 FROM exercise_to_category etc
                        WHERE etc.exercise_id = e.id AND etc.category::TEXT = ANY(p_categories)
                    )
                )
            ORDER BY
                e.name
            LIMIT p_page_limit
            OFFSET p_page_offset
        ) AS ex_data
    );
END;
$$;



---

-- Removing rpc i am not using
-- This script removes old or redundant RPC functions that are now replaced
-- by the more powerful, structured functions we have designed for the application managers.

-- 1. Removing Overly Granular or Redundant "Workout" Functions
-- ----------------------------------------------------------------

-- Reason: This function is replaced by the more powerful `get_workout_details` RPC,
-- which provides a much richer "planned vs. performed" dataset for a specific workout.
DROP FUNCTION IF EXISTS public.get_user_workouts_with_details(p_user_id uuid);

-- Reason: This generic formatting function is no longer needed. The frontend can format
-- data returned by `get_workout_details` or `get_client_progress_for_coach`.
DROP FUNCTION IF EXISTS public.get_user_workouts_formatted(p_user_id uuid);

-- Reason: Replaced by our new workflow. The `start_workout_session` RPC now initiates
-- the process, and direct client calls log the individual sets.
DROP FUNCTION IF EXISTS public.log_workout(workout_payload jsonb);


-- 2. Removing Redundant "Plan" and "Discovery" Functions
-- ----------------------------------------------------------------

-- Reason: This is replaced by the more powerful `get_filtered_plans` function,
-- which includes pagination and multiple filter criteria.
DROP FUNCTION IF EXISTS public.get_discoverable_plans(page_limit integer, page_offset integer);

-- Reason: This is too granular. The logic for getting a full plan's details
-- should handle fetching the days, making this separate call inefficient.
DROP FUNCTION IF EXISTS public.get_plan_day_details(_plan_day_id uuid);


-- 3. Removing Redundant "User" or "Context" Functions
-- ----------------------------------------------------------------

-- Reason: Replaced by the `get_user_profile_details` RPC, which returns the
-- user's active plan, making a separate call for a "today summary" unnecessary.
DROP FUNCTION IF EXISTS public.get_todays_plan_summary();

-- Reason: This is a generic function whose purpose is now fully covered by the
-- more specific and comprehensive `get_user_profile_details` RPC.
DROP FUNCTION IF EXISTS public.get_user_context();


-- FILE: Supabase SQL Editor
-- NAME: get_exercise_details

CREATE OR REPLACE FUNCTION get_exercise_details(p_exercise_id UUID)
RETURNS JSONB -- Returning a single JSON object is perfect for this
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (
        SELECT
            -- Use jsonb_build_object to construct the final response
            jsonb_build_object(
                -- Include all columns from the base 'exercises' table
                'exercise', to_jsonb(e),
                
                -- Aggregate all related muscle groups into a JSON array
                'muscle_groups', (
                    SELECT jsonb_agg(em.muscle_group)
                    FROM exercise_muscle em
                    WHERE em.exercise_id = e.id
                ),
                
                -- Aggregate all related global references into a JSON array
                'references', (
                    SELECT jsonb_agg(erg)
                    FROM exercise_reference_global erg
                    WHERE erg.exercise_id = e.id
                )
            )
        FROM
            exercises e
        WHERE
            e.id = p_exercise_id
    );
END;
$$;

-- FILE: Supabase SQL Editor
-- NAME: get_exercise_details
-- Creates the function to fetch all details for a single exercise.

CREATE OR REPLACE FUNCTION get_exercise_details(p_exercise_id UUID)
RETURNS JSONB -- Returning a single JSON object
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN (
        SELECT
            -- Construct the final JSON object
            jsonb_build_object(
                -- Include all columns from the 'exercises' table
                'exercise', to_jsonb(e),
                
                -- Aggregate related muscle groups into a JSON array
                'muscle_groups', (
                    SELECT jsonb_agg(em.muscle_group)
                    FROM exercise_muscle em
                    WHERE em.exercise_id = e.id
                ),
                
                -- Aggregate all related global references into a JSON array
                'references', (
                    SELECT jsonb_agg(erg)
                    FROM exercise_reference_global erg
                    WHERE erg.exercise_id = e.id
                )
            )
        FROM
            exercises e
        WHERE
            e.id = p_exercise_id
    );
END;
$$;

-- FILE: Supabase SQL Editor
-- NAME: get_filtered_exercises (Upgraded Version)

CREATE OR REPLACE FUNCTION get_filtered_exercises(
    p_search_term TEXT DEFAULT NULL,
    p_muscle_groups TEXT[] DEFAULT NULL,
    p_categories TEXT[] DEFAULT NULL,
    p_types TEXT[] DEFAULT NULL,
    p_environments TEXT[] DEFAULT NULL,
    p_difficulty_level INT DEFAULT NULL,
    p_page_limit INT DEFAULT 20,
    p_page_offset INT DEFAULT 0
)
RETURNS SETOF exercises -- Returning a set of exercise records is clean and efficient for a list
LANGUAGE sql
AS $$
    SELECT *
    FROM exercises e
    WHERE
        -- Conditional search term filter
        (p_search_term IS NULL OR e.name ILIKE ('%' || p_search_term || '%'))
        -- Conditional difficulty filter
        AND (p_difficulty_level IS NULL OR e.difficulty_level = p_difficulty_level)
        -- Conditional environment filter
        AND (p_environments IS NULL OR e.environment::TEXT = ANY(p_environments))
        -- Conditional muscle group filter
        AND (p_muscle_groups IS NULL OR EXISTS (
            SELECT 1 FROM exercise_muscle em
            WHERE em.exercise_id = e.id AND em.muscle_group::TEXT = ANY(p_muscle_groups)
        ))
        -- Conditional category filter
        AND (p_categories IS NULL OR EXISTS (
            SELECT 1 FROM exercise_to_category etc
            WHERE etc.exercise_id = e.id AND etc.category::TEXT = ANY(p_categories)
        ))
        -- Conditional type filter
        AND (p_types IS NULL OR EXISTS (
            SELECT 1 FROM exercise_to_type ett
            WHERE ett.exercise_id = e.id AND ett.type::TEXT = ANY(p_types)
        ))
    ORDER BY e.name
    LIMIT p_page_limit
    OFFSET p_page_offset;
$$;

-- FILE: Supabase SQL Editor
-- NAME: get_exercise_details (Upgraded Version)

CREATE OR REPLACE FUNCTION get_exercise_details(p_exercise_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    v_references JSONB;
BEGIN
    -- First, try to get the user's saved references for this exercise
    SELECT jsonb_agg(erg)
    INTO v_references
    FROM exercise_saved_references esr
    JOIN exercise_reference_global erg ON esr.global_reference = erg.id
    WHERE esr.exercise_id = p_exercise_id AND esr.user_id = auth.uid();

    -- If no saved references were found, get the global references instead
    IF v_references IS NULL OR jsonb_array_length(v_references) = 0 THEN
        SELECT jsonb_agg(erg)
        INTO v_references
        FROM exercise_reference_global erg
        WHERE erg.exercise_id = p_exercise_id;
    END IF;

    -- Assemble and return the final JSON object
    RETURN (
        SELECT
            jsonb_build_object(
                'exercise', to_jsonb(e),
                'muscle_groups', (SELECT jsonb_agg(em.muscle_group) FROM exercise_muscle em WHERE em.exercise_id = e.id),
                'categories', (SELECT jsonb_agg(etc.category) FROM exercise_to_category etc WHERE etc.exercise_id = e.id),
                'types', (SELECT jsonb_agg(ett.type) FROM exercise_to_type ett WHERE ett.exercise_id = e.id),
                'references', v_references
            )
        FROM exercises e
        WHERE e.id = p_exercise_id
    );
END;
$$;


-- FILE: Supabase SQL Editor
-- NAME: get_discoverable_users

CREATE OR REPLACE FUNCTION get_discoverable_users(
    p_role_filter TEXT DEFAULT NULL, -- e.g., 'coach' or 'member'
    p_search_term TEXT DEFAULT NULL,
    p_page_limit INT DEFAULT 20,
    p_page_offset INT DEFAULT 0
)
RETURNS JSONB -- We return JSONB to include the aggregated roles array
LANGUAGE sql
AS $$
SELECT
    jsonb_agg(u_agg)
FROM (
    SELECT
        p.*, -- Select all profile fields
        -- This subquery finds all distinct roles for the user and aggregates them into an array
        (
            SELECT jsonb_agg(DISTINCT tm.role)
            FROM team_members tm
            WHERE tm.user_id = p.id
        ) AS roles
    FROM
        profiles p
    WHERE
        -- The user must be a member of at least one public team to be "discoverable"
        EXISTS (
            SELECT 1
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            WHERE tm.user_id = p.id AND t.is_private = false
        )
        -- Apply the role filter if provided
        AND (
            p_role_filter IS NULL OR
            EXISTS (
                SELECT 1
                FROM team_members tm
                WHERE tm.user_id = p.id AND tm.role::TEXT = p_role_filter
            )
        )
        -- Apply the search term filter if provided
        AND (
            p_search_term IS NULL OR
            p.full_name ILIKE ('%' || p_search_term || '%') OR
            p.username ILIKE ('%' || p_search_term || '%')
        )
    ORDER BY
        p.full_name
    LIMIT p_page_limit
    OFFSET p_page_offset
) AS u_agg;
$$;


-- FILE: Supabase SQL Editor
-- NAME: get_user_plan_history

CREATE OR REPLACE FUNCTION get_user_plan_history(p_user_id UUID)
RETURNS JSONB -- Returning JSONB is great for custom, aggregated data
LANGUAGE sql
AS $$
SELECT
    jsonb_agg(plan_history)
FROM (
    SELECT
        p.*, -- Select all the base fields from the plan
        -- Find the very first date this user logged a workout for this plan
        MIN(sl.date) as first_logged_date,
        -- Find the most recent date this user logged a workout for this plan
        MAX(sl.date) as last_logged_date
    FROM
        session_logs sl
        -- Join through the hierarchy to get back to the plan
        JOIN plan_sessions ps ON sl.session_id = ps.id
        JOIN plan_days pd ON ps.plan_day_id = pd.id
        JOIN plan_weeks pw ON pd.plan_week_id = pw.id
        JOIN plans p ON pw.plan_id = p.id
    WHERE
        sl.user_id = p_user_id
        AND sl.session_id IS NOT NULL -- Ensure we only count workouts linked to a plan
    -- Group by the plan to get one row per unique plan
    GROUP BY
        p.id
    ORDER BY
        last_logged_date DESC -- Show the most recently used plans first
) AS plan_history;
$$;


-- First, drop the old function to avoid conflicts.
DROP FUNCTION IF EXISTS public.get_discoverable_teams_with_details(p_search_term TEXT);

-- Now, create the new, more powerful version.
CREATE OR REPLACE FUNCTION get_discoverable_teams_rich(
    p_search_term TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE sql
AS $$
SELECT
    jsonb_agg(t_agg)
FROM (
    SELECT
        t.*,
        (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) AS members_count,
        (SELECT COUNT(*) FROM plans p WHERE p.team_id = t.id) AS plans_count,
        
        -- NEW: Get the full profiles of admins and coaches
        (
            SELECT jsonb_agg(jsonb_build_object('profile', p, 'role', tm.role))
            FROM team_members tm
            JOIN profiles p ON tm.user_id = p.id
            WHERE tm.team_id = t.id AND tm.role IN ('admin', 'coach')
        ) AS key_members,

        -- NEW: Get a preview of up to 15 member names for tooltips
        (
            SELECT jsonb_agg(p.full_name)
            FROM (
                SELECT p_inner.*
                FROM team_members tm
                JOIN profiles p_inner ON tm.user_id = p_inner.id
                WHERE tm.team_id = t.id
                ORDER BY tm.role, p_inner.full_name
                LIMIT 15
            ) p
        ) AS member_names_preview

    FROM
        teams t
    WHERE
        t.is_private = false
        AND (
            p_search_term IS NULL OR
            t.name ILIKE ('%' || p_search_term || '%') OR
            t.description ILIKE ('%' || p_search_term || '%')
        )
    ORDER BY
        t.created_at DESC
) AS t_agg;
$$;


-- FILE: Supabase SQL Editor
-- This script replaces the old function with one that also fetches the team's plans.

CREATE OR REPLACE FUNCTION get_team_details_and_members(p_team_id UUID)
RETURNS JSONB
LANGUAGE sql
AS $$
    SELECT jsonb_build_object(
        'team', to_jsonb(t),
        'members', (
            SELECT jsonb_agg(jsonb_build_object('profile', p, 'role', tm.role) ORDER BY tm.role, p.full_name)
            FROM team_members tm
            JOIN profiles p ON tm.user_id = p.id
            WHERE tm.team_id = p_team_id
        ),
        -- NEW: This subquery fetches all plans associated with this team.
        'plans', (
            SELECT jsonb_agg(p ORDER BY p.title)
            FROM plans p
            WHERE p.team_id = p_team_id
        )
    )
    FROM teams t
    WHERE t.id = p_team_id;
$$;



-- FILE: Supabase SQL Editor
-- NAME: get_plan_details (Corrected Version 2)

CREATE OR REPLACE FUNCTION get_plan_details(p_plan_id UUID)
RETURNS JSONB
LANGUAGE sql
AS $$
WITH
-- Calculate the total number of workouts for this plan
plan_stats AS (
    SELECT
        COUNT(*) AS total_workouts_planned
    FROM plan_days pd
    JOIN plan_weeks pw ON pd.plan_week_id = pw.id
    WHERE pw.plan_id = p_plan_id AND pd.is_rest_day = false
),
-- Calculate performance for each user
user_performance AS (
    SELECT
        sl.user_id,
        MAX(sl.date) AS last_completed_date,
        COUNT(DISTINCT pd.id) AS unique_workouts_logged,
        COUNT(sl.id) AS total_workouts_logged
    FROM session_logs sl
    JOIN plan_sessions ps ON sl.session_id = ps.id
    JOIN plan_days pd ON ps.plan_day_id = pd.id
    JOIN plan_weeks pw ON pd.plan_week_id = pw.id
    WHERE pw.plan_id = p_plan_id AND pd.is_rest_day = false
    GROUP BY sl.user_id
)
-- Assemble the final JSON object
SELECT
    jsonb_build_object(
        'plan', to_jsonb(p),
        'creator', to_jsonb(creator_profile),
        'team', to_jsonb(t),
        'hierarchy', (
            SELECT jsonb_build_object(
                'weeks', (
                    SELECT jsonb_agg(w_agg)
                    FROM (
                        SELECT w.*, jsonb_build_object(
                            'days', (
                                SELECT jsonb_agg(d_agg)
                                FROM (
                                    SELECT d.*, jsonb_build_object(
                                        'sessions', (
                                            SELECT jsonb_agg(s_agg)
                                            FROM (
                                                SELECT s.*, jsonb_build_object(
                                                    'exercises', (
                                                        SELECT jsonb_agg(pse_agg)
                                                        FROM (
                                                            SELECT pse.*,
                                                                to_jsonb(ex) AS exercise_details,
                                                                (
                                                                    SELECT jsonb_agg(pses ORDER BY pses.set_number) -- Ordering here is fine
                                                                    FROM plan_session_exercise_sets pses
                                                                    WHERE pses.plan_session_exercise_id = pse.id
                                                                ) AS sets
                                                            FROM plan_session_exercises pse
                                                            JOIN exercises ex ON pse.exercise_id = ex.id
                                                            WHERE pse.plan_session_id = s.id
                                                            ORDER BY pse.order_index -- CORRECTED: ORDER BY here
                                                        ) AS pse_agg
                                                    )
                                                )
                                                FROM plan_sessions s WHERE s.plan_day_id = d.id
                                                ORDER BY s.order_index -- CORRECTED: ORDER BY here
                                            ) AS s_agg
                                        )
                                    )
                                    FROM plan_days d WHERE d.plan_week_id = w.id
                                    ORDER BY d.day_number -- CORRECTED: ORDER BY here
                                ) AS d_agg
                            )
                        )
                        FROM plan_weeks w WHERE w.plan_id = p.id
                        ORDER BY w.week_number -- CORRECTED: ORDER BY here
                    ) AS w_agg
                )
            )
        ),
        'performance_stats', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'user_profile', to_jsonb(perf_profile),
                    'last_completed_date', up.last_completed_date,
                    'unique_workouts_logged', up.unique_workouts_logged,
                    'total_workouts_planned', ps.total_workouts_planned,
                    'completion_percentage', ROUND((up.unique_workouts_logged::NUMERIC / NULLIF(ps.total_workouts_planned, 0)) * 100),
                    'adherence_percentage', ROUND((up.total_workouts_logged::NUMERIC / NULLIF(ps.total_workouts_planned, 0)) * 100)
                ) ORDER BY up.last_completed_date DESC
            )
            FROM user_performance up
            JOIN profiles perf_profile ON up.user_id = perf_profile.id
            CROSS JOIN plan_stats ps
        )
    )
FROM
    plans p
JOIN
    profiles creator_profile ON p.created_by = creator_profile.id
LEFT JOIN
    teams t ON p.team_id = t.id
WHERE
    p.id = p_plan_id;
$$;


-- FILE: Supabase SQL Editor
-- NAME: get_filtered_plans_rich

CREATE OR REPLACE FUNCTION get_filtered_plans_rich(
    p_sport_filter TEXT DEFAULT NULL,
    p_muscle_groups_filter TEXT[] DEFAULT NULL,
    p_difficulty_level INT DEFAULT NULL,
    p_page_limit INT DEFAULT 20,
    p_page_offset INT DEFAULT 0
)
RETURNS JSONB -- We return JSONB to include our custom aggregated stats
LANGUAGE sql
AS $$
WITH
-- CTE to calculate total planned workouts for each plan
plan_workout_counts AS (
    SELECT
        pw.plan_id,
        COUNT(pd.id) as total_workouts_planned
    FROM plan_weeks pw
    JOIN plan_days pd ON pw.id = pd.plan_week_id
    WHERE pd.is_rest_day = false
    GROUP BY pw.plan_id
),
-- CTE to calculate unique workouts logged by each user for each plan
user_plan_progress AS (
    SELECT
        pw.plan_id,
        sl.user_id,
        COUNT(DISTINCT pd.id) as unique_workouts_logged
    FROM session_logs sl
    JOIN plan_sessions ps ON sl.session_id = ps.id
    JOIN plan_days pd ON ps.plan_day_id = pd.id
    JOIN plan_weeks pw ON pd.plan_week_id = pw.id
    GROUP BY pw.plan_id, sl.user_id
)
-- Main query to assemble the final data
SELECT
    jsonb_agg(plan_data)
FROM (
    SELECT
        p.*, -- Select all base plan fields
        (SELECT COUNT(*) FROM plan_weeks pw WHERE pw.plan_id = p.id) AS duration_weeks,
        (SELECT COUNT(DISTINCT upp.user_id) FROM user_plan_progress upp WHERE upp.plan_id = p.id) AS active_users_count,
        (
            SELECT COUNT(*)
            FROM user_plan_progress upp
            JOIN plan_workout_counts pwc ON upp.plan_id = pwc.plan_id
            WHERE upp.plan_id = p.id AND upp.unique_workouts_logged >= pwc.total_workouts_planned
        ) AS finished_users_count
    FROM
        plans p
    -- This is the filtering logic from your old get_filtered_plans function
    WHERE
        (p_sport_filter IS NULL OR p.sport ILIKE ('%' || p_sport_filter || '%'))
        AND (p_difficulty_level IS NULL OR p.difficulty_level = p_difficulty_level)
        AND (p_muscle_groups_filter IS NULL OR EXISTS (
            SELECT 1 FROM plan_weeks pw
            JOIN plan_days pd ON pw.plan_id = p.id
            JOIN plan_sessions ps ON ps.plan_day_id = pd.id
            JOIN plan_session_exercises pse ON pse.plan_session_id = ps.id
            JOIN exercise_muscle em ON em.exercise_id = pse.exercise_id
            WHERE em.muscle_group::TEXT = ANY(p_muscle_groups_filter)
        ))
    ORDER BY p.created_at DESC
    LIMIT p_page_limit
    OFFSET p_page_offset
) AS plan_data;
$$;

-- This script removes old and conflicting RPC functions to align the database
-- with the final API layer we have designed.

-- 1. Clean up Plan Filtering Functions
-- --------------------------------------------------

-- Reason: This is the OLD, simple plan filtering function. It has been completely
-- replaced by `get_filtered_plans_rich` which provides the necessary stats for the UI.
-- This is the main source of your ambiguity error.
DROP FUNCTION IF EXISTS public.get_filtered_plans(
    difficulty_filter integer,
    sport_filter text,
    muscle_groups_filter text[],
    page_limit integer,
    page_offset integer
);


-- 2. Clean up Team Discovery Functions
-- --------------------------------------------------

-- Reason: Based on our last discussion, you created a richer function for team
-- discovery that includes coach profiles and member previews. It seems you have
-- named it `get_discoverable_teams_rich`. If you have an even older, simpler function
-- for discovering teams, we should remove it to prevent future conflicts.
-- NOTE: If you don't have this exact older function, this command will do nothing.
DROP FUNCTION IF EXISTS public.get_discoverable_teams();


-- 3. (Optional) Clean up Legacy Plan Editing Functions
-- --------------------------------------------------
-- The following functions (`plan_add_*`, `plan_update_*`, etc.) are very granular.
-- While useful, you may eventually replace them with more comprehensive RPCs
-- that handle plan editing in larger transactions.
-- For NOW, they are still useful for building a plan editor, so I will NOT
-- include commands to drop them. Keep them for your next feature.

-- No functions to drop in this section for now.


-- FILE: Supabase SQL Editor
-- NAME: get_plan_details (Final Corrected Version)

-- FILE: Supabase SQL Editor
-- NAME: get_plan_details (Final Corrected Version for Nesting)

CREATE OR REPLACE FUNCTION get_plan_details(p_plan_id UUID)
RETURNS JSONB
LANGUAGE sql
AS $$
WITH
plan_stats AS (
    SELECT
        COUNT(*) AS total_workouts_planned
    FROM plan_days pd
    JOIN plan_weeks pw ON pd.plan_week_id = pw.id
    WHERE pw.plan_id = p_plan_id AND pd.is_rest_day = false
),
user_performance AS (
    SELECT
        sl.user_id,
        MAX(sl.date) AS last_completed_date,
        COUNT(DISTINCT pd.id) AS unique_workouts_logged,
        COUNT(sl.id) AS total_workouts_logged
    FROM session_logs sl
    JOIN plan_sessions ps ON sl.session_id = ps.id
    JOIN plan_days pd ON ps.plan_day_id = pd.id
    JOIN plan_weeks pw ON pd.plan_week_id = pw.id
    WHERE pw.plan_id = p_plan_id AND pd.is_rest_day = false
    GROUP BY sl.user_id
)
SELECT
    -- CORRECTED STRUCTURE: Build the hierarchy from the inside out
    jsonb_build_object(
        'plan', to_jsonb(p),
        'creator', to_jsonb(creator_profile),
        'team', to_jsonb(t),
        'hierarchy', jsonb_build_object(
            'weeks', (
                SELECT jsonb_agg(
                    to_jsonb(w) || jsonb_build_object(
                        'days', (
                            SELECT jsonb_agg(
                                to_jsonb(d) || jsonb_build_object(
                                    'sessions', (
                                        SELECT jsonb_agg(
                                            to_jsonb(s) || jsonb_build_object(
                                                'exercises', (
                                                    SELECT jsonb_agg(
                                                        to_jsonb(pse) || jsonb_build_object(
                                                            'exercise_details', to_jsonb(ex),
                                                            'sets', (
                                                                SELECT jsonb_agg(pses ORDER BY pses.set_number)
                                                                FROM plan_session_exercise_sets pses
                                                                WHERE pses.plan_session_exercise_id = pse.id
                                                            )
                                                        )
                                                    ORDER BY pse.order_index)
                                                    FROM plan_session_exercises pse
                                                    JOIN exercises ex ON pse.exercise_id = ex.id
                                                    WHERE pse.plan_session_id = s.id
                                                )
                                            )
                                        ORDER BY s.order_index)
                                        FROM plan_sessions s
                                        WHERE s.plan_day_id = d.id
                                    )
                                )
                            ORDER BY d.day_number)
                            FROM plan_days d
                            WHERE d.plan_week_id = w.id
                        )
                    )
                ORDER BY w.week_number)
                FROM plan_weeks w
                WHERE w.plan_id = p.id
            )
        ),
        'performance_stats', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'user_profile', to_jsonb(perf_profile),
                    'last_completed_date', up.last_completed_date,
                    'unique_workouts_logged', up.unique_workouts_logged,
                    'total_workouts_planned', ps.total_workouts_planned,
                    'completion_percentage', ROUND((up.unique_workouts_logged::NUMERIC / NULLIF(ps.total_workouts_planned, 0)) * 100),
                    'adherence_percentage', ROUND((up.total_workouts_logged::NUMERIC / NULLIF(ps.total_workouts_planned, 0)) * 100)
                ) ORDER BY up.last_completed_date DESC
            )
            FROM user_performance up
            JOIN profiles perf_profile ON up.user_id = perf_profile.id
            CROSS JOIN plan_stats ps
        )
    )
FROM
    plans p
JOIN
    profiles creator_profile ON p.created_by = creator_profile.id
LEFT JOIN
    teams t ON p.team_id = t.id
WHERE
    p.id = p_plan_id;
$$;


-- FILE: Supabase SQL Editor
-- This script fixes the conflicting 'weight_unit_enum' types.

-- STEP 1: Temporarily drop the RPC function that depends on the enum.
-- We will recreate it at the end.
DROP FUNCTION IF EXISTS public.plan_add_set(
    _plan_session_exercise_id uuid,
    _set_number smallint,
    _target_reps smallint,
    _target_weight numeric,
    _target_weight_unit weight_unit_enum,
    _target_duration_seconds integer,
    _target_distance_meters numeric,
    _target_rest_seconds integer,
    _notes text
);

-- STEP 2: Alter the table column to use the CORRECT enum (without the space).
-- This is the core of the fix.
ALTER TABLE public.plan_session_exercise_sets
  ALTER COLUMN target_weight_unit TYPE public.weight_unit_enum
  USING (target_weight_unit::text::public.weight_unit_enum);

-- STEP 3: Now that nothing is using the faulty enum, we can safely drop it.
-- NOTE: The quotes are important to correctly identify the name with the space.
DROP TYPE IF EXISTS public."weight_unit_enum ";

-- STEP 4: Re-create the RPC function, which will now correctly reference the single valid enum.
CREATE OR REPLACE FUNCTION public.plan_add_set(
    _plan_session_exercise_id uuid,
    _set_number smallint,
    _target_reps smallint DEFAULT NULL::smallint,
    _target_weight numeric DEFAULT NULL::numeric,
    _target_weight_unit weight_unit_enum DEFAULT NULL::weight_unit_enum, -- This now points to the correct enum
    _target_duration_seconds integer DEFAULT NULL::integer,
    _target_distance_meters numeric DEFAULT NULL::numeric,
    _target_rest_seconds integer DEFAULT NULL::integer,
    _notes text DEFAULT NULL::text
)
RETURNS SETOF plan_session_exercise_sets
LANGUAGE sql
AS $$
    INSERT INTO public.plan_session_exercise_sets
        (plan_session_exercise_id, set_number, target_reps, target_weight, target_weight_unit, target_duration_seconds, target_distance_meters, notes)
    VALUES
        (_plan_session_exercise_id, _set_number, _target_reps, _target_weight, _target_weight_unit, _target_duration_seconds, _target_distance_meters, _notes)
    RETURNING *;
$$;


-- =================================================================
-- SCRIPT TO IMPLEMENT AUTOMATED USER PLAN STATUS TRACKING (Final Corrected Version)
-- =================================================================

-- Section 1: Create the necessary database objects (Table & ENUM)
-- -----------------------------------------------------------------

-- Create the ENUM type to define the possible statuses.
CREATE TYPE public.plan_status AS ENUM (
  'active',
  'completed',
  'abandoned'
);

-- Create the table to explicitly track the status of a user's plan.
CREATE TABLE public.user_plan_status (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    status plan_status NOT NULL DEFAULT 'active',
    -- CORRECTED TYPO: TIMESTAMPTZ
    started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create a UNIQUE INDEX to enforce that a user can only have one 'active' plan.
CREATE UNIQUE INDEX user_active_plan_unique_idx
ON public.user_plan_status (user_id)
WHERE (status = 'active');


-- Section 2: Create the database functions
-- -----------------------------------------------------------------

-- This function will be run by a Cron Job to mark old plans as abandoned.
CREATE OR REPLACE FUNCTION public.mark_abandoned_plans()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE public.user_plan_status
    SET status = 'abandoned'
    WHERE
        status = 'active'
        AND last_activity_at < now() - interval '7 days';
$$;


-- The upgraded version of your start_workout_session function.
CREATE OR REPLACE FUNCTION public.start_workout_session(
    p_plan_session_id UUID DEFAULT NULL
)
RETURNS SETOF session_logs
LANGUAGE plpgsql
AS $$
DECLARE
    v_plan_id UUID;
    new_session_log session_logs;
BEGIN
    IF p_plan_session_id IS NOT NULL THEN
        SELECT pw.plan_id INTO v_plan_id
        FROM plan_sessions ps
        JOIN plan_days pd ON ps.plan_day_id = pd.id
        JOIN plan_weeks pw ON pd.plan_week_id = pw.id
        WHERE ps.id = p_plan_session_id;

        INSERT INTO public.user_plan_status (user_id, plan_id, status, last_activity_at)
        VALUES (auth.uid(), v_plan_id, 'active', now())
        ON CONFLICT (user_id) WHERE (status = 'active')
        DO UPDATE SET
            plan_id = EXCLUDED.plan_id,
            last_activity_at = now();
    END IF;

    INSERT INTO public.session_logs (user_id, session_id, date, privacy_level)
    VALUES (auth.uid(), p_plan_session_id, now(), 'private')
    RETURNING * INTO new_session_log;

    RETURN NEXT new_session_log;
END;
$$;


-- FILE: Supabase SQL Editor
-- This script updates the logic to match the 2-day abandonment rule.

CREATE OR REPLACE FUNCTION public.mark_abandoned_plans()
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
    UPDATE public.user_plan_status
    SET status = 'abandoned'
    WHERE
        status = 'active'
        -- CORRECTED LOGIC: Find plans where the last activity
        -- was more than 2 days (48 hours) ago.
        AND last_activity_at < now() - interval '2 days';
$$;

-- FILE: Supabase SQL Editor
-- NAME: start_user_plan

CREATE OR REPLACE FUNCTION start_user_plan(p_plan_id UUID)
RETURNS VOID
LANGUAGE sql
AS $$
    -- This uses the UNIQUE INDEX we created. It tries to insert a new 'active' plan.
    -- If the user already has an active plan (violating the index), it updates
    -- the existing row to point to this new plan instead.
    INSERT INTO public.user_plan_status (user_id, plan_id, status, last_activity_at)
    VALUES (auth.uid(), p_plan_id, 'active', now())
    ON CONFLICT (user_id) WHERE (status = 'active')
    DO UPDATE SET
        plan_id = EXCLUDED.plan_id,
        started_at = now(),
        last_activity_at = now();
$$;

CREATE OR REPLACE FUNCTION get_user_profile_details(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    result JSONB;
    v_active_plan_id UUID;
BEGIN
    -- STEP 1: Find the user's TRUE active plan from our new table.
    SELECT plan_id INTO v_active_plan_id
    FROM user_plan_status
    WHERE user_id = p_user_id AND status = 'active'
    LIMIT 1;

    -- STEP 2: Now build the JSON object using this correct active plan ID.
    WITH
    -- Find the most recent logged workout FOR THE ACTIVE PLAN to get the current position.
    latest_activity AS (
        SELECT
            pw.week_number,
            pd.day_number
        FROM session_logs sl
        JOIN plan_sessions ps ON sl.session_id = ps.id
        JOIN plan_days pd ON ps.plan_day_id = pd.id
        JOIN plan_weeks pw ON pd.plan_week_id = pw.id
        WHERE sl.user_id = p_user_id
          AND pw.plan_id = v_active_plan_id -- The crucial link to the correct plan
        ORDER BY sl.date DESC, sl.created_at DESC
        LIMIT 1
    )
    SELECT jsonb_build_object(
        'profile', to_jsonb(prof),
        'teams', (
            SELECT jsonb_agg(jsonb_build_object('team', t, 'role', tm.role))
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            WHERE tm.user_id = p_user_id
        ),
        -- Build the active_plan object if an active plan was found
        'active_plan', (
            SELECT
                CASE
                    WHEN v_active_plan_id IS NOT NULL THEN
                        jsonb_build_object(
                            'plan_details', to_jsonb(p),
                            'current_position', jsonb_build_object(
                                'week', COALESCE(la.week_number, 1), -- Default to Week 1, Day 1 if no logs yet
                                'day', COALESCE(la.day_number, 1)
                            )
                        )
                    ELSE
                        NULL
                END
            FROM plans p
            LEFT JOIN latest_activity la ON TRUE
            WHERE p.id = v_active_plan_id
        )
    )
    INTO result
    FROM profiles prof
    WHERE prof.id = p_user_id;

    RETURN result;
END;
$$;


-- FILE: Supabase SQL Editor
-- NAME: get_workout_details (Final Corrected Version)

CREATE OR REPLACE FUNCTION get_workout_details(p_log_id UUID)
RETURNS JSONB
LANGUAGE sql
AS $$
SELECT
    jsonb_build_object(
        'performed', to_jsonb(sl),
        'planned', (
            SELECT
                jsonb_build_object(
                    'session', to_jsonb(ps),
                    'exercises', (
                        SELECT
                            jsonb_agg(ex_data)
                        FROM (
                            SELECT
                                pse.*,
                                to_jsonb(ex) as exercise_details,
                                (
                                    SELECT jsonb_agg(pses ORDER BY pses.set_number)
                                    FROM plan_session_exercise_sets pses
                                    WHERE pses.plan_session_exercise_id = pse.id
                                ) as sets
                            FROM
                                plan_session_exercises pse
                            JOIN
                                exercises ex ON pse.exercise_id = ex.id
                            WHERE
                                pse.plan_session_id = ps.id
                            ORDER BY
                                pse.order_index
                        ) as ex_data
                    )
                )
            FROM
                plan_sessions ps
            WHERE
                ps.id = sl.session_id
        )
    )
FROM
    session_logs sl
WHERE
    sl.id = p_log_id;
$$;