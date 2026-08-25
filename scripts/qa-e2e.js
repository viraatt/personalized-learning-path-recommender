// qa-e2e.js — End-to-end QA of the deployed edge functions (Phase 12.1).
//
// Reuses ONE fixed QA account (created on first run) instead of creating a
// throwaway user per invocation — Supabase Auth rate-limits signups, and
// burning them here breaks manual sign-up testing from the UI.
//
// Usage: node scripts/qa-e2e.js

import 'dotenv/config'

const URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
if (!URL || !SERVICE_KEY || !ANON_KEY) {
  console.error('Missing VITE_SUPABASE_URL / keys in .env')
  process.exit(1)
}

const EMAIL = 'qa-runner@example.com'
const PASSWORD = 'qa-test-password-123'

async function fn(name, token, body) {
  const res = await fetch(`${URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: ANON_KEY,
    },
    body: JSON.stringify(body ?? {}),
  })
  const data = await res.json().catch(() => null)
  return { status: res.status, ok: res.ok, data }
}

function check(label, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? ' — ' + extra : ''}`)
  if (!cond) process.exitCode = 1
}

// --- 1. Ensure the fixed QA user exists (idempotent), then sign in --------
await fetch(`${URL}/auth/v1/admin/users`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD, email_confirm: true }),
})

const signInRes = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})
const signIn = await signInRes.json()
const token = signIn?.access_token
check('auth: QA user signed in', Boolean(token), signInRes.status === 400 ? 'wrong password? delete the qa-runner user in the dashboard to reset it' : '')

// --- 2. parse-profile ------------------------------------------------------
const parsed = await fn('parse-profile', token, {
  message:
    "Hi! I know Python and some pandas already. I want to become a machine learning engineer, focusing on deep learning and cloud deployment.",
})
const profile = parsed.data?.profile
check('parse-profile: 200', parsed.ok && parsed.status === 200, JSON.stringify(parsed.data).slice(0, 300))
check('parse-profile: goals text', typeof profile?.goals === 'string' && profile.goals.length > 0, JSON.stringify(profile?.goals))
check('parse-profile: level valid', ['beginner', 'intermediate', 'advanced'].includes(profile?.experience_level), profile?.experience_level)
check('parse-profile: completed courses mapped', Array.isArray(profile?.completed_courses) && profile.completed_courses.length > 0, JSON.stringify((profile?.completed_courses ?? []).map(c => c?.title ?? c)))

// --- 3. generate-path ------------------------------------------------------
const gen = await fn('generate-path', token, {})
const pathId = gen.data?.pathId
const steps = Array.isArray(gen.data?.path) ? gen.data.path : []
check('generate-path: 200', gen.ok, JSON.stringify(gen.data?.error ?? '').slice(0, 120))
check('generate-path: has steps', steps.length > 0, `${steps.length} steps; milestones=${[...new Set(steps.map(s => s.milestone_group))].join(',')}`)
check('generate-path: path id', Boolean(pathId), pathId)

// --- 4. explain-step -------------------------------------------------------
const explained = await fn('explain-step', token, { pathId })
const explanations = explained.data?.explanations ?? {}
const rationaleCount = Object.values(explanations).filter(Boolean).length
check('explain-step: 200', explained.ok, JSON.stringify(explained.data?.error ?? '').slice(0, 120))
check('explain-step: rationales produced', explained.ok && rationaleCount > 0, `${rationaleCount} rationales`)

// --- 5. tutor-chat ---------------------------------------------------------
const tutored = await fn('tutor-chat', token, { message: 'I finished the first course. What should I focus on next?' })
const reply = tutored.data?.reply ?? tutored.data?.data?.reply
check('tutor-chat: 200', tutored.ok, JSON.stringify(tutored.data?.error ?? '').slice(0, 120))
check('tutor-chat: non-empty reply', typeof reply === 'string' && reply.length > 0)

// --- 6. retrieve-courses ---------------------------------------------------
const retrieved = await fn('retrieve-courses', token, {})
check('retrieve-courses: 200', retrieved.ok, JSON.stringify(retrieved.data?.error ?? '').slice(0, 120))
check('retrieve-courses: matches returned', Array.isArray(retrieved.data?.matches) && retrieved.data.matches.length > 0, `${retrieved.data?.matches?.length} matches`)
check('retrieve-courses: skill gap object', retrieved.data?.skillGap != null)

console.log(`\nTest user: ${EMAIL}`)
console.log(process.exitCode ? '\nQA RESULT: FAILURES ABOVE' : '\nQA RESULT: ALL PASS')
