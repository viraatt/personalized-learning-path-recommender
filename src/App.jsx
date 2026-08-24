import IntakeChat from '@/components/intake/IntakeChat'
import PathTimeline from '@/components/path/PathTimeline'
import TutorChat from '@/components/tutor/TutorChat'

export default function App() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-6">
      <IntakeChat />
      <PathTimeline />
      <TutorChat />
    </main>
  )
}
