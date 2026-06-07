# Branching — Multi-Job Time Tracker

---

## 1. Strategy

**main + feature branches.** Main is always production-ready. All work happens on feature branches and is merged via squash merge.

```
main
├── feature/session-timer
├── feature/job-templates
├── fix/odometer-calculation
└── chore/update-dependencies
```

---

## 2. Branch Rules

| Branch | Purpose | Merges into |
|---|---|---|
| `main` | Production. Always deployable. | — |
| `feature/*` | New features from GitHub issues | main |
| `fix/*` | Bug fixes | main |
| `chore/*` | Dependencies, config, non-functional | main |

### main is protected
- No direct commits to main
- All changes via PR
- PR must pass all tests (Vitest + Playwright) before merge
- Squash merge only — keeps history clean and linear

---

## 3. Naming Convention

```
feature/issue-{number}-{short-description}
fix/issue-{number}-{short-description}
chore/{short-description}
```

### Examples
```
feature/issue-11-session-timer-dashboard
feature/issue-9-job-types-ui
fix/issue-14-duplicate-reminder-emails
chore/update-supabase-client
```

---

## 4. Commit Convention

Follows **Conventional Commits**:

```
<type>: <short description>

[optional body]
```

### Types
| Type | When to use |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `chore` | Maintenance, dependencies, config |
| `test` | Adding or updating tests |
| `docs` | Documentation only |
| `refactor` | Code change that is not a fix or feature |
| `style` | Formatting, whitespace (no logic change) |

### Examples
```
feat: add live HH:MM:SS session timer to dashboard
fix: prevent duplicate reminder emails from pg_cron
chore: upgrade supabase-js to v2.40
test: add e2e test for session start and stop flow
docs: update API spec with remind endpoint
```

---

## 5. PR Workflow

1. Create branch from main: `git checkout -b feature/issue-11-session-timer`
2. Make commits using Conventional Commits
3. Push branch and open PR on GitHub
4. PR title should match the issue title
5. Link the issue in the PR body: `Closes #11`
6. CI runs tests automatically
7. Once tests pass → squash merge into main
8. Delete the feature branch after merge
9. Vercel auto-deploys main on merge

---

## 6. Working with AI Agents (Aider)

When using Aider or Claude to implement a GitHub issue:

- Start a new branch per issue before prompting the agent
- Reference the issue number and relevant docs in your prompt
- Review the agent's commits before merging — squash them into one clean commit
- Use the issue title as the squash commit message:
  ```
  feat: build dashboard with start/stop session and live timer (#11)
  ```
