import { supabase } from '@/lib/supabaseClient'

/**
 * regeneratePath — re-runs the generate-path edge function (10.3). The
 * generator already excludes completed courses and pulls unmet prerequisites,
 * so a fresh path reflects updated mastery/progress.
 */
export async function regeneratePath() {
  const { data, error } = await supabase.functions.invoke('generate-path', {
    body: {},
  })

  if (error) throw new Error(error.message || 'Failed to re-sequence path')
  return data?.pathId ?? null
}