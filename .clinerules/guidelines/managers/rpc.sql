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


-- FILE: Supabase SQL Editor
-- This script adds a robust status tracking system to your workout logs.

-- STEP 1: Create the new ENUM type for the workout log status.
CREATE TYPE public.workout_status_enum AS ENUM (
  'in_progress',
  'completed',
  'abandoned' -- For future use, e.g., if a workout is left for over 24 hours
);


-- STEP 2: Add the new 'status' column to the session_logs table.
-- We will default all existing and new logs to 'in_progress'.
-- Our application logic will be responsible for updating it to 'completed'.
ALTER TABLE public.session_logs
  ADD COLUMN status workout_status_enum DEFAULT 'in_progress' NOT NULL;


  -- FILE: Supabase SQL Editor
-- This is the final, correct version of the function.

CREATE OR REPLACE FUNCTION get_plan_details_for_user(p_plan_id UUID)
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
-- Main query to assemble the final object
SELECT
    jsonb_build_object(
        'plan', to_jsonb(p),
        'creator', to_jsonb(creator_profile),
        'team', to_jsonb(t),
        'active_session_log', (
            SELECT to_jsonb(sl)
            FROM session_logs sl
            WHERE sl.user_id = auth.uid() AND sl.status = 'in_progress'
            LIMIT 1
        ),
        'can_edit', (
            -- The current user can edit if they are the creator...
            p.created_by = auth.uid()
            -- ...OR if the plan has a team_id and the user is an admin/coach of that team.
            OR (p.team_id IS NOT NULL AND EXISTS (
                SELECT 1
                FROM team_members tm
                WHERE tm.team_id = p.team_id
                  AND tm.user_id = auth.uid()
                  AND tm.role IN ('admin', 'coach')
            ))
        ),
        'hierarchy', (
            SELECT jsonb_build_object(
                'weeks', (
                    SELECT jsonb_agg(
                        to_jsonb(w) || jsonb_build_object(
                            'days', (
                                SELECT jsonb_agg(
                                    to_jsonb(d) || jsonb_build_object(
                                        'sessions', (
                                            SELECT jsonb_agg(
                                                to_jsonb(s) || jsonb_build_object(
                                                    'is_completed_by_user', EXISTS (
                                                        SELECT 1 FROM session_logs sl
                                                        WHERE sl.user_id = auth.uid()
                                                          AND sl.session_id = s.id
                                                          AND sl.status = 'completed'
                                                    ),
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

CREATE OR REPLACE FUNCTION get_user_dashboard_summary()
RETURNS JSONB
LANGUAGE sql
AS $$
SELECT
    jsonb_build_object(
        -- Get the user's currently active plan by joining user_plan_status with plans
        'active_plan_status', (
            SELECT
                jsonb_build_object('status', ups, 'plan', to_jsonb(p))
            FROM user_plan_status ups
            JOIN plans p ON ups.plan_id = p.id
            WHERE ups.user_id = auth.uid() AND ups.status = 'active'
            LIMIT 1
        ),
        
        -- Get a list of ALL teams the user is a member of
        'my_teams', (
            SELECT jsonb_agg(
                to_jsonb(t) || jsonb_build_object('role', tm.role)
                ORDER BY t.name
            )
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            WHERE tm.user_id = auth.uid()
        ),
        
        -- Get a list of ALL plans the user has personally created
        'my_created_plans', (
            SELECT jsonb_agg(p ORDER BY p.created_at DESC)
            FROM plans p
            WHERE p.created_by = auth.uid()
        ),

        -- Get a count of any pending team invitations for a notification badge
        'pending_invitations_count', (
            SELECT COUNT(*)
            FROM team_invitations ti
            WHERE ti.invited_user_id = auth.uid() AND ti.status = 'pending'
        )
    );
$$;

-- FILE: Supabase SQL Editor
-- This script creates the functions needed for the team invitation workflow,
-- assuming the 'team_invitations' table already exists.

-- STEP 1: Create the RPC function to SEND an invitation.
CREATE OR REPLACE FUNCTION invite_member_to_team(
    p_team_id UUID,
    p_invited_email TEXT,
    p_role team_member_role,
    
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inviter_id UUID := auth.uid();
    v_invited_user_id UUID;
    v_inviter_role team_member_role;
BEGIN
    -- Security Check: Ensure the inviter is an admin or coach of the team.
    SELECT role INTO v_inviter_role
    FROM public.team_members
    WHERE team_id = p_team_id AND user_id = v_inviter_id;

    IF v_inviter_role IS NULL OR v_inviter_role NOT IN ('admin', 'coach') THEN
        RAISE EXCEPTION 'Permission denied: Not an admin or coach of this team.';
    END IF;

    -- Find the user ID corresponding to the email, if they exist in the app.
    SELECT id INTO v_invited_user_id FROM public.profiles WHERE email = p_invited_email;

    -- Create the invitation record in your existing table.
    INSERT INTO public.team_invitations (team_id, invited_by, invited_email, invited_user_id, role)
    VALUES (p_team_id, v_inviter_id, p_invited_email, v_invited_user_id, p_role);
END;
$$;


-- STEP 2: Create the RPC function to RESPOND to an invitation.
CREATE OR REPLACE FUNCTION respond_to_team_invitation(
    p_invitation_id UUID,
    p_accepted BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_invitation public.team_invitations;
    v_user_id UUID := auth.uid();
BEGIN
    -- Fetch the invitation and verify the current user is the one invited.
    SELECT * INTO v_invitation FROM public.team_invitations WHERE id = p_invitation_id;

    IF v_invitation IS NULL THEN
        RAISE EXCEPTION 'Invitation not found.';
    END IF;

    IF v_invitation.invited_user_id IS DISTINCT FROM v_user_id THEN
        RAISE EXCEPTION 'Permission denied: This invitation is not for you.';
    END IF;

    IF v_invitation.status <> 'pending' THEN
        RAISE EXCEPTION 'This invitation has already been responded to.';
    END IF;

    IF p_accepted THEN
        -- User accepted: Update status and create the team membership.
        UPDATE public.team_invitations SET status = 'accepted' WHERE id = p_invitation_id;
        INSERT INTO public.team_members (team_id, user_id, role)
        VALUES (v_invitation.team_id, v_user_id, v_invitation.role);
    ELSE
        -- User declined: Update status.
        UPDATE public.team_invitations SET status = 'declined' WHERE id = p_invitation_id;
    END IF;
END;
$$;

-- FILE: Supabase SQL Editor
-- This script correctly upgrades the 'status' column in the team_invitations table.

-- STEP 1: Create the new ENUM type (if it doesn't exist already).
-- The 'IF NOT EXISTS' clause makes this safe to re-run.
CREATE TYPE public.invitation_status AS ENUM (
  'pending',
  'accepted',
  'declined'
);

-- STEP 2: Temporarily remove the old default value from the 'status' column.
-- The old default is of type 'text', which causes the conflict.
ALTER TABLE public.team_invitations
  ALTER COLUMN status DROP DEFAULT;

-- STEP 3: Now that there is no default, we can safely alter the column's data type.
-- The USING clause tells PostgreSQL how to convert the existing text values.
ALTER TABLE public.team_invitations
  ALTER COLUMN status SET DATA TYPE public.invitation_status
  USING (status::public.invitation_status);

-- STEP 4: Finally, add the new, correctly-typed default value back to the column.
ALTER TABLE public.team_invitations
  ALTER COLUMN status SET DEFAULT 'pending'::public.invitation_status;


  -- FILE: Supabase SQL Editor
-- This script creates a function and trigger to automatically link new users to pending invitations.

-- 1. Create the function
CREATE OR REPLACE FUNCTION public.claim_pending_invitations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This function runs AFTER a new user's profile is created.
  -- The 'NEW' variable holds the data for the new profile row.

  -- Look for any pending invitations that match the new user's email
  -- and update them with the new user's ID.
  UPDATE public.team_invitations
  SET invited_user_id = NEW.id
  WHERE invited_email = NEW.email AND status = 'pending';

  RETURN NEW;
END;
$$;

-- 2. Create the trigger
-- This trigger will fire AFTER a new profile is inserted.
CREATE TRIGGER on_new_profile_claim_invitations
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.claim_pending_invitations();


-- FILE: Supabase SQL Editor
-- This script creates the trigger that calls our Edge Function.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.notify_on_new_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Perform an HTTP POST request to our Edge Function
  PERFORM
    net.http_post(
      -- The URL of the Edge Function
      url:='https://<your-project-ref>.supabase.co/functions/v1/send-invite-email',
      -- The body of the request, containing the new invitation record
      body:=jsonb_build_object('record', NEW),
      -- Headers, including the service role key for authentication
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || '<your-anon-key>' -- Best practice: use a dedicated secret for this
      )
    );
  RETURN NEW;
END;
$$;


-- 2. Create the trigger itself
-- This will fire AFTER a new row is inserted into team_invitations.
CREATE TRIGGER on_new_invitation_send_email
AFTER INSERT ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_invitation();

-- FILE: Supabase SQL Editor
-- This script creates a trigger that calls the Edge Function using a hardcoded key.

-- STEP 1: Create the trigger function with the hardcoded key.
CREATE OR REPLACE FUNCTION public.notify_on_new_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql
-- SECURITY DEFINER is still recommended for pg_net access.
SECURITY DEFINER
AS $$
BEGIN
  -- Perform the HTTP POST request to our Edge Function.
  PERFORM
    net.http_post(
      -- The URL of the Edge Function
      url:='https://ojoemgnsqqchnnbvztpg.supabase.co/functions/v1/send-invite-email',
      
      -- The body of the request, containing the new invitation record
      body:=jsonb_build_object('record', NEW),
      
      -- Headers with the hardcoded anon key
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qb2VtZ25zcXFjaG5uYnZ6dHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNjk1NTAsImV4cCI6MjA1ODg0NTU1MH0.VNUWVaE-Z_-7AgO7i9G_xfVw2ut22LfQTFP8_KDWMtU' -- <-- IMPORTANT: REPLACE THIS
      )
    );
  RETURN NEW;
END;
$$;


-- STEP 2: Create the trigger itself that fires on new invitations.
-- This ensures the function above is called whenever a new invitation is created.
DROP TRIGGER IF EXISTS on_new_invitation_send_email ON public.team_invitations;
CREATE TRIGGER on_new_invitation_send_email
AFTER INSERT ON public.team_invitations
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_new_invitation();


-- FILE: Supabase SQL Editor
-- This script upgrades the user discovery function to allow excluding members of a specific team.

CREATE OR REPLACE FUNCTION get_discoverable_users(
    p_role_filter TEXT DEFAULT NULL,
    p_search_term TEXT DEFAULT NULL,
    p_exclude_team_id UUID DEFAULT NULL, -- The new parameter
    p_page_limit INT DEFAULT 20,
    p_page_offset INT DEFAULT 0
)
RETURNS JSONB
LANGUAGE sql
AS $$
SELECT
    jsonb_agg(u_agg)
FROM (
    SELECT
        p.*,
        (
            SELECT jsonb_agg(DISTINCT tm.role)
            FROM team_members tm
            WHERE tm.user_id = p.id
        ) AS roles
    FROM
        profiles p
    WHERE
        -- The user must be in at least one public team to be "discoverable"
        EXISTS (
            SELECT 1
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            WHERE tm.user_id = p.id AND t.is_private = false
        )
        -- ** THIS IS THE NEW PART **
        -- If a team ID is provided for exclusion, the user must NOT be a member of that team.
        AND (
            p_exclude_team_id IS NULL OR
            NOT EXISTS (
                SELECT 1
                FROM team_members tm
                WHERE tm.user_id = p.id AND tm.team_id = p_exclude_team_id
            )
        )
        -- Existing filters for role and search term
        AND (
            p_role_filter IS NULL OR
            EXISTS (
                SELECT 1
                FROM team_members tm
                WHERE tm.user_id = p.id AND tm.role::TEXT = p_role_filter
            )
        )
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
-- This script corrects the invite function to look for emails in the correct table.

CREATE OR REPLACE FUNCTION invite_member_to_team(
    p_team_id UUID,
    p_role team_member_role,
    p_invited_user_id UUID DEFAULT NULL,
    p_invited_email TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inviter_id UUID := auth.uid();
    v_final_user_id UUID := p_invited_user_id;
    v_final_email TEXT := p_invited_email;
    v_inviter_role team_member_role;
    v_new_invitation_id UUID;
    v_user_email TEXT;
BEGIN
    -- Security Check 1: Ensure at least one identifier is provided.
    IF p_invited_user_id IS NULL AND p_invited_email IS NULL THEN
        RAISE EXCEPTION 'Either a user ID or an email must be provided.';
    END IF;

    -- Security Check 2: Ensure the inviter is an admin or coach of the team.
    SELECT role INTO v_inviter_role
    FROM public.team_members
    WHERE team_id = p_team_id AND user_id = v_inviter_id;

    IF v_inviter_role IS NULL OR v_inviter_role NOT IN ('admin', 'coach') THEN
        RAISE EXCEPTION 'Permission denied: Not an admin or coach of this team.';
    END IF;

    -- Logic Branch 1: A specific user ID was provided.
    IF v_final_user_id IS NOT NULL THEN
        -- Find the user's email from the AUTH table for clarity.
        SELECT email INTO v_final_email FROM auth.users WHERE id = v_final_user_id;
        IF v_final_email IS NULL THEN
            RAISE EXCEPTION 'Invited user not found.';
        END IF;

    -- Logic Branch 2: Only an email was provided.
    ELSE
        -- ** THIS IS THE CORRECTED PART **
        -- Check if a user with this email already exists in the AUTH table.
        SELECT id INTO v_final_user_id FROM auth.users WHERE email = v_final_email;
    END IF;

    -- Final Check: Ensure the user is not already a member of the team.
    IF v_final_user_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.team_members
        WHERE team_id = p_team_id AND user_id = v_final_user_id
    ) THEN
        RAISE EXCEPTION 'This user is already a member of the team.';
    END IF;

    -- Create the invitation record with the resolved details.
    INSERT INTO public.team_invitations (team_id, invited_by, invited_email, invited_user_id, role)
    VALUES (p_team_id, v_inviter_id, v_final_email, v_final_user_id, p_role)
    RETURNING id INTO v_new_invitation_id; -- Store the new ID
END;
$$;

-- Temporary debug version of the trigger function
CREATE OR REPLACE FUNCTION public.notify_on_new_invitation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- This will show up in your database's main logs if the trigger fires
  RAISE NOTICE 'DEBUG: notify_on_new_invitation trigger fired for new record %', NEW.id;

  -- The rest of the function is the same...
  PERFORM
    net.http_post(
      url:='https://ojoemgnsqqchnnbvztpg.supabase.co/functions/v1/send-invite-email',
      body:=jsonb_build_object('record', NEW),
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || 'PASTE_YOUR_ANON_KEY_HERE'
      )
    );
  RETURN NEW;
END;
$$;

-- FILE: Supabase SQL Editor
-- This script removes the now-unnecessary email trigger.

-- Drop the trigger itself
DROP TRIGGER IF EXISTS on_new_invitation_send_email ON public.team_invitations;

-- Drop the function that the trigger was calling
DROP FUNCTION IF EXISTS public.notify_on_new_invitation();

-- FILE: Supabase SQL Editor
-- This version returns a structured JSON object, which is more reliable.
DROP FUNCTION invite_member_to_team(uuid,team_member_role,uuid,text);

CREATE OR REPLACE FUNCTION invite_member_to_team(
    p_team_id UUID,
    p_role team_member_role,
    p_invited_user_id UUID DEFAULT NULL,
    p_invited_email TEXT DEFAULT NULL
)
RETURNS JSONB -- THE KEY CHANGE: We now return a JSON object.
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_inviter_id UUID := auth.uid();
    v_final_user_id UUID := p_invited_user_id;
    v_final_email TEXT := p_invited_email;
    v_inviter_role team_member_role;
    v_new_invitation_id UUID;
BEGIN
    -- ... (All security checks and logic are exactly the same as before) ...
    IF p_invited_user_id IS NULL AND p_invited_email IS NULL THEN
        RAISE EXCEPTION 'Either a user ID or an email must be provided.';
    END IF;
    SELECT role INTO v_inviter_role FROM public.team_members WHERE team_id = p_team_id AND user_id = v_inviter_id;
    IF v_inviter_role IS NULL OR v_inviter_role NOT IN ('admin', 'coach') THEN
        RAISE EXCEPTION 'Permission denied: Not an admin or coach of this team.';
    END IF;
    IF v_final_user_id IS NOT NULL THEN
        SELECT email INTO v_final_email FROM auth.users WHERE id = v_final_user_id;
        IF v_final_email IS NULL THEN RAISE EXCEPTION 'Invited user not found.'; END IF;
    ELSE
        SELECT id INTO v_final_user_id FROM auth.users WHERE email = v_final_email;
    END IF;
    IF v_final_user_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.team_members WHERE team_id = p_team_id AND user_id = v_final_user_id) THEN
        RAISE EXCEPTION 'This user is already a member of the team.';
    END IF;

    -- Create the invitation and capture the new ID
    INSERT INTO public.team_invitations (team_id, invited_by, invited_email, invited_user_id, role)
    VALUES (p_team_id, v_inviter_id, v_final_email, v_final_user_id, p_role)
    RETURNING id INTO v_new_invitation_id;

    -- THE KEY CHANGE: Return a structured JSON object with the ID.
    RETURN jsonb_build_object('id', v_new_invitation_id);
END;
$$;

-- FILE: Supabase SQL Editor
-- This function securely creates a new team and assigns the creator as the admin.

CREATE OR REPLACE FUNCTION create_new_team(
    p_name TEXT,
    p_description TEXT DEFAULT NULL,
    p_sport TEXT DEFAULT NULL,
    p_is_private BOOLEAN DEFAULT false
)
RETURNS SETOF teams -- We return the new team record so the UI can use it
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id UUID := auth.uid();
    new_team teams;
BEGIN
    -- Step 1: Create the new team record.
    -- The 'is_personal_workspace' flag defaults to FALSE, so this is a collaborative team.
    INSERT INTO public.teams (name, description, sport, is_private, created_by)
    VALUES (p_name, p_description, p_sport, p_is_private, v_user_id)
    RETURNING * INTO new_team;

    -- Step 2: Make the creator of the team an 'admin'.
    INSERT INTO public.team_members (team_id, user_id, role)
    VALUES (new_team.id, v_user_id, 'admin');

    -- Step 3: Return the newly created team record.
    RETURN NEXT new_team;
END;
$$;

-- FILE: Supabase SQL Editor
-- This script adds the necessary column to the profiles table for tracking onboarding status.

-- Add the new boolean column to the 'profiles' table.
-- It defaults to FALSE for every new user created by the handle_new_user trigger.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false NOT NULL;

  -- FILE: Supabase SQL Editor
-- This function allows a user to securely mark their own onboarding as complete.

CREATE OR REPLACE FUNCTION complete_onboarding()
RETURNS VOID -- This function doesn't need to return any data
LANGUAGE sql
AS $$
    -- Find the profile record for the currently authenticated user
    -- and update the onboarding_completed flag to TRUE.
    UPDATE public.profiles
    SET onboarding_completed = true
    WHERE id = auth.uid();
$$;

-- FILE: Supabase SQL Editor
-- NAME: get_workspace_data

CREATE OR REPLACE FUNCTION get_workspace_data(p_team_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY INVOKER -- Run as the logged-in user to respect RLS
AS $$
  SELECT
    jsonb_build_object(
      'team', to_jsonb(t),
      
      -- Get the current user's specific role in this team
      'current_user_role', (
        SELECT tm.role
        FROM public.team_members tm
        WHERE tm.team_id = p_team_id AND tm.user_id = auth.uid()
      ),
      
      -- Get all plans associated with this team
      'plans', (
        SELECT jsonb_agg(p ORDER BY p.title)
        FROM public.plans p
        WHERE p.team_id = p_team_id
      ),
      
      -- Get all members of this team with their profiles and roles
      'members', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'profile', to_jsonb(p),
            'role', tm.role
          ) ORDER BY tm.role, p.full_name
        )
        FROM public.team_members tm
        JOIN public.profiles p ON tm.user_id = p.id
        WHERE tm.team_id = p_team_id
      )
    )
  FROM
    public.teams t
  WHERE
    t.id = p_team_id
    -- Security Gate: Only return data if the current user is a member of the requested team.
    AND EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = p_team_id AND tm.user_id = auth.uid()
    );
$$;

-- FILE: Supabase SQL Editor
-- This script corrects the security definition of the workspace function.

CREATE OR REPLACE FUNCTION get_workspace_data(p_team_id UUID)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER -- CORRECTED: Run with elevated privileges to see all team plans.
AS $$
  SELECT
    jsonb_build_object(
      'team', to_jsonb(t),
      
      'current_user_role', (
        SELECT tm.role
        FROM public.team_members tm
        WHERE tm.team_id = p_team_id AND tm.user_id = auth.uid()
      ),
      
      -- This subquery can now see all plans for the team, regardless of RLS.
      'plans', (
        SELECT jsonb_agg(p ORDER BY p.title)
        FROM public.plans p
        WHERE p.team_id = p_team_id
      ),
      
      'members', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'profile', to_jsonb(p),
            'role', tm.role
          ) ORDER BY tm.role, p.full_name
        )
        FROM public.team_members tm
        JOIN public.profiles p ON tm.user_id = p.id
        WHERE tm.team_id = p_team_id
      )
    )
  FROM
    public.teams t
  WHERE
    t.id = p_team_id
    -- The security gate is still here: a user must be a member to run the function at all.
    AND EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = p_team_id AND tm.user_id = auth.uid()
    );
$$;

-- FILE: Supabase SQL Editor
-- This script fixes the ambiguous column reference bug.
DROP FUNCTION get_workspace_data(uuid);


CREATE OR REPLACE FUNCTION get_workspace_data(
    workspace_id UUID -- RENAMED for clarity and to prevent conflicts
)
RETURNS JSONB
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    jsonb_build_object(
      'team', to_jsonb(t),
      
      'current_user_role', (
        SELECT tm.role
        FROM public.team_members tm
        WHERE tm.team_id = workspace_id AND tm.user_id = auth.uid()
      ),
      
      -- This subquery now has an unambiguous WHERE clause
      'plans', (
        SELECT jsonb_agg(p ORDER BY p.title)
        FROM public.plans p
        WHERE p.team_id = workspace_id
      ),
      
      'members', (
        SELECT jsonb_agg(
          jsonb_build_object(
            'profile', to_jsonb(p),
            'role', tm.role
          ) ORDER BY tm.role, p.full_name
        )
        FROM public.team_members tm
        JOIN public.profiles p ON tm.user_id = p.id
        WHERE tm.team_id = workspace_id
      )
    )
  FROM
    public.teams t
  WHERE
    t.id = workspace_id
    AND EXISTS (
      SELECT 1
      FROM public.team_members tm
      WHERE tm.team_id = workspace_id AND tm.user_id = auth.uid()
    );
$$;

-- =============================================================================
-- BEGIN DATABASE MIGRATION SCRIPT
-- =============================================================================
-- This script will refactor the database schema to support advanced workout
-- planning, goal tracking, and deterministic exercise classification.
--
-- PLEASE BACK UP YOUR DATABASE BEFORE RUNNING THIS SCRIPT.
-- =============================================================================

BEGIN;

-- =============================================================================
-- STEP 1: DROP OBSOLETE TABLES
-- =============================================================================
-- These tables are being replaced by a more flexible tagging system.

COMMENT ON TABLE public.exercise_to_category IS 'Dropping: Replaced by the new tagging system.';
DROP TABLE IF EXISTS public.exercise_to_category;

COMMENT ON TABLE public.exercise_to_type IS 'Dropping: Replaced by the new tagging system.';
DROP TABLE IF EXISTS public.exercise_to_type;

-- =============================================================================
-- STEP 2: CREATE NEW ENUM TYPES
-- =============================================================================
-- These types provide structured, deterministic options for our new columns.

CREATE TYPE public.exercise_physical_intent AS ENUM (
    'strength_hypertrophy',
    'strength_endurance',
    'power_explosive',
    'cardiovascular_endurance',
    'flexibility_mobility',
    'stability_balance',
    'skill_development',
    'restorative_recovery',
    'none'
);

CREATE TYPE public.engagement_level AS ENUM (
    'primary',
    'secondary',
    'stabilizer',
    'dynamic_stretch',
    'isometric'
);

CREATE TYPE public.set_type AS ENUM (
    'normal',
    'warmup',
    'dropset',
    'amrap',
    'emom',
    'for_time',
    'tabata',
    'pyramid',
    'failure',
    'rest_pause',
    'isometrics',
    'technique'
);

CREATE TYPE public.goal_metric AS ENUM (
    -- Strength-Based
    'one_rep_max_kg',
    'max_weight_for_reps_kg',
    'total_volume_kg',
    'max_reps_at_weight',
    'max_reps_bodyweight',
    -- Endurance/Cardio
    'time_to_complete_distance',
    'distance_in_time',
    'max_duration_seconds',
    'avg_pace_seconds_per_km',
    'avg_speed_kmh',
    'avg_heart_rate_bpm',
    'vo2_max',
    -- Skill & Power
    'max_vertical_jump_cm',
    'max_box_jump_height_cm',
    'throw_distance_m',
    'successful_attempts_percent',
    'balance_duration_seconds',
    -- Body Composition
    'bodyweight_kg',
    'body_fat_percent',
    'muscle_mass_kg',
    'waist_circumference_cm',
    -- Consistency
    'sessions_completed_count',
    'adherence_percent',
    'total_active_time_minutes'
);

CREATE TYPE public.goal_status AS ENUM (
    'in_progress',
    'achieved',
    'not_achieved'
);


-- =============================================================================
-- STEP 3: CREATE NEW TABLES
-- =============================================================================

-- New Tagging System
CREATE TABLE public.tags (
    id serial PRIMARY KEY,
    name text NOT NULL UNIQUE,
    tag_type text NOT NULL -- e.g., 'equipment', 'movement_pattern', 'mental_attribute'
);
COMMENT ON TABLE public.tags IS 'Central repository for all tags (equipment, mental attributes, etc.).';

CREATE TABLE public.exercise_tags (
    exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    tag_id integer NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (exercise_id, tag_id)
);
COMMENT ON TABLE public.exercise_tags IS 'Links exercises to their various tags.';


-- New Goal System
CREATE TABLE public.plan_goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    metric public.goal_metric NOT NULL,
    target_value numeric NOT NULL,
    exercise_id uuid REFERENCES public.exercises(id) ON DELETE SET NULL, -- Goal can be plan-wide
    created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.plan_goals IS 'Defines the measurable objectives of a workout plan.';

CREATE TABLE public.user_plan_goal_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_goal_id uuid NOT NULL REFERENCES public.plan_goals(id) ON DELETE CASCADE,
    start_value numeric,
    current_value numeric,
    status public.goal_status NOT NULL DEFAULT 'in_progress',
    achieved_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.user_plan_goal_progress IS 'Tracks an individual user''s progress against a specific plan goal.';


-- New Logging Bridge Table
CREATE TABLE public.session_exercise_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_log_id uuid NOT NULL REFERENCES public.session_logs(id) ON DELETE CASCADE,
    plan_session_exercise_id uuid REFERENCES public.plan_session_exercises(id) ON DELETE SET NULL, -- Can be null for unplanned workouts
    exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);
COMMENT ON TABLE public.session_exercise_logs IS 'Acts as a parent for all sets of a specific exercise within a logged session.';


-- =============================================================================
-- STEP 4: MODIFY EXISTING TABLES
-- =============================================================================

-- Refactor 'exercises' table
COMMENT ON COLUMN public.exercises.environment IS 'Dropping: This is better handled by the tagging system.';
ALTER TABLE public.exercises DROP COLUMN IF EXISTS environment;
ALTER TABLE public.exercises ADD COLUMN primary_physical_intent public.exercise_physical_intent;
COMMENT ON COLUMN public.exercises.primary_physical_intent IS 'The primary physical goal of the exercise.';

-- Refactor 'exercise_muscle' table
ALTER TABLE public.exercise_muscle ADD COLUMN engagement_level public.engagement_level NOT NULL DEFAULT 'primary';
COMMENT ON COLUMN public.exercise_muscle.engagement_level IS 'Describes how the muscle is involved (primary, stabilizer, etc.).';

-- Refactor 'plans' table
COMMENT ON COLUMN public.plans.sport IS 'Dropping: Plan sport is better inferred from its exercises or explicit tags.';
ALTER TABLE public.plans DROP COLUMN IF EXISTS sport;

-- Refactor 'plan_session_exercises' table
ALTER TABLE public.plan_session_exercises RENAME COLUMN order_index TO order_within_session;
COMMENT ON COLUMN public.plan_session_exercises.target_rest_seconds IS 'Dropping: Replaced by post_exercise and post_group rest columns.';
ALTER TABLE public.plan_session_exercises DROP COLUMN IF EXISTS target_rest_seconds;
ALTER TABLE public.plan_session_exercises ADD COLUMN execution_group smallint NOT NULL DEFAULT 1;
COMMENT ON COLUMN public.plan_session_exercises.execution_group IS 'Groups exercises into supersets/circuits.';
ALTER TABLE public.plan_session_exercises ADD COLUMN post_exercise_rest_seconds integer NOT NULL DEFAULT 0 CHECK (post_exercise_rest_seconds >= 0);
COMMENT ON COLUMN public.plan_session_exercises.post_exercise_rest_seconds IS 'Short rest after an exercise within a circuit.';
ALTER TABLE public.plan_session_exercises ADD COLUMN post_group_rest_seconds integer NOT NULL DEFAULT 0 CHECK (post_group_rest_seconds >= 0);
COMMENT ON COLUMN public.plan_session_exercises.post_group_rest_seconds IS 'Main rest after an entire execution group is completed.';


-- Refactor 'plan_session_exercise_sets' table
ALTER TABLE public.plan_session_exercise_sets ADD COLUMN set_type public.set_type NOT NULL DEFAULT 'normal';
COMMENT ON COLUMN public.plan_session_exercise_sets.set_type IS 'The specific type of set (warmup, dropset, amrap, etc.).';
ALTER TABLE public.plan_session_exercise_sets ADD COLUMN metadata jsonb;
COMMENT ON COLUMN public.plan_session_exercise_sets.metadata IS 'Stores flexible, type-specific data for complex sets.';

-- Refactor 'session_logs' table
ALTER TABLE public.session_logs RENAME COLUMN session_id TO plan_session_id;
COMMENT ON COLUMN public.session_logs.plan_session_id IS 'Renamed from session_id for clarity; links to the planned session.';

-- Refactor 'set_logs' table (This is the most critical change)
ALTER TABLE public.set_logs DROP CONSTRAINT IF EXISTS set_logs_exercise_session_id_fkey;
ALTER TABLE public.set_logs RENAME COLUMN exercise_session_id TO session_exercise_log_id;
ALTER TABLE public.set_logs
    ADD CONSTRAINT set_logs_session_exercise_log_id_fkey
    FOREIGN KEY (session_exercise_log_id)
    REFERENCES public.session_exercise_logs(id)
    ON DELETE CASCADE;
COMMENT ON COLUMN public.set_logs.session_exercise_log_id IS 'Repointed to link to the new session_exercise_logs bridge table.';
ALTER TABLE public.set_logs ADD COLUMN performance_metadata jsonb;
COMMENT ON COLUMN public.set_logs.performance_metadata IS 'Stores flexible, actual performance data for complex sets.';

-- =============================================================================
-- MIGRATION SCRIPT COMPLETE
-- =============================================================================
COMMIT;

-- =============================================================================
-- RPC REFACTOR SCRIPT
-- =============================================================================
-- This script updates all relevant RPC functions to align with the new schema.
-- It introduces new functions, updates existing ones, and removes obsolete ones.
-- =============================================================================

BEGIN;

-- =============================================================================
-- STEP 1: DROP OBSOLETE OR REPLACED FUNCTIONS
-- =============================================================================

-- These CRUD functions are too granular and will be replaced by a more robust
-- 'plan_update_full' function later if needed. For now, we remove them to
-- avoid confusion with the new, more complex structure.
DROP FUNCTION IF EXISTS public.plan_add_session_exercise(uuid, uuid, smallint, text, integer);
DROP FUNCTION IF EXISTS public.plan_add_session(uuid, smallint, varchar, text);
DROP FUNCTION IF EXISTS public.plan_delete_set(uuid);
DROP FUNCTION IF EXISTS public.plan_delete_session(uuid);
DROP FUNCTION IF EXISTS public.plan_delete_session_exercise(uuid);
DROP FUNCTION IF EXISTS public.plan_update_session_exercise(uuid, text, integer, smallint);
DROP FUNCTION IF EXISTS public.plan_update_set(uuid, smallint, numeric, public.weight_unit_enum, integer, numeric, integer, text);
DROP FUNCTION IF EXISTS public.plan_add_set(uuid, smallint, smallint, numeric, public.weight_unit_enum, integer, numeric, integer, text);
DROP FUNCTION IF EXISTS public.plan_update_session(uuid, varchar, text, smallint);
DROP FUNCTION IF EXISTS public.get_plan_details(uuid); -- Replaced by the _for_user version


-- =============================================================================
-- STEP 2: UPDATE CORE EXERCISE & PLAN RPCs
-- =============================================================================

-- Replaces the old filter function with one that uses the new tagging system.
CREATE OR REPLACE FUNCTION public.get_filtered_exercises(
    p_search_term text DEFAULT NULL,
    p_primary_intents text[] DEFAULT NULL,
    p_tag_ids int[] DEFAULT NULL,
    p_difficulty_level integer DEFAULT NULL,
    p_page_limit integer DEFAULT 20,
    p_page_offset integer DEFAULT 0
)
RETURNS SETOF exercises
LANGUAGE sql
AS $$
    SELECT *
    FROM exercises e
    WHERE
        -- Conditional search term filter
        (p_search_term IS NULL OR e.name ILIKE ('%' || p_search_term || '%'))
        -- Conditional difficulty filter
        AND (p_difficulty_level IS NULL OR e.difficulty_level = p_difficulty_level)
        -- NEW: Conditional primary physical intent filter
        AND (p_primary_intents IS NULL OR e.primary_physical_intent::TEXT = ANY(p_primary_intents))
        -- NEW: Conditional tag filter (for equipment, mental attributes, etc.)
        AND (p_tag_ids IS NULL OR EXISTS (
            SELECT 1 FROM exercise_tags et
            WHERE et.exercise_id = e.id AND et.tag_id = ANY(p_tag_ids)
        ))
    ORDER BY e.name
    LIMIT p_page_limit
    OFFSET p_page_offset;
$$;


-- Updated to return the rich, new deterministic classification of an exercise.
CREATE OR REPLACE FUNCTION public.get_exercise_details(p_exercise_id uuid)
RETURNS jsonb
LANGUAGE sql
AS $$
    SELECT
        jsonb_build_object(
            'exercise', to_jsonb(e),
            'muscles', (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'muscle', em.muscle_group,
                        'engagement', em.engagement_level
                    )
                )
                FROM exercise_muscle em
                WHERE em.exercise_id = e.id
            ),
            'tags', (
                SELECT jsonb_agg(t)
                FROM exercise_tags et
                JOIN tags t ON et.tag_id = t.id
                WHERE et.exercise_id = e.id
            ),
            'references', (
                 SELECT jsonb_agg(erg)
                 FROM exercise_reference_global erg
                 WHERE erg.exercise_id = e.id
            )
        )
    FROM exercises e
    WHERE e.id = p_exercise_id;
$$;


-- This is the most heavily refactored function.
-- It now returns the full hierarchy including goals and the new superset structure.
CREATE OR REPLACE FUNCTION public.get_plan_details_for_user(p_plan_id uuid)
RETURNS jsonb
LANGUAGE sql STABLE
AS $$
SELECT
    jsonb_build_object(
        'plan', to_jsonb(p),
        'creator', to_jsonb(creator_profile),
        'team', to_jsonb(t),
        'goals', (
            SELECT jsonb_agg(g)
            FROM plan_goals g
            WHERE g.plan_id = p.id
        ),
        'can_edit', (
            p.created_by = auth.uid()
            OR (p.team_id IS NOT NULL AND EXISTS (
                SELECT 1
                FROM team_members tm
                WHERE tm.team_id = p.team_id
                  AND tm.user_id = auth.uid()
                  AND tm.role IN ('admin', 'coach')
            ))
        ),
        'hierarchy', (
            SELECT jsonb_build_object(
                'weeks', (
                    SELECT jsonb_agg(
                        to_jsonb(w) || jsonb_build_object(
                            'days', (
                                SELECT jsonb_agg(
                                    to_jsonb(d) || jsonb_build_object(
                                        'sessions', (
                                            SELECT jsonb_agg(
                                                to_jsonb(s) || jsonb_build_object(
                                                    'is_completed_by_user', EXISTS (
                                                        SELECT 1 FROM session_logs sl
                                                        WHERE sl.user_id = auth.uid()
                                                          AND sl.plan_session_id = s.id
                                                          AND sl.status = 'completed'
                                                    ),
                                                    'exercises', (
                                                        SELECT jsonb_agg(
                                                            -- This is the new exercise structure
                                                            to_jsonb(pse) || jsonb_build_object(
                                                                'exercise_details', to_jsonb(ex),
                                                                'sets', (
                                                                    SELECT jsonb_agg(pses ORDER BY pses.set_number)
                                                                    FROM plan_session_exercise_sets pses
                                                                    WHERE pses.plan_session_exercise_id = pse.id
                                                                )
                                                            )
                                                        ORDER BY pse.order_within_session)
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
            )
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


-- =============================================================================
-- STEP 3: NEW WORKOUT LOGGING RPCs
-- =============================================================================

-- This function replaces your old start_workout_session.
-- It now correctly updates the last_activity_at field.
CREATE OR REPLACE FUNCTION public.start_workout_session(
    p_plan_session_id uuid DEFAULT NULL
)
RETURNS SETOF session_logs
LANGUAGE plpgsql
AS $$
DECLARE
    v_plan_id UUID;
    new_session_log session_logs;
BEGIN
    IF p_plan_session_id IS NOT NULL THEN
        -- Find the plan_id from the session
        SELECT pw.plan_id INTO v_plan_id
        FROM plan_sessions ps
        JOIN plan_days pd ON ps.plan_day_id = pd.id
        JOIN plan_weeks pw ON pd.plan_week_id = pw.id
        WHERE ps.id = p_plan_session_id;

        -- Update the user's status for that plan
        -- This is important for tracking activity and abandoning plans
        UPDATE public.user_plan_status
        SET last_activity_at = now()
        WHERE user_id = auth.uid() AND plan_id = v_plan_id AND status = 'active';
    END IF;

    -- Create the new session log entry
    INSERT INTO public.session_logs (user_id, plan_session_id, date, status)
    VALUES (auth.uid(), p_plan_session_id, now(), 'in_progress')
    RETURNING * INTO new_session_log;

    RETURN NEXT new_session_log;
END;
$$;


-- CRITICAL NEW FUNCTION: This function saves the user's performance.
CREATE OR REPLACE FUNCTION public.log_workout_session(
    p_session_log_id uuid,
    p_performed_exercises jsonb, -- e.g., '[{"plan_exercise_id": "...", "exercise_id": "...", "sets": [...]}]'
    p_duration_minutes integer,
    p_overall_feeling smallint,
    p_notes text
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    exercise_data jsonb;
    set_data jsonb;
    new_session_exercise_log_id uuid;
BEGIN
    -- First, loop through each performed exercise in the JSON array
    FOR exercise_data IN SELECT * FROM jsonb_array_elements(p_performed_exercises)
    LOOP
        -- Create a parent log entry for this exercise
        INSERT INTO public.session_exercise_logs
            (session_log_id, plan_session_exercise_id, exercise_id, notes)
        VALUES
            (p_session_log_id,
             (exercise_data->>'plan_session_exercise_id')::uuid,
             (exercise_data->>'exercise_id')::uuid,
             exercise_data->>'notes'
            )
        RETURNING id INTO new_session_exercise_log_id;

        -- Then, loop through each set for this exercise
        FOR set_data IN SELECT * FROM jsonb_array_elements(exercise_data->'sets')
        LOOP
            INSERT INTO public.set_logs
                (session_exercise_log_id, set_number, reps_performed, weight_used, duration_seconds, distance_meters, notes, performance_metadata)
            VALUES
                (new_session_exercise_log_id,
                 (set_data->>'set_number')::smallint,
                 (set_data->>'reps_performed')::smallint,
                 (set_data->>'weight_used')::numeric,
                 (set_data->>'duration_seconds')::integer,
                 (set_data->>'distance_meters')::numeric,
                 set_data->>'notes',
                 set_data->'performance_metadata'
                );
        END LOOP;
    END LOOP;

    -- Finally, update the main session_log to mark it as complete
    UPDATE public.session_logs
    SET
        status = 'completed',
        duration_minutes = p_duration_minutes,
        overall_feeling = p_overall_feeling,
        notes = p_notes,
        updated_at = now()
    WHERE
        id = p_session_log_id AND user_id = auth.uid();

END;
$$;


-- Updated to use the new logging hierarchy
CREATE OR REPLACE FUNCTION public.get_workout_details(p_log_id uuid)
RETURNS jsonb
LANGUAGE sql
AS $$
SELECT
    jsonb_build_object(
        'log_summary', to_jsonb(sl),
        'performed_exercises', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'exercise_details', to_jsonb(ex),
                    'log_details', to_jsonb(sel),
                    'sets_logged', (
                        SELECT jsonb_agg(slog ORDER BY slog.set_number)
                        FROM set_logs slog
                        WHERE slog.session_exercise_log_id = sel.id
                    )
                )
            )
            FROM session_exercise_logs sel
            JOIN exercises ex ON sel.exercise_id = ex.id
            WHERE sel.session_log_id = sl.id
        )
    )
FROM
    session_logs sl
WHERE
    sl.id = p_log_id;
$$;


-- =============================================================================
-- STEP 4: CLEAN UP AND MINOR ADJUSTMENTS TO OTHER FUNCTIONS
-- =============================================================================

-- Minor adjustment to use the renamed column `plan_session_id`
CREATE OR REPLACE FUNCTION public.get_user_profile_details(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    result JSONB;
    v_active_plan_id UUID;
BEGIN
    SELECT plan_id INTO v_active_plan_id
    FROM user_plan_status
    WHERE user_id = p_user_id AND status = 'active'
    LIMIT 1;

    WITH
    latest_activity AS (
        SELECT
            pw.week_number,
            pd.day_number
        FROM session_logs sl
        -- RENAMED COLUMN
        JOIN plan_sessions ps ON sl.plan_session_id = ps.id
        JOIN plan_days pd ON ps.plan_day_id = pd.id
        JOIN plan_weeks pw ON pd.plan_week_id = pw.id
        WHERE sl.user_id = p_user_id
          AND pw.plan_id = v_active_plan_id
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
        'active_plan', (
            SELECT
                CASE
                    WHEN v_active_plan_id IS NOT NULL THEN
                        jsonb_build_object(
                            'plan_details', to_jsonb(p),
                            'current_position', jsonb_build_object(
                                'week', COALESCE(la.week_number, 1),
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
$function$;

COMMIT;



-- /supabase/migrations/refactor_dashboard_rpc.sql

CREATE OR REPLACE FUNCTION public.get_user_dashboard_summary()
RETURNS jsonb
LANGUAGE plpgsql STABLE -- Changed to plpgsql to handle logic
AS $$
DECLARE
    v_active_plan_id UUID;
    v_result JSONB;
BEGIN
    -- First, find the user's active plan ID
    SELECT plan_id INTO v_active_plan_id
    FROM public.user_plan_status
    WHERE user_id = auth.uid() AND status = 'active'
    LIMIT 1;

    -- Now, build the main JSONB object
    SELECT jsonb_build_object(
        -- NEW: If an active plan exists, call our powerful get_plan_details_for_user
        -- function to get the rich, complete plan object.
        'active_plan_details', (
            SELECT
                CASE
                    WHEN v_active_plan_id IS NOT NULL THEN
                        public.get_plan_details_for_user(v_active_plan_id)
                    ELSE
                        NULL
                END
        ),

        -- The rest of the function remains the same as it was correct
        'my_teams', (
            SELECT jsonb_agg(
                to_jsonb(t) || jsonb_build_object('role', tm.role)
                ORDER BY t.name
            )
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            WHERE tm.user_id = auth.uid()
        ),

        'my_created_plans', (
            SELECT jsonb_agg(p ORDER BY p.created_at DESC)
            FROM plans p
            WHERE p.created_by = auth.uid()
        ),

        'pending_invitations_count', (
            SELECT COUNT(*)
            FROM team_invitations ti
            WHERE ti.invited_user_id = auth.uid() AND ti.status = 'pending'
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$;

-- /supabase/migrations/refactor_user_profile_rpc.sql

CREATE OR REPLACE FUNCTION public.get_user_profile_details(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql STABLE
AS $$
DECLARE
    v_active_plan_id UUID;
    v_result JSONB;
BEGIN
    -- Step 1: Find the user's active plan ID, if it exists.
    SELECT plan_id INTO v_active_plan_id
    FROM public.user_plan_status
    WHERE user_id = p_user_id AND status = 'active'
    LIMIT 1;

    -- Step 2: Build the main JSONB object for the profile.
    SELECT jsonb_build_object(
        'profile', to_jsonb(prof),
        'teams', (
            SELECT jsonb_agg(jsonb_build_object('team', t, 'role', tm.role))
            FROM team_members tm
            JOIN teams t ON tm.team_id = t.id
            WHERE tm.user_id = p_user_id
        ),

        -- NEW AND IMPROVED PART:
        -- Instead of manually fetching basic plan details, we now call our
        -- powerful `get_plan_details_for_user` function to get the full,
        -- rich, and consistent plan object.
        'active_plan_details', (
            SELECT
                CASE
                    WHEN v_active_plan_id IS NOT NULL THEN
                        public.get_plan_details_for_user(v_active_plan_id)
                    ELSE
                        NULL
                END
        )
    )
    INTO v_result
    FROM public.profiles prof
    WHERE prof.id = p_user_id;

    RETURN v_result;
END;
$$;

-- =============================================================================
-- FINAL BACKEND PREPARATION SCRIPT (CORRECTED)
-- =============================================================================
-- This script creates the Materialized Views and RPCs for the analytics layer.
-- It includes the fix for the "subquery in FROM must have an alias" error.
-- =============================================================================

BEGIN;

-- =============================================================================
-- STEP 1: CREATE THE MATERIALIZED VIEWS (THE "ENGINES")
-- =============================================================================

DROP MATERIALIZED VIEW IF EXISTS public.coach_analytics_summary;
DROP MATERIALIZED VIEW IF EXISTS public.plan_analytics_summary;
DROP MATERIALIZED VIEW IF EXISTS public.user_plan_performance_summary;


-- VIEW 1: The Foundation - User/Plan Granular Performance
CREATE MATERIALIZED VIEW public.user_plan_performance_summary AS
WITH
plan_workout_counts AS (
    SELECT
        pw.plan_id,
        count(pd.id) AS total_workouts_planned
    FROM public.plan_weeks pw
    JOIN public.plan_days pd ON pw.id = pd.plan_week_id
    WHERE pd.is_rest_day = false
    GROUP BY pw.plan_id
),
plan_goal_counts AS (
    SELECT
        pg.plan_id,
        count(pg.id) AS total_goals_in_plan
    FROM public.plan_goals pg
    GROUP BY pg.plan_id
),
user_logged_workouts AS (
    SELECT
        sl.user_id,
        pw.plan_id,
        count(DISTINCT pd.id) AS unique_workouts_logged,
        max(sl.date) AS last_activity_date
    FROM public.session_logs sl
    JOIN public.plan_sessions ps ON sl.plan_session_id = ps.id
    JOIN public.plan_days pd ON ps.plan_day_id = pd.id
    JOIN public.plan_weeks pw ON pd.plan_week_id = pw.id
    WHERE sl.status = 'completed'
    GROUP BY sl.user_id, pw.plan_id
),
user_achieved_goals AS (
    SELECT
        upgp.user_id,
        pg.plan_id,
        count(upgp.id) AS achieved_goals_count
    FROM public.user_plan_goal_progress upgp
    JOIN public.plan_goals pg ON upgp.plan_goal_id = pg.id
    WHERE upgp.status = 'achieved'
    GROUP BY upgp.user_id, pg.plan_id
)
SELECT
    ulw.user_id,
    ulw.plan_id,
    ulw.last_activity_date,
    COALESCE(pwc.total_workouts_planned, 0) AS total_workouts_planned,
    ulw.unique_workouts_logged,
    COALESCE(pgc.total_goals_in_plan, 0) AS total_goals_in_plan,
    COALESCE(uag.achieved_goals_count, 0) AS achieved_goals_count,
    ROUND((ulw.unique_workouts_logged::numeric * 100) / NULLIF(pwc.total_workouts_planned, 0), 0) AS completion_percentage,
    ROUND((COALESCE(uag.achieved_goals_count, 0)::numeric * 100) / NULLIF(pgc.total_goals_in_plan, 0), 0) AS goal_achievement_percentage
FROM user_logged_workouts ulw
LEFT JOIN plan_workout_counts pwc ON ulw.plan_id = pwc.plan_id
LEFT JOIN plan_goal_counts pgc ON ulw.plan_id = pgc.plan_id
LEFT JOIN user_achieved_goals uag ON ulw.user_id = uag.user_id AND ulw.plan_id = uag.plan_id;

-- Add an index for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS user_plan_performance_summary_idx ON public.user_plan_performance_summary (user_id, plan_id);


-- VIEW 2: Plan-Level Analytics Summary
CREATE MATERIALIZED VIEW public.plan_analytics_summary AS
SELECT
    p.id as plan_id,
    p.like_count,
    p.fork_count,
    (SELECT count(*) FROM public.user_plan_status WHERE plan_id = p.id AND status = 'active') as active_users_count,
    -- Calculate the average success rate from our foundational view
    (SELECT AVG(uperf.goal_achievement_percentage) FROM public.user_plan_performance_summary uperf WHERE uperf.plan_id = p.id) as avg_goal_success_rate
FROM public.plans p;

CREATE UNIQUE INDEX IF NOT EXISTS plan_analytics_summary_idx ON public.plan_analytics_summary (plan_id);


-- VIEW 3: Coach-Level Analytics Summary
CREATE MATERIALIZED VIEW public.coach_analytics_summary AS
SELECT
    prof.id as coach_id,
    (SELECT count(*) FROM public.plans WHERE created_by = prof.id AND private = false) as total_plans_created,
    (SELECT SUM(p.like_count) FROM public.plans p WHERE p.created_by = prof.id) as total_likes_on_plans,
    -- Calculate the average success rate across all of a coach's plans
    (
        SELECT AVG(uperf.goal_achievement_percentage)
        FROM public.user_plan_performance_summary uperf
        JOIN public.plans p ON uperf.plan_id = p.id
        WHERE p.created_by = prof.id
    ) as avg_efficacy_across_all_plans
FROM public.profiles prof;

CREATE UNIQUE INDEX IF NOT EXISTS coach_analytics_summary_idx ON public.coach_analytics_summary (coach_id);


-- =============================================================================
-- STEP 2: CREATE NEW RPCS FOR THE ANALYTICS LAYER
-- =============================================================================

-- RPC for the "Community Performance" leaderboard on the plan details page.
CREATE OR REPLACE FUNCTION public.get_plan_user_performance_list(p_plan_id uuid)
RETURNS jsonb LANGUAGE sql STABLE AS $$
    SELECT
        jsonb_agg(
            jsonb_build_object(
                'profile', to_jsonb(prof),
                'performance', to_jsonb(uperf)
            )
            ORDER BY uperf.goal_achievement_percentage DESC, uperf.completion_percentage DESC, uperf.last_activity_date DESC
        )
    FROM public.user_plan_performance_summary uperf
    JOIN public.profiles prof ON uperf.user_id = prof.id
    WHERE uperf.plan_id = p_plan_id;
$$;


-- RPC for the rich plan cards on the Explore page.
-- This function replaces your old 'get_filtered_plans_rich'
CREATE OR REPLACE FUNCTION public.get_filtered_plans_rich(
    p_search_term text DEFAULT NULL,
    p_tag_ids int[] DEFAULT NULL,
    p_difficulty_level integer DEFAULT NULL,
    p_page_limit integer DEFAULT 20,
    p_page_offset integer DEFAULT 0
) RETURNS jsonb LANGUAGE sql STABLE AS $$
    SELECT jsonb_agg(plan_data)
    FROM (
        SELECT
            p.*,
            to_jsonb(pas) as analytics,
            to_jsonb(creator) as creator
        FROM plans p
        JOIN profiles creator on p.created_by = creator.id
        LEFT JOIN plan_analytics_summary pas ON p.id = pas.plan_id
        WHERE
            p.private = false
            AND (p_search_term IS NULL OR p.title ILIKE ('%' || p_search_term || '%'))
            AND (p_difficulty_level IS NULL OR p.difficulty_level = p.difficulty_level)
            AND (p_tag_ids IS NULL OR EXISTS (
                SELECT 1 FROM plan_session_exercises pse
                JOIN exercise_tags et ON pse.exercise_id = et.exercise_id
                JOIN plan_sessions ps ON pse.plan_session_id = ps.id
                JOIN plan_days pd ON ps.plan_day_id = pd.id
                JOIN plan_weeks pw ON pd.plan_week_id = pw.id
                WHERE pw.plan_id = p.id AND et.tag_id = ANY(p_tag_ids)
            ))
        ORDER BY p.created_at DESC
        LIMIT p_page_limit
        OFFSET p_page_offset
    ) AS plan_data;
$$;


-- =============================================================================
-- STEP 3: UPDATE/REFACTOR EXISTING RPCS
-- =============================================================================

-- Add the 'required_equipment' aggregation and FIX THE HIERARCHY SUBQUERY ALIAS.
CREATE OR REPLACE FUNCTION public.get_plan_details_for_user(p_plan_id uuid)
RETURNS jsonb LANGUAGE sql STABLE AS $$
    SELECT
        jsonb_build_object(
            'plan', to_jsonb(p),
            'creator', to_jsonb(creator_profile),
            'team', to_jsonb(t),
            'goals', (SELECT jsonb_agg(g) FROM plan_goals g WHERE g.plan_id = p.id),
            'can_edit', (p.created_by = auth.uid() OR (p.team_id IS NOT NULL AND EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = p.team_id AND tm.user_id = auth.uid() AND tm.role IN ('admin', 'coach')))),
            'required_equipment', (
                SELECT jsonb_agg(DISTINCT t_equip)
                FROM plan_weeks pw
                JOIN plan_days pd ON pw.id = pd.plan_week_id
                JOIN plan_sessions ps ON pd.id = ps.plan_day_id
                JOIN plan_session_exercises pse ON ps.id = pse.plan_session_id
                JOIN exercise_tags et ON pse.exercise_id = et.exercise_id
                JOIN tags t_equip ON et.tag_id = t_equip.id
                WHERE pw.plan_id = p.id AND t_equip.tag_type = 'equipment'
            ),
            'hierarchy', (
                SELECT jsonb_build_object(
                    'weeks', (
                        SELECT jsonb_agg(weeks.w_json ORDER BY weeks.week_number)
                        FROM (
                            SELECT
                                w.*,
                                jsonb_build_object('days', (
                                    SELECT jsonb_agg(days.d_json ORDER BY days.day_number)
                                    FROM (
                                        SELECT
                                            d.*,
                                            jsonb_build_object('sessions', (
                                                SELECT jsonb_agg(sessions.s_json ORDER BY sessions.order_index)
                                                FROM (
                                                    SELECT
                                                        s.*,
                                                        jsonb_build_object(
                                                            'is_completed_by_user', EXISTS(SELECT 1 FROM session_logs sl WHERE sl.user_id = auth.uid() AND sl.plan_session_id = s.id AND sl.status = 'completed'),
                                                            'exercises', (
                                                                SELECT jsonb_agg(exercises.pse_json ORDER BY exercises.order_within_session)
                                                                FROM (
                                                                    SELECT
                                                                        pse.*,
                                                                        jsonb_build_object(
                                                                            'exercise_details', to_jsonb(ex),
                                                                            'sets', (SELECT jsonb_agg(pses ORDER BY pses.set_number) FROM plan_session_exercise_sets pses WHERE pses.plan_session_exercise_id = pse.id)
                                                                        ) AS pse_json
                                                                    FROM plan_session_exercises pse
                                                                    JOIN exercises ex ON pse.exercise_id = ex.id
                                                                    WHERE pse.plan_session_id = s.id
                                                                ) AS exercises
                                                            )
                                                        ) AS s_json
                                                    FROM plan_sessions s
                                                    WHERE s.plan_day_id = d.id
                                                ) AS sessions
                                            )) AS d_json
                                        FROM plan_days d
                                        WHERE d.plan_week_id = w.id
                                    ) AS days
                                )) AS w_json
                            FROM plan_weeks w
                            WHERE w.plan_id = p.id
                        ) AS weeks
                    )
                )
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

DROP FUNCTION fork_plan(uuid);

-- Refactor 'fork_plan' to work with the new hierarchical structure.
CREATE OR REPLACE FUNCTION public.fork_plan(p_original_plan_id uuid)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
    _caller_id uuid := auth.uid();
    _original_plan record;
    _new_plan_id uuid;
    week_record record;
    day_record record;
    session_record record;
    exercise_record record;
    _new_week_id uuid;
    _new_day_id uuid;
    _new_session_id uuid;
    _new_exercise_id uuid;
BEGIN
    -- Validate access and fetch original plan
    SELECT * INTO _original_plan FROM public.plans WHERE id = p_original_plan_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Original plan not found'; END IF;
    IF _original_plan.private = true AND _original_plan.created_by <> _caller_id AND NOT _original_plan.allow_public_forking THEN RAISE EXCEPTION 'Permission denied: This plan cannot be forked'; END IF;

    -- 1. Create the new forked plan record
    INSERT INTO public.plans (title, description, difficulty_level, created_by, private, forked_from, allow_public_forking)
    VALUES ('Fork of ' || _original_plan.title, _original_plan.description, _original_plan.difficulty_level, _caller_id, true, p_original_plan_id, false)
    RETURNING id INTO _new_plan_id;

    -- 2. Copy all plan goals
    INSERT INTO public.plan_goals (plan_id, title, description, metric, target_value, exercise_id)
    SELECT _new_plan_id, title, description, metric, target_value, exercise_id
    FROM public.plan_goals WHERE plan_id = p_original_plan_id;

    -- 3. Loop through and deep copy the hierarchy
    FOR week_record IN SELECT * FROM public.plan_weeks WHERE plan_id = p_original_plan_id ORDER BY week_number LOOP
        INSERT INTO public.plan_weeks (plan_id, week_number, description)
        VALUES (_new_plan_id, week_record.week_number, week_record.description)
        RETURNING id INTO _new_week_id;

        FOR day_record IN SELECT * FROM public.plan_days WHERE plan_week_id = week_record.id ORDER BY day_number LOOP
            INSERT INTO public.plan_days (plan_week_id, day_number, title, description, is_rest_day)
            VALUES (_new_week_id, day_record.day_number, day_record.title, day_record.description, day_record.is_rest_day)
            RETURNING id INTO _new_day_id;

            FOR session_record IN SELECT * FROM public.plan_sessions WHERE plan_day_id = day_record.id ORDER BY order_index LOOP
                INSERT INTO public.plan_sessions (plan_day_id, order_index, title, notes)
                VALUES (_new_day_id, session_record.order_index, session_record.title, session_record.notes)
                RETURNING id INTO _new_session_id;

                FOR exercise_record IN SELECT * FROM public.plan_session_exercises WHERE plan_session_id = session_record.id ORDER BY order_within_session LOOP
                    INSERT INTO public.plan_session_exercises (plan_session_id, exercise_id, order_within_session, notes, execution_group, post_exercise_rest_seconds, post_group_rest_seconds)
                    VALUES (_new_session_id, exercise_record.exercise_id, exercise_record.order_within_session, exercise_record.notes, exercise_record.execution_group, exercise_record.post_exercise_rest_seconds, exercise_record.post_group_rest_seconds)
                    RETURNING id INTO _new_exercise_id;

                    -- Copy all sets for the exercise
                    INSERT INTO public.plan_session_exercise_sets (plan_session_exercise_id, set_number, target_reps, target_weight, target_duration_seconds, target_distance_meters, notes, set_type, metadata)
                    SELECT _new_exercise_id, set_number, target_reps, target_weight, target_duration_seconds, target_distance_meters, notes, set_type, metadata
                    FROM public.plan_session_exercise_sets WHERE plan_session_exercise_id = exercise_record.id;
                END LOOP;
            END LOOP;
        END LOOP;
    END LOOP;

    -- 4. Increment the fork count on the original plan
    UPDATE public.plans SET fork_count = fork_count + 1 WHERE id = p_original_plan_id;

    RETURN _new_plan_id;
END;
$$;


COMMIT;

-- =============================================================================
-- ANALYTICS RPC COMPLETION SCRIPT
-- =============================================================================
-- This script adds the missing RPC functions needed to power the rich preview
-- cards for Teams and Users on the Explore pages.
-- =============================================================================

BEGIN;

-- RPC for the rich team cards on the Explore Teams page.
CREATE OR REPLACE FUNCTION public.get_filtered_teams_rich(
    p_search_term text DEFAULT NULL,
    p_page_limit integer DEFAULT 20,
    p_page_offset integer DEFAULT 0
) RETURNS jsonb LANGUAGE sql STABLE AS $$
    SELECT jsonb_agg(team_data)
    FROM (
        SELECT
            t.*,
            -- We can eventually add a team_analytics_summary view here
            (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as members_count,
            (SELECT COUNT(*) FROM plans p WHERE p.team_id = t.id AND p.private = false) as plans_count
        FROM teams t
        WHERE
            t.is_private = false
            AND t.is_personal_workspace = false
            AND (p_search_term IS NULL OR t.name ILIKE ('%' || p_search_term || '%'))
        ORDER BY t.created_at DESC
        LIMIT p_page_limit
        OFFSET p_page_offset
    ) AS team_data;
$$;


-- RPC for the rich user/coach cards on the Explore Users page.
CREATE OR REPLACE FUNCTION public.get_filtered_users_rich(
    p_search_term text DEFAULT NULL,
    p_page_limit integer DEFAULT 20,
    p_page_offset integer DEFAULT 0
) RETURNS jsonb LANGUAGE sql STABLE AS $$
    SELECT jsonb_agg(user_data)
    FROM (
        SELECT
            p.*,
            to_jsonb(cas) as analytics
        FROM profiles p
        -- This join ensures we only get users who have created public content
        -- and have analytics available.
        JOIN coach_analytics_summary cas ON p.id = cas.coach_id
        WHERE
            (p_search_term IS NULL OR p.full_name ILIKE ('%' || p_search_term || '%') OR p.username ILIKE ('%' || p_search_term || '%'))
        ORDER BY cas.total_likes_on_plans DESC NULLS LAST, p.full_name
        LIMIT p_page_limit
        OFFSET p_page_offset
    ) AS user_data;
$$;


COMMIT;