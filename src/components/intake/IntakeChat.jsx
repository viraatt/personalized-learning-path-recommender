import { useState } from 'react'
import { cn } from '@/lib/utils'
import { submitIntake } from '@/hooks/profile/submitIntake'

/**
 * IntakeChat — chat/form intake UI (Phases 3.1–3.3).
 *
 * Renders a simple single-form/chat input and wires it to the `parse-profile`
 * edge function via `submitIntake`. Includes loading and error UI states. The
 * function returns a stub profile until Phase 4.1 adds real Gemini parsing.
 *
 * Deliberately a single simple form (no multi-step wizard), per SCOPE.md's
 * OUT-OF-SCOPE note.
 */
export default function IntakeChat() {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle')

  function handleSubmit(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || status === 'loading') return

    // Push the user's message immediately, then call the profiling function.
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setDraft('')
    setStatus('loading')

    void submitIntake(text)
      .then((profile) => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'Thanks! Here is your parsed profile (stub for now): ' +
              JSON.stringify(profile, null, 2),
          },
        ])
        setStatus('success')
      })
      .catch((error) => {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Something went wrong: ${error.message}`,
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
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Describe your learning goal…"
          rows={2}
          disabled={status === 'loading'}
          className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          disabled={!draft.trim() || status === 'loading'}
        >
          {status === 'loading' ? 'Sending…' : 'Send'}
        </button>
      </form>
    </div>
  )
}