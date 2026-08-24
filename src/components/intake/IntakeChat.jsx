import { useState } from 'react'
import { cn } from '@/lib/utils'
import { submitIntake } from '@/hooks/profile/submitIntake'

/**
 * IntakeChat — chat/form intake UI (Phases 3.1–3.2).
 *
 * Renders a simple single-form/chat input and wires it to the `parse-profile`
 * edge function via `submitIntake`. Loading/error UI states land in sub-phase
 * 3.3; the function returns a stub profile until Phase 4.1 adds real Gemini
 * parsing.
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

    // Push the user's message immediately, then call the profiling function.
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setDraft('')

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
      })
      .catch((error) => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Something went wrong: ${error.message}` },
        ])
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
                'max-w-[80%] whitespace-pre-wrap rounded-lg bg-muted px-3 py-2 text-left text-sm',
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