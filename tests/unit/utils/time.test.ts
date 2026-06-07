// Unit tests for time utility functions – tests duration formatting.
import { describe, it, expect } from 'vitest'
import { formatDuration } from '../../../lib/utils'

describe('formatDuration', () => {
  it('should format seconds into HH:MM:SS', () => {
    expect(formatDuration(0)).toBe('00:00:00')
    expect(formatDuration(666)).toBe('00:11:06')
    expect(formatDuration(3661)).toBe('01:01:01')
  })
})
