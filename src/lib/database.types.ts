export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          like_count: number | null
          parent_comment_id: string | null
          target_id: string
          target_type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_comment_id?: string | null
          target_id: string
          target_type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          like_count?: number | null
          parent_comment_id?: string | null
          target_id?: string
          target_type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      exercise_logs: {
        Row: {
          created_at: string | null
          exercise_id: string
          id: string
          notes: string | null
          order_index: number | null
          plan_exercise_id: string | null
          workout_log_id: string
        }
        Insert: {
          created_at?: string | null
          exercise_id: string
          id?: string
          notes?: string | null
          order_index?: number | null
          plan_exercise_id?: string | null
          workout_log_id: string
        }
        Update: {
          created_at?: string | null
          exercise_id?: string
          id?: string
          notes?: string | null
          order_index?: number | null
          plan_exercise_id?: string | null
          workout_log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exercise_logs_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exercise_logs_workout_log_id_fkey"
            columns: ["workout_log_id"]
            isOneToOne: false
            referencedRelation: "workout_logs"
            referencedColumns: ["id"]
          },
        ]
      }
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
      exercises: {
        Row: {
          category: Database["public"]["Enums"]["exercise_category"] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          environment: Database["public"]["Enums"]["exercise_environment"]
          exercise_type:
            | Database["public"]["Enums"]["exercise_type_enum"]
            | null
          id: string
          image_url: string | null
          instructions: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["exercise_category"] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          environment?: Database["public"]["Enums"]["exercise_environment"]
          exercise_type?:
            | Database["public"]["Enums"]["exercise_type_enum"]
            | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["exercise_category"] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          environment?: Database["public"]["Enums"]["exercise_environment"]
          exercise_type?:
            | Database["public"]["Enums"]["exercise_type_enum"]
            | null
          id?: string
          image_url?: string | null
          instructions?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          followed_at: string | null
          follower_user_id: string
          following_user_id: string
        }
        Insert: {
          followed_at?: string | null
          follower_user_id: string
          following_user_id: string
        }
        Update: {
          followed_at?: string | null
          follower_user_id?: string
          following_user_id?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          created_at: string | null
          id: string
          target_id: string
          target_type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          target_id: string
          target_type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          related_object_id: string | null
          related_object_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          related_object_id?: string | null
          related_object_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          related_object_id?: string | null
          related_object_type?: string | null
          type?: string
          user_id?: string
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
            | Database["public"]["Enums"]["weight_unit_enum "]
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
            | Database["public"]["Enums"]["weight_unit_enum "]
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
            | Database["public"]["Enums"]["weight_unit_enum "]
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
          is_featured: boolean | null
          like_count: number | null
          origin_type: string
          sport: string | null
          team_id: string | null
          title: string
          updated_at: string | null
          visibility: string
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
          is_featured?: boolean | null
          like_count?: number | null
          origin_type?: string
          sport?: string | null
          team_id?: string | null
          title: string
          updated_at?: string | null
          visibility?: string
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
          is_featured?: boolean | null
          like_count?: number | null
          origin_type?: string
          sport?: string | null
          team_id?: string | null
          title?: string
          updated_at?: string | null
          visibility?: string
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
      set_logs: {
        Row: {
          created_at: string | null
          distance_meters: number | null
          duration_seconds: number | null
          exercise_log_id: string
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
          exercise_log_id: string
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
          exercise_log_id?: string
          id?: string
          notes?: string | null
          reps_performed?: number | null
          set_number?: number
          weight_unit?: string | null
          weight_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "set_logs_exercise_log_id_fkey"
            columns: ["exercise_log_id"]
            isOneToOne: false
            referencedRelation: "exercise_logs"
            referencedColumns: ["id"]
          },
        ]
      }
      team_announcements: {
        Row: {
          content: string
          created_at: string | null
          id: string
          pinned: boolean | null
          team_id: string
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          pinned?: boolean | null
          team_id: string
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          pinned?: boolean | null
          team_id?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_announcements_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          start_time: string
          team_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          start_time: string
          team_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          start_time?: string
          team_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_events_team_id_fkey"
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
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          role: string
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          role?: string
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
      user_plans: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          plan_id: string
          privacy_level: string | null
          start_date: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_id: string
          privacy_level?: string | null
          start_date?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          plan_id?: string
          privacy_level?: string | null
          start_date?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_logs: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_team_plan_to_member: {
        Args: {
          _user_id_to_assign: string
          _plan_id_to_assign: string
          _team_id_context: string
          _start_date?: string
          _privacy_level?: string
        }
        Returns: string
      }
      fork_plan: {
        Args: { original_plan_id: string }
        Returns: string
      }
      get_discoverable_plans: {
        Args: { page_limit?: number; page_offset?: number }
        Returns: Json
      }
      get_plan_day_details: {
        Args: { _plan_day_id: string }
        Returns: Json
      }
      get_todays_plan_summary: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_context: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_user_workouts_formatted: {
        Args: { p_user_id: string }
        Returns: {
          workouts: Json
        }[]
      }
      get_user_workouts_with_details: {
        Args: { p_user_id: string }
        Returns: {
          workout_log_id: string
          workout_date: string
          workout_title: string
          workout_notes: string
          workout_duration_minutes: number
          workout_overall_feeling: number
          workout_privacy_level: string
          workout_user_plan_id: string
          workout_plan_day_id: string
          workout_created_at: string
          workout_updated_at: string
          exercise_log_id: string
          exercise_log_workout_log_id: string
          exercise_log_exercise_id: string
          exercise_log_plan_exercise_id: string
          exercise_log_notes: string
          exercise_log_order_index: number
          exercise_log_created_at: string
          set_log_id: string
          set_log_exercise_log_id: string
          set_log_set_number: number
          set_log_reps_performed: number
          set_log_weight_used: number
          set_log_weight_unit: string
          set_log_duration_seconds: number
          set_log_distance_meters: number
          set_log_notes: string
          set_log_created_at: string
        }[]
      }
      log_workout: {
        Args: { workout_payload: Json }
        Returns: string
      }
      plan_add_session: {
        Args: {
          _plan_day_id: string
          _order_index?: number
          _title?: string
          _notes?: string
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
          _plan_session_id: string
          _exercise_id: string
          _order_index: number
          _notes?: string
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
          _plan_session_exercise_id: string
          _set_number: number
          _target_reps?: number
          _target_weight?: number
          _target_weight_unit?: Database["public"]["Enums"]["weight_unit_enum"]
          _target_duration_seconds?: number
          _target_distance_meters?: number
          _target_rest_seconds?: number
          _notes?: string
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
            | Database["public"]["Enums"]["weight_unit_enum "]
            | null
          updated_at: string | null
        }
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
          _session_id: string
          _title?: string
          _notes?: string
          _order_index?: number
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
          _plan_session_exercise_id: string
          _notes?: string
          _target_rest_seconds?: number
          _order_index?: number
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
          _set_id: string
          _target_reps?: number
          _target_weight?: number
          _target_weight_unit?: Database["public"]["Enums"]["weight_unit_enum"]
          _target_duration_seconds?: number
          _target_distance_meters?: number
          _target_rest_seconds?: number
          _notes?: string
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
            | Database["public"]["Enums"]["weight_unit_enum "]
            | null
          updated_at: string | null
        }
      }
    }
    Enums: {
      exercise_category:
        | "strength"
        | "hypertrophy"
        | "endurance"
        | "cardio"
        | "mobility"
        | "flexibility"
        | "power"
        | "speed"
        | "agility"
        | "balance"
        | "coordination"
        | "recovery"
        | "rehab"
        | "functional"
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
      reference_source: "tiktok" | "youtube" | "instagram"
      reference_visibility: "global" | "private"
      weight_unit_enum: "kg" | "lb"
      "weight_unit_enum ": "kg" | "lb"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      exercise_category: [
        "strength",
        "hypertrophy",
        "endurance",
        "cardio",
        "mobility",
        "flexibility",
        "power",
        "speed",
        "agility",
        "balance",
        "coordination",
        "recovery",
        "rehab",
        "functional",
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
      reference_source: ["tiktok", "youtube", "instagram"],
      reference_visibility: ["global", "private"],
      weight_unit_enum: ["kg", "lb"],
      "weight_unit_enum ": ["kg", "lb"],
    },
  },
} as const
