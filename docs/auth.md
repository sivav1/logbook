# Auth — Multi-Job Time Tracker

---

## 1. Overview

Authentication is handled entirely by Supabase Auth. Two methods are supported: email/password and Google OAuth. The Supabase JWT is used to authenticate all API route requests.

---

## 2. Supported Methods

| Method | Provider | Notes |
|---|---|---|
| Email/Password | Supabase built-in | Registration + login |
| Google OAuth | Supabase Google provider | One-click login/register |

---

## 3. Auth Flows

### Email/Password — Registration
1. User submits email + password on `/register`
2. Supabase creates the user and returns a session (JWT)
3. Redirect to onboarding (`/jobs/new`) — must create a job type first
4. Cannot access `/dashboard` until at least one job type exists

### Email/Password — Login
1. User submits email + password on `/login`
2. Supabase validates and returns a session (JWT)
3. Redirect to `/dashboard`

### Google OAuth
1. User clicks "Continue with Google" on `/login` or `/register`
2. Supabase redirects to Google consent screen
3. Google redirects back to `/auth/callback` with an auth code
4. Supabase exchanges the code for a session (JWT)
5. Redirect to `/dashboard` (existing user) or `/jobs/new` (new user)

### OAuth Callback Route
Create `app/auth/callback/route.ts` — this is required for Google OAuth to work:

```ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

### Supabase Dashboard Config
Add both of these as allowed redirect URLs in the Supabase dashboard:
- `https://your-domain.com/auth/callback`
- `http://localhost:3000/auth/callback`

---

## 4. Session Handling

- Supabase stores the JWT in a cookie automatically via `@supabase/auth-helpers-nextjs`
- Session persists across page loads and browser restarts
- Session is refreshed automatically before expiry
- On logout: call `supabase.auth.signOut()` — clears cookie and redirects to `/login`

---

## 5. Passing JWT to API Routes

All API routes must validate the JWT from the request cookie. Always derive the user ID from the session — never trust a user ID from the request body:

```ts
const { data: { session } } = await supabase.auth.getSession()
if (!session) return Response.json({ error: 'Unauthorised', code: 'UNAUTHORISED' }, { status: 401 })
// use session.user.id for all DB queries
```

---

## 6. Route Protection (Middleware)

`middleware.ts` at the project root protects all app routes. Unauthenticated users are redirected to `/login`:

```ts
export const config = {
  matcher: ['/dashboard/:path*', '/jobs/:path*', '/sessions/:path*']
}
```

---

## 7. Row Level Security (RLS)

All Supabase tables have RLS enabled. Apply this policy pattern to every table:

```sql
CREATE POLICY "Users can only access their own data"
ON sessions FOR ALL
USING (auth.uid() = user_id);
```

Apply equivalent policies to `job_types` and `session_audit_log`.

---

## 8. Mobile (Phase 5)

- `@supabase/supabase-js` works in React Native with no changes
- Google OAuth on mobile uses `expo-auth-session` with a deep link redirect instead of a browser callback
- JWT passed as `Authorization: Bearer <token>` header to the same API routes
