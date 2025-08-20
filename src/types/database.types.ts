export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      exercise_muscle: {
        Row: {
          created_at: string
          engagement_level: Database["public"]["Enums"]["engagement_level"]
          exercise_id: string
          id: string
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"]
        }
        Insert: {
          created_at?: string
          engagement_level?: Database["public"]["Enums"]["engagement_level"]
          exercise_id: string
          id?: string
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"]
        }
        Update: {
          created_at?: string
          engagement_level?: Database["public"]["Enums"]["engagement_level"]
          exercise_id?: string
          id?: string
          muscle_group?: Database["public"]["Enums"]["muscle_group_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "exercise_muscle_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_reference_global: {
        Row: {
          created_at: string
          created_by: string
          exercise_id: string
          id: string
          source: Database["public"]["Enums"]["reference_source"]
          title: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string
          exercise_id: string
          id?: string
          source: Database["public"]["Enums"]["reference_source"]
          title?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          exercise_id?: string
          id?: string
          source?: Database["public"]["Enums"]["reference_source"]
          title?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_reference_global_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "coach_analytics_summary"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "exercise_reference_global_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_reference_global_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_saved_references: {
        Row: {
          created_at: string
          exercise_id: string
          global_reference: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          global_reference: string
          id?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          global_reference?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_saved_references_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_saved_references_global_reference_fkey"
            columns: ["global_reference"]
            isOneToOne: false
            referencedRelation: "exercise_reference_global"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_saved_references_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "coach_analytics_summary"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "exercise_saved_references_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_tags: {
        Row: {
          exercise_id: string
          tag_id: number
        }
        Insert: {
          exercise_id: string
          tag_id: number
        }
        Update: {
          exercise_id?: string
          tag_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "exercise_tags_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          id: string
          image_url: string | null
          instructions: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      plan_days: {
        Row: {
          day_number: number
          description: string | null
          id: string
          is_rest_day: boolean | null
          plan_week_id: string
          title: string | null
        }
        Insert: {
          day_number: number
          description?: string | null
          id?: string
          is_rest_day?: boolean | null
          plan_week_id: string
          title?: string | null
        }
        Update: {
          day_number?: number
          description?: string | null
          id?: string
          is_rest_day?: boolean | null
          plan_week_id?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_days_plan_week_id_fkey"
            columns: ["plan_week_id"]
            isOneToOne: false
            referencedRelation: "plan_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_goals: {
        Row: {
          created_at: string
          description: string | null
          direction: Database["public"]["Enums"]["goal_direction"]
          exercise_id: string | null
          id: string
          metric: Database["public"]["Enums"]["goal_metric"]
          plan_id: string
          target_type: Database["public"]["Enums"]["goal_target_type"]
          target_value: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          direction: Database["public"]["Enums"]["goal_direction"]
          exercise_id?: string | null
          id?: string
          metric: Database["public"]["Enums"]["goal_metric"]
          plan_id: string
          target_type: Database["public"]["Enums"]["goal_target_type"]
          target_value: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          direction?: Database["public"]["Enums"]["goal_direction"]
          exercise_id?: string | null
          id?: string
          metric?: Database["public"]["Enums"]["goal_metric"]
          plan_id?: string
          target_type?: Database["public"]["Enums"]["goal_target_type"]
          target_value?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_goals_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_goals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_analytics_summary"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "plan_goals_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_session_exercise_sets: {
        Row: {
          created_at: string | null
          id: string
          intent: Database["public"]["Enums"]["exercise_physical_intent"] | null
          metadata: Json | null
          notes: string | null
          plan_session_exercise_id: string
          set_number: number
          set_type: Database["public"]["Enums"]["set_type"]
          target_distance_meters: number | null
          target_duration_seconds: number | null
          target_reps: number | null
          target_rest_seconds: number | null
          target_weight: number | null
          target_weight_unit:
            | Database["public"]["Enums"]["weight_unit_enum"]
            | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          intent?:
            | Database["public"]["Enums"]["exercise_physical_intent"]
            | null
          metadata?: Json | null
          notes?: string | null
          plan_session_exercise_id: string
          set_number: number
          set_type?: Database["public"]["Enums"]["set_type"]
          target_distance_meters?: number | null
          target_duration_seconds?: number | null
          target_reps?: number | null
          target_rest_seconds?: number | null
          target_weight?: number | null
          target_weight_unit?:
            | Database["public"]["Enums"]["weight_unit_enum"]
            | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          intent?:
            | Database["public"]["Enums"]["exercise_physical_intent"]
            | null
          metadata?: Json | null
          notes?: string | null
          plan_session_exercise_id?: string
          set_number?: number
          set_type?: Database["public"]["Enums"]["set_type"]
          target_distance_meters?: number | null
          target_duration_seconds?: number | null
          target_reps?: number | null
          target_rest_seconds?: number | null
          target_weight?: number | null
          target_weight_unit?:
            | Database["public"]["Enums"]["weight_unit_enum"]
            | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_session_exercise_sets_plan_session_exercise_id_fkey"
            columns: ["plan_session_exercise_id"]
            isOneToOne: false
            referencedRelation: "plan_session_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_session_exercises: {
        Row: {
          created_at: string | null
          execution_group: number
          exercise_id: string
          id: string
          notes: string | null
          order_within_session: number
          plan_session_id: string
          post_exercise_rest_seconds: number
          post_group_rest_seconds: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          execution_group?: number
          exercise_id: string
          id?: string
          notes?: string | null
          order_within_session: number
          plan_session_id: string
          post_exercise_rest_seconds?: number
          post_group_rest_seconds?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          execution_group?: number
          exercise_id?: string
          id?: string
          notes?: string | null
          order_within_session?: number
          plan_session_id?: string
          post_exercise_rest_seconds?: number
          post_group_rest_seconds?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_session_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_session_exercises_plan_session_id_fkey"
            columns: ["plan_session_id"]
            isOneToOne: false
            referencedRelation: "plan_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_sessions: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          order_index: number
          plan_day_id: string
          title: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          plan_day_id: string
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          order_index?: number
          plan_day_id?: string
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_sessions_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "plan_days"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_weeks: {
        Row: {
          description: string | null
          id: string
          plan_id: string
          week_number: number
        }
        Insert: {
          description?: string | null
          id?: string
          plan_id: string
          week_number: number
        }
        Update: {
          description?: string | null
          id?: string
          plan_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "plan_weeks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_analytics_summary"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "plan_weeks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          allow_public_forking: boolean
          created_at: string | null
          created_by: string
          description: string | null
          difficulty_level: number | null
          fork_count: number | null
          forked_from: string | null
          id: string
          like_count: number | null
          private: boolean
          team_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          allow_public_forking?: boolean
          created_at?: string | null
          created_by?: string
          description?: string | null
          difficulty_level?: number | null
          fork_count?: number | null
          forked_from?: string | null
          id?: string
          like_count?: number | null
          private?: boolean
          team_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          allow_public_forking?: boolean
          created_at?: string | null
          created_by?: string
          description?: string | null
          difficulty_level?: number | null
          fork_count?: number | null
          forked_from?: string | null
          id?: string
          like_count?: number | null
          private?: boolean
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plans_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "coach_analytics_summary"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "plans_created_by_fkey1"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_forked_from_fkey"
            columns: ["forked_from"]
            isOneToOne: false
            referencedRelation: "plan_analytics_summary"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "plans_forked_from_fkey"
            columns: ["forked_from"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string | null
          current_workspace_id: string | null
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean
          profile_image_url: string | null
          unit: Database["public"]["Enums"]["measure_unit"]
          updated_at: string | null
          username: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          current_workspace_id?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean
          profile_image_url?: string | null
          unit?: Database["public"]["Enums"]["measure_unit"]
          updated_at?: string | null
          username: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          current_workspace_id?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean
          profile_image_url?: string | null
          unit?: Database["public"]["Enums"]["measure_unit"]
          updated_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_workspace_id_fkey"
            columns: ["current_workspace_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      session_exercise_logs: {
        Row: {
          created_at: string
          exercise_id: string
          id: string
          notes: string | null
          plan_session_exercise_id: string | null
          session_log_id: string
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          notes?: string | null
          plan_session_exercise_id?: string | null
          session_log_id: string
        }
        Update: {
          created_at?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          plan_session_exercise_id?: string | null
          session_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_exercise_logs_plan_session_exercise_id_fkey"
            columns: ["plan_session_exercise_id"]
            isOneToOne: false
            referencedRelation: "plan_session_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_exercise_logs_session_log_id_fkey"
            columns: ["session_log_id"]
            isOneToOne: false
            referencedRelation: "session_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      session_logs: {
        Row: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          overall_feeling: number | null
          plan_id: string | null
          plan_session_id: string | null
          privacy_level: string | null
          status: Database["public"]["Enums"]["workout_status_enum"]
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          overall_feeling?: number | null
          plan_id?: string | null
          plan_session_id?: string | null
          privacy_level?: string | null
          status?: Database["public"]["Enums"]["workout_status_enum"]
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          overall_feeling?: number | null
          plan_id?: string | null
          plan_session_id?: string | null
          privacy_level?: string | null
          status?: Database["public"]["Enums"]["workout_status_enum"]
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_logs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_analytics_summary"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "session_logs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_logs_session_id_fkey"
            columns: ["plan_session_id"]
            isOneToOne: false
            referencedRelation: "plan_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      set_logs: {
        Row: {
          created_at: string | null
          distance_meters: number | null
          duration_seconds: number | null
          id: string
          notes: string | null
          performance_metadata: Json | null
          reps_performed: number | null
          session_exercise_log_id: string
          set_number: number
          weight_unit: string | null
          weight_used: number | null
        }
        Insert: {
          created_at?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          performance_metadata?: Json | null
          reps_performed?: number | null
          session_exercise_log_id: string
          set_number: number
          weight_unit?: string | null
          weight_used?: number | null
        }
        Update: {
          created_at?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          id?: string
          notes?: string | null
          performance_metadata?: Json | null
          reps_performed?: number | null
          session_exercise_log_id?: string
          set_number?: number
          weight_unit?: string | null
          weight_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_session_exercise_log_id_fkey"
            columns: ["session_exercise_log_id"]
            isOneToOne: false
            referencedRelation: "session_exercise_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: number
          name: string
          tag_type: string
        }
        Insert: {
          id?: number
          name: string
          tag_type: string
        }
        Update: {
          id?: number
          name?: string
          tag_type?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string
          invited_email: string | null
          invited_user_id: string | null
          role: Database["public"]["Enums"]["team_member_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          team_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by: string
          invited_email?: string | null
          invited_user_id?: string | null
          role: Database["public"]["Enums"]["team_member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          team_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string
          invited_email?: string | null
          invited_user_id?: string | null
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "coach_analytics_summary"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "coach_analytics_summary"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "team_invitations_invited_user_id_fkey"
            columns: ["invited_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          role: Database["public"]["Enums"]["team_member_role"]
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role: Database["public"]["Enums"]["team_member_role"]
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: Database["public"]["Enums"]["team_member_role"]
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_personal_workspace: boolean
          is_private: boolean | null
          logo_url: string | null
          name: string
          sport: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_personal_workspace?: boolean
          is_private?: boolean | null
          logo_url?: string | null
          name: string
          sport?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_personal_workspace?: boolean
          is_private?: boolean | null
          logo_url?: string | null
          name?: string
          sport?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_measurements: {
        Row: {
          biceps_left_cm: number | null
          biceps_left_photo_url: string | null
          biceps_right_cm: number | null
          biceps_right_photo_url: string | null
          body_fat_percentage: number | null
          body_fat_photo_url: string | null
          calf_left_cm: number | null
          calf_left_photo_url: string | null
          calf_right_cm: number | null
          calf_right_photo_url: string | null
          chest_cm: number | null
          chest_photo_url: string | null
          created_at: string | null
          forearm_left_cm: number | null
          forearm_left_photo_url: string | null
          forearm_right_cm: number | null
          forearm_right_photo_url: string | null
          height_cm: number | null
          hips_cm: number | null
          hips_photo_url: string | null
          id: string
          measurement_date: string
          overall_notes: string | null
          resting_heart_rate: number | null
          thigh_left_cm: number | null
          thigh_left_photo_url: string | null
          thigh_right_cm: number | null
          thigh_right_photo_url: string | null
          user_id: string
          waist_cm: number | null
          waist_photo_url: string | null
          weight_kg: number | null
        }
        Insert: {
          biceps_left_cm?: number | null
          biceps_left_photo_url?: string | null
          biceps_right_cm?: number | null
          biceps_right_photo_url?: string | null
          body_fat_percentage?: number | null
          body_fat_photo_url?: string | null
          calf_left_cm?: number | null
          calf_left_photo_url?: string | null
          calf_right_cm?: number | null
          calf_right_photo_url?: string | null
          chest_cm?: number | null
          chest_photo_url?: string | null
          created_at?: string | null
          forearm_left_cm?: number | null
          forearm_left_photo_url?: string | null
          forearm_right_cm?: number | null
          forearm_right_photo_url?: string | null
          height_cm?: number | null
          hips_cm?: number | null
          hips_photo_url?: string | null
          id?: string
          measurement_date?: string
          overall_notes?: string | null
          resting_heart_rate?: number | null
          thigh_left_cm?: number | null
          thigh_left_photo_url?: string | null
          thigh_right_cm?: number | null
          thigh_right_photo_url?: string | null
          user_id: string
          waist_cm?: number | null
          waist_photo_url?: string | null
          weight_kg?: number | null
        }
        Update: {
          biceps_left_cm?: number | null
          biceps_left_photo_url?: string | null
          biceps_right_cm?: number | null
          biceps_right_photo_url?: string | null
          body_fat_percentage?: number | null
          body_fat_photo_url?: string | null
          calf_left_cm?: number | null
          calf_left_photo_url?: string | null
          calf_right_cm?: number | null
          calf_right_photo_url?: string | null
          chest_cm?: number | null
          chest_photo_url?: string | null
          created_at?: string | null
          forearm_left_cm?: number | null
          forearm_left_photo_url?: string | null
          forearm_right_cm?: number | null
          forearm_right_photo_url?: string | null
          height_cm?: number | null
          hips_cm?: number | null
          hips_photo_url?: string | null
          id?: string
          measurement_date?: string
          overall_notes?: string | null
          resting_heart_rate?: number | null
          thigh_left_cm?: number | null
          thigh_left_photo_url?: string | null
          thigh_right_cm?: number | null
          thigh_right_photo_url?: string | null
          user_id?: string
          waist_cm?: number | null
          waist_photo_url?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "coach_analytics_summary"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "user_measurements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plan_goal_progress: {
        Row: {
          achieved_at: string | null
          created_at: string
          current_value: number | null
          id: string
          plan_goal_id: string
          plan_id: string | null
          start_value: number | null
          status: Database["public"]["Enums"]["goal_status"]
          target_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          created_at?: string
          current_value?: number | null
          id?: string
          plan_goal_id: string
          plan_id?: string | null
          start_value?: number | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          created_at?: string
          current_value?: number | null
          id?: string
          plan_goal_id?: string
          plan_id?: string | null
          start_value?: number | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plan_goal_progress_plan_goal_id_fkey"
            columns: ["plan_goal_id"]
            isOneToOne: false
            referencedRelation: "plan_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_plan_goal_progress_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_analytics_summary"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "user_plan_goal_progress_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_plan_goal_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "coach_analytics_summary"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "user_plan_goal_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_plan_status: {
        Row: {
          id: string
          last_activity_at: string
          plan_id: string
          started_at: string
          status: Database["public"]["Enums"]["plan_status"]
          user_id: string
        }
        Insert: {
          id?: string
          last_activity_at?: string
          plan_id: string
          started_at?: string
          status?: Database["public"]["Enums"]["plan_status"]
          user_id: string
        }
        Update: {
          id?: string
          last_activity_at?: string
          plan_id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["plan_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plan_status_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_analytics_summary"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "user_plan_status_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_plan_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "coach_analytics_summary"
            referencedColumns: ["coach_id"]
          },
          {
            foreignKeyName: "user_plan_status_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      coach_analytics_summary: {
        Row: {
          avg_efficacy_across_all_plans: number | null
          coach_id: string | null
          total_likes_on_plans: number | null
          total_plans_created: number | null
        }
        Relationships: []
      }
      plan_analytics_summary: {
        Row: {
          active_users_count: number | null
          avg_goal_success_rate: number | null
          fork_count: number | null
          like_count: number | null
          plan_id: string | null
        }
        Relationships: []
      }
      user_plan_performance_summary: {
        Row: {
          achieved_goals_count: number | null
          completion_percentage: number | null
          goal_achievement_percentage: number | null
          last_activity_date: string | null
          plan_id: string | null
          total_goals_in_plan: number | null
          total_workouts_planned: number | null
          unique_workouts_logged: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_weeks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plan_analytics_summary"
            referencedColumns: ["plan_id"]
          },
          {
            foreignKeyName: "plan_weeks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      add_exercise_set: {
        Args: { p_set_data: Json }
        Returns: {
          created_at: string | null
          id: string
          intent: Database["public"]["Enums"]["exercise_physical_intent"] | null
          metadata: Json | null
          notes: string | null
          plan_session_exercise_id: string
          set_number: number
          set_type: Database["public"]["Enums"]["set_type"]
          target_distance_meters: number | null
          target_duration_seconds: number | null
          target_reps: number | null
          target_rest_seconds: number | null
          target_weight: number | null
          target_weight_unit:
            | Database["public"]["Enums"]["weight_unit_enum"]
            | null
          updated_at: string | null
        }
      }
      add_plan_day: {
        Args: {
          p_day_number: number
          p_description?: string
          p_is_rest_day?: boolean
          p_plan_week_id: string
          p_title?: string
        }
        Returns: {
          day_number: number
          description: string | null
          id: string
          is_rest_day: boolean | null
          plan_week_id: string
          title: string | null
        }
      }
      add_plan_goal: {
        Args: {
          p_description?: string
          p_direction: Database["public"]["Enums"]["goal_direction"]
          p_exercise_id?: string
          p_metric: Database["public"]["Enums"]["goal_metric"]
          p_plan_id: string
          p_target_type: Database["public"]["Enums"]["goal_target_type"]
          p_target_value: number
          p_title: string
        }
        Returns: {
          created_at: string
          description: string | null
          direction: Database["public"]["Enums"]["goal_direction"]
          exercise_id: string | null
          id: string
          metric: Database["public"]["Enums"]["goal_metric"]
          plan_id: string
          target_type: Database["public"]["Enums"]["goal_target_type"]
          target_value: number
          title: string
        }
      }
      add_plan_session: {
        Args: {
          p_notes?: string
          p_order_index: number
          p_plan_day_id: string
          p_title?: string
        }
        Returns: {
          created_at: string | null
          id: string
          notes: string | null
          order_index: number
          plan_day_id: string
          title: string | null
          updated_at: string | null
        }
      }
      add_plan_session_exercise: {
        Args: {
          p_execution_group?: number
          p_exercise_id: string
          p_notes?: string
          p_order_within_session: number
          p_plan_session_id: string
          p_post_exercise_rest_seconds?: number
          p_post_group_rest_seconds?: number
        }
        Returns: Json
      }
      add_plan_week: {
        Args: {
          p_description?: string
          p_plan_id: string
          p_week_number: number
        }
        Returns: {
          description: string | null
          id: string
          plan_id: string
          week_number: number
        }
      }
      assign_team_plan_to_member: {
        Args: {
          _plan_id_to_assign: string
          _privacy_level?: string
          _start_date?: string
          _team_id_context: string
          _user_id_to_assign: string
        }
        Returns: string
      }
      complete_onboarding: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_basic_plan: {
        Args: {
          p_description?: string
          p_difficulty_level?: number
          p_private?: boolean
          p_team_id?: string
          p_title: string
        }
        Returns: {
          allow_public_forking: boolean
          created_at: string | null
          created_by: string
          description: string | null
          difficulty_level: number | null
          fork_count: number | null
          forked_from: string | null
          id: string
          like_count: number | null
          private: boolean
          team_id: string | null
          title: string
          updated_at: string | null
        }
      }
      create_new_team: {
        Args: {
          p_description?: string
          p_is_private?: boolean
          p_name: string
          p_sport?: string
        }
        Returns: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_personal_workspace: boolean
          is_private: boolean | null
          logo_url: string | null
          name: string
          sport: string | null
          updated_at: string | null
        }[]
      }
      delete_plan_day: {
        Args: { p_day_id: string }
        Returns: undefined
      }
      delete_plan_goal: {
        Args: { p_goal_id: string }
        Returns: undefined
      }
      delete_plan_session: {
        Args: { p_session_id: string }
        Returns: undefined
      }
      delete_plan_week: {
        Args: { p_week_id: string }
        Returns: undefined
      }
      fork_plan: {
        Args: { p_original_plan_id: string }
        Returns: string
      }
      get_active_session_for_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          overall_feeling: number | null
          plan_id: string | null
          plan_session_id: string | null
          privacy_level: string | null
          status: Database["public"]["Enums"]["workout_status_enum"]
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
      }
      get_client_progress_for_coach: {
        Args: { p_client_id: string }
        Returns: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          overall_feeling: number | null
          plan_id: string | null
          plan_session_id: string | null
          privacy_level: string | null
          status: Database["public"]["Enums"]["workout_status_enum"]
          title: string | null
          updated_at: string | null
          user_id: string | null
        }[]
      }
      get_discoverable_teams_rich: {
        Args: { p_search_term?: string }
        Returns: Json
      }
      get_discoverable_users: {
        Args: {
          p_exclude_team_id?: string
          p_page_limit?: number
          p_page_offset?: number
          p_role_filter?: string
          p_search_term?: string
        }
        Returns: Json
      }
      get_exercise_details: {
        Args: { p_exercise_id: string }
        Returns: Json
      }
      get_filtered_exercises_with_details: {
        Args: {
          p_difficulty_level?: number
          p_muscle_groups?: string[]
          p_page_limit?: number
          p_page_offset?: number
          p_search_term?: string
          p_tag_ids?: number[]
        }
        Returns: Json
      }
      get_filtered_plans_rich: {
        Args: {
          p_difficulty_level?: number
          p_page_limit?: number
          p_page_offset?: number
          p_search_term?: string
          p_tag_ids?: number[]
        }
        Returns: Json
      }
      get_filtered_teams_rich: {
        Args: {
          p_page_limit?: number
          p_page_offset?: number
          p_search_term?: string
        }
        Returns: Json
      }
      get_filtered_users_rich: {
        Args: {
          p_page_limit?: number
          p_page_offset?: number
          p_search_term?: string
        }
        Returns: Json
      }
      get_pending_baselines_for_session: {
        Args: { p_plan_session_id: string }
        Returns: {
          exercise_name: string
          goal_title: string
          metric: Database["public"]["Enums"]["goal_metric"]
          progress_id: string
        }[]
      }
      get_plan_details_for_user: {
        Args: { p_plan_id: string }
        Returns: Json
      }
      get_plan_session_details: {
        Args: { p_plan_session_id: string }
        Returns: Json
      }
      get_plan_user_performance_list: {
        Args: { p_plan_id: string }
        Returns: Json
      }
      get_session_log: {
        Args: { p_session_log_id: string }
        Returns: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          overall_feeling: number | null
          plan_id: string | null
          plan_session_id: string | null
          privacy_level: string | null
          status: Database["public"]["Enums"]["workout_status_enum"]
          title: string | null
          updated_at: string | null
          user_id: string | null
        }[]
      }
      get_team_details_and_members: {
        Args: { p_team_id: string }
        Returns: Json
      }
      get_user_dashboard_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_logbook: {
        Args: { p_user_id: string }
        Returns: {
          duration_minutes: number
          log_id: string
          overall_feeling: number
          plan_id: string
          plan_title: string
          session_title: string
          workout_date: string
        }[]
      }
      get_user_measurements: {
        Args: { p_user_id: string }
        Returns: {
          biceps_left_cm: number | null
          biceps_left_photo_url: string | null
          biceps_right_cm: number | null
          biceps_right_photo_url: string | null
          body_fat_percentage: number | null
          body_fat_photo_url: string | null
          calf_left_cm: number | null
          calf_left_photo_url: string | null
          calf_right_cm: number | null
          calf_right_photo_url: string | null
          chest_cm: number | null
          chest_photo_url: string | null
          created_at: string | null
          forearm_left_cm: number | null
          forearm_left_photo_url: string | null
          forearm_right_cm: number | null
          forearm_right_photo_url: string | null
          height_cm: number | null
          hips_cm: number | null
          hips_photo_url: string | null
          id: string
          measurement_date: string
          overall_notes: string | null
          resting_heart_rate: number | null
          thigh_left_cm: number | null
          thigh_left_photo_url: string | null
          thigh_right_cm: number | null
          thigh_right_photo_url: string | null
          user_id: string
          waist_cm: number | null
          waist_photo_url: string | null
          weight_kg: number | null
        }[]
      }
      get_user_plan_history: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_plan_performance_details: {
        Args: { p_user_plan_status_id: string }
        Returns: Json
      }
      get_user_plan_performance_summary_list: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_profile_details: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_workout_dates: {
        Args: { p_user_id: string }
        Returns: {
          workout_date: string
        }[]
      }
      get_workout_details: {
        Args: { p_log_id: string }
        Returns: Json
      }
      get_workout_player_data: {
        Args: { p_session_log_id: string }
        Returns: Json
      }
      insert_user_measurement: {
        Args: { p_measurement_data: Json }
        Returns: {
          biceps_left_cm: number | null
          biceps_left_photo_url: string | null
          biceps_right_cm: number | null
          biceps_right_photo_url: string | null
          body_fat_percentage: number | null
          body_fat_photo_url: string | null
          calf_left_cm: number | null
          calf_left_photo_url: string | null
          calf_right_cm: number | null
          calf_right_photo_url: string | null
          chest_cm: number | null
          chest_photo_url: string | null
          created_at: string | null
          forearm_left_cm: number | null
          forearm_left_photo_url: string | null
          forearm_right_cm: number | null
          forearm_right_photo_url: string | null
          height_cm: number | null
          hips_cm: number | null
          hips_photo_url: string | null
          id: string
          measurement_date: string
          overall_notes: string | null
          resting_heart_rate: number | null
          thigh_left_cm: number | null
          thigh_left_photo_url: string | null
          thigh_right_cm: number | null
          thigh_right_photo_url: string | null
          user_id: string
          waist_cm: number | null
          waist_photo_url: string | null
          weight_kg: number | null
        }
      }
      invite_member_to_team: {
        Args: {
          p_invited_email?: string
          p_invited_user_id?: string
          p_role: Database["public"]["Enums"]["team_member_role"]
          p_team_id: string
        }
        Returns: Json
      }
      log_workout: {
        Args: { p_payload: Json }
        Returns: undefined
      }
      log_workout_session: {
        Args: {
          p_duration_minutes: number
          p_notes: string
          p_overall_feeling: number
          p_performed_exercises: Json
          p_session_log_id: string
        }
        Returns: undefined
      }
      mark_abandoned_plans: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      respond_to_team_invitation: {
        Args: { p_accepted: boolean; p_invitation_id: string }
        Returns: undefined
      }
      save_plan_changes: {
        Args: { p_changeset: Json }
        Returns: Json
      }
      save_plan_hierarchy: {
        Args: { p_hierarchy: Json; p_plan_id: string }
        Returns: undefined
      }
      set_current_user_workspace: {
        Args: { p_workspace_id?: string }
        Returns: undefined
      }
      set_goal_baseline: {
        Args: { p_baseline_value: number; p_progress_id: string }
        Returns: undefined
      }
      start_adhoc_workout: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          overall_feeling: number | null
          plan_id: string | null
          plan_session_id: string | null
          privacy_level: string | null
          status: Database["public"]["Enums"]["workout_status_enum"]
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
      }
      start_and_log_plan_session: {
        Args: { p_plan_session_id: string }
        Returns: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          overall_feeling: number | null
          plan_id: string | null
          plan_session_id: string | null
          privacy_level: string | null
          status: Database["public"]["Enums"]["workout_status_enum"]
          title: string | null
          updated_at: string | null
          user_id: string | null
        }[]
      }
      start_new_workout_session: {
        Args: { p_plan_session_id: string }
        Returns: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          overall_feeling: number | null
          plan_id: string | null
          plan_session_id: string | null
          privacy_level: string | null
          status: Database["public"]["Enums"]["workout_status_enum"]
          title: string | null
          updated_at: string | null
          user_id: string | null
        }[]
      }
      start_plan_for_user: {
        Args: { p_plan_id: string }
        Returns: {
          id: string
          last_activity_at: string
          plan_id: string
          started_at: string
          status: Database["public"]["Enums"]["plan_status"]
          user_id: string
        }[]
      }
      start_plan_with_baselines: {
        Args: { p_payload: Json }
        Returns: {
          id: string
          last_activity_at: string
          plan_id: string
          started_at: string
          status: Database["public"]["Enums"]["plan_status"]
          user_id: string
        }[]
      }
      start_plan_with_goals: {
        Args: {
          p_baselines: Database["public"]["CompositeTypes"]["user_baseline"][]
          p_plan_id: string
        }
        Returns: {
          id: string
          last_activity_at: string
          plan_id: string
          started_at: string
          status: Database["public"]["Enums"]["plan_status"]
          user_id: string
        }[]
      }
      start_user_plan: {
        Args: { p_plan_id: string }
        Returns: undefined
      }
      start_workout_session: {
        Args: { p_plan_session_id: string }
        Returns: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          overall_feeling: number | null
          plan_id: string | null
          plan_session_id: string | null
          privacy_level: string | null
          status: Database["public"]["Enums"]["workout_status_enum"]
          title: string | null
          updated_at: string | null
          user_id: string | null
        }
      }
      update_plan_day: {
        Args: {
          p_day_id: string
          p_day_number: number
          p_description?: string
          p_is_rest_day?: boolean
          p_title?: string
        }
        Returns: {
          day_number: number
          description: string | null
          id: string
          is_rest_day: boolean | null
          plan_week_id: string
          title: string | null
        }
      }
      update_plan_goal: {
        Args: {
          p_description: string
          p_exercise_id?: string
          p_goal_id: string
          p_metric: Database["public"]["Enums"]["goal_metric"]
          p_target_value: number
          p_title: string
        }
        Returns: {
          created_at: string
          description: string | null
          direction: Database["public"]["Enums"]["goal_direction"]
          exercise_id: string | null
          id: string
          metric: Database["public"]["Enums"]["goal_metric"]
          plan_id: string
          target_type: Database["public"]["Enums"]["goal_target_type"]
          target_value: number
          title: string
        }
      }
      update_plan_session: {
        Args: {
          p_notes?: string
          p_order_index: number
          p_session_id: string
          p_title?: string
        }
        Returns: {
          created_at: string | null
          id: string
          notes: string | null
          order_index: number
          plan_day_id: string
          title: string | null
          updated_at: string | null
        }
      }
      update_plan_week: {
        Args: {
          p_description?: string
          p_week_id: string
          p_week_number: number
        }
        Returns: {
          description: string | null
          id: string
          plan_id: string
          week_number: number
        }
      }
      update_user_profile: {
        Args: {
          p_bio: string
          p_full_name: string
          p_unit: Database["public"]["Enums"]["measure_unit"]
          p_username: string
        }
        Returns: {
          bio: string
          created_at: string
          current_workspace_id: string
          email: string
          full_name: string
          id: string
          onboarding_completed: boolean
          profile_image_url: string
          unit: Database["public"]["Enums"]["measure_unit"]
          updated_at: string
          username: string
        }[]
      }
    }
    Enums: {
      engagement_level:
        | "primary"
        | "secondary"
        | "stabilizer"
        | "dynamic_stretch"
        | "isometric"
      exercise_category:
        | "strength"
        | "endurance"
        | "mobility"
        | "power"
        | "speed"
        | "agility"
        | "balance"
        | "coordination"
        | "recovery"
        | "core_stability"
      exercise_environment: "gym" | "outdoor" | "home" | "studio"
      exercise_physical_intent:
        | "strength_hypertrophy"
        | "strength_endurance"
        | "power_explosive"
        | "cardiovascular_endurance"
        | "flexibility_mobility"
        | "stability_balance"
        | "skill_development"
        | "restorative_recovery"
        | "none"
      exercise_type_enum:
        | "pull"
        | "push"
        | "isometric"
        | "plyometric"
        | "rotational"
        | "dynamic"
      goal_direction: "increase" | "decrease"
      goal_metric:
        | "one_rep_max_kg"
        | "max_weight_for_reps_kg"
        | "total_volume_kg"
        | "max_reps_at_weight"
        | "max_reps_bodyweight"
        | "time_to_complete_distance"
        | "distance_in_time"
        | "max_duration_seconds"
        | "avg_pace_seconds_per_km"
        | "avg_speed_kmh"
        | "avg_heart_rate_bpm"
        | "vo2_max"
        | "max_vertical_jump_cm"
        | "max_box_jump_height_cm"
        | "throw_distance_m"
        | "successful_attempts_percent"
        | "balance_duration_seconds"
        | "bodyweight_kg"
        | "body_fat_percent"
        | "muscle_mass_kg"
        | "waist_circumference_cm"
        | "sessions_completed_count"
        | "adherence_percent"
        | "total_active_time_minutes"
      goal_status:
        | "in_progress"
        | "achieved"
        | "not_achieved"
        | "pending_baseline"
      goal_target_type: "absolute_value" | "percent_change" | "absolute_change"
      invitation_status: "pending" | "accepted" | "declined"
      measure_unit: "metric" | "imperial"
      muscle_group_enum:
        | "trapezius"
        | "upper-back"
        | "lower-back"
        | "chest"
        | "biceps"
        | "triceps"
        | "forearm"
        | "back-deltoids"
        | "front-deltoids"
        | "abs"
        | "obliques"
        | "adductor"
        | "hamstring"
        | "quadriceps"
        | "abductors"
        | "calves"
        | "gluteal"
        | "head"
        | "neck"
      plan_status: "active" | "completed" | "abandoned"
      reference_source: "tiktok" | "youtube" | "instagram"
      reference_visibility: "global" | "private"
      set_type:
        | "normal"
        | "warmup"
        | "dropset"
        | "amrap"
        | "emom"
        | "for_time"
        | "tabata"
        | "pyramid"
        | "failure"
        | "rest_pause"
        | "isometrics"
        | "technique"
      team_member_role: "admin" | "coach" | "member"
      weight_unit_enum: "kg" | "lb"
      workout_status_enum: "in_progress" | "completed" | "abandoned"
    }
    CompositeTypes: {
      user_baseline: {
        goal_id: string | null
        baseline_value: number | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      engagement_level: [
        "primary",
        "secondary",
        "stabilizer",
        "dynamic_stretch",
        "isometric",
      ],
      exercise_category: [
        "strength",
        "endurance",
        "mobility",
        "power",
        "speed",
        "agility",
        "balance",
        "coordination",
        "recovery",
        "core_stability",
      ],
      exercise_environment: ["gym", "outdoor", "home", "studio"],
      exercise_physical_intent: [
        "strength_hypertrophy",
        "strength_endurance",
        "power_explosive",
        "cardiovascular_endurance",
        "flexibility_mobility",
        "stability_balance",
        "skill_development",
        "restorative_recovery",
        "none",
      ],
      exercise_type_enum: [
        "pull",
        "push",
        "isometric",
        "plyometric",
        "rotational",
        "dynamic",
      ],
      goal_direction: ["increase", "decrease"],
      goal_metric: [
        "one_rep_max_kg",
        "max_weight_for_reps_kg",
        "total_volume_kg",
        "max_reps_at_weight",
        "max_reps_bodyweight",
        "time_to_complete_distance",
        "distance_in_time",
        "max_duration_seconds",
        "avg_pace_seconds_per_km",
        "avg_speed_kmh",
        "avg_heart_rate_bpm",
        "vo2_max",
        "max_vertical_jump_cm",
        "max_box_jump_height_cm",
        "throw_distance_m",
        "successful_attempts_percent",
        "balance_duration_seconds",
        "bodyweight_kg",
        "body_fat_percent",
        "muscle_mass_kg",
        "waist_circumference_cm",
        "sessions_completed_count",
        "adherence_percent",
        "total_active_time_minutes",
      ],
      goal_status: [
        "in_progress",
        "achieved",
        "not_achieved",
        "pending_baseline",
      ],
      goal_target_type: ["absolute_value", "percent_change", "absolute_change"],
      invitation_status: ["pending", "accepted", "declined"],
      measure_unit: ["metric", "imperial"],
      muscle_group_enum: [
        "trapezius",
        "upper-back",
        "lower-back",
        "chest",
        "biceps",
        "triceps",
        "forearm",
        "back-deltoids",
        "front-deltoids",
        "abs",
        "obliques",
        "adductor",
        "hamstring",
        "quadriceps",
        "abductors",
        "calves",
        "gluteal",
        "head",
        "neck",
      ],
      plan_status: ["active", "completed", "abandoned"],
      reference_source: ["tiktok", "youtube", "instagram"],
      reference_visibility: ["global", "private"],
      set_type: [
        "normal",
        "warmup",
        "dropset",
        "amrap",
        "emom",
        "for_time",
        "tabata",
        "pyramid",
        "failure",
        "rest_pause",
        "isometrics",
        "technique",
      ],
      team_member_role: ["admin", "coach", "member"],
      weight_unit_enum: ["kg", "lb"],
      workout_status_enum: ["in_progress", "completed", "abandoned"],
    },
  },
} as const
