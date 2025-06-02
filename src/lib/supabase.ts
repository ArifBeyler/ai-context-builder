import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// For client components
export const createSupabaseClient = () => createClientComponentClient()

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          credits: number
          anonymous_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          credits?: number
          anonymous_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          credits?: number
          anonymous_id?: string | null
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