// parse-profile (STUB — Phase 3.2)
//
// Wires the chat intake frontend to a Supabase edge function. This is a STUB:
// it returns a canned learner profile so the HOOK path (frontend -> function)
// is proven end-to-end. Real Gemini parsing of the intake text into structured
// profile JSON lands in Phase 4.1 via the shared _shared/aiProvider module.
//
// Deno runtime, plain JS (no TypeScript, per repo convention).

import { corsHeaders } from '../_shared/cors.js'

const STUB_PROFILE = {
  goals: 'Become a data analyst with Python and machine learning skills',
  experience_level: 'beginner',
  interests: ['data-science', 'python'],
  completed_courses: [],
  target_role: 'junior data analyst',
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
    return json({ profile: { ...STUB_PROFILE, raw_intake_text: body?.message ?? '' } })
  } catch (err) {
    return json({ error: err.message ?? 'Invalid request' }, 500)
  }
})