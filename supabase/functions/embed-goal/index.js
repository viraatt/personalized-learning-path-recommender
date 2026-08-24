// embed-goal — Embed the learner's goal text on demand (Phase 5.3).
//
// Returns the embedding vector for a given text string via text-embedding-004.
// Consumed downstream by the Phase 6 retrieval/similarity-search function.
// Uses the shared _shared/ai.js embed() so the model is defined in one place.

import { corsHeaders } from '../_shared/cors.js'
import { embed } from '../_shared/ai.js'

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json()
    const text = String(body?.text ?? '').trim()
    if (!text) return json({ error: 'text is required' }, 400)

    const values = await embed(text)
    if (!Array.isArray(values)) throw new Error('No embedding returned')

    return json({ embedding: values, dim: values.length })
  } catch (err) {
    console.error('embed-goal failed:', err)
    return json({ error: err?.message ?? 'Embedding failed' }, 500)
  }
})