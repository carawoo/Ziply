import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const supabase = createClientComponentClient()

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
    }
  }
}
