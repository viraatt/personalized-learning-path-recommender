import { supabase } from '@/lib/supabaseClient'

/**
 * askTutor — asks the grounded tutor-chat edge function a question.
 * Returns the tutor's reply text.
 */
export async function askTutor(message) {
  const { data, error } = await supabase.functions.invoke('tutor-chat', {
    body: { message },
  })

  if (error) throw new Error(error.message || 'Tutor unavailable')
  return data?.reply ?? ''
}