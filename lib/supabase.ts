import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

export const supabase = createClientComponentClient()

// Admin client for server-side operations
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export type Database = {
  public: {
    Tables: {
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          session_id: string
          messages: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          messages: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          messages?: any
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
