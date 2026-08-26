// aiProvider.js — shared Gemini client wrapper for all edge functions.
//
// Single place that talks to the Gemini API. Every edge function that needs an
// LLM or embeddings imports THIS module and never calls the Gemini API/ SDK
// directly (see ARCHITECTURE.md). Plain JS, no TypeScript. Uses the REST API
// via fetch so there is no external SDK dependency and no Provider chain —
// this project is Gemini-only per SCOPE.md.
//
// Exposed:
//   chat({ model?, messages, responseSchema?, maxTokens?, temperature? })
//     -> { content }  (parsed object when responseSchema is provided)
//   embed({ text })   -> number[]  (768-dim, gemini-embedding-001)
//
// Includes basic retry/backoff for Gemini free-tier rate limits.

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const DEFAULT_MODEL = 'gemini-3.5-flash'
const EMBED_MODEL = 'gemini-embedding-001' // 768-dim output via outputDimensionality
const EMBED_DIMS = 768
const MAX_ATTEMPTS = 3

function apiKey() {
  return Deno.env.get('GEMINI_API_KEY') || ''
}

// Sleep helper for backoff.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// Chat / structured JSON generation
// ---------------------------------------------------------------------------

/**
 * Call Gemini chat/generate. If `responseSchema` is provided, requests a JSON
 * object conforming to that schema (responseMimeType=application/json).
 * Returns the raw text content (validated as JSON when schema is given).
 */
export async function chat({
  messages,
  responseSchema,
  maxOutputTokens = 8000,
  temperature = 0.2,
  model = DEFAULT_MODEL,
} = {}) {
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const generationConfig = { temperature, maxOutputTokens }
  if (responseSchema) {
    generationConfig.responseMimeType = 'application/json'
    generationConfig.responseSchema = responseSchema
  }

  const url = `${API_BASE}/models/${model}:generateContent?key=${apiKey()}`
  const body = { contents, generationConfig }

  let lastError
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(20000),
      })

      if (response.status === 429 || response.status >= 500) {
        lastError = new Error(`Gemini API returned status ${response.status}`)
        if (attempt < MAX_ATTEMPTS) {
          await sleep(Math.min(1000 * 2 ** (attempt - 1), 3000))
          continue
        }
        throw lastError
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(`Gemini error ${response.status}: ${data?.error?.message ?? 'unknown'}`)
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
      if (!text) throw new Error('Gemini returned an empty response')

      if (responseSchema) return parseJson(text)
      return text
    } catch (err) {
      lastError = err
      if (attempt < MAX_ATTEMPTS && (err.name === 'TimeoutError' || err.status === 429)) {
        await sleep(1500)
        continue
      }
      throw err
    }
  }
  throw lastError
}

// ---------------------------------------------------------------------------
// Embeddings
// ---------------------------------------------------------------------------

/**
 * Embed a single text string into a 768-dim vector via text-embedding-004.
 */
export async function embed(text) {
  const url = `${API_BASE}/models/${EMBED_MODEL}:embedContent?key=${apiKey()}`
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
    throw new Error(`Embedding error returned: ${data?.error?.message ?? 'unknown'}`)
  }
  return data?.embedding?.values
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse strict JSON from a model response, stripping any markdown fences in
 * case responseMimeType rounding leaves them. Throws on invalid shape.
 */
export function parseJson(text) {
  let cleaned = String(text).trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim()
  }
  return JSON.parse(cleaned)
}