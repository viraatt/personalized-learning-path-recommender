import { supabase } from '@/lib/supabaseClient'

/**
 * deletePath — deletes a learning path by ID (or the current user's latest path).
 * Cascades to path_steps via database foreign key constraint.
 */
export async function deletePath(pathId) {
  const { data: auth } = await supabase.auth.getUser()
  const userId = auth?.user?.id
  if (!userId) throw new Error('Not signed in')

  let query = supabase.from('learning_paths').delete()
  if (pathId) {
    query = query.eq('id', pathId).eq('user_id', userId)
  } else {
    query = query.eq('user_id', userId)
  }

  const { error } = await query
  if (error) throw new Error(error.message || 'Failed to delete learning path')
  return true
}
