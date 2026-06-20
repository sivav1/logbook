import { test, expect } from 'vitest'
import { vi } from 'vitest'
import { useAuth } from '@/hooks/useAuth'
import { renderHook, waitFor, act } from '@testing-library/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: vi.fn()
}))

const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'uid', email: 'test@example.com' } } } }),
    signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  }
}
;(createClientComponentClient as any).mockReturnValue(mockSupabase)

test('initial load sets user', async () => {
  const { result } = renderHook(() => useAuth())
  await waitFor(() => result.current.user !== undefined)
  expect(result.current.user?.email).toBe('test@example.com')
})

test('login updates user', async () => {
  const { result } = renderHook(() => useAuth())
  await waitFor(() => result.current.user !== undefined)
  await act(async () => {
    await result.current.login('test@example.com', 'pwd')
  })
  expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled()
  expect(result.current.user?.email).toBe('test@example.com')
})

test('logout clears user', async () => {
  const { result } = renderHook(() => useAuth())
  await waitFor(() => result.current.user !== undefined)
  await act(async () => {
    await result.current.logout()
  })
  expect(mockSupabase.auth.signOut).toHaveBeenCalled()
  expect(result.current.user).toBeNull()
})
