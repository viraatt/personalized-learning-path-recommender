import { useState } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

/**
 * Map auth errors to actionable messages. Supabase Auth rate-limits signups
 * per project (free tier) — a bare 429 reads as "broken", so explain it.
 */
function describeAuthError(message) {
  const raw = String(message ?? '')
  if (/rate|429|too many/i.test(raw)) {
    return (
      'Too many attempts — Supabase limits new sign-ups per hour on the ' +
      'free tier. Wait a little while and try again.'
    )
  }
  return raw || 'Authentication failed'
}

/**
 * AuthCard — minimal email/password sign-in + sign-up.
 *
 * The whole backend is RLS-scoped to auth.uid() and every edge function
 * requires the caller's JWT, so nothing works until the user is signed in.
 * On success supabase-js persists the session and useSession() flips the app
 * into its signed-in view automatically — no callback wiring needed.
 */
export default function AuthCard() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading
  const [error, setError] = useState(null)
  const [notice, setNotice] = useState(null)

  function toggleMode() {
    setMode((m) => (m === 'signin' ? 'signup' : 'signin'))
    setError(null)
    setNotice(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    setError(null)
    setNotice(null)

    const result =
      mode === 'signup'
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName.trim() || email.split('@')[0] } },
          })
        : await supabase.auth.signInWithPassword({ email, password })

    const authError = result.error

    if (authError) {
      setError(describeAuthError(authError.message))
      setStatus('idle')
      return
    }

    // Sign-up succeeded but no session means the project requires email
    // confirmation — tell the user instead of silently doing nothing.
    if (mode === 'signup' && !result.data?.session) {
      setNotice(
        'Account created! If email confirmation is required, check your ' +
          'inbox and confirm, then sign in below.'
      )
    }
    // Otherwise the session change drives the UI; nothing else to do here.
    setStatus('idle')
  }

  return (
    <Card className="mx-auto mt-10 w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-xl">
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </CardTitle>
        <CardDescription>
          Sign in so your learning path, progress, and mastery stay with you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-600 dark:text-amber-400">
            <span className="font-semibold">⚠️ Setup Required:</span> Supabase credentials not found in <code className="rounded bg-muted px-1 py-0.5 font-mono">.env</code>. Copy <code className="rounded bg-muted px-1 py-0.5 font-mono">.env.example</code> to <code className="rounded bg-muted px-1 py-0.5 font-mono">.env</code> and supply your Supabase URL & keys.
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Email</span>
            <Input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading'}
              placeholder="you@example.com"
            />
          </label>

          {mode === 'signup' && (
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Full name</span>
              <Input
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={status === 'loading'}
                placeholder="Your name (optional)"
              />
            </label>
          )}

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted-foreground">Password</span>
            <Input
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status === 'loading'}
              placeholder="At least 6 characters"
            />
          </label>

          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {notice && (
            <p role="status" className="rounded-md bg-accent px-3 py-2 text-sm text-accent-foreground">
              {notice}
            </p>
          )}

          <Button
            type="submit"
            disabled={status === 'loading'}
            className="mt-2 w-full"
          >
            {status === 'loading'
              ? 'Working…'
              : mode === 'signin'
                ? 'Sign in'
                : 'Sign up'}
          </Button>
        </form>

        <Button
          type="button"
          onClick={toggleMode}
          disabled={status === 'loading'}
          variant="link"
          className="mt-4 px-0 text-muted-foreground"
        >
          {mode === 'signin'
            ? "New here? Create an account"
            : 'Already have an account? Sign in'}
        </Button>
      </CardContent>
    </Card>
  )
}
