import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getMastery } from '@/hooks/progress/getMastery'

/**
 * SkillChart — skill development bar chart wired to skill_mastery (11.1).
 * Loading/error/empty states are derived; no synchronous setState in effects.
 */
export default function SkillChart() {
  const [rows, setRows] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    getMastery()
      .then((data) => {
        if (!cancelled) setRows(data)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const loading = !failed && rows === null

  return (
    <section aria-label="Skill development" className="rounded-lg border bg-background p-4 text-left">
      <h2 className="text-lg font-semibold tracking-tight">Skill development</h2>

      {loading && (
        <p className="mt-3 text-sm text-muted-foreground">Loading mastery scores…</p>
      )}

      {failed && (
        <p role="alert" className="mt-3 text-sm text-destructive">
          Could not load your skill chart.
        </p>
      )}

      {!loading && !failed && (rows ?? []).length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">
          No skills tracked yet — mark a step complete or rate it to build your
          mastery profile.
        </p>
      )}

      {!loading && !failed && (rows ?? []).length > 0 && (
        <div className="mt-3 h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="skill_name"
                tick={{ fontSize: 11 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(value) => [`${value}`, 'mastery']}
                labelFormatter={(label) => String(label)}
              />
              <Bar dataKey="mastery_score" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}