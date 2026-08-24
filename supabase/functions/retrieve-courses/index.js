// retrieve-courses — profile/goal in -> ranked courses + skill gaps out.
//
// Phases 6.1–6.3:
//   6.1 Embeds the learner's goal text and runs pgvector cosine similarity
//       search over the catalog via the match_courses RPC.
//   6.2 Computes the skill gap between matched-course skills and the skills
//       the learner already has, using _shared/skillGap.js.
//   6.3 Integration: reads the caller's saved learner_profile (RLS) so a
//       profile alone is enough input — message text optional.

import { corsHeaders } from '../_shared/cors.js'
import { embed } from '../_shared/ai.js'
import { createAuthedClient } from '../_shared/supabase.js'
import { collectCourseSkills, computeSkillGap } from '../_shared/skillGap.js'

const DEFAULT_MATCH_COUNT = 8

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

async function getProfile(authed) {
  const { data, error } = await authed.from('learner_profiles').select('*').maybeSingle()
  if (error) throw new Error(`Failed to load profile: ${error.message}`)
  return data ?? null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const message = String(body?.message ?? '').trim()
    const matchCount = Number(body?.matchCount) || DEFAULT_MATCH_COUNT

    const authed = createAuthedClient(req)
    const admin = createAuthedClient(req, { serviceRole: true })

    // Profile provides context; goal text drives the query embedding.
    const profile = await getProfile(authed)
    if (!profile && !message) {
      return json({ error: 'No saved profile and no goal text provided' }, 400)
    }

    const queryText = [message, profile?.goals].filter(Boolean).join('. ')
    const queryEmbedding = await embed(queryText)
    if (!Array.isArray(queryEmbedding)) throw new Error('No embedding returned')

    // 6.1 Similarity search over the catalog.
    const { data: matches, error: rpcError } = await authed.rpc('match_courses', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
    })
    if (rpcError) throw new Error(`Similarity search failed: ${rpcError.message}`)

    // 6.2 Skill gap: skills needed by matched courses vs. skills already held
    // from the courses the learner marked complete.
    const targetSkills = collectCourseSkills(matches ?? [])
    let existingSkills = []
    const completedIds = profile?.completed_courses ?? []
    if (completedIds.length > 0) {
      const { data: completedCourses, error: completedError } = await admin
        .from('courses')
        .select('id, skills')
        .in('id', completedIds)
      if (completedError) throw new Error(`Failed to load completed courses: ${completedError.message}`)
      existingSkills = collectCourseSkills(completedCourses ?? [])
    }

    const { gaps, covered, coverage } = computeSkillGap(targetSkills, existingSkills)

    return json({
      matches,
      skillGap: { gaps, covered, coverage },
      profileUsed: Boolean(profile),
    })
  } catch (err) {
    console.error('retrieve-courses failed:', err)
    return json({ error: err?.message ?? 'Retrieval failed' }, 500)
  }
})