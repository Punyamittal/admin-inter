import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[Admin] CRITICAL ERROR: VITE_SUPABASE_URL or VITE_SERVICE_KEY is missing from .env')
}

export const supabaseAdmin = createClient(
  supabaseUrl || 'https://MISSING-URL-ADMIN.supabase.co',
  supabaseServiceKey || 'MISSING-KEY-ADMIN',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }
)
