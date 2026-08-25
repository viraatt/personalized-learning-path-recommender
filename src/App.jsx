import { NavLink } from 'react-router-dom'
import { useSession } from '@/hooks/auth/useSession'
import AuthCard from '@/components/auth/AuthCard'
import Landing from '@/pages/Landing'
import ChatPage from '@/pages/ChatPage'
import DashboardPage from '@/pages/DashboardPage'
import ProfilePage from '@/pages/ProfilePage'
import { Routes, Route, Navigate } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Home', end: true },
  { to: '/chat', label: 'Chat' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/profile', label: 'Profile' },
]

function Shell({ children, session }) {
  const signedIn = Boolean(session)
  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Top navigation */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <NavLink to="/" className="text-sm font-bold tracking-tight">
            learn<span className="text-primary">path</span>
          </NavLink>
          <nav aria-label="Primary" className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          {signedIn ? (
            <span className="hidden max-w-40 truncate text-xs text-muted-foreground md:block">
              {session?.user?.email}
            </span>
          ) : (
            <NavLink
              to="/chat"
              className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
            >
              Sign in
            </NavLink>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pt-8">{children}</main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        personalized learning path recommender
      </footer>
    </div>
  )
}

/** Gate: renders children only when signed in, otherwise the auth card. */
function RequireAuth({ children }) {
  const session = useSession()
  if (session === undefined) {
    return (
      <p className="text-sm text-muted-foreground" role="status">
        Loading…
      </p>
    )
  }
  if (!session) return <AuthCard />
  return children
}

export default function App() {
  // undefined = loading, null = signed out, Session = signed in.
  const session = useSession()

  // Only block the UI while we genuinely don't know yet.
  if (session === undefined) {
    return (
      <main className="mx-auto w-full max-w-2xl p-6">
        <p className="text-sm text-muted-foreground" role="status">
          Loading…
        </p>
      </main>
    )
  }

  return (
    <Shell session={session}>
      <Routes>
        {/* Landing is public — marketing before login. */}
        <Route path="/" element={<Landing />} />
        {/* App routes require an account. */}
        <Route
          path="/chat"
          element={
            <RequireAuth>
              <ChatPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Shell>
  )
}
