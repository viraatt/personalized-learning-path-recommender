// generate-path — learner profile/goal in -> ordered, milestone-grouped path.
//
// Phase 7 integration: retrieval (Phase 6) feeds the prerequisite DAG
// (_shared/pathGraph.js) to produce a valid learning order. Persistence into
// learning_paths/path_steps is Phase 8.1 — this function only returns JSON.

import { corsHeaders } from '../_shared/cors.js'
import { embed } from '../_shared/ai.js'
import { createAuthedClient } from '../_shared/supabase.js'
import {
  resolvePathOrder,
  groupIntoMilestones,
} from '../_shared/pathGraph.js'

const DEFAULT_MATCH_COUNT = 8
const MILESTONE_SIZE = 3

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const message = String(body?.message ?? '').trim()
    const matchCount = Number(body?.matchCount) || DEFAULT_MATCH_COUNT

    const authed = createAuthedClient(req)
    const admin = createAuthedClient(req, { serviceRole: true })

    const { data: profile, error: profileError } = await authed
      .from('learner_profiles')
      .select('*')
      .maybeSingle()
    if (profileError) throw profileError
    if (!profile && !message) {
      return json({ error: 'No saved profile and no goal text provided' }, 400)
    }

    // Retrieval input: goal text (+ intake message when provided).
    const queryText = [message, profile?.goals].filter(Boolean).join('. ')
    const queryEmbedding = await embed(queryText)
    if (!Array.isArray(queryEmbedding)) throw new Error('No embedding returned')

    const { data: matches, error: rpcError } = await authed.rpc('match_courses', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
    })
    if (rpcError) throw new Error(`Similarity search failed: ${rpcError.message}`)

    // Graph inputs: full catalog + prerequisite edges + learner's completed set.
    const [catalogResult, edgesResult] = await Promise.all([
      admin.from('courses').select('id, title, description, domain, difficulty, duration_hours, skills'),
      admin.from('prerequisites').select('course_id, prerequisite_course_id'),
    ])
    if (catalogResult.error) throw catalogResult.error
    if (edgesResult.error) throw edgesResult.error

    const orderedEntries = groupIntoMilestones(
      resolvePathOrder(
        catalogResult.data ?? [],
        (matches ?? []).map((m) => m.id),
        edgesResult.data ?? [],
        profile?.completed_courses ?? []
      ),
      MILESTONE_SIZE
    )

    const path = orderedEntries.map((entry, index) => ({
      course_id: entry.course.id,
      title: entry.course.title,
      description: entry.course.description,
      difficulty: entry.course.difficulty,
      duration_hours: entry.course.duration_hours,
      skills: entry.course.skills,
      source: entry.source,
      order_index: index + 1,
      milestone_group: entry.milestone_group,
    }))

    return json({ path, generated_at: new Date().toISOString() })
  } catch (err) {
    console.error('generate-path failed:', err)
    return json({ error: err?.message ?? 'Path generation failed' }, 500)
  }
})