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
      workouts: {
        Row: {
          id: string
          user_id: string
          date: string
          exercise_name: string
          sets: number
          reps: number
          weight: number
          duration: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          exercise_name: string
          sets: number
          reps: number
          weight: number
          duration: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          exercise_name?: string
          sets?: number
          reps?: number
          weight?: number
          duration?: number
          notes?: string | null
          created_at?: string
        }
      }
      body_weight: {
        Row: {
          id: string
          user_id: string
          date: string
          weight: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          weight: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          weight?: number
          created_at?: string
        }
      }
      water_intake: {
        Row: {
          id: string
          user_id: string
          date: string
          amount_ml: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          amount_ml: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          amount_ml?: number
          created_at?: string
        }
      }
      sleep_tracker: {
        Row: {
          id: string
          user_id: string
          date: string
          duration_hr: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          duration_hr: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          duration_hr?: number
          notes?: string | null
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_type: string
          target_value: number
          deadline: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_type: string
          target_value: number
          deadline: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_type?: string
          target_value?: number
          deadline?: string
          notes?: string | null
          created_at?: string
        }
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