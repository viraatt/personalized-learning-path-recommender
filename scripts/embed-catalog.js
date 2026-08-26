// embed-catalog.js
// Generates embeddings for every catalog course and stores them in the
// `courses.embedding` column (768-dim via Gemini embedding).
// Idempotent: safe to re-run. Plain JS, node.
//
// Usage: node scripts/embed-catalog.js [--force]
//
// Requires VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + GEMINI_API_KEY in .env.
// Optionally uses GEMINI_API_KEY_2 as fallback if primary key runs into quota limits.

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
let primaryKey = process.env.GEMINI_API_KEY
const fallbackKey = process.env.GEMINI_API_KEY_2

if (!supabaseUrl || !serviceRoleKey || !primaryKey) {
  console.error(
    'Missing env vars. Set VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and GEMINI_API_KEY in .env'
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey)

const EMBED_MODEL = 'gemini-embedding-001'
const EMBED_DIMS = 768
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const forceReembed = process.argv.includes('--force')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let currentKey = primaryKey
let switchedToFallback = false

/**
 * Embed a single text via Gemini embedding with key failover support.
 */
async function embedText(text) {
  const tryCall = async (key) => {
    const url = `${API_BASE}/models/${EMBED_MODEL}:embedContent?key=${key}`
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
      const err = new Error(data?.error?.message ?? `Status ${response.status}`)
      err.status = response.status
      err.code = data?.error?.status
      throw err
    }
    return data?.embedding?.values
  }

  try {
    return await tryCall(currentKey)
  } catch (err) {
    if (!switchedToFallback && fallbackKey && (err.status === 429 || err.status === 403 || err.code === 'RESOURCE_EXHAUSTED')) {
      console.warn(`\n[WARN] Primary Gemini API key rate-limited/exhausted (${err.message}). Switching to GEMINI_API_KEY_2...`)
      currentKey = fallbackKey
      switchedToFallback = true
      await sleep(1000)
      return await tryCall(currentKey)
    }
    throw err
  }
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

let query = supabase
  .from('courses')
  .select('id, title, description, domain, difficulty, skills, embedding')

if (!forceReembed) {
  query = query.is('embedding', null)
}

const { data: courses, error } = await query

if (error) {
  console.error('Failed to fetch courses:', error.message)
  process.exit(1)
}

if (!courses?.length) {
  console.log('All courses already have embeddings! Use --force to re-embed all.')
  process.exit(0)
}

console.log(`Embedding ${courses.length} courses (pacing 500ms per course)...`)
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
    console.log(`  [${done}/${courses.length}] embedded: ${course.title}`)
  } catch (err) {
    console.error(`  failed: ${course.title} — ${err.message}`)
  }
  await sleep(500)
}

console.log(`\nDone. Embedded ${done}/${courses.length} courses.`)