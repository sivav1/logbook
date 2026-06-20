import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    if (!error) router.push('/dashboard');
  };

  const handleGoogle = async () => {
    // Placeholder: implement Google sign‑in using supabase
  };

  return (
    <div className="flex min-h-screen items-center justify-center" data-testid="login-page">
      <form onSubmit={handleSubmit} className="w-80 space-y-4" data-testid="login-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded border p-2"
          data-testid="email-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded border p-2"
          data-testid="password-input"
        />
        {error && <p className="text-red-500" data-testid="error-msg">{error.message}</p>}
        <button type="submit" disabled={loading} className="w-full rounded bg-blue-600 p-2 text-white" data-testid="login-button">
          {loading ? 'Loading...' : 'Login'}
        </button>
        <button type="button" onClick={handleGoogle} className="w-full rounded bg-red-600 p-2 text-white" data-testid="google-button">
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
