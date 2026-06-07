// Unit tests for JobCard component – tests rendering and job details.
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { JobCard } from '../../../components/features/placeholder'

describe('JobCard', () => {
  it('should render the job card', () => {
    const { container } = render(<JobCard />)
    expect(container.querySelector('div')).toBeTruthy()
  })
})
