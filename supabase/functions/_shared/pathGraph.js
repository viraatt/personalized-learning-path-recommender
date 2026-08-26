// pathGraph.js — prerequisite-DAG path sequencing (Phases 7.1–7.3).
//
// Pure functions only (no DB/network) so the logic is unit-testable:
//   topoSort             7.1 Kahn's algorithm, cycle-safe
//   resolvePathOrder     7.2 retrieval results -> valid ordered path
//   groupIntoMilestones  7.3 chunk the ordered path into milestones
//
// Edge shape matches the `prerequisites` table:
//   { course_id, prerequisite_course_id }  // course requires prerequisite first

/**
 * Build a lookup of courseId -> [prerequisite courseIds].
 */
export function buildPrereqLookup(edges = []) {
  const lookup = new Map()
  for (const edge of edges ?? []) {
    if (!edge?.course_id || !edge?.prerequisite_course_id) continue
    const list = lookup.get(edge.course_id) ?? []
    list.push(edge.prerequisite_course_id)
    lookup.set(edge.course_id, list)
  }
  return lookup
}

/**
 * 7.1 — Topologically sort `nodeIds` under `prereqLookup`.
 * Only edges where BOTH endpoints are in nodeIds constrain the order;
 * prerequisites outside the set (e.g. already completed) are treated as met.
 * Deterministic: stable input order breaks ties. If a cycle exists (data bug),
 * remaining nodes are appended in input order rather than dropped.
 */
export function topoSort(nodeIds = [], prereqLookup = new Map()) {
  const nodes = [...nodeIds]
  const nodeSet = new Set(nodes)

  const indegree = new Map(nodes.map((id) => [id, 0]))
  const dependents = new Map(nodes.map((id) => [id, []]))

  for (const courseId of nodes) {
    for (const pre of prereqLookup.get(courseId) ?? []) {
      if (!nodeSet.has(pre)) continue
      indegree.set(courseId, indegree.get(courseId) + 1)
      dependents.get(pre)?.push(courseId)
    }
  }

  const queue = nodes.filter((id) => indegree.get(id) === 0)
  const ordered = []
  while (queue.length > 0) {
    const id = queue.shift()
    ordered.push(id)
    for (const dep of dependents.get(id) ?? []) {
      const next = indegree.get(dep) - 1
      indegree.set(dep, next)
      if (next === 0) queue.push(dep)
    }
  }

  if (ordered.length < nodes.length) {
    const stuck = new Set(nodes.filter((id) => !ordered.includes(id)))
    console.warn?.(
      `pathGraph: prerequisite cycle among ${stuck.size} courses; appending in catalog order`
    )
    for (const id of nodes) if (stuck.has(id)) ordered.push(id)
  }

  return ordered
}

/**
 * 7.2 — Merge retrieval results into the prerequisite DAG.
 *
 * - Drops matched courses the learner already completed.
 * - Transitively pulls in any unmet prerequisites that exist in the catalog,
 *   so the returned path never references skills it doesn't teach.
 * - Returns courses in a prerequisite-valid order, each tagged with whether it
 *   came from retrieval or was added as a supporting prerequisite.
 *
 * @param {Array} courses       full catalog rows ({id, ...})
 * @param {Array} matchedIds    course ids chosen by retrieval, best first
 * @param {Array} edges         prerequisite rows for the whole catalog
 * @param {string[]} completedIds course ids the learner has finished
 */
export function resolvePathOrder(
  courses = [],
  matchedIds = [],
  edges = [],
  completedIds = []
) {
  const byId = new Map(courses.map((c) => [c.id, c]))
  const completedSet = new Set(completedIds)
  const prereqLookup = buildPrereqLookup(edges)

  const pathIds = new Set()
  const addedPrereqs = new Set()

  // Seed with uncompleted retrieval matches (keep retrieval rank).
  const seeds = matchedIds.filter((id) => byId.has(id) && !completedSet.has(id))
  for (const id of seeds) pathIds.add(id)

  // Transitive unmet prerequisites.
  const queue = [...seeds]
  while (queue.length > 0) {
    const id = queue.shift()
    for (const pre of prereqLookup.get(id) ?? []) {
      if (completedSet.has(pre) || pathIds.has(pre) || !byId.has(pre)) continue
      pathIds.add(pre)
      addedPrereqs.add(pre)
      queue.push(pre)
    }
  }

  const orderedIds = topoSort([...pathIds], prereqLookup)
  return orderedIds.map((id) => ({
    course: byId.get(id),
    source: addedPrereqs.has(id) ? 'prerequisite' : 'matched',
  }))
}

/**
 * 7.3 — Chunk an ordered path into milestone groups.
 * If a project or assessment exists within a milestone, place it last in that
 * milestone's step list as a "cap".
 * Returns entries with `milestone_group` starting at 1.
 */
export function groupIntoMilestones(entries = [], groupSize = 3) {
  const size = Math.max(1, Math.floor(groupSize))
  const chunks = []

  for (let i = 0; i < entries.length; i += size) {
    const chunk = entries.slice(i, i + size)
    const capIndex = chunk.findIndex((entry) => {
      const type = entry?.course?.resource_type ?? entry?.resource_type
      return type === 'project' || type === 'assessment'
    })

    if (capIndex !== -1 && capIndex !== chunk.length - 1) {
      const [capItem] = chunk.splice(capIndex, 1)
      chunk.push(capItem)
    }

    chunks.push(chunk)
  }

  const result = []
  chunks.forEach((chunk, groupIdx) => {
    chunk.forEach((entry) => {
      result.push({
        ...entry,
        milestone_group: groupIdx + 1,
      })
    })
  })

  return result
}