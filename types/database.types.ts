export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          first_name: string | null
          last_name: string | null
          bio: string | null
          height: number | null
          weight: number | null
          age: number | null
          gender: string | null
          unit_system: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          first_name?: string | null
          last_name?: string | null
          bio?: string | null
          height?: number | null
          weight?: number | null
          age?: number | null
          gender?: string | null
          unit_system?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string | null
          last_name?: string | null
          bio?: string | null
          height?: number | null
          weight?: number | null
          age?: number | null
          gender?: string | null
          unit_system?: string
          created_at?: string
          updated_at?: string
        }
      }
      workout_plans: {
        Row: {
          id: string
          user_id: string
          title: string
          goal: string
          experience_level: string
          equipment: string
          days_per_week: number
          duration: number
          preferences: string | null
          injuries: string | null
          include_cardio: boolean
          include_mobility: boolean
          plan_content: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          goal: string
          experience_level: string
          equipment: string
          days_per_week: number
          duration: number
          preferences?: string | null
          injuries?: string | null
          include_cardio?: boolean
          include_mobility?: boolean
          plan_content: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          goal?: string
          experience_level?: string
          equipment?: string
          days_per_week?: number
          duration?: number
          preferences?: string | null
          injuries?: string | null
          include_cardio?: boolean
          include_mobility?: boolean
          plan_content?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      workout_days: {
        Row: {
          id: string
          workout_plan_id: string
          day_of_week: string
          workout_type: string
          exercises_count: number
          duration: string
          intensity: string
          is_rest_day: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workout_plan_id: string
          day_of_week: string
          workout_type: string
          exercises_count: number
          duration: string
          intensity: string
          is_rest_day?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workout_plan_id?: string
          day_of_week?: string
          workout_type?: string
          exercises_count?: number
          duration?: string
          intensity?: string
          is_rest_day?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          workout_day_id: string
          name: string
          sets: number | null
          reps: string | null
          rest_period: string | null
          technique_notes: string | null
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workout_day_id: string
          name: string
          sets?: number | null
          reps?: string | null
          rest_period?: string | null
          technique_notes?: string | null
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workout_day_id?: string
          name?: string
          sets?: number | null
          reps?: string | null
          rest_period?: string | null
          technique_notes?: string | null
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      progress_checkins: {
        Row: {
          id: string
          user_id: string
          weight: number
          body_fat: number | null
          chest: number | null
          waist: number | null
          arms: number | null
          legs: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight: number
          body_fat?: number | null
          chest?: number | null
          waist?: number | null
          arms?: number | null
          legs?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          weight?: number
          body_fat?: number | null
          chest?: number | null
          waist?: number | null
          arms?: number | null
          legs?: number | null
          notes?: string | null
          created_at?: string
        }
      }
      nutrition_macros: {
        Row: {
          id: string
          user_id: string
          calories: number
          protein: number
          carbs: number
          fat: number
          goal: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          calories: number
          protein: number
          carbs: number
          fat: number
          goal: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          calories?: number
          protein?: number
          carbs?: number
          fat?: number
          goal?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notification_preferences: {
        Row: {
          user_id: string
          email_workout: boolean
          email_progress: boolean
          email_nutrition: boolean
          push_workout: boolean
          push_progress: boolean
          push_nutrition: boolean
          sms_workout: boolean
          sms_progress: boolean
          sms_nutrition: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          email_workout?: boolean
          email_progress?: boolean
          email_nutrition?: boolean
          push_workout?: boolean
          push_progress?: boolean
          push_nutrition?: boolean
          sms_workout?: boolean
          sms_progress?: boolean
          sms_nutrition?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          email_workout?: boolean
          email_progress?: boolean
          email_nutrition?: boolean
          push_workout?: boolean
          push_progress?: boolean
          push_nutrition?: boolean
          sms_workout?: boolean
          sms_progress?: boolean
          sms_nutrition?: boolean
          updated_at?: string
        }
      }
      perplexity_cache: {
        Row: {
          id: string
          query_hash: string
          query: string
          system_content: string
          response: string
          created_at: string
          last_accessed: string
          access_count: number
          model: string | null
        }
        Insert: {
          id?: string
          query_hash: string
          query: string
          system_content: string
          response: string
          created_at?: string
          last_accessed?: string
          access_count?: number
          model?: string | null
        }
        Update: {
          id?: string
          query_hash?: string
          query?: string
          system_content?: string
          response?: string
          created_at?: string
          last_accessed?: string
          access_count?: number
          model?: string | null
        }
        Relationships: []
      }
      perplexity_analytics: {
        Row: {
          id: string
          user_id: string | null
          query: string
          system_content: string | null
          model: string | null
          success: boolean
          error_message: string | null
          response_time_ms: number
          timestamp: string
          cached: boolean
        }
        Insert: {
          id?: string
          user_id?: string | null
          query: string
          system_content?: string | null
          model?: string | null
          success: boolean
          error_message?: string | null
          response_time_ms: number
          timestamp?: string
          cached?: boolean
        }
        Update: {
          id?: string
          user_id?: string | null
          query?: string
          system_content?: string | null
          model?: string | null
          success?: boolean
          error_message?: string | null
          response_time_ms?: number
          timestamp?: string
          cached?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "perplexity_analytics_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      perplexity_rate_limits: {
        Row: {
          id: string
          requests_per_minute: number
          requests_per_day: number
          last_reset_minute: string
          last_reset_day: string
          current_minute_count: number
          current_day_count: number
          updated_at: string
        }
        Insert: {
          id?: string
          requests_per_minute: number
          requests_per_day: number
          last_reset_minute?: string
          last_reset_day?: string
          current_minute_count?: number
          current_day_count?: number
          updated_at?: string
        }
        Update: {
          id?: string
          requests_per_minute?: number
          requests_per_day?: number
          last_reset_minute?: string
          last_reset_day?: string
          current_minute_count?: number
          current_day_count?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
    PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
            Row: infer R
        }
    ? R
    : never
    : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
            Row: infer R
        }
    ? R
    : never
    : never

export type TablesInsert<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Insert: infer I
    }
    ? I
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
    }
    ? I
    : never
    : never

export type TablesUpdate<
    PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
        Update: infer U
    }
    ? U
    : never
    : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
    }
    ? U
    : never
    : never

export type Enums<
    PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

