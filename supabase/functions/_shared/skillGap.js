// skillGap.js — pure skill-gap computation (Phase 6.2).
//
// Compares the skills implied by a learner's goal/retrieved courses against
// the skills they already have, producing an ordered gap list. Pure functions
// only — no DB or network access — so it is unit-testable in isolation.

/**
 * computeSkillGap(targetSkills, existingSkills)
 * @param {string[]} targetSkills  skills needed to reach the goal
 * @param {string[]} existingSkills skills the learner already has
 * @returns {{ gaps: string[], covered: string[], coverage: number }}
 *   gaps: target skills not covered yet (original order)
 *   covered: target skills already satisfied
 *   coverage: fraction of target skills covered, 0..1
 */
export function computeSkillGap(targetSkills = [], existingSkills = []) {
  const normalize = (s) => String(s).trim().toLowerCase()
  const existingSet = new Set(existingSkills.map(normalize).filter(Boolean))

  const seen = new Set()
  const targets = []
  for (const skill of targetSkills) {
    const key = normalize(skill)
    if (!key || seen.has(key)) continue
    seen.add(key)
    targets.push({ key, original: String(skill).trim() })
  }

  const gaps = []
  const covered = []
  for (const t of targets) {
    if (existingSet.has(t.key)) covered.push(t.original)
    else gaps.push(t.original)
  }

  return {
    gaps,
    covered,
    coverage: targets.length === 0 ? 0 : covered.length / targets.length,
  }
}

/**
 * Union of the `skills` arrays across a list of course rows.
 */
export function collectCourseSkills(courses = []) {
  const out = []
  const seen = new Set()
  for (const course of courses) {
    for (const skill of course?.skills ?? []) {
      const key = String(skill).trim().toLowerCase()
      if (!key || seen.has(key)) continue
      seen.add(key)
      out.push(String(skill).trim())
    }
  }
  return out
}