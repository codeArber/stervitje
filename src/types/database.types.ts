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
          exercise_id: string
          id: string
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"]
        }
        Insert: {
          created_at?: string
          exercise_id: string
          id?: string
          muscle_group: Database["public"]["Enums"]["muscle_group_enum"]
        }
        Update: {
          created_at?: string
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_to_category: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"]
          exercise_id: string
        }
        Insert: {
          category: Database["public"]["Enums"]["exercise_category"]
          exercise_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"]
          exercise_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_to_category_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_to_type: {
        Row: {
          exercise_id: string
          type: Database["public"]["Enums"]["exercise_type_enum"]
        }
        Insert: {
          exercise_id: string
          type: Database["public"]["Enums"]["exercise_type_enum"]
        }
        Update: {
          exercise_id?: string
          type?: Database["public"]["Enums"]["exercise_type_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "exercise_to_type_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
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
          environment: Database["public"]["Enums"]["exercise_environment"]
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
          environment?: Database["public"]["Enums"]["exercise_environment"]
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
          environment?: Database["public"]["Enums"]["exercise_environment"]
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
      plan_session_exercise_sets: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          plan_session_exercise_id: string
          set_number: number
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
          notes?: string | null
          plan_session_exercise_id: string
          set_number: number
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
          notes?: string | null
          plan_session_exercise_id?: string
          set_number?: number
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
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          plan_session_id: string
          target_rest_seconds: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_index: number
          plan_session_id: string
          target_rest_seconds?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number
          plan_session_id?: string
          target_rest_seconds?: number | null
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
          sport: string | null
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
          sport?: string | null
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
          sport?: string | null
          team_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
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
          full_name: string | null
          id: string
          profile_image_url: string | null
          unit: Database["public"]["Enums"]["measure_unit"]
          updated_at: string | null
          username: string
        }
        Insert: {
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          profile_image_url?: string | null
          unit?: Database["public"]["Enums"]["measure_unit"]
          updated_at?: string | null
          username: string
        }
        Update: {
          bio?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          profile_image_url?: string | null
          unit?: Database["public"]["Enums"]["measure_unit"]
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      session_logs: {
        Row: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          overall_feeling: number | null
          privacy_level: string | null
          session_id: string | null
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
          privacy_level?: string | null
          session_id?: string | null
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
          privacy_level?: string | null
          session_id?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_logs_session_id_fkey"
            columns: ["session_id"]
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
          exercise_session_id: string
          id: string
          notes: string | null
          reps_performed: number | null
          set_number: number
          weight_unit: string | null
          weight_used: number | null
        }
        Insert: {
          created_at?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_session_id: string
          id?: string
          notes?: string | null
          reps_performed?: number | null
          set_number: number
          weight_unit?: string | null
          weight_used?: number | null
        }
        Update: {
          created_at?: string | null
          distance_meters?: number | null
          duration_seconds?: number | null
          exercise_session_id?: string
          id?: string
          notes?: string | null
          reps_performed?: number | null
          set_number?: number
          weight_unit?: string | null
          weight_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_exercise_session_id_fkey"
            columns: ["exercise_session_id"]
            isOneToOne: false
            referencedRelation: "plan_session_exercises"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string
          invited_email: string | null
          invited_user_id: string | null
          role: Database["public"]["Enums"]["team_member_role"]
          status: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by: string
          invited_email?: string | null
          invited_user_id?: string | null
          role: Database["public"]["Enums"]["team_member_role"]
          status?: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string
          invited_email?: string | null
          invited_user_id?: string | null
          role?: Database["public"]["Enums"]["team_member_role"]
          status?: string
          team_id?: string
        }
        Relationships: [
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
          {
            foreignKeyName: "team_members_user_id_fkey1"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            referencedRelation: "plans"
            referencedColumns: ["id"]
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
      [_ in never]: never
    }
    Functions: {
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
      fork_plan: {
        Args: { original_plan_id: string }
        Returns: string
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
          privacy_level: string | null
          session_id: string | null
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
      get_filtered_exercises: {
        Args: {
          p_categories?: string[]
          p_difficulty_level?: number
          p_environments?: string[]
          p_muscle_groups?: string[]
          p_page_limit?: number
          p_page_offset?: number
          p_search_term?: string
          p_types?: string[]
        }
        Returns: {
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          environment: Database["public"]["Enums"]["exercise_environment"]
          id: string
          image_url: string | null
          instructions: string | null
          name: string
          updated_at: string | null
        }[]
      }
      get_filtered_plans_rich: {
        Args: {
          p_difficulty_level?: number
          p_muscle_groups_filter?: string[]
          p_page_limit?: number
          p_page_offset?: number
          p_sport_filter?: string
        }
        Returns: Json
      }
      get_plan_details: {
        Args: { p_plan_id: string }
        Returns: Json
      }
      get_team_details_and_members: {
        Args: { p_team_id: string }
        Returns: Json
      }
      get_user_plan_history: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_profile_details: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_workout_details: {
        Args: { p_log_id: string }
        Returns: Json
      }
      mark_abandoned_plans: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      plan_add_session: {
        Args: {
          _notes?: string
          _order_index?: number
          _plan_day_id: string
          _title?: string
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
      plan_add_session_exercise: {
        Args: {
          _exercise_id: string
          _notes?: string
          _order_index: number
          _plan_session_id: string
          _target_rest_seconds?: number
        }
        Returns: {
          created_at: string | null
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          plan_session_id: string
          target_rest_seconds: number | null
          updated_at: string | null
        }
      }
      plan_add_set: {
        Args: {
          _notes?: string
          _plan_session_exercise_id: string
          _set_number: number
          _target_distance_meters?: number
          _target_duration_seconds?: number
          _target_reps?: number
          _target_rest_seconds?: number
          _target_weight?: number
          _target_weight_unit?: Database["public"]["Enums"]["weight_unit_enum"]
        }
        Returns: {
          created_at: string | null
          id: string
          notes: string | null
          plan_session_exercise_id: string
          set_number: number
          target_distance_meters: number | null
          target_duration_seconds: number | null
          target_reps: number | null
          target_rest_seconds: number | null
          target_weight: number | null
          target_weight_unit:
            | Database["public"]["Enums"]["weight_unit_enum"]
            | null
          updated_at: string | null
        }[]
      }
      plan_delete_session: {
        Args: { _session_id: string }
        Returns: undefined
      }
      plan_delete_session_exercise: {
        Args: { _plan_session_exercise_id: string }
        Returns: undefined
      }
      plan_delete_set: {
        Args: { _set_id: string }
        Returns: undefined
      }
      plan_update_session: {
        Args: {
          _notes?: string
          _order_index?: number
          _session_id: string
          _title?: string
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
      plan_update_session_exercise: {
        Args: {
          _notes?: string
          _order_index?: number
          _plan_session_exercise_id: string
          _target_rest_seconds?: number
        }
        Returns: {
          created_at: string | null
          exercise_id: string
          id: string
          notes: string | null
          order_index: number
          plan_session_id: string
          target_rest_seconds: number | null
          updated_at: string | null
        }
      }
      plan_update_set: {
        Args: {
          _notes?: string
          _set_id: string
          _target_distance_meters?: number
          _target_duration_seconds?: number
          _target_reps?: number
          _target_rest_seconds?: number
          _target_weight?: number
          _target_weight_unit?: Database["public"]["Enums"]["weight_unit_enum"]
        }
        Returns: {
          created_at: string | null
          id: string
          notes: string | null
          plan_session_exercise_id: string
          set_number: number
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
      start_user_plan: {
        Args: { p_plan_id: string }
        Returns: undefined
      }
      start_workout_session: {
        Args: { p_plan_session_id?: string }
        Returns: {
          created_at: string | null
          date: string
          duration_minutes: number | null
          id: string
          notes: string | null
          overall_feeling: number | null
          privacy_level: string | null
          session_id: string | null
          title: string | null
          updated_at: string | null
          user_id: string | null
        }[]
      }
    }
    Enums: {
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
      exercise_type_enum:
        | "pull"
        | "push"
        | "isometric"
        | "plyometric"
        | "rotational"
        | "dynamic"
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
      team_member_role: "admin" | "coach" | "member"
      weight_unit_enum: "kg" | "lb"
    }
    CompositeTypes: {
      [_ in never]: never
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
      exercise_type_enum: [
        "pull",
        "push",
        "isometric",
        "plyometric",
        "rotational",
        "dynamic",
      ],
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
      team_member_role: ["admin", "coach", "member"],
      weight_unit_enum: ["kg", "lb"],
    },
  },
} as const
