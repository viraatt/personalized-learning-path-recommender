import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/**
 * ProfileDisplay — structured read-only view of the learner's parsed profile.
 * Renders goals, experience level, target role, interests, and completed
 * courses delivered by the profiling engine (Phase 4.3).
 */
export default function ProfileDisplay({ profile, className }) {
  if (!profile) return null

  return (
    <Card className={cn('text-left', className)} aria-label="Your learner profile">
      <CardHeader>
        <CardTitle className="text-lg">Your learner profile</CardTitle>
      </CardHeader>

      <CardContent>
        <dl className="grid gap-3 text-xs sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Goal</dt>
            <dd className="mt-0.5 font-medium">{profile.goals || '—'}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Target role</dt>
            <dd className="mt-0.5 font-medium capitalize">
              {profile.target_role || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Experience level</dt>
            <dd className="mt-0.5 font-medium capitalize">
              {profile.experience_level || '—'}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Interests</dt>
            <dd className="mt-0.5">
              {profile.interests?.length
                ? profile.interests.join(', ')
                : '—'}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Completed courses</dt>
            <dd className="mt-0.5">
              {profile.completed_courses?.length
                ? profile.completed_courses.join(', ')
                : 'None yet'}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  )
}