import { useState } from 'react'
import { askTutor } from '@/hooks/tutor/askTutor'
import { cn } from '@/lib/utils'
import { describeError } from '@/lib/errorMessage'

/**
 * TutorChat — grounded Q&A widget (10.1). Same message-list pattern as
 * IntakeChat, with loading/error states.
 */
export default function TutorChat() {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle')

  function handleSubmit(event) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || status === 'loading') return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setDraft('')
    setStatus('loading')

    void askTutor(text)
      .then((reply) => {
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
        setStatus('idle')
      })
      .catch((error) => {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Tutor error: ${describeError(error)}`, isError: true },
        ])
        setStatus('error')
      })
  }

  return (
    <section aria-label="Ask your tutor" className="rounded-lg border bg-background p-4 text-left">
      <h2 className="text-lg font-semibold tracking-tight">Ask your tutor</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Questions about your path — e.g. “why is pandas before ML?”
      </p>

      <div
        aria-live="polite"
        className="mt-3 flex min-h-16 flex-col gap-2"
      >
        {messages.length === 0 && (
          <p className="text-sm text-muted-foreground">No questions yet.</p>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              'max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm',
              message.role === 'user' && 'self-end bg-primary text-primary-foreground',
              message.isError && 'bg-destructive/10 text-destructive',
              message.role === 'assistant' && !message.isError && 'bg-muted self-start'
            )}
          >
            {message.content}
          </div>
        ))}
        {status === 'loading' && (
          <p role="status" className="self-start text-sm text-muted-foreground">
            Thinking…
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about your path…"
          disabled={status === 'loading'}
          className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!draft.trim() || status === 'loading'}
          className="rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </section>
  )
}