// generate-path — learner profile/goal in -> persisted, ordered path.
//
// 1. Builds rich query from profile (goals, target_role, interests, experience) + message.
// 2. Performs vector similarity search over the 100-course catalog.
// 3. Applies similarity threshold and domain prioritization.
// 4. If similarity is low (< 0.42), invokes LLM synthesis fallback (Gemini/Grok)
//    to pick the most relevant catalog courses for the goal.
// 5. Passes seeds into prerequisite DAG (_shared/pathGraph.js) to guarantee prerequisite
//    correctness and milestone grouping.
// 6. Persists path + steps to Supabase.

import { corsHeaders } from '../_shared/cors.js'
import { embed, chat } from '../_shared/ai.js'
import { createAuthedClient } from '../_shared/supabase.js'
import {
  resolvePathOrder,
  groupIntoMilestones,
} from '../_shared/pathGraph.js'

const DEFAULT_MATCH_COUNT = 15
const MILESTONE_SIZE = 3
const SIMILARITY_THRESHOLD = 0.30

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

// Keyword-to-domain mapping for fast domain prioritization
const ROLE_DOMAIN_MAP = {
  game: ['game-dev', 'system-programming'],
  gaming: ['game-dev', 'system-programming'],
  unity: ['game-dev'],
  unreal: ['game-dev'],
  graphics: ['game-dev', 'system-programming'],
  shader: ['game-dev'],
  'data scientist': ['data-science', 'ai-engineering'],
  'machine learning': ['data-science', 'ai-engineering'],
  ai: ['ai-engineering', 'data-science'],
  nlp: ['data-science', 'ai-engineering'],
  'web developer': ['web-dev', 'databases'],
  frontend: ['web-dev', 'design'],
  backend: ['web-dev', 'databases', 'cloud'],
  fullstack: ['web-dev', 'databases', 'cloud'],
  'full-stack': ['web-dev', 'databases', 'cloud'],
  cloud: ['cloud', 'devops'],
  aws: ['cloud', 'devops'],
  devops: ['devops', 'cloud', 'system-programming'],
  sre: ['devops', 'cloud'],
  ios: ['mobile-dev'],
  android: ['mobile-dev'],
  mobile: ['mobile-dev'],
  flutter: ['mobile-dev'],
  security: ['cybersecurity', 'system-programming'],
  cyber: ['cybersecurity'],
  pentest: ['cybersecurity'],
  hacker: ['cybersecurity'],
  systems: ['system-programming', 'devops'],
  embedded: ['system-programming'],
  database: ['databases', 'backend-apis'],
  sql: ['databases'],
  blockchain: ['blockchain', 'web-dev'],
  crypto: ['blockchain', 'cybersecurity'],
  solidity: ['blockchain'],
  designer: ['design', 'web-dev'],
  ui: ['design', 'web-dev'],
  ux: ['design'],
}

function inferDomains(text = '') {
  const lower = text.toLowerCase()
  const found = new Set()
  for (const [kw, domains] of Object.entries(ROLE_DOMAIN_MAP)) {
    if (lower.includes(kw)) {
      for (const d of domains) found.add(d)
    }
  }
  return [...found]
}

const SYNTHESIS_SCHEMA = {
  type: 'object',
  properties: {
    selected_course_titles: {
      type: 'array',
      items: { type: 'string' },
      description: 'Ordered list of 6-10 exact course titles from the provided catalog that best build towards the user goal.',
    },
    rationale: {
      type: 'string',
      description: 'Brief 1-2 sentence explanation of the roadmap selection.',
    },
  },
  required: ['selected_course_titles'],
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const body = await req.json().catch(() => ({}))
    const message = String(body?.message ?? '').trim()
    const matchCount = Number(body?.matchCount) || DEFAULT_MATCH_COUNT

    const authed = createAuthedClient(req)
    const admin = createAuthedClient(req, { serviceRole: true })

    const { data: profile, error: profileError } = await authed
      .from('learner_profiles')
      .select('*')
      .maybeSingle()
    if (profileError) throw profileError
    if (!profile && !message) {
      return json({ error: 'No saved profile and no goal text provided' }, 400)
    }

    // Rich semantic query incorporating goals, target role, and interests
    const queryParts = [
      message,
      profile?.target_role ? `Target Role: ${profile.target_role}` : null,
      profile?.goals ? `Goal: ${profile.goals}` : null,
      profile?.interests?.length ? `Interests: ${profile.interests.join(', ')}` : null,
      profile?.experience_level ? `Experience Level: ${profile.experience_level}` : null,
    ].filter(Boolean)

    const queryText = queryParts.join('. ')
    const queryEmbedding = await embed(queryText)
    if (!Array.isArray(queryEmbedding)) throw new Error('No embedding returned')

    // Fetch candidate matches from vector similarity
    const { data: rawMatches, error: rpcError } = await authed.rpc('match_courses', {
      query_embedding: queryEmbedding,
      match_count: matchCount,
    })
    if (rpcError) throw new Error(`Similarity search failed: ${rpcError.message}`)

    // Fetch full catalog & edges for graph resolution
    const [catalogResult, edgesResult] = await Promise.all([
      admin.from('courses').select('id, title, description, domain, difficulty, duration_hours, skills, resource_type, deliverable, pass_criteria'),
      admin.from('prerequisites').select('course_id, prerequisite_course_id'),
    ])
    if (catalogResult.error) throw catalogResult.error
    if (edgesResult.error) throw edgesResult.error

    const catalog = catalogResult.data ?? []
    const edges = edgesResult.data ?? []
    const completedCourses = profile?.completed_courses ?? []

    const relevantDomains = inferDomains(queryText)
    const maxSimilarity = rawMatches?.[0]?.similarity ?? 0

    let seedCourseIds = []

    // If similarity search yielded strong results, filter and prioritize them
    if (maxSimilarity >= 0.42 && rawMatches?.length > 0) {
      // Prioritize courses matching inferred domains or high similarity
      const filtered = rawMatches.filter((m) => {
        const isDomainMatch = relevantDomains.length > 0 && relevantDomains.includes(m.domain)
        return isDomainMatch || m.similarity >= SIMILARITY_THRESHOLD
      })

      // Sort domain matches first, then by similarity
      filtered.sort((a, b) => {
        const aDomain = relevantDomains.includes(a.domain) ? 1 : 0
        const bDomain = relevantDomains.includes(b.domain) ? 1 : 0
        if (aDomain !== bDomain) return bDomain - aDomain
        return b.similarity - aDomain
      })

      seedCourseIds = (filtered.length >= 3 ? filtered : rawMatches).slice(0, 10).map((m) => m.id)
    } else {
      // Fallback: AI synthesis using catalog selection
      console.log(`[generate-path] Max similarity ${maxSimilarity.toFixed(2)} is low; invoking AI course selection synthesis...`)
      
      const catalogSummary = catalog.map((c) => `- "${c.title}" (${c.domain}, ${c.difficulty}, ${c.resource_type ?? 'course'}): ${c.description}`).join('\n')
      const synthesisPrompt = `The learner wants to achieve:
Stated Goal / Message: "${message || profile?.goals}"
Target Role: "${profile?.target_role || 'Not specified'}"
Experience Level: "${profile?.experience_level || 'beginner'}"
Interests: "${(profile?.interests || []).join(', ')}"

Here is our course catalog:
${catalogSummary}

Select the 6 to 10 course titles that best create a step-by-step learning journey for this learner.
Use EXACT titles from the catalog only. Do not invent course titles.`

      try {
        const synthesisResult = await chat({
          messages: [
            {
              role: 'system',
              content: 'You are an expert curriculum advisor. Pick the best courses from the catalog for the user.',
            },
            { role: 'user', content: synthesisPrompt },
          ],
          responseSchema: SYNTHESIS_SCHEMA,
          temperature: 0.2,
        })

        const selectedTitles = synthesisResult?.selected_course_titles ?? []
        const titleToId = new Map(catalog.map((c) => [c.title.toLowerCase().trim(), c.id]))

        for (const title of selectedTitles) {
          const matchId = titleToId.get(String(title).toLowerCase().trim())
          if (matchId && !seedCourseIds.includes(matchId)) {
            seedCourseIds.push(matchId)
          }
        }
      } catch (synthErr) {
        console.error('[generate-path] AI synthesis failed, falling back to top vector matches:', synthErr)
        seedCourseIds = (rawMatches ?? []).slice(0, 8).map((m) => m.id)
      }

      // If still empty, use top vector matches
      if (seedCourseIds.length === 0) {
        seedCourseIds = (rawMatches ?? []).slice(0, 8).map((m) => m.id)
      }
    }

    // Graph resolution: Topological sort + prerequisite inclusion + milestone grouping
    const orderedEntries = groupIntoMilestones(
      resolvePathOrder(
        catalog,
        seedCourseIds,
        edges,
        completedCourses
      ),
      MILESTONE_SIZE
    )

    const path = orderedEntries.map((entry, index) => ({
      course_id: entry.course.id,
      title: entry.course.title,
      description: entry.course.description,
      difficulty: entry.course.difficulty,
      duration_hours: entry.course.duration_hours,
      skills: entry.course.skills,
      resource_type: entry.course.resource_type ?? 'course',
      deliverable: entry.course.deliverable ?? null,
      pass_criteria: entry.course.pass_criteria ?? null,
      source: entry.source,
      order_index: index + 1,
      milestone_group: entry.milestone_group,
    }))

    // Persist learning_paths row + pending steps
    const {
      data: { user },
    } = await authed.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data: pathRow, error: pathInsertError } = await authed
      .from('learning_paths')
      .insert({ user_id: user.id })
      .select('id')
      .single()
    if (pathInsertError) throw pathInsertError

    const { error: stepsError } = await authed.from('path_steps').insert(
      path.map((step) => ({
        path_id: pathRow.id,
        course_id: step.course_id,
        order_index: step.order_index,
        milestone_group: step.milestone_group,
        status: 'pending',
      }))
    )
    if (stepsError) throw stepsError

    return json({
      pathId: pathRow.id,
      path,
      generated_at: new Date().toISOString(),
    })
  } catch (err) {
    console.error('generate-path failed:', err)
    return json({ error: err?.message ?? 'Path generation failed' }, 500)
  }
})