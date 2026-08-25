import IntakeChat from '@/components/intake/IntakeChat'
import PathTimeline from '@/components/path/PathTimeline'

/**
 * ChatPage — the conversational workflow: describe your goal, get a profile,
 * then the generated path timeline underneath.
 */
export default function ChatPage() {
  return (
    <div className="flex flex-col gap-8 pb-16">
      <IntakeChat />
      <PathTimeline />
    </div>
  )
}
