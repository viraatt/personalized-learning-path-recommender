import { useState } from 'react'
import { cn } from '@/lib/utils'

/**
 * IntakeChat — chat/form intake UI skeleton (Phase 3.1).
 *
 * Currently a UI scaffold only: maintains local message state and renders a
 * simple single-form/chat input. It does NOT call any backend yet — wiring the
 * input to the profiling edge function is sub-phase 3.2, and loading/error UI
 * states are sub-phase 3.3.
 *
 * Deliberately a single simple form (no multi-step wizard), per SCOPE.md's
 * OUT-OF-SCOPE note.
 */
export default function IntakeChat() {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([])

  function handleSubmit(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return

    // Skeleton: append the user's message locally. No backend call yet (3.2).
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setDraft('')
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
                'max-w-[80%] rounded-lg bg-muted px-3 py-2 text-left text-sm',
                message.role === 'user' && 'self-end bg-primary text-primary-foreground'
              )}
            >
              {message.content}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Describe your learning goal…"
          rows={2}
          className="flex-1 resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
          disabled={!draft.trim()}
        >
          Send
        </button>
      </form>
    </div>
  )
}