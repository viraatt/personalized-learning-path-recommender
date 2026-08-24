import { useEffect, useState } from 'react'
import { getPath } from '@/hooks/path/getPath'
import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/10 text-foreground',
  complete: 'bg-primary text-primary-foreground',
}

/**
 * PathTimeline — renders the learner's saved path as a vertical timeline
 * (8.2) grouped under milestone markers (8.3). Loads its own data.
 * Loading/error are derived states, so no setState happens synchronously
 * inside the effect.
 */
export default function PathTimeline() {
  const [path, setPath] = useState(null)
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

  const loading = !failed && path === null

  if (loading) {
    return (
      <section className="rounded-lg border bg-background p-4 text-left text-sm text-muted-foreground">
        Loading your learning path…
      </section>
    )
  }

  if (failed) {
    return (
      <section className="rounded-lg border bg-destructive/10 p-4 text-left text-sm text-destructive">
        Could not load your learning path.
      </section>
    )
  }

  if (!path || path.steps.length === 0) return null

  // Group steps by milestone for the marker headers.
  const milestones = []
  for (const step of path.steps) {
    const last = milestones[milestones.length - 1]
    if (last && last.group === step.milestone_group) last.steps.push(step)
    else milestones.push({ group: step.milestone_group ?? 1, steps: [step] })
  }

  return (
    <section
      aria-label="Your learning path"
      className="rounded-lg border bg-background p-4 text-left"
    >
      <h2 className="mb-4 text-lg font-semibold tracking-tight">
        Your learning path
      </h2>

      <ol className="flex flex-col gap-6">
        {milestones.map((milestone, mIndex) => (
          <li key={milestone.group}>
            {/* Milestone marker (8.3). */}
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {mIndex + 1}
              </span>
              <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                Milestone {mIndex + 1}
              </span>
            </div>

            <ol className="ml-3 flex flex-col gap-3 border-l pl-5">
              {milestone.steps.map((step) => (
                <li key={step.id} className="relative">
                  {/* Timeline node dot. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute -left-[27px] top-3 size-2.5 rounded-full',
                      step.status === 'complete' ? 'bg-primary' : 'bg-border'
                    )}
                  />
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-medium">
                        {step.order_index}. {step.courses?.title ?? 'Course'}
                      </h3>
                      <span
                        className={cn(
                          'shrink-0 rounded-full px-2 py-0.5 text-xs',
                          STATUS_STYLES[step.status] ?? STATUS_STYLES.pending
                        )}
                      >
                        {step.status?.replace('_', ' ') ?? 'pending'}
                      </span>
                    </div>
                    {step.courses?.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {step.courses.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {step.courses?.difficulty && (
                        <span className="capitalize">{step.courses.difficulty}</span>
                      )}
                      {step.courses?.duration_hours != null && (
                        <span>{step.courses.duration_hours}h</span>
                      )}
                      {(step.courses?.skills ?? []).slice(0, 4).map((skill) => (
                        <span key={skill} className="rounded bg-background px-1.5 py-0.5">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  )
}