// tutor-chat — Q&A scoped to the learner's current path/profile (10.1).
//
// Grounded like explain-step: the tutor receives the learner's profile facts
// and the actual ordered path, and is instructed to answer ONLY from that
// context (plus generic learning advice). Body: { message, pathId? } —
// without pathId, the learner's latest path is used.

import { corsHeaders } from '../_shared/cors.js'
import { chat } from '../_shared/ai.js'
import { createAuthedClient } from '../_shared/supabase.js'
import { collectProfileFacts } from '../_shared/grounding.js'

const REPLY_SCHEMA = {
  type: 'object',
  properties: { reply: { type: 'string' } },
  required: ['reply'],
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

async function getLatestPath(authed) {
  const { data, error } = await authed
    .from('learning_paths')
    .select(
      `id,
       path_steps (
         order_index, milestone_group, status,
         courses ( title, difficulty, skills )
       )`
    )
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data
}

function buildPathLines(path) {
  if (!path?.path_steps?.length) return ['- (no generated path yet)']
  const steps = [...path.path_steps].sort((a, b) => a.order_index - b.order_index)
  return steps.map(
    (s) =>
      `- ${s.order_index}. ${s.courses?.title ?? 'Course'} (${s.courses?.difficulty ?? '?'},` +
      ` milestone ${s.milestone_group ?? '?'}, ${s.status ?? 'pending'})`
  )
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const message = String(body?.message ?? '').trim()
    if (!message) return json({ error: 'message is required' }, 400)

    const authed = createAuthedClient(req)
    const admin = createAuthedClient(req, { serviceRole: true })

    const [{ data: profile }, path] = await Promise.all([
      authed.from('learner_profiles').select('*').maybeSingle(),
      body?.pathId
        ? getLatestPath(authed) // pathId accepted for future per-path scoping
        : getLatestPath(authed),
    ])

    let completedTitles = []
    const completedIds = profile?.completed_courses ?? []
    if (completedIds.length > 0) {
      const { data: rows, error } = await admin
        .from('courses')
        .select('title')
        .in('id', completedIds)
      if (error) throw error
      completedTitles = (rows ?? []).map((r) => r.title)
    }

    const facts = collectProfileFacts(profile, completedTitles)
    const prompt = `Learner profile:
${facts.lines.length > 0 ? facts.lines.join('\n') : '- (no profile details available)'}

Current learning path (ordered):
${buildPathLines(path).join('\n')}

Learner question: "${message}"

Answer in at most 4 sentences. Use ONLY the facts above plus general learning
advice. If asked something not covered by the path or profile, say so honestly.`

    const result = await chat({
      messages: [
        {
          role: 'system',
          content:
            'You are a concise, grounded learning tutor. Never invent courses, skills, or history.',
        },
        { role: 'user', content: prompt },
      ],
      responseSchema: REPLY_SCHEMA,
      temperature: 0.6,
    })

    return json({ reply: String(result?.reply ?? '').trim() })
  } catch (err) {
    console.error('tutor-chat failed:', err)
    return json({ error: err?.message ?? 'Tutor failed' }, 500)
  }
})