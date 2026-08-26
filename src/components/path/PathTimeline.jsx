import { useCallback, useEffect, useState } from 'react'
import { getPath } from '@/hooks/path/getPath'
import { deletePath } from '@/hooks/path/deletePath'
import { explainSteps } from '@/hooks/path/explainSteps'
import { updateStepProgress } from '@/hooks/progress/updateStepProgress'
import { regeneratePath } from '@/hooks/progress/regeneratePath'
import { cn } from '@/lib/utils'

const STATUS_STYLES = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-primary/10 text-primary border border-primary/20',
  complete: 'bg-primary text-primary-foreground',
}

/**
 * PathTimeline — timeline + milestone markers + explanation cards +
 * progress controls (including unmarking & prerequisite lock) + delete & re-sequence.
 */
export default function PathTimeline({ onChanged }) {
  // undefined = still loading; null = loaded, no saved path.
  const [path, setPath] = useState(undefined)
  const [failed, setFailed] = useState(false)
  const [rationales, setRationales] = useState({})
  const [explainState, setExplainState] = useState('idle') // idle|loading|error
  const [busyStepId, setBusyStepId] = useState(null)
  const [resequencing, setResequencing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      const data = await getPath()
      setPath(data)
    } catch {
      setFailed(true)
    }
  }, [])

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

  function handleExplain() {
    if (!path || explainState === 'loading') return
    setExplainState('loading')
    void explainSteps(path.id)
      .then((explanations) => {
        setRationales((prev) => ({ ...prev, ...explanations }))
        setExplainState('idle')
      })
      .catch(() => setExplainState('error'))
  }

  // 10.2 — persist status/rating, support unmarking, then fold skills into mastery (10.3).
  async function handleProgress(step, patch) {
    if (busyStepId) return
    setBusyStepId(step.id)
    try {
      await updateStepProgress({
        stepId: step.id,
        skills: step.courses?.skills ?? [],
        previousStatus: step.status,
        ...patch,
      })
      // Optimistic UI refresh from DB truth.
      await load()
      onChanged?.()
    } catch {
      /* surfaced via next render's DB state */
    } finally {
      setBusyStepId(null)
    }
  }

  // 10.3 — regenerate so remaining steps re-sequence around new mastery.
  async function handleResequence() {
    if (resequencing) return
    setResequencing(true)
    try {
      await regeneratePath()
      await load()
      onChanged?.()
    } catch {
      /* keep prior view on failure */
    } finally {
      setResequencing(false)
    }
  }

  // Delete path
  async function handleDelete() {
    if (!path?.id || deleting) return
    setDeleting(true)
    try {
      await deletePath(path.id)
      setPath(null)
      setConfirmDelete(false)
      onChanged?.()
    } catch (err) {
      console.error('Delete failed:', err)
    } finally {
      setDeleting(false)
    }
  }

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

  if (!path || path.steps.length === 0) {
    return (
      <section className="rounded-lg border bg-background p-6 text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">No learning path active</p>
        <p className="mt-1">Describe what you want to learn above to generate your customized prerequisite roadmap.</p>
      </section>
    )
  }

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
      className="rounded-lg border bg-background p-5 text-left"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Your learning path
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Prerequisite DAG roadmap · {path.steps.length} sequential courses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExplain}
            disabled={explainState === 'loading'}
            className="shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {explainState === 'loading' ? 'Explaining…' : 'Why these picks?'}
          </button>

          <button
            type="button"
            onClick={handleResequence}
            disabled={resequencing}
            title="Regenerate the remaining path from your updated mastery"
            className="shrink-0 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:opacity-50"
          >
            {resequencing ? 'Re-sequencing…' : 'Re-sequence path'}
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-1 text-xs">
              <span className="text-destructive font-medium">Delete path?</span>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="rounded bg-destructive px-2 py-0.5 font-bold text-destructive-foreground hover:opacity-90 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Yes'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded border border-muted-foreground/30 px-2 py-0.5 text-muted-foreground hover:bg-background"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="shrink-0 rounded-md border border-destructive/30 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              Delete path
            </button>
          )}
        </div>
      </div>

      {explainState === 'error' && (
        <p role="alert" className="mb-3 text-sm text-destructive">
          Could not generate explanations. Please try again.
        </p>
      )}

      <ol className="flex flex-col gap-6">
        {milestones.map((milestone, mIndex) => (
          <li key={milestone.group}>
            {/* Milestone marker (8.3). */}
            <div className="mb-3 flex items-center gap-2">
              <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {mIndex + 1}
              </span>
              <span className="text-sm font-semibold tracking-wide text-foreground">
                Milestone {mIndex + 1}
              </span>
            </div>

            <ol className="ml-3 flex flex-col gap-3 border-l pl-5">
              {milestone.steps.map((step) => {
                const globalIndex = path.steps.findIndex((s) => s.id === step.id)
                const prevStep = globalIndex > 0 ? path.steps[globalIndex - 1] : null
                // Sequential Prerequisite Unlock Rule:
                // Step is unlocked if it's the first step, or the immediately preceding step is complete, or step is already complete.
                const isUnlocked = globalIndex === 0 || prevStep?.status === 'complete' || step.status === 'complete'

                return (
                  <li key={step.id} className="relative">
                    {/* Timeline node dot. */}
                    <span
                      aria-hidden="true"
                      className={cn(
                        'absolute -left-[27px] top-3 size-2.5 rounded-full transition-colors',
                        step.status === 'complete'
                          ? 'bg-primary ring-4 ring-primary/20'
                          : isUnlocked
                          ? 'bg-primary/50'
                          : 'bg-muted-foreground/30'
                      )}
                    />
                    <div
                      className={cn(
                        'rounded-lg p-3.5 transition-all',
                        step.status === 'complete'
                          ? 'bg-primary/5 border border-primary/20'
                          : isUnlocked
                          ? 'bg-muted/50 border border-border/50'
                          : 'bg-muted/20 border border-border/30 opacity-75'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium">
                            {step.order_index}. {step.courses?.title ?? 'Course'}
                          </h3>
                          {!isUnlocked && (
                            <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                              🔒 Locked
                            </span>
                          )}
                        </div>
                        <span
                          className={cn(
                            'shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            STATUS_STYLES[step.status] ?? STATUS_STYLES.pending
                          )}
                        >
                          {step.status === 'complete'
                            ? '✓ Complete'
                            : step.status?.replace('_', ' ') ?? 'pending'}
                        </span>
                      </div>

                      {step.courses?.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {step.courses.description}
                        </p>
                      )}

                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        {step.courses?.difficulty && (
                          <span className="capitalize rounded bg-background px-1.5 py-0.5 border border-border/40">
                            {step.courses.difficulty}
                          </span>
                        )}
                        {step.courses?.duration_hours != null && (
                          <span className="rounded bg-background px-1.5 py-0.5 border border-border/40">
                            {step.courses.duration_hours}h
                          </span>
                        )}
                        {(step.courses?.skills ?? []).slice(0, 4).map((skill) => (
                          <span key={skill} className="rounded bg-background px-1.5 py-0.5 border border-border/40">
                            {skill}
                          </span>
                        ))}
                      </div>

                      {/* Grounded explanation card (9.2). */}
                      {(rationales[step.id] || step.rationale_text) && (
                        <p className="mt-3 rounded-md border-l-2 border-primary/40 bg-background/80 p-2.5 text-xs text-muted-foreground">
                          <span className="font-semibold text-foreground">Why this: </span>
                          {rationales[step.id] ?? step.rationale_text}
                        </p>
                      )}

                      {/* Progress controls (10.2) + Lock notice & Unmark action */}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-2.5 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          {!isUnlocked ? (
                            <span className="text-[11px] text-amber-500/90 font-medium">
                              Complete Course #{prevStep?.order_index} ({prevStep?.courses?.title}) to unlock
                            </span>
                          ) : (
                            <>
                              {step.status !== 'in_progress' && step.status !== 'complete' && (
                                <button
                                  type="button"
                                  disabled={busyStepId === step.id}
                                  onClick={() => handleProgress(step, { status: 'in_progress' })}
                                  className="rounded border bg-background px-2.5 py-1 font-medium hover:bg-muted transition-colors disabled:opacity-50"
                                >
                                  Start
                                </button>
                              )}

                              {step.status === 'in_progress' && (
                                <button
                                  type="button"
                                  disabled={busyStepId === step.id}
                                  onClick={() => handleProgress(step, { status: 'pending' })}
                                  className="rounded border bg-background px-2.5 py-1 text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                                >
                                  Reset to pending
                                </button>
                              )}

                              {step.status !== 'complete' ? (
                                <button
                                  type="button"
                                  disabled={busyStepId === step.id}
                                  onClick={() =>
                                    handleProgress(step, {
                                      status: 'complete',
                                      rating: step.rating ?? null,
                                    })
                                  }
                                  className="rounded bg-primary px-3 py-1 font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                  Mark complete
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={busyStepId === step.id}
                                  onClick={() =>
                                    handleProgress(step, {
                                      status: 'pending',
                                      previousStatus: 'complete',
                                    })
                                  }
                                  className="rounded border border-destructive/30 px-2.5 py-1 font-medium text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                                  title="Unmark course as complete and adjust mastery"
                                >
                                  Unmark / Incomplete
                                </button>
                              )}
                            </>
                          )}
                        </div>

                        {/* Star Rating */}
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground text-[11px] mr-1">Rating:</span>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              aria-label={`Rate ${star} of 5`}
                              disabled={busyStepId === step.id || !isUnlocked}
                              onClick={() => handleProgress(step, { rating: star })}
                              className={cn(
                                'text-sm transition-transform hover:scale-110',
                                (step.rating ?? 0) >= star
                                  ? 'text-amber-400'
                                  : 'text-muted-foreground/30 hover:text-muted-foreground',
                                (!isUnlocked || busyStepId === step.id) && 'opacity-40 pointer-events-none'
                              )}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  )
}