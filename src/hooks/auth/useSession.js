import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

/**
 * useSession — subscribes to the Supabase auth session.
 *
 * Returns:
 *   undefined -> session state still loading (avoid flashing the auth form)
 *   null      -> signed out
 *   Session   -> signed in
 */
export function useSession() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session ?? null)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (mounted) setSession(nextSession ?? null)
      }
    )

    return () => {
      mounted = false
      subscription?.subscription?.unsubscribe()
    }
  }, [])

  return session
}
