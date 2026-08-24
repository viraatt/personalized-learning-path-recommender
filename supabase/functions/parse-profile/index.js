// parse-profile — Chat -> structured learner profile (Phase 4.1).
//
// Calls Gemini (via the shared _shared/ai.js module) to parse the learner's
// natural-language intake into a structured profile JSON, then validates the
// shape at runtime (no TS, so LLM output must be checked defensively).
//
// The completed_courses field is returned as course/skill TITLES (strings);
// mapping titles to course UUIDs happens at persist time (Phase 4.2).

import { corsHeaders } from '../_shared/cors.js'
import { chat } from '../_shared/ai.js'

const LEVELS = ['beginner', 'intermediate', 'advanced']

const PROFILE_SCHEMA = {
  type: 'object',
  properties: {
    goals: { type: 'string' },
    experience_level: { type: 'string', enum: LEVELS },
    interests: { type: 'array', items: { type: 'string' } },
    completed_courses: { type: 'array', items: { type: 'string' } },
    target_role: { type: 'string' },
  },
  required: ['goals', 'experience_level', 'interests', 'completed_courses'],
}

const SYSTEM_PROMPT = `You extract a learner profile from free-text intake. Return ONLY a JSON object with these keys:
- goals: string — the learner's primary learning objective
- experience_level: one of "beginner", "intermediate", "advanced"
- interests: array of topic/skill strings the learner mentioned or implied
- completed_courses: array of course/skill names the learner said they already know
- target_role: string — the job role they want, or empty string if unknown
Do not invent facts. If something is not mentioned, use a sensible default (beginner, empty array).`

// Basic runtime shape validation since there is no compile-time typing.
function validateProfile(value) {
  if (!value || typeof value !== 'object') {
    throw new Error('Profile parse returned a non-object')
  }
  if (typeof value.goals !== 'string') throw new Error('Missing goals')
  if (!LEVELS.includes(value.experience_level)) {
    throw new Error(`Invalid experience_level: ${value.experience_level}`)
  }
  if (!Array.isArray(value.interests)) throw new Error('interests must be an array')
  if (!Array.isArray(value.completed_courses)) {
    throw new Error('completed_courses must be an array')
  }
  if (typeof value.target_role !== 'string') value.target_role = ''
  return value
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
    const message = String(body?.message ?? '').trim()
    if (!message) return json({ error: 'Message is required' }, 400)

    const parsed = await chat({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      responseSchema: PROFILE_SCHEMA,
      temperature: 0.2,
    })

    // chat() returns a parsed object (not a string) when responseSchema is set.
    const profile = validateProfile(parsed)

    return json({ profile: { ...profile, raw_intake_text: message } })
  } catch (err) {
    console.error('parse-profile failed:', err)
    return json({ error: err?.message ?? 'Profile parsing failed' }, 500)
  }
})