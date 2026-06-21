'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loginWithGoogle, loading, error, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) router.push('/dashboard')
  }, [router, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
    if (!error) router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <h1 className="text-2xl font-bold">Login</h1>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border p-2 rounded"
        />
        <button type="submit" disabled={loading} className="bg-blue-500 text-white p-2 rounded">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="text-red-500">{error.message}</p>}
        <button
          type="button"
          disabled={loading}
          onClick={() => void loginWithGoogle()}
          className="bg-green-500 text-white p-2 rounded"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  )
}
