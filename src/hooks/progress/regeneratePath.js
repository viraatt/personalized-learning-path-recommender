import { supabase } from '@/lib/supabaseClient'

/**
 * regeneratePath — re-runs the generate-path edge function (10.3). The
 * generator already excludes completed courses and pulls unmet prerequisites,
 * so a fresh path reflects updated mastery/progress.
 */
export async function regeneratePath(message = '') {
  const { data, error } = await supabase.functions.invoke('generate-path', {
    body: message ? { message } : {},
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
    throw new Error(detail || 'Failed to generate learning path')
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  return data?.pathId ?? null
}