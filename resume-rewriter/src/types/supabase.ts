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
          user_id: string
          full_name: string | null
          email: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          email?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      resumes: {
        Row: {
          id: string
          user_id: string
          title: string
          original_content: string | null
          optimized_content: string | null
          job_description: string | null
          status: string
          template: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          original_content?: string | null
          optimized_content?: string | null
          job_description?: string | null
          status?: string
          template?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          original_content?: string | null
          optimized_content?: string | null
          job_description?: string | null
          status?: string
          template?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          user_id: string
          resume_id: string | null
          file_name: string
          file_path: string
          file_type: string | null
          file_size: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resume_id?: string | null
          file_name: string
          file_path: string
          file_type?: string | null
          file_size?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resume_id?: string | null
          file_name?: string
          file_path?: string
          file_type?: string | null
          file_size?: number | null
          created_at?: string
        }
      }
      resume_versions: {
        Row: {
          id: string
          resume_id: string
          content: string
          version_number: number
          created_at: string
        }
        Insert: {
          id?: string
          resume_id: string
          content: string
          version_number: number
          created_at?: string
        }
        Update: {
          id?: string
          resume_id?: string
          content?: string
          version_number?: number
          created_at?: string
        }
      }
      resume_plans: {
        Row: {
          id: number
          price_id: string
          plan_type: string
          price: number
          monthly_limit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          price_id: string
          plan_type: string
          price: number
          monthly_limit: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          price_id?: string
          plan_type?: string
          price?: number
          monthly_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      resume_subscriptions: {
        Row: {
          id: number
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          price_id: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          price_id: string
          status: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          price_id?: string
          status?: string
          created_at?: string
          updated_at?: string
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
