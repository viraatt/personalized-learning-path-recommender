import { supabase } from '@/lib/supabaseClient'

/**
 * getProfile — fetches the current user's saved learner profile.
 * Relies on the PostgREST + RLS (only the owner can see their row).
 * Returns the profile object, or null if none exists yet.
 */
export async function getProfile() {
  const { data, error } = await supabase
    .from('learner_profiles')
    .select('*')
    .maybeSingle()

  if (error) throw new Error(error.message || 'Failed to load profile')
  return data ?? null
}