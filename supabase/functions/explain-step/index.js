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

const SINGLE_SCHEMA = {
  type: 'object',
  properties: { rationale: { type: 'string' } },
  required: ['rationale'],
}

const BATCH_SCHEMA = {
  type: 'object',
  properties: {
    explanations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step_id: { type: 'string' },
          rationale: { type: 'string' },
        },
        required: ['step_id', 'rationale'],
      },
    },
  },
  required: ['explanations'],
}

function buildSinglePrompt(profileFacts, stepFacts) {
  return `Learner profile facts:
${profileFacts.length > 0 ? profileFacts.join('\n') : '- (no profile details available)'}

Recommended course facts:
${stepFacts.join('\n')}

In 2-3 sentences, explain why this course is recommended for this learner.
Reference ONLY the facts above — never invent skills, goals, or history the
learner did not state. If profile facts are missing, speak generically about
how the course's difficulty and position fit a structured learning order.`
}

function buildBatchPrompt(profileFacts, steps) {
  const stepsText = steps
    .map((s) => {
      const { lines } = collectStepFacts(s)
      return `[Step ID: ${s.id}]\n${lines.join('\n')}`
    })
    .join('\n\n')

  return `Learner profile facts:
${profileFacts.length > 0 ? profileFacts.join('\n') : '- (no profile details available)'}

Recommended course steps:
${stepsText}

For each course step listed above, write a concise 2-3 sentence explanation of why this course is recommended for this learner.
Reference ONLY the facts above — never invent skills, goals, or history the learner did not state. If profile facts are missing, speak generically about how the course's difficulty and position fit a structured learning order.
Return a JSON object with an 'explanations' array containing the step_id and rationale for each step.`
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

    const explanations = {}

    if (stepId || steps.length === 1) {
      // Single step mode
      const step = steps[0]
      const { lines } = collectStepFacts(step)
      const result = await chat({
        messages: [
          {
            role: 'system',
            content:
              'You write concise, grounded learning recommendations. Use ONLY provided facts.',
          },
          { role: 'user', content: buildSinglePrompt(profileFacts.lines, lines) },
        ],
        responseSchema: SINGLE_SCHEMA,
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
    } else {
      // Batch mode: one LLM call for all steps
      const result = await chat({
        messages: [
          {
            role: 'system',
            content:
              'You write concise, grounded learning recommendations. Use ONLY provided facts.',
          },
          { role: 'user', content: buildBatchPrompt(profileFacts.lines, steps) },
        ],
        responseSchema: BATCH_SCHEMA,
        temperature: 0.4,
      })

      const returnedList = Array.isArray(result?.explanations) ? result.explanations : []
      const returnedMap = new Map()
      for (const item of returnedList) {
        if (item?.step_id && item?.rationale) {
          returnedMap.set(String(item.step_id).trim(), String(item.rationale).trim())
        }
      }

      // Update and map each step
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i]
        let rationale = returnedMap.get(step.id)
        if (!rationale && returnedList[i]?.rationale) {
          rationale = String(returnedList[i].rationale).trim()
        }
        if (!rationale) {
          rationale = `This course is positioned at step ${step.order_index} in milestone ${step.milestone_group} to build essential skills in a structured learning sequence.`
        }

        const { error: updateError } = await authed
          .from('path_steps')
          .update({ rationale_text: rationale })
          .eq('id', step.id)
        if (updateError) throw updateError

        explanations[step.id] = rationale
      }
    }

    return json({ explanations })
  } catch (err) {
    console.error('explain-step failed:', err)
    return json({ error: err?.message ?? 'Explanation failed' }, 500)
  }
})