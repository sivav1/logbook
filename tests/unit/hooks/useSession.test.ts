// Unit tests for useSession hook – tests active session state management.
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSession } from '../../../hooks/useSession'

describe('useSession', () => {
  it('should return null when no session is active', () => {
    const { result } = renderHook(() => useSession())
    expect(result.current.session).toBeNull()
  })
})
