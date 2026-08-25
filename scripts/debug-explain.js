// debug-explain.js — one-off probe of the explain-step function
import 'dotenv/config'

const URL = process.env.VITE_SUPABASE_URL
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY
const EMAIL = 'qa-runner@example.com'
const PASSWORD = 'qa-test-password-123'

const signInRes = await fetch(`${URL}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', apikey: ANON_KEY },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
})
const token = (await signInRes.json())?.access_token

// latest path id via PostgREST
const pathsRes = await fetch(`${URL}/rest/v1/learning_paths?select=id,generated_at&order=generated_at.desc&limit=1`, {
  headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
})
console.log('rest status:', pathsRes.status)
const paths = await pathsRes.json().catch(() => null)
console.log('paths raw:', JSON.stringify(paths)?.slice(0, 300))
const pathId = Array.isArray(paths) ? paths?.[0]?.id : undefined
console.log('pathId:', pathId)

const res = await fetch(`${URL}/functions/v1/explain-step`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, apikey: ANON_KEY },
  body: JSON.stringify({ pathId }),
})
console.log('status:', res.status)
console.log('content-type:', res.headers.get('content-type'))
const text = await res.text()
console.log('body:', text.slice(0, 600))
