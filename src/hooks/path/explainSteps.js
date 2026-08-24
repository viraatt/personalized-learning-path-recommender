import { supabase } from '@/lib/supabaseClient'

/**
 * explainSteps — asks the `explain-step` edge function for grounded
 * rationales. Without stepId, all unexplained steps of the path are covered.
 * Returns { [stepId]: rationale }.
 */
export async function explainSteps(pathId, stepId) {
  const body = stepId ? { pathId, stepId } : { pathId }
  const { data, error } = await supabase.functions.invoke('explain-step', { body })

  if (error) throw new Error(error.message || 'Failed to generate explanations')
  return data?.explanations ?? {}
}