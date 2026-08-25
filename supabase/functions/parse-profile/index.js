// parse-profile — Chat -> structured learner profile (Phase 4.1) + persist (4.2).
//
// 1. Calls Gemini (via _shared/ai.js) to parse the intake into structured JSON.
// 2. Maps completed_course TITLES to course UUIDs (catalog lookup).
// 3. Upserts into learner_profiles scoped to the caller's auth.uid() (RLS).

import { corsHeaders } from '../_shared/cors.js'
import { chat } from '../_shared/ai.js'
import { createAuthedClient } from '../_shared/supabase.js'

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

/**
 * Map completed-course TITLES to course UUIDs via the seeded catalog.
 * Uses the service-role client (catalog is public, non-RLS data); unknown
 * titles are dropped rather than failing the whole profile write.
 */
async function mapCourseTitlesToIds(supabase, titles) {
  if (!Array.isArray(titles) || titles.length === 0) return []
  const { data: courses, error } = await supabase
    .from('courses')
    .select('id, title')
    .in('title', [...new Set(titles)])
  if (error) throw new Error(`Failed to resolve course ids: ${error.message}`)
  return (courses ?? []).map((c) => c.id)
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

    // Parse profile from the intake text.
    const parsed = await chat({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: message },
      ],
      responseSchema: PROFILE_SCHEMA,
      temperature: 0.2,
    })
    const profile = validateProfile(parsed)

    // Clients: authed (user-owned writes, RLS) + service-role (catalog lookup).
    const authed = createAuthedClient(req)
    const admin = createAuthedClient(req, { serviceRole: true })

    // Require a signed-in caller up front — RLS needs auth.uid() and the row
    // below stores user_id explicitly.
    const {
      data: { user },
    } = await authed.auth.getUser()
    if (!user) return json({ error: 'Not authenticated' }, 401)

    // Map completed-course titles -> ids.
    const completedCourseIds = await mapCourseTitlesToIds(
      admin,
      profile.completed_courses
    )

    // Upsert the user's profile (one row per user).
    const existing = await authed
      .from('learner_profiles')
      .select('id')
      .maybeSingle()

    if (existing.error) throw existing.error

    const row = {
      user_id: user.id,
      raw_intake_text: message,
      goals: profile.goals,
      experience_level: profile.experience_level,
      interests: profile.interests,
      completed_courses: completedCourseIds,
      target_role: profile.target_role,
      updated_at: new Date().toISOString(),
    }

    const result = existing.data?.id
      ? await authed.from('learner_profiles').update(row).eq('id', existing.data.id).select()
      : await authed.from('learner_profiles').insert(row).select()

    if (result.error) throw result.error

    const saved = Array.isArray(result.data) ? result.data[0] : result.data
    return json({ profile: { ...profile, id: saved?.id, raw_intake_text: message } })
  } catch (err) {
    console.error('parse-profile failed:', err)
    return json({ error: err?.message ?? 'Profile parsing failed' }, 500)
  }
})