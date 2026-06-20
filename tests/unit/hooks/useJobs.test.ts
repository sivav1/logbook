// Unit tests for useJobs hook – tests job types list management.
import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useJobs } from '../../../hooks/useJobs'

describe('useJobs', () => {
  it('should return an empty array initially', () => {
    const { result } = renderHook(() => useJobs())
    expect(result.current.jobs).toEqual([])
  })
})
