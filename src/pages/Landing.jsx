import { Link } from 'react-router-dom'

const FEATURES = [
  {
    title: 'Conversational intake',
    body: 'Describe your goal in plain English — no forms, no friction. The profiling engine turns it into a structured learner profile.',
    span: 'md:col-span-2',
  },
  {
    title: 'Semantic course matching',
    body: 'pgvector similarity search over a curated catalog finds the courses that actually fit your goal.',
    span: '',
  },
  {
    title: 'Prerequisite-aware paths',
    body: 'A topological sort over the prerequisite DAG sequences courses so you never hit a wall.',
    span: '',
  },
  {
    title: 'Explainable picks',
    body: 'Every recommendation ships with a grounded rationale tied to your actual profile — ask "why this?" any time.',
    span: '',
  },
  {
    title: 'Adaptive re-sequencing',
    body: 'Mark steps complete or rate them; mastery updates flow back and the remaining path re-orders itself.',
    span: 'md:col-span-2',
  },
]

export default function Landing() {
  return (
    <div className="flex flex-col gap-14">
      {/* Hero */}
      <section className="flex flex-col items-start gap-5 pt-10">
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          AI-powered · personalized · explainable
        </span>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          Your learning path,
          <span className="text-primary"> computed</span> — not guessed.
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Tell it what you want to learn. It profiles your skills, searches the
          catalog semantically, resolves prerequisites, and hands you a
          milestone-based roadmap that adapts as you progress.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <Link
            to="/chat"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Build my learning path →
          </Link>
          <Link
            to="/dashboard"
            className="rounded-md border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
          >
            Open dashboard
          </Link>
        </div>
      </section>

      {/* Feature bento */}
      <section aria-label="Features">
        <h2 className="mb-4 text-lg font-bold uppercase tracking-wide text-muted-foreground">
          What it does
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className={`rounded-xl border bg-card p-5 ${feature.span}`}
            >
              <h3 className="text-base font-bold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section aria-label="How it works" className="pb-16">
        <h2 className="mb-4 text-lg font-bold uppercase tracking-wide text-muted-foreground">
          How it works
        </h2>
        <ol className="grid gap-4 md:grid-cols-4">
          {[
            ['01', 'Chat', 'Describe your goal and background'],
            ['02', 'Match', 'Semantic search + skill-gap analysis'],
            ['03', 'Learn', 'Follow milestones, mark progress'],
            ['04', 'Adapt', 'Path re-sequences around your mastery'],
          ].map(([step, title, body]) => (
            <li key={step} className="rounded-xl border bg-card p-5">
              <span className="text-xs font-bold text-primary">{step}</span>
              <h3 className="mt-1 text-sm font-bold">{title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Link
            to="/chat"
            className="inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Get started — it takes one message
          </Link>
        </div>
      </section>
    </div>
  )
}
