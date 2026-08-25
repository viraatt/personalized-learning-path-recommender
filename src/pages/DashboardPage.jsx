import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPath } from '@/hooks/path/getPath'
import NextAction from '@/components/dashboard/NextAction'
import SkillChart from '@/components/dashboard/SkillChart'
import TutorChat from '@/components/tutor/TutorChat'

/**
 * DashboardPage — bento-grid overview: a path-progress stat tile, the next
 * recommended action, the skill mastery chart, and the tutor Q&A widget.
 */
export default function DashboardPage() {
  // undefined = loading, null = no path.
  const [stats, setStats] = useState(undefined)

  useEffect(() => {
    let cancelled = false
    getPath()
      .then((data) => {
        if (!cancelled) {
          const steps = data?.steps ?? []
          setStats({
            total: steps.length,
            complete: steps.filter((s) => s.status === 'complete').length,
            inProgress: steps.filter((s) => s.status === 'in_progress').length,
          })
        }
      })
      .catch(() => {
        if (!cancelled) setStats(null)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const pct =
    stats && stats.total > 0
      ? Math.round((stats.complete / stats.total) * 100)
      : 0

  return (
    <div className="flex flex-col gap-4 pb-16">
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your progress at a glance.
        </p>
      </header>

      {/* Bento grid */}
      <div className="grid auto-rows-min grid-cols-1 gap-4 md:grid-cols-3">
        {/* Path progress — tall-ish stat tile */}
        <section
          aria-label="Path progress"
          className="rounded-xl border bg-card p-5 md:row-span-2"
        >
          <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Path progress
          </h2>
          {stats === undefined ? (
            <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
          ) : !stats || stats.total === 0 ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                No learning path yet. Chat your goal to generate one.
              </p>
              <Link
                to="/chat"
                className="mt-3 inline-block rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:opacity-90"
              >
                Build my path →
              </Link>
            </>
          ) : (
            <>
              <p className="mt-4 text-5xl font-bold tracking-tighter">
                {pct}
                <span className="text-xl text-muted-foreground">%</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stats.complete} of {stats.total} courses complete
                {stats.inProgress > 0 ? ` · ${stats.inProgress} in progress` : ''}
              </p>
              <div
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                className="mt-4 h-2 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </>
          )}
        </section>

        {/* Next action — spans two columns */}
        <div className="md:col-span-2 [&>section]:h-full [&>section]:rounded-xl">
          <NextAction />
        </div>

        {/* Skill chart — spans two columns */}
        <div className="md:col-span-2 [&>section]:h-full [&>section]:rounded-xl">
          <SkillChart />
        </div>

        {/* Tutor */}
        <div className="[&>section]:h-full [&>section]:rounded-xl">
          <TutorChat />
        </div>
      </div>
    </div>
  )
}
