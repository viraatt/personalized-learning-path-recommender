// grounding.js — build the factual context for explanation prompts (9.1/9.3).
//
// The rationale MUST be grounded in the learner's actual profile facts
// (SCOPE.md). This module turns DB rows into explicit fact strings so the
// prompt can say "use ONLY these facts". Pure functions, unit-testable.

/**
 * collectProfileFacts(profile, completedCourseTitles)
 * @returns {{ lines: string[], hasAny: boolean }}
 */
export function collectProfileFacts(profile, completedCourseTitles = []) {
  const lines = []
  const push = (label, value) => {
    const v = typeof value === 'string' ? value.trim() : value
    if (!v) return
    if (Array.isArray(v)) {
      if (v.length > 0) lines.push(`- ${label}: ${v.join(', ')}`)
      return
    }
    lines.push(`- ${label}: ${v}`)
  }

  push('Stated goal', profile?.goals)
  push('Target role', profile?.target_role)
  push('Experience level', profile?.experience_level)
  push('Interests', profile?.interests)
  push(
    'Already completed',
    Array.isArray(completedCourseTitles) ? completedCourseTitles : []
  )

  return { lines, hasAny: lines.length > 0 }
}

/**
 * collectStepFacts(step) — course-side facts for one path step.
 */
export function collectStepFacts(step) {
  const c = step?.courses ?? {}
  const lines = []
  const push = (label, value) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value) && value.length === 0) return
    lines.push(`- ${label}: ${Array.isArray(value) ? value.join(', ') : value}`)
  }
  push('Title', c.title)
  push('Domain', c.domain)
  push('Difficulty', c.difficulty)
  push('Duration', c.duration_hours != null ? `${c.duration_hours} hours` : null)
  push('Skills taught', c.skills)
  push('Position in path', step?.order_index)
  push('Milestone', step?.milestone_group)

  return { lines, title: c.title ?? 'this course' }
}