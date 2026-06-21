'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useCallback, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSession = useCallback(async () => {
    setLoading(true)
    const { data, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) setError(sessionError)
    else setUser(data.session?.user ?? null)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchSession()
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [fetchSession, supabase])

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) setError(loginError)
    else await fetchSession()
    setLoading(false)
  }, [supabase, fetchSession])

  const loginWithGoogle = useCallback(async () => {
    setLoading(true)
    const { error: loginError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (loginError) setError(loginError)
    else await fetchSession()
    setLoading(false)
  }, [supabase, fetchSession])

  const logout = useCallback(async () => {
    setLoading(true)
    const { error: logoutError } = await supabase.auth.signOut()
    if (logoutError) setError(logoutError)
    else setUser(null)
    setLoading(false)
  }, [supabase])

  return { user, loading, error, login, loginWithGoogle, logout }
}
