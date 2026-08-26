import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { describeError } from '@/lib/errorMessage'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { submitIntake } from '@/hooks/profile/submitIntake'
import { getProfile } from '@/hooks/profile/getProfile'
import { regeneratePath } from '@/hooks/progress/regeneratePath'
import ProfileDisplay from '@/components/profile/ProfileDisplay'

const TIMEOUT_MS = 60000

export default function IntakeChat({ onProfileUpdated }) {
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState([])
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [loadingStage, setLoadingStage] = useState('') // 'parsing' | 'sequencing' | ''
  const [profile, setProfile] = useState(null)
  const [lastError, setLastError] = useState(null)
  const abortTimerRef = useRef(null)

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
      if (abortTimerRef.current) clearTimeout(abortTimerRef.current)
    }
  }, [])

  async function handleSubmit(event) {
    event?.preventDefault()
    const text = draft.trim()
    if (!text || status === 'loading') return

    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setDraft('')
    setStatus('loading')
    setLoadingStage('parsing')
    setLastError(null)

    // Set timeout guard to prevent UI from ever hanging indefinitely.
    let timedOut = false
    abortTimerRef.current = setTimeout(() => {
      timedOut = true
      setStatus('error')
      setLoadingStage('')
      setDraft(text)
      const timeoutErr = new Error('The request timed out. Please verify your connection or Gemini API key and try again.')
      setLastError(timeoutErr.message)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: timeoutErr.message,
          isError: true,
        },
      ])
    }, TIMEOUT_MS)

    try {
      // Step 1: Parse profile with Gemini
      setLoadingStage('parsing')
      const parsed = await submitIntake(text)
      if (timedOut) return
      setProfile(parsed)

      // Step 2: Generate & sequence learning path
      setLoadingStage('sequencing')
      try {
        await regeneratePath(text)
      } catch (genErr) {
        console.warn('Auto-generation warning:', genErr)
        // Profile is saved, user can still click re-sequence
      }

      if (timedOut) return
      clearTimeout(abortTimerRef.current)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Got it! I analyzed your goals, extracted your learner profile, and generated your prerequisite-sequenced learning path below.',
        },
      ])
      setStatus('success')
      setLoadingStage('')
      onProfileUpdated?.(parsed)
    } catch (error) {
      if (timedOut) return
      clearTimeout(abortTimerRef.current)
      const friendly = describeError(error)
      setLastError(friendly)
      setDraft(text) // Restore user's draft so they don't have to retype
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Something went wrong: ${friendly}`,
          isError: true,
        },
      ])
      setStatus('error')
      setLoadingStage('')
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <header className="text-left">
        <h1 className="text-2xl font-semibold tracking-tight">
          Tell me what you want to learn
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Describe your goal in plain English. Example: “I want to become a machine learning engineer and learn Python, pandas, and cloud deployment.”
        </p>
      </header>

      {/* Previously saved / just-parsed profile. */}
      {profile && <ProfileDisplay profile={profile} />}

      {/* Message list */}
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
                'max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-left text-sm',
                message.isError && 'border border-destructive/30 bg-destructive/10 text-destructive',
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

        {/* Live Multi-Stage Progress Indicator */}
        {status === 'loading' && (
          <div
            className="flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-left text-sm text-foreground"
            role="status"
          >
            <div className="flex items-center gap-2.5">
              <span
                className="inline-block size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
                aria-hidden="true"
              />
              <span className="font-medium text-primary">
                {loadingStage === 'parsing' && 'Step 1/2: Extracting goals & skill profile with Gemini AI…'}
                {loadingStage === 'sequencing' && 'Step 2/2: Finding courses with pgvector & sequencing roadmap…'}
                {!loadingStage && 'Processing your request…'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={cn('size-2 rounded-full', loadingStage === 'parsing' ? 'animate-pulse bg-primary' : 'bg-primary')}></span>
              <span>1. Profile Extraction</span>
              <span className="text-muted-foreground/40">➔</span>
              <span className={cn('size-2 rounded-full', loadingStage === 'sequencing' ? 'animate-pulse bg-primary' : 'bg-muted-foreground/30')}></span>
              <span>2. Prerequisite DAG Sequencing</span>
            </div>
          </div>
        )}

        {/* Actionable error banner */}
        {status === 'error' && (
          <div
            className="flex items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-left text-sm text-destructive"
            role="alert"
          >
            <span>{lastError || 'Could not process that request.'}</span>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="shrink-0 font-medium underline underline-offset-2 hover:opacity-80"
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
          className="h-auto shrink-0 px-5"
        >
          {status === 'loading' ? (
            <span className="flex items-center gap-1.5">
              <span className="size-3 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
              Working…
            </span>
          ) : (
            'Send'
          )}
        </Button>
      </form>
    </div>
  )
}