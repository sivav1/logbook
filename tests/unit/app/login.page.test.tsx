import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import LoginPage from '@/app/(auth)/login/page'
import { useAuth } from '@/hooks/useAuth'

jest.mock('@/hooks/useAuth')

const mockLogin = jest.fn()
;(useAuth as jest.Mock).mockReturnValue({
  user: null,
  loading: false,
  error: null,
  login: mockLogin,
  logout: jest.fn()
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
