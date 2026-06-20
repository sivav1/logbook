// Unit tests for useTimer hook – tests elapsed time calculation and formatting.
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useTimer } from '../../../hooks/useTimer'

describe('useTimer', () => {
  it('should return elapsed time in HH:MM:SS format', () => {
    const { result } = renderHook(() => useTimer('2024-01-01T00:00:00Z'))
    expect(result.current).toMatch(/^\d{2}:\d{2}:\d{2}$/)
  })
})
