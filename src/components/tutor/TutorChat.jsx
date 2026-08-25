import { useState } from 'react'
import { askTutor } from '@/hooks/tutor/askTutor'
import { cn } from '@/lib/utils'
import { describeError } from '@/lib/errorMessage'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
    <Card className="text-left">
      <CardHeader>
        <CardTitle className="text-lg">Ask your tutor</CardTitle>
        <CardDescription>
          Questions about your path — e.g. “why is pandas before ML?”
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          aria-live="polite"
          className="flex min-h-16 flex-col gap-2"
        >
          {messages.length === 0 && (
            <p className="text-xs text-muted-foreground">No questions yet.</p>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-xs',
                message.role === 'user' && 'self-end bg-primary text-primary-foreground',
                message.isError && 'bg-destructive/10 text-destructive',
                message.role === 'assistant' && !message.isError && 'bg-muted self-start'
              )}
            >
              {message.content}
            </div>
          ))}
          {status === 'loading' && (
            <p role="status" className="self-start text-xs text-muted-foreground">
              Thinking…
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about your path…"
            disabled={status === 'loading'}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!draft.trim() || status === 'loading'}
            className="shrink-0"
          >
            Ask
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}