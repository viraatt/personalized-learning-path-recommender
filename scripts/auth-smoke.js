// auth-smoke.js — verifies the email/password auth flow the frontend now uses.
// Reuses ONE fixed QA account (created idempotently) so we don't burn
// Supabase's signup rate limit.
import 'dotenv/config'

const URL = process.env.VITE_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

const EMAIL = 'qa-runner@example.com'
const PASSWORD = 'qa-test-password-123'

// 1. Create confirmed user (service role).
await fetch(`${URL}/auth/v1/admin/users`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD, email_confirm: true }),
})

// 2. Password grant (what signInWithPassword does under the hood).
const res = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})
const data = await res.json()

console.log(`signin status: ${res.status}`)
console.log(`got access_token: ${Boolean(data.access_token)}`)
console.log(`user id: ${data.user?.id ?? 'none'}`)

// 3. Use the JWT for an RLS-scoped read (should be 200 + empty array).
const rlsRes = await fetch(`${URL}/rest/v1/learner_profiles?select=*`, {
  headers: { apikey: ANON_KEY, Authorization: `Bearer ${data.access_token}` },
})
console.log(`RLS learner_profiles read as new user: HTTP ${rlsRes.status} ${await rlsRes.text()}`)
console.log(res.ok && data.access_token ? 'AUTH SMOKE: PASS' : 'AUTH SMOKE: FAIL')
