import { supabase } from '@/lib/supabaseClient'

const COMPLETE_BONUS = 40
const RATING_PER_STAR = 8
const MAX_SCORE = 100

/**
 * updateStepProgress — persists step status/rating (10.2) and folds the
 * course's skills into skill_mastery (10.3).
 *
 * Mastery rule: completing a step grants COMPLETE_BONUS per taught skill;
 * a star rating grants RATING_PER_STAR per star. Scores cap at MAX_SCORE.
 *
 * @returns {{ mastery: Array<{skill_name, mastery_score}> }} updated scores
 */
export async function updateStepProgress({ stepId, skills = [], status, rating }) {
  const patch = {}
  if (status) patch.status = status
  if (rating != null) patch.rating = rating

  const { error: updateError } = await supabase
    .from('path_steps')
    .update(patch)
    .eq('id', stepId)
  if (updateError) throw new Error(updateError.message || 'Failed to save progress')

  if (skills.length === 0) return { mastery: [] }

  const gained =
    (status === 'complete' ? COMPLETE_BONUS : 0) +
    (rating != null ? rating * RATING_PER_STAR : 0)
  if (gained === 0) return { mastery: [] }

  const { data: auth } = await supabase.auth.getUser()
  const userId = auth?.user?.id
  if (!userId) throw new Error('Not signed in')

  const { data: existingRows, error: fetchError } = await supabase
    .from('skill_mastery')
    .select('skill_name, mastery_score')
    .eq('user_id', userId)
    .in('skill_name', skills)
  if (fetchError) throw new Error(fetchError.message)

  const current = Object.fromEntries(
    (existingRows ?? []).map((r) => [r.skill_name, Number(r.mastery_score) || 0])
  )

  const updates = skills.map((skill) => ({
    user_id: userId,
    skill_name: skill,
    mastery_score: Math.min(MAX_SCORE, (current[skill] ?? 0) + gained),
  }))

  const { data: saved, error: upsertError } = await supabase
    .from('skill_mastery')
    .upsert(updates, { onConflict: 'user_id,skill_name' })
    .select('skill_name, mastery_score')
  if (upsertError) throw new Error(upsertError.message)

  return { mastery: saved ?? [] }
}