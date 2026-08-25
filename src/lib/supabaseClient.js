import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Provide safe fallbacks so Vite does not throw runtime startup exceptions before rendering
const supabaseUrl = rawUrl || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = rawKey || 'placeholder-anon-key'

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  !rawUrl.includes('your-project-ref') &&
  rawUrl.startsWith('http')
)

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

