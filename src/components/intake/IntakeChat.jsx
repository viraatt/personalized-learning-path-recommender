import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { describeError } from '@/lib/errorMessage'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitIntake } from '@/hooks/profile/submitIntake'
import { getProfile } from '@/hooks/profile/getProfile'
import ProfileDisplay from '@/components/profile/ProfileDisplay'

/**
 * IntakeChat — chat/form intake UI (Phases 3.1–3.3, 4.3).
 *
 * Renders a simple single-form/chat input wired to the `parse-profile` edge
 * function. Includes loading/error state. After a successful parse, the
 * resulting profile is persisted (4.2) and shown as a structured card (4.3).
 * On mount, any previously saved profile is retrieved and displayed.
 *
 * Deliberately a single simple form (no multi-step wizard), per SCOPE.md's
 * OUT-OF-SCOPE note.
 */
import { regeneratePath } from '@/hooks/progress/regeneratePath'

export default function IntakeChat({ onProfileUpdated }) {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle')
  const [profile, setProfile] = useState(null)

  // Load any saved profile on mount.
  useEffect(() => {
    let cancelled = false
    getProfile()
      .then((saved) => {
        if (!cancelled && saved) setProfile(saved)
      })
      .catch(() => {
        /* no profile yet / not authenticated — fine */
      })
    return () => {
      cancelled = true
    }
  }, [])

  function handleSubmit(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || status === 'loading') return

    // Push the user's message immediately, then call the profiling function.
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setDraft('')
    setStatus('loading')

    void submitIntake(text)
      .then(async (parsed) => {
        setProfile(parsed)
        try {
          await regeneratePath()
        } catch {
          /* generator will also be available via re-sequence */
        }
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'Got it — I parsed your profile and generated your customized learning path below!',
          },
        ])
        setStatus('success')
        onProfileUpdated?.(parsed)
      })
      .catch((error) => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Something went wrong: ${describeError(error)}`,
            isError: true,
          },
        ])
        setStatus('error')
      })
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <header className="text-left">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tell me what you want to learn
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe your goal in plain English. Example: “I want to become a data
          analyst and get comfortable with Python and machine learning.”
        </p>
      </header>

      {/* Previously saved / just-parsed profile. */}
      {profile && <ProfileDisplay profile={profile} />}

      {/* Message list — rendered as cards; empty until a message is sent. */}
      <div
        aria-live="polite"
        className="flex min-h-40 flex-col gap-3 rounded-lg border bg-background p-4"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Your conversation will appear here.
          </p>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'max-w-[80%] whitespace-pre-wrap rounded-lg px-3 py-2 text-left text-sm',
                message.isError && 'bg-destructive/10 text-destructive',
                message.role === 'user' && 'self-end bg-primary text-primary-foreground',
                message.role === 'assistant' &&
                  !message.isError &&
                  'bg-muted self-start'
              )}
            >
              {message.content}
            </div>
          ))
        )}

        {/* Loading indicator while awaiting the profiling function. */}
        {status === 'loading' && (
          <div
            className="flex items-center gap-2 self-start text-sm text-muted-foreground"
            role="status"
          >
            <span
              className="inline-block size-3 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"
              aria-hidden="true"
            />
            Parsing your profile…
          </div>
        )}

        {/* Persistent error banner surfaced when the last call failed. */}
        {status === 'error' && (
          <div
            className="flex items-center justify-between gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-left text-sm text-destructive"
            role="alert"
          >
            <span>Could not process that request.</span>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="font-medium underline underline-offset-2"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Describe your learning goal…"
          rows={2}
          disabled={status === 'loading'}
          className="flex-1 resize-none"
        />
        <Button
          type="submit"
          disabled={!draft.trim() || status === 'loading'}
          className="h-auto shrink-0 px-4"
        >
          {status === 'loading' ? 'Sending…' : 'Send'}
        </Button>
      </form>
    </div>
  )
}