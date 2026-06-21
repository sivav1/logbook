import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'
import { useAuth } from '@/hooks/useAuth'

import { vi } from 'vitest'

vi.mock('@/hooks/useAuth')

const mockLogin = vi.fn()
const mockLoginWithGoogle = vi.fn()
;(useAuth as any).mockReturnValue({
  user: null,
  loading: false,
  error: null,
  login: mockLogin,
  loginWithGoogle: mockLoginWithGoogle,
  logout: vi.fn()
})

test('renders login form', () => {
  render(<LoginPage />)
  expect(screen.getByPlaceholderText('Email')).toBeInTheDocument()
  expect(screen.getByPlaceholderText('Password')).toBeInTheDocument()
})

test('calls login on submit', async () => {
  render(<LoginPage />)
  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } })
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'secret' } })
  fireEvent.click(screen.getByText('Login'))
  await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'secret'))
})

test('calls loginWithGoogle on button click', async () => {
  render(<LoginPage />)
  fireEvent.click(screen.getByText('Sign in with Google'))
  await waitFor(() => expect(mockLoginWithGoogle).toHaveBeenCalled())
})