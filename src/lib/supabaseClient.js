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

// Realtime postgres_changes on RLS-protected tables (e.g. public.shops) require:
// 1) Table in publication supabase_realtime (see supabase/migrations/*realtime*shops*.sql)
// 2) SELECT policies that allow the signed-in admin to read relevant rows
// The client already calls realtime.setAuth on SIGNED_IN / TOKEN_REFRESHED (supabase-js).
