import IntakeChat from '@/components/intake/IntakeChat'
import PathTimeline from '@/components/path/PathTimeline'
import SkillChart from '@/components/dashboard/SkillChart'
import NextAction from '@/components/dashboard/NextAction'
import TutorChat from '@/components/tutor/TutorChat'

export default function App() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 p-6">
      <IntakeChat />
      <PathTimeline />
      <div className="grid gap-6 md:grid-cols-1">
        <SkillChart />
        <NextAction />
      </div>
      <TutorChat />
    </main>
  )
}
