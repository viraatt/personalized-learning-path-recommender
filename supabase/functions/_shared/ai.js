// aiProvider.js — resilient AI client wrapper with Grok fallback.
//
// Single place that talks to AI providers. Every edge function imports THIS
// module and never calls providers directly.
//
// Features:
//   - Primary: Gemini 2.5/Flash & gemini-embedding-001 (768-dim)
//   - Secondary: GEMINI_API_KEY_2 fallback for embedding quota resilience
//   - Chat Fallback: Grok (xAI API) on Gemini 429, quota exhaustion, or service failure
//   - JSON schema enforcement across both providers
//
// Exposed:
//   chat({ model?, messages, responseSchema?, maxTokens?, temperature? })
//   embed(text) -> number[] (768-dim)
//   parseJson(text)

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const GROK_API_BASE = 'https://api.x.ai/v1'
const DEFAULT_GEMINI_MODEL = 'gemini-3.7-flash'
const DEFAULT_GROK_MODEL = 'grok-2-1212'
const EMBED_MODEL = 'gemini-embedding-001'
const EMBED_DIMS = 768
const MAX_ATTEMPTS = 3

function getGeminiKey() {
  return Deno.env.get('GEMINI_API_KEY') || ''
}

function getGeminiBackupKey() {
  return Deno.env.get('GEMINI_API_KEY_2') || ''
}

function getGrokKey() {
  return Deno.env.get('GROK_API_KEY') || ''
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------------------------------------------------------------------------
// Grok Chat Provider (xAI OpenAI-compatible API)
// ---------------------------------------------------------------------------

async function chatWithGrok({
  messages,
  responseSchema,
  maxOutputTokens = 4000,
  temperature = 0.2,
  model = DEFAULT_GROK_MODEL,
}) {
  const apiKey = getGrokKey()
  if (!apiKey) {
    throw new Error('Grok fallback requested but GROK_API_KEY is not configured')
  }

  const grokMessages = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  if (responseSchema) {
    grokMessages.unshift({
      role: 'system',
      content: `You must respond with ONLY valid JSON matching this schema: ${JSON.stringify(responseSchema)}. Do not include any text before or after the JSON block.`,
    })
  }

  const payload = {
    model,
    messages: grokMessages,
    temperature,
    max_tokens: maxOutputTokens,
  }

  if (responseSchema) {
    payload.response_format = { type: 'json_object' }
  }

  const response = await fetch(`${GROK_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(25000),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(`Grok error ${response.status}: ${data?.error?.message ?? JSON.stringify(data)}`)
  }

  const text = data?.choices?.[0]?.message?.content ?? ''
  if (!text) throw new Error('Grok returned an empty response')

  if (responseSchema) return parseJson(text)
  return text
}

// ---------------------------------------------------------------------------
// Gemini Chat Provider with Automatic Failover
// ---------------------------------------------------------------------------

export async function chat({
  messages,
  responseSchema,
  maxOutputTokens = 8000,
  temperature = 0.2,
  model = DEFAULT_GEMINI_MODEL,
} = {}) {
  const primaryKey = getGeminiKey()
  const backupKey = getGeminiBackupKey()
  const hasGrok = Boolean(getGrokKey())

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const generationConfig = { temperature, maxOutputTokens }
  if (responseSchema) {
    generationConfig.responseMimeType = 'application/json'
    generationConfig.responseSchema = responseSchema
  }

  const tryGemini = async (key, modelName) => {
    if (!key) throw new Error('No Gemini key provided')
    const url = `${GEMINI_API_BASE}/models/${modelName}:generateContent?key=${key}`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig }),
      signal: AbortSignal.timeout(20000),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const err = new Error(errorData?.error?.message ?? `Status ${response.status}`)
      err.status = response.status
      err.code = errorData?.error?.status
      throw err
    }

    const data = await response.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
    if (!text) throw new Error('Gemini returned an empty response')
    if (responseSchema) return parseJson(text)
    return text
  }

  // 1. Try Gemini with active keys and fast fallback models
  const modelsToTry = [DEFAULT_GEMINI_MODEL, 'gemini-3.6-flash', 'gemini-3.1-flash-lite', 'gemini-3.5-flash-lite']
  let lastError

  for (const k of [backupKey, primaryKey].filter(Boolean)) {
    for (const m of modelsToTry) {
      try {
        return await tryGemini(k, m)
      } catch (err) {
        lastError = err
        console.warn(`[aiProvider] Gemini ${m} returned ${err.status ?? err.code} (${err.message}). Trying next fallback model...`)
      }
    }
  }

  // 2. Try Grok fallback if configured
  if (hasGrok) {
    console.warn('[aiProvider] Gemini keys unavailable or exhausted. Trying Grok fallback...')
    try {
      return await chatWithGrok({ messages, responseSchema, maxOutputTokens, temperature })
    } catch (grokErr) {
      console.error('[aiProvider] Grok fallback also failed:', grokErr.message)
    }
  }

  throw lastError ?? new Error('Chat failed on all configured AI providers')
}

// ---------------------------------------------------------------------------
// Embeddings with Dual-Key Fallback
// ---------------------------------------------------------------------------

/**
 * Embed a single text string into a 768-dim vector via Gemini.
 * Uses GEMINI_API_KEY first; switches to GEMINI_API_KEY_2 if quota is exceeded.
 */
export async function embed(text) {
  const tryEmbed = async (key) => {
    if (!key) throw new Error('No API key provided for embedding')
    const url = `${GEMINI_API_BASE}/models/${EMBED_MODEL}:embedContent?key=${key}`
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
      const err = new Error(`Embedding error: ${data?.error?.message ?? response.status}`)
      err.status = response.status
      err.code = data?.error?.status
      throw err
    }
    return data?.embedding?.values
  }

  const primary = getGeminiKey()
  const backup = getGeminiBackupKey()

  try {
    return await tryEmbed(primary)
  } catch (err) {
    if (backup && (err.status === 429 || err.status === 403 || err.code === 'RESOURCE_EXHAUSTED')) {
      console.warn('[aiProvider] Primary Gemini embedding key rate limited/exhausted. Using GEMINI_API_KEY_2...')
      return await tryEmbed(backup)
    }
    throw err
  }
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