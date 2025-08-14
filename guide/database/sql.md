# Database as SQL

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  target_type character varying NOT NULL CHECK (target_type::text = ANY (ARRAY['plan'::character varying::text, 'workout_log'::character varying::text, 'exercise'::character varying::text, 'announcement'::character varying::text, 'event'::character varying::text, 'discussion_message'::character varying::text])),
  target_id uuid NOT NULL,
  parent_comment_id uuid,
  content text NOT NULL,
  like_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT comments_parent_comment_id_fkey FOREIGN KEY (parent_comment_id) REFERENCES public.comments(id)
);
CREATE TABLE public.exercise_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  workout_log_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  plan_exercise_id uuid,
  notes text,
  order_index smallint,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT exercise_logs_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_logs_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id),
  CONSTRAINT exercise_logs_workout_log_id_fkey FOREIGN KEY (workout_log_id) REFERENCES public.workout_logs(id)
);
CREATE TABLE public.exercise_muscle (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  exercise_id uuid NOT NULL,
  muscle_group USER-DEFINED NOT NULL,
  CONSTRAINT exercise_muscle_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_muscle_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);
CREATE TABLE public.exercise_reference_global (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  exercise_id uuid NOT NULL,
  source USER-DEFINED NOT NULL,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  url text NOT NULL,
  title text NOT NULL DEFAULT 'URL Title'::text,
  CONSTRAINT exercise_reference_global_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_reference_global_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT exercise_reference_global_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);
CREATE TABLE public.exercise_saved_references (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  global_reference uuid NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  exercise_id uuid NOT NULL,
  CONSTRAINT exercise_saved_references_pkey PRIMARY KEY (id),
  CONSTRAINT exercise_saved_references_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT exercise_saved_references_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id),
  CONSTRAINT exercise_saved_references_global_reference_fkey FOREIGN KEY (global_reference) REFERENCES public.exercise_reference_global(id)
);
CREATE TABLE public.exercise_to_category (
  exercise_id uuid NOT NULL,
  category USER-DEFINED NOT NULL,
  CONSTRAINT exercise_to_category_pkey PRIMARY KEY (exercise_id, category),
  CONSTRAINT exercise_to_category_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);
CREATE TABLE public.exercise_to_type (
  exercise_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  CONSTRAINT exercise_to_type_pkey PRIMARY KEY (exercise_id, type),
  CONSTRAINT exercise_to_type_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id)
);
CREATE TABLE public.exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  instructions text,
  difficulty_level smallint CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  image_url character varying,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  environment USER-DEFINED NOT NULL DEFAULT 'outdoor'::exercise_environment,
  CONSTRAINT exercises_pkey PRIMARY KEY (id),
  CONSTRAINT exercises_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.follows (
  follower_user_id uuid NOT NULL,
  following_user_id uuid NOT NULL,
  followed_at timestamp with time zone DEFAULT now(),
  CONSTRAINT follows_pkey PRIMARY KEY (follower_user_id, following_user_id),
  CONSTRAINT follows_following_user_id_fkey FOREIGN KEY (following_user_id) REFERENCES auth.users(id),
  CONSTRAINT follows_follower_user_id_fkey FOREIGN KEY (follower_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_type character varying NOT NULL CHECK (target_type::text = ANY (ARRAY['plan'::character varying::text, 'workout_log'::character varying::text, 'exercise'::character varying::text, 'comment'::character varying::text, 'announcement'::character varying::text])),
  target_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type character varying NOT NULL,
  message text NOT NULL,
  related_object_type character varying,
  related_object_id uuid,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.plan_days (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_week_id uuid NOT NULL,
  day_number smallint NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  title character varying,
  description text,
  is_rest_day boolean DEFAULT false,
  CONSTRAINT plan_days_pkey PRIMARY KEY (id),
  CONSTRAINT plan_days_plan_week_id_fkey FOREIGN KEY (plan_week_id) REFERENCES public.plan_weeks(id)
);
CREATE TABLE public.plan_session_exercise_sets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_session_exercise_id uuid NOT NULL,
  set_number smallint NOT NULL CHECK (set_number > 0),
  target_reps smallint CHECK (target_reps >= 0),
  target_weight numeric CHECK (target_weight >= 0::numeric),
  target_duration_seconds integer CHECK (target_duration_seconds >= 0),
  target_distance_meters numeric CHECK (target_distance_meters >= 0::numeric),
  target_rest_seconds integer CHECK (target_rest_seconds >= 0),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  target_weight_unit USER-DEFINED,
  CONSTRAINT plan_session_exercise_sets_pkey PRIMARY KEY (id),
  CONSTRAINT plan_session_exercise_sets_plan_session_exercise_id_fkey FOREIGN KEY (plan_session_exercise_id) REFERENCES public.plan_session_exercises(id)
);
CREATE TABLE public.plan_session_exercises (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_session_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  order_index smallint NOT NULL CHECK (order_index > 0),
  notes text,
  target_rest_seconds integer CHECK (target_rest_seconds >= 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT plan_session_exercises_pkey PRIMARY KEY (id),
  CONSTRAINT plan_session_exercises_exercise_id_fkey FOREIGN KEY (exercise_id) REFERENCES public.exercises(id),
  CONSTRAINT plan_session_exercises_plan_session_id_fkey FOREIGN KEY (plan_session_id) REFERENCES public.plan_sessions(id)
);
CREATE TABLE public.plan_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_day_id uuid NOT NULL,
  order_index smallint NOT NULL DEFAULT 1 CHECK (order_index > 0),
  title character varying,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT plan_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT plan_sessions_plan_day_id_fkey FOREIGN KEY (plan_day_id) REFERENCES public.plan_days(id)
);
CREATE TABLE public.plan_weeks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL,
  week_number smallint NOT NULL CHECK (week_number > 0),
  description text,
  CONSTRAINT plan_weeks_pkey PRIMARY KEY (id),
  CONSTRAINT plan_weeks_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  difficulty_level smallint CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  sport character varying,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  team_id uuid,
  visibility character varying NOT NULL DEFAULT 'private'::character varying CHECK (visibility::text = ANY (ARRAY['public'::character varying::text, 'team'::character varying::text, 'private'::character varying::text])),
  allow_public_forking boolean NOT NULL DEFAULT false,
  origin_type character varying NOT NULL DEFAULT 'user'::character varying CHECK (origin_type::text = ANY (ARRAY['user'::character varying::text, 'admin'::character varying::text, 'ai'::character varying::text, 'coach'::character varying::text])),
  is_featured boolean DEFAULT false,
  fork_count integer DEFAULT 0,
  like_count integer DEFAULT 0,
  forked_from uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT plans_pkey PRIMARY KEY (id),
  CONSTRAINT plans_created_by_fkey1 FOREIGN KEY (created_by) REFERENCES public.profiles(id),
  CONSTRAINT plans_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT plans_forked_from_fkey FOREIGN KEY (forked_from) REFERENCES public.plans(id),
  CONSTRAINT plans_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username character varying NOT NULL UNIQUE,
  full_name character varying,
  bio text,
  profile_image_url character varying,
  updated_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  unit USER-DEFINED NOT NULL DEFAULT 'metric'::measure_unit,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.set_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exercise_log_id uuid NOT NULL,
  set_number smallint NOT NULL CHECK (set_number > 0),
  reps_performed smallint,
  weight_used numeric,
  weight_unit character varying DEFAULT 'kg'::character varying,
  duration_seconds integer,
  distance_meters numeric,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT set_logs_pkey PRIMARY KEY (id),
  CONSTRAINT set_logs_exercise_log_id_fkey FOREIGN KEY (exercise_log_id) REFERENCES public.exercise_logs(id)
);
CREATE TABLE public.team_announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  user_id uuid,
  title character varying NOT NULL,
  content text NOT NULL,
  pinned boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_announcements_pkey PRIMARY KEY (id),
  CONSTRAINT team_announcements_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_announcements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.team_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  location character varying,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_events_pkey PRIMARY KEY (id),
  CONSTRAINT team_events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT team_events_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id)
);
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role character varying NOT NULL CHECK (role::text = ANY (ARRAY['coach'::character varying::text, 'student'::character varying::text])),
  joined_at timestamp with time zone DEFAULT now(),
  CONSTRAINT team_members_pkey PRIMARY KEY (id),
  CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES public.teams(id),
  CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT team_members_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  description text,
  logo_url character varying,
  sport character varying,
  is_private boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  CONSTRAINT teams_pkey PRIMARY KEY (id),
  CONSTRAINT teams_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.user_measurements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  measurement_date date NOT NULL DEFAULT CURRENT_DATE,
  weight_kg numeric,
  height_cm numeric,
  body_fat_percentage numeric,
  body_fat_photo_url text,
  resting_heart_rate integer,
  biceps_left_cm numeric,
  biceps_left_photo_url text,
  biceps_right_cm numeric,
  biceps_right_photo_url text,
  waist_cm numeric,
  waist_photo_url text,
  chest_cm numeric,
  chest_photo_url text,
  thigh_left_cm numeric,
  thigh_left_photo_url text,
  thigh_right_cm numeric,
  thigh_right_photo_url text,
  calf_left_cm numeric,
  calf_left_photo_url text,
  calf_right_cm numeric,
  calf_right_photo_url text,
  hips_cm numeric,
  hips_photo_url text,
  forearm_left_cm numeric,
  forearm_left_photo_url text,
  forearm_right_cm numeric,
  forearm_right_photo_url text,
  overall_notes text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_measurements_pkey PRIMARY KEY (id),
  CONSTRAINT user_measurements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.user_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  start_date date,
  end_date date,
  status character varying DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying::text, 'completed'::character varying::text, 'paused'::character varying::text, 'abandoned'::character varying::text])),
  privacy_level character varying DEFAULT 'private'::character varying CHECK (privacy_level::text = ANY (ARRAY['private'::character varying::text, 'team'::character varying::text, 'public'::character varying::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_plans_pkey PRIMARY KEY (id),
  CONSTRAINT user_plans_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT user_plans_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id)
);
CREATE TABLE public.workout_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  date date NOT NULL,
  title character varying,
  notes text,
  duration_minutes integer,
  overall_feeling smallint CHECK (overall_feeling >= 1 AND overall_feeling <= 5),
  privacy_level character varying DEFAULT 'private'::character varying CHECK (privacy_level::text = ANY (ARRAY['private'::character varying::text, 'team'::character varying::text, 'public'::character varying::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  session_id uuid,
  CONSTRAINT workout_logs_pkey PRIMARY KEY (id),
  CONSTRAINT workout_logs_session_id_fkey FOREIGN KEY (session_id) REFERENCES public.plan_sessions(id),
  CONSTRAINT workout_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);