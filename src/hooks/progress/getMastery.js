import { supabase } from '@/lib/supabaseClient'

/**
 * getMastery — fetches the user's per-skill mastery scores, best first.
 * Returns [] when nothing has been learned yet.
 */
export async function getMastery() {
  const { data, error } = await supabase
    .from('skill_mastery')
    .select('skill_name, mastery_score')
    .order('mastery_score', { ascending: false })

  if (error) throw new Error(error.message || 'Failed to load mastery scores')
  return data ?? []
}