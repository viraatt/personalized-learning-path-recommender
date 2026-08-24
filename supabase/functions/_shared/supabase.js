// Shared Supabase client helper for edge functions.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Create a Supabase client scoped to the caller's JWT so Row Level Security
 * attributes every read/write to `auth.uid()`. Use for user-owned tables
 * (learner_profiles, learning_paths, path_steps, skill_mastery).
 *
 * Deno edge functions get SUPABASE_URL and SUPABASE_ANON_KEY from the platform.
 */
export function createAuthedClient(req, {
  serviceRole = false,
} = {}) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const key = serviceRole
    ? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    : Deno.env.get('SUPABASE_ANON_KEY') ?? ''

  const options = {}
  if (!serviceRole) {
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '').trim()
    if (token) options.global = { headers: { Authorization: `Bearer ${token}` } }
  }

  return createClient(supabaseUrl, key, options)
}