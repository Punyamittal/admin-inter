import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  console.error('[Supabase] CRITICAL ERROR: VITE_SUPABASE_URL is not defined in .env or Vite environment.')
}

export const supabase = createClient(
  supabaseUrl || 'https://MISSING-URL-ERROR.supabase.co',
  supabaseAnonKey || 'MISSING-KEY-ERROR',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'superadmin-session'
    }
  }
)
