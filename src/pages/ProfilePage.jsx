import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/hooks/auth/useSession'
import { getProfile } from '@/hooks/profile/getProfile'
import { describeError } from '@/lib/errorMessage'
import ProfileDisplay from '@/components/profile/ProfileDisplay'
import { supabase } from '@/lib/supabaseClient'

/**
 * ProfilePage — your parsed learner profile plus account settings
 * (signed-in identity, sign out).
 */
export default function ProfilePage() {
  const session = useSession()
  // undefined = loading, null = none saved, object = loaded.
  const [profile, setProfile] = useState(undefined)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    getProfile()
      .then((data) => {
        if (!cancelled) setProfile(data)
      })
      .catch((err) => {
        if (!cancelled) setError(describeError(err))
      })
    return () => {
      cancelled = true
    }
  }, [])

  const email = session?.user?.email ?? 'unknown'

  return (
    <div className="flex flex-col gap-6 pb-16">
      <header>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Who you are as a learner — and your account.
        </p>
      </header>

      {/* Settings / account */}
      <section aria-label="Account settings" className="rounded-xl border bg-card p-5">
        <h2 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          Account
        </h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold">{email}</p>
            <p className="text-xs text-muted-foreground">
              Signed in via email &amp; password
            </p>
          </div>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="rounded-md border px-4 py-2 text-xs font-medium transition-colors hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      </section>

      {/* Learner profile */}
      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {!error && profile === undefined && (
        <p className="text-sm text-muted-foreground" role="status">
          Loading your learner profile…
        </p>
      )}
      {!error && profile === null && (
        <section className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
          No learner profile yet —{' '}
          <Link to="/chat" className="font-medium text-primary underline underline-offset-2">
            chat your goal
          </Link>{' '}
          and I'll build one.
        </section>
      )}
      {profile && <ProfileDisplay profile={profile} />}
    </div>
  )
}
