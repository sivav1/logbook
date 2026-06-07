# Agents — Multi-Job Time Tracker

This file tells AI agents (Aider, Claude, etc.) how to work on this project effectively. Read this before starting any task.

---

## 1. Always Read These Docs First

Before writing any code, read the relevant docs for the task:

| Task type | Docs to read |
|---|---|
| Any task | `CONVENTIONS.md` |
| Auth, login, registration, middleware | `docs/auth.md` |
| API routes | `docs/api.md`, `docs/auth.md` |
| Database schema or migrations | `docs/architecture.md` section 5 |
| Frontend components or pages | `docs/architecture.md` section 4, `CONVENTIONS.md` section 3 |
| Testing | `docs/testing.md` |
| New branch or PR | `docs/branching.md` |
| Environment variables | `docs/environment.md` |

---

## 2. How to Scope a Task

- Work on **one GitHub issue at a time** — do not combine multiple issues in one session
- Read the issue title and body in full before starting
- If the issue references another issue or doc, read that too
- If anything is unclear, ask before writing code

---

## 3. Before Writing Any Code

1. Read `CONVENTIONS.md` in full
2. Read the relevant docs listed in section 1 above
3. Check `lib/types.ts` — use existing types before defining new ones
4. Check `components/ui/` — use existing shadcn components before building new ones
5. Check existing hooks in `hooks/` — don't duplicate logic that already exists

---

## 4. Branch & Commit Rules

- Never commit directly to `main`
- Create a branch before starting: `feature/issue-{number}-{short-description}`
- Use Conventional Commits for every commit — see `docs/branching.md`
- One logical change per commit — don't bundle unrelated changes
- After finishing, summarise what was done and what tests were added

---

## 5. What Agents Must Not Do

- Do not install new npm packages without flagging it first and explaining why
- Do not modify files in `components/ui/` — these are shadcn primitives
- Do not modify existing migration files in `supabase/migrations/` — add new ones
- Do not use `any` in TypeScript — ever
- Do not put business logic in components — it belongs in hooks
- Do not query the database without scoping to `user_id`
- Do not hardcode values that belong in environment variables
- Do not skip writing tests for new hooks or API routes
- Do not add `console.log` to production code

---

## 6. API Routes Checklist

Every new API route must:
- [ ] Validate the Supabase JWT and return 401 if missing
- [ ] Derive `user_id` from `session.user.id` — never from request body
- [ ] Return `{ data }` on success
- [ ] Return `{ error, code }` on failure using codes from `docs/api.md`
- [ ] Have an integration test covering: happy path, 401, and primary business rule violation

---

## 7. Database Checklist

Every new table or migration must:
- [ ] Have RLS enabled with a policy scoped to `user_id`
- [ ] Be created as a new versioned file in `supabase/migrations/`
- [ ] Have corresponding TypeScript types added to `lib/types.ts`

---

## 8. Handing Off Between Sessions

When ending a session, always output a handoff summary:

```
## Session Handoff
- Issue: #[number] [title]
- Branch: [branch name]
- What was completed: [list]
- What was NOT completed: [list]
- Tests added: [list]
- Next steps: [list]
- Any decisions made or questions that came up: [list]
```

When starting a new session, provide this summary so the agent has full context.

---

## 9. Prompt Templates

### Start a new issue
```
Read CONVENTIONS.md and the relevant docs in docs/ for this task.
Implement GitHub issue #[number]: [title]
Branch: feature/issue-[number]-[short-description]
Follow all conventions in CONVENTIONS.md.
Write tests as defined in docs/testing.md.
Use Conventional Commits.
```

### Continue an existing issue
```
Read CONVENTIONS.md.
Continuing work on issue #[number]: [title]
Branch: [branch name]
Here is the handoff from the last session: [paste handoff summary]
Continue from: [next step]
```

### Fix a bug
```
Read CONVENTIONS.md and docs/[relevant].md.
Fix the following bug on branch fix/issue-[number]-[description]:
[describe the bug]
Write a test that would have caught this bug before fixing it.
```