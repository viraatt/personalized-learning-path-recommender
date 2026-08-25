// embed-catalog.js
// Generates embeddings for every catalog course and stores them in the
// `courses.embedding` column (768-dim via Gemini text-embedding-004).
// Idempotent: safe to re-run. Plain JS, node.
//
// Usage: node scripts/embed-catalog.js
//
// Requires VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + GEMINI_API_KEY in .env.

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const geminiApiKey = process.env.GEMINI_API_KEY

if (!supabaseUrl || !serviceRoleKey || !geminiApiKey) {
  console.error(
    'Missing env vars. Set VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GEMINI_API_KEY in .env'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const EMBED_MODEL = 'gemini-embedding-001'
const EMBED_DIMS = 768
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

/**
 * Embed a single text via Gemini text-embedding-004. Returns a number[] vector.
 */
async function embedText(text) {
  const url = `${API_BASE}/models/${EMBED_MODEL}:embedContent?key=${geminiApiKey}`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: EMBED_MODEL,
      content: { parts: [{ text }] },
      outputDimensionality: EMBED_DIMS,
    }),
  })
  const data = await response.json()
  if (!response.ok) {
    throw new Error(`Embedding error: ${data?.error?.message ?? response.status}`)
  }
  return data?.embedding?.values
}

// Build a single text blob per course so the embedding captures its semantics.
function buildCourseText(course) {
  const parts = [
    course.title,
    course.domain,
    course.difficulty,
    course.description,
    (course.skills ?? []).join(', '),
  ]
  return parts.filter(Boolean).join('\n')
}

const { data: courses, error } = await supabase
  .from('courses')
  .select('id, title, description, domain, difficulty, skills')

if (error) {
  console.error('Failed to fetch courses:', error.message)
  process.exit(1)
}

if (!courses?.length) {
  console.log('No courses found. Run node scripts/seed-catalog.js first.')
  process.exit(0)
}

console.log(`Embedding ${courses.length} courses...`)
let done = 0

for (const course of courses) {
  try {
    const values = await embedText(buildCourseText(course))
    if (!Array.isArray(values)) throw new Error('No embedding returned')

    const { error: updateError } = await supabase
      .from('courses')
      .update({ embedding: values })
      .eq('id', course.id)
    if (updateError) throw updateError

    done += 1
    console.log(`  embedded: ${course.title}`)
  } catch (err) {
    console.error(`  failed: ${course.title} — ${err.message}`)
  }
}

console.log(`\nDone. Embedded ${done}/${courses.length} courses.`)