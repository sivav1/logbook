# Conventions — Multi-Job Time Tracker

This file defines the coding standards for this project. All contributors and AI agents must follow these conventions. When in doubt, check here before making a decision.

---

## 1. TypeScript

- Strict mode enabled — no `any` types ever
- All shared types defined in `lib/types.ts` — never define types inline in components or API routes
- Use `interface` for object shapes, `type` for unions and primitives
- All API request and response shapes must have a corresponding type in `lib/types.ts`
- Prefer explicit return types on all functions

```ts
// Good
export function formatDuration(seconds: number): string { ... }

// Bad
export function formatDuration(seconds) { ... }
```

---

## 2. File & Folder Naming

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `SessionTimer.tsx` |
| Hooks | camelCase, `use` prefix | `useSession.ts` |
| Utility functions | camelCase | `formatDuration.ts` |
| API routes | kebab-case folders | `sessions/start/route.ts` |
| DB columns | snake_case | `started_at`, `job_id` |
| Zustand stores | camelCase, `store` suffix | `sessionStore.ts` |
| Test files | same name as file under test | `useTimer.test.ts` |

---

## 3. Component Structure

- One component per file
- Keep logic in hooks, not components — components should be mostly JSX
- All feature components go in `components/features/`
- All shadcn/ui primitives go in `components/ui/` — never modify shadcn files directly
- No inline styles — Tailwind classes only
- No hardcoded colours — use Tailwind tokens

```tsx
// Good — logic in hook, component is clean
export function SessionTimer({ startedAt }: { startedAt: string }) {
  const elapsed = useTimer(startedAt)
  return <div data-testid="timer">{elapsed}</div>
}

// Bad — logic mixed into component
export function SessionTimer({ startedAt }: { startedAt: string }) {
  const [elapsed, setElapsed] = useState('00:00:00')
  useEffect(() => { ... }, [])
  return <div>{elapsed}</div>
}
```

---

## 4. API Routes

- Every route must validate the Supabase JWT first — no exceptions
- Always derive `user_id` from `session.user.id` — never from the request body
- Always return `{ data }` on success and `{ error, code }` on failure
- Use the standard error codes defined in `docs/api.md`
- Never expose internal error messages to the client — log them server-side only

```ts
// Good
return Response.json({ data: session }, { status: 201 })
return Response.json({ error: 'Session already active', code: 'CONFLICT' }, { status: 409 })

// Bad
return Response.json({ session })
return Response.json({ message: error.message }, { status: 500 })
```

---

## 5. Database

- All DB queries scoped to `user_id` from the session — never query without a user scope
- Never query `auth.users` directly — always go through the `users` table
- All schema changes go in `supabase/migrations/` as versioned SQL files — never edit the DB manually
- Migration files named: `001_init.sql`, `002_add_profiles.sql`, etc.
- Never delete or modify existing migration files — add new ones instead

---

## 6. State Management

- Zustand for global state: active session, current user, job types list
- React `useState` for local UI state only (form inputs, toggles, loading states)
- Never store derived data in Zustand — compute it from raw state
- All Zustand stores in `store/` folder

---

## 7. Environment Variables

- `NEXT_PUBLIC_` prefix only for variables that are safe to expose to the browser
- Never use `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Never log environment variables
- All variables documented in `docs/environment.md` and `env.local.example`

---

## 8. Testing

- Every hook must have a unit test
- Every API route must have an integration test covering: happy path, auth failure (401), and the most likely business rule violation
- Every major user flow must have an E2E test in `tests/e2e/`
- Use `data-testid` attributes on interactive elements for Playwright selectors
- Never test implementation details — test behaviour

---

## 9. Commits

Follows Conventional Commits. See `docs/branching.md` for full details.

| Type | When |
|---|---|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Maintenance, deps, config |
| `test:` | Adding or updating tests |
| `docs:` | Documentation only |
| `refactor:` | Code change, not a fix or feature |

---

## 10. What Not To Do

- Do not install new packages without checking if existing dependencies already cover the need
- Do not create new global state without discussing it first
- Do not write raw SQL outside of `supabase/migrations/` — use the Supabase client
- Do not add `console.log` to production code — use proper error handling
- Do not duplicate types — check `lib/types.ts` before defining a new one