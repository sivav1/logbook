import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useState, useEffect, useCallback } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSession = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.auth.getSession()
    if (error) setError(error)
    else setUser(data.session?.user ?? null)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchSession()
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [fetchSession, supabase])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error)
    else await fetchSession()
    setLoading(false)
  }, [supabase, fetchSession])

  const logout = useCallback(async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    if (error) setError(error)
    else setUser(null)
    setLoading(false)
  }, [supabase])

  return { user, loading, error, login, logout }
}
