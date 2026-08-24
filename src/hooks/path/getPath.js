import { supabase } from '@/lib/supabaseClient'

/**
 * getPath — fetches the user's latest learning path with its ordered steps
 * (and each step's course details) via RLS-scoped queries.
 * Returns null when the user has no saved path yet.
 */
export async function getPath() {
  const { data, error } = await supabase
    .from('learning_paths')
    .select(
      `id, generated_at,
       path_steps (
         id, course_id, order_index, milestone_group, status,
         courses ( title, description, difficulty, duration_hours, skills )
       )`
    )
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message || 'Failed to load learning path')
  if (!data) return null

  const steps = (data.path_steps ?? [])
    .slice()
    .sort((a, b) => a.order_index - b.order_index)

  return { id: data.id, generatedAt: data.generated_at, steps }
}