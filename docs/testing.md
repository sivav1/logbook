# Testing — Multi-Job Time Tracker

---

## 1. Overview

Three layers of testing: unit, integration, and E2E.

| Layer | Tool | What it tests |
|---|---|---|
| Unit | Vitest + React Testing Library | Hooks, utilities, individual components |
| Integration | Vitest + Supabase local emulator | API routes with real DB interactions |
| E2E | Playwright | Full user flows in a real browser |

---

## 2. Folder Structure

```
tests/
├── setup.ts
├── unit/
│   ├── hooks/
│   │   ├── useTimer.test.ts
│   │   └── useSession.test.ts
│   ├── utils/
│   │   └── time.test.ts
│   └── components/
│       ├── SessionTimer.test.tsx
│       └── JobCard.test.tsx
├── integration/
│   └── api/
│       ├── jobs.test.ts
│       └── sessions.test.ts
└── e2e/
    ├── auth.spec.ts
    ├── onboarding.spec.ts
    ├── session.spec.ts
    └── jobs.spec.ts
```

---

## 3. Unit Tests

### What to test

| File | What to test |
|---|---|
| `useTimer.ts` | Elapsed time calculation from `started_at`, HH:MM:SS formatting |
| `useSession.ts` | Returns active session, returns null when none |
| `useJobs.ts` | Returns list of job types |
| `SessionTimer` | Renders correct time, updates every second |
| `JobCard` | Renders job name, preset badge, edit/delete buttons |
| `lib/utils.ts` | Duration formatting, km calculated from odometer values |

---

## 4. Integration Tests

Run against local Supabase (`npx supabase start`). Use `.env.test` for local Supabase credentials.

### What to test

| Route | Scenarios |
|---|---|
| POST /api/sessions/start | Starts session; returns 409 if one already active |
| POST /api/sessions/:id/stop | Stops session, saves end fields |
| PUT /api/sessions/:id | Saves edit + audit log entry; returns 422 if note missing |
| GET /api/sessions | Returns only current user's sessions (RLS check) |
| POST /api/jobs | Creates job type with correct fields |
| DELETE /api/jobs/:id | Returns 403 if user doesn't own the job |

---

## 5. E2E Tests

### What to test

| Flow | Scenarios |
|---|---|
| Auth | Register with email, login, logout, redirect if unauthenticated |
| Onboarding | Cannot reach dashboard without a job type; create first job type; redirected to dashboard |
| Session | Start session, timer visible and counting, stop session, appears in history |
| Jobs | Create from preset, customise fields, edit, delete |
| Edit session | Edit a field, audit note required, audit log visible |

---

## 6. Running Tests

```bash
npx vitest          # unit + integration
npx vitest --watch  # watch mode
npx playwright test # E2E
npx vitest run && npx playwright test  # full suite (CI)
```

---

## 7. CI — GitHub Actions

Tests run automatically on every PR before merge to main:

```yaml
# .github/workflows/test.yml
name: Test
on: [pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx vitest run
      - run: npx playwright install --with-deps
      - run: npx playwright test
```
