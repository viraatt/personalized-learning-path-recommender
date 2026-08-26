import { supabase } from '@/lib/supabaseClient'

/**
 * submitIntake — sends the learner's raw intake message to the `parse-profile`
 * edge function and returns the structured profile it produces.
 *
 * Phase 3.2 wires this path with a stub function; Phase 4.1 swaps the stub for
 * real Gemini parsing without changing this hook's signature.
 */
export async function submitIntake(message) {
  const text = String(message ?? '').trim()
  if (!text) throw new Error('Please describe what you want to learn.')

  const { data, error } = await supabase.functions.invoke('parse-profile', {
    body: { message: text },
  })

  if (error) {
    let detail = error.message
    try {
      if (error.context && typeof error.context.json === 'function') {
        const body = await error.context.json()
        if (body?.error) detail = body.error
      }
    } catch {
      /* ignore context parsing issues */
    }
    throw new Error(detail || 'Failed to parse profile')
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  if (!data?.profile) {
    throw new Error('No profile data returned from server')
  }

  return data.profile
}