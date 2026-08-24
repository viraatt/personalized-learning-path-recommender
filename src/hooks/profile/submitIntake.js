import { supabase } from '@/lib/supabaseClient'

/**
 * submitIntake — sends the learner's raw intake message to the `parse-profile`
 * edge function and returns the structured profile it produces.
 *
 * Phase 3.2 wires this path with a stub function; Phase 4.1 swaps the stub for
 * real Gemini parsing without changing this hook's signature.
 */
export async function submitIntake(message) {
  const { data, error } = await supabase.functions.invoke('parse-profile', {
    body: { message },
  })

  if (error) throw new Error(error.message || 'Failed to parse profile')
  return data?.profile ?? null
}