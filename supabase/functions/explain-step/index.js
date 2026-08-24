// explain-step — grounded "why recommended" rationale per path step (9.1).
//
// Body: { pathId, stepId? }
//   - with stepId: explains that single step
//   - without: explains every step of the path that has no rationale yet
//
// Grounding rule (SCOPE.md): the rationale must reference the learner's real
// profile facts. Facts are collected via _shared/grounding.js and the prompt
// is instructed to use ONLY those facts. Output persists to
// path_steps.rationale_text through the caller's RLS-scoped session.

import { corsHeaders } from '../_shared/cors.js'
import { chat } from '../_shared/ai.js'
import { createAuthedClient } from '../_shared/supabase.js'
import {
  collectProfileFacts,
  collectStepFacts,
} from '../_shared/grounding.js'

const RATIONALE_SCHEMA = {
  type: 'object',
  properties: { rationale: { type: 'string' } },
  required: ['rationale'],
}

function buildPrompt(profileFacts, stepFacts) {
  return `Learner profile facts:
${profileFacts.length > 0 ? profileFacts.join('\n') : '- (no profile details available)'}

Recommended course facts:
${stepFacts.join('\n')}

In 2-3 sentences, explain why this course is recommended for this learner.
Reference ONLY the facts above — never invent skills, goals, or history the
learner did not state. If profile facts are missing, speak generically about
how the course's difficulty and position fit a structured learning order.`
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const pathId = String(body?.pathId ?? '').trim()
    const stepId = body?.stepId ? String(body.stepId).trim() : null
    if (!pathId) return json({ error: 'pathId is required' }, 400)

    const authed = createAuthedClient(req)
    const admin = createAuthedClient(req, { serviceRole: true })

    // Learner facts.
    const { data: profile } = await authed
      .from('learner_profiles')
      .select('*')
      .maybeSingle()

    let completedTitles = []
    const completedIds = profile?.completed_courses ?? []
    if (completedIds.length > 0) {
      const { data: completedCourses, error } = await admin
        .from('courses')
        .select('title')
        .in('id', completedIds)
      if (error) throw error
      completedTitles = (completedCourses ?? []).map((c) => c.title)
    }
    const profileFacts = collectProfileFacts(profile, completedTitles)

    // Target steps: one, or all lacking rationale.
    let query = authed
      .from('path_steps')
      .select(
        `id, order_index, milestone_group,
         courses ( title, domain, difficulty, duration_hours, skills )`
      )
      .eq('path_id', pathId)
    if (stepId) query = query.eq('id', stepId)
    else query = query.is('rationale_text', null)

    const { data: steps, error: stepsError } = await query
    if (stepsError) throw stepsError
    if (!steps?.length) return json({ explanations: {} })

    // Generate + persist rationales sequentially (free-tier friendly).
    const explanations = {}
    for (const step of steps) {
      const { lines } = collectStepFacts(step)
      const result = await chat({
        messages: [
          {
            role: 'system',
            content:
              'You write concise, grounded learning recommendations. Use ONLY provided facts.',
          },
          { role: 'user', content: buildPrompt(profileFacts.lines, lines) },
        ],
        responseSchema: RATIONALE_SCHEMA,
        temperature: 0.4,
      })

      const rationale = String(result?.rationale ?? '').trim()
      if (!rationale) throw new Error('Empty rationale returned')

      const { error: updateError } = await authed
        .from('path_steps')
        .update({ rationale_text: rationale })
        .eq('id', step.id)
      if (updateError) throw updateError

      explanations[step.id] = rationale
    }

    return json({ explanations })
  } catch (err) {
    console.error('explain-step failed:', err)
    return json({ error: err?.message ?? 'Explanation failed' }, 500)
  }
})