import { useEffect, useState } from 'react'
import { getPath } from '@/hooks/path/getPath'

/**
 * NextAction — surfaces the single next recommended action (11.2): the first
 * incomplete step of the latest path, or a nudge to create one.
 */
export default function NextAction() {
  // undefined = still loading; null = loaded, no saved path.
  const [path, setPath] = useState(undefined)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    getPath()
      .then((data) => {
        if (!cancelled) setPath(data)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const loading = !failed && path === undefined

  const nextStep = path?.steps?.find((s) => s.status !== 'complete')

  let body
  if (loading) {
    body = <p className="text-sm text-muted-foreground">Checking your path…</p>
  } else if (failed) {
    body = (
      <p role="alert" className="text-sm text-destructive">
        Could not determine your next action.
      </p>
    )
  } else if (!path || path.steps.length === 0) {
    body = (
      <p className="text-sm text-muted-foreground">
        No learning path yet — describe your goal above to get one.
      </p>
    )
  } else if (!nextStep) {
    body = <p className="text-sm font-medium">🎉 Path complete — time for a new goal!</p>
  } else {
    body = (
      <>
        <p className="text-sm font-medium">
          {nextStep.order_index}. {nextStep.courses?.title ?? 'Course'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Milestone {nextStep.milestone_group ?? 1} ·{' '}
          {nextStep.courses?.difficulty ? `${nextStep.courses.difficulty} · ` : ''}
          {nextStep.courses?.duration_hours != null
            ? `${nextStep.courses.duration_hours}h`
            : 'self-paced'}
        </p>
      </>
    )
  }

  return (
    <section aria-label="Next recommended action" className="rounded-lg border bg-background p-4 text-left">
      <h2 className="text-lg font-semibold tracking-tight">Next recommended action</h2>
      <div className="mt-3">{body}</div>
    </section>
  )
}