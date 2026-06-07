# Multi-Job Time Tracker — Architecture Document
_Version 1.0 | NZ-First Edition_

---

## 1. Overview

A web-based time tracking application designed for multi-job workers in New Zealand. The app uses customisable job templates to capture the right data for each job type — from simple start/end times for contract work, to full odometer and trip tracking for IRD-compliant rideshare records.

The system is built web-first (MVP) with a clear path to a mobile app and AI-powered features in later phases.

---

## 2. Goals & Non-Goals

### Goals
- Track work sessions across 4–5 different job types
- Support IRD-compliant rideshare record keeping (Uber & Bolt)
- Sync data across devices in real time
- Shared API usable by future mobile apps
- Extendable to multi-country tax requirements

### Non-Goals (MVP)
- Mobile native app (planned Phase 3+)
- Payroll or invoicing integration
- Multi-user / team support

---

## 3. System Architecture

Next.js serves both the frontend UI and backend API routes. Supabase provides authentication, database, and real-time sync. The same API layer can be consumed by a future mobile app without duplication.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js (React) | Web UI — works on desktop and mobile browser |
| Backend API | Next.js API Routes | REST endpoints shared with future mobile app |
| Database | Supabase (Postgres) | Persistent storage, real-time sync, auth |
| Email | Resend | Transactional email — forgotten session reminders |
| Hosting | Vercel | Deployment, CDN, serverless functions |
| UI Components | shadcn/ui | Accessible, customisable component library |
| State Management | Zustand | Global state for active session, user, jobs |

---

## 4. Project Structure

```
my-app/
├── app/
│   ├── (auth)/login/          → Login page
│   ├── (auth)/register/       → Registration page
│   ├── dashboard/             → Home screen with active session
│   ├── jobs/                  → Job type management
│   ├── sessions/              → Session history & log
│   └── layout.tsx             → Root layout
├── components/
│   ├── ui/                    → shadcn/ui primitives
│   └── features/              → JobCard, SessionTimer, TemplateForm
├── lib/
│   ├── supabase.ts            → Supabase client
│   ├── utils.ts               → Shared utilities
│   └── types.ts               → TypeScript types
├── api/
│   ├── jobs/                  → CRUD for job types
│   ├── sessions/              → Session start/stop/list
│   └── sessions/remind        → Triggered by cron for reminder emails
├── hooks/
│   ├── useSession.ts          → Active session state
│   ├── useJobs.ts             → Job types list
│   └── useTimer.ts            → Live elapsed time
├── store/                     → Zustand global state
└── supabase/migrations/       → DB schema version control
```

---

## 5. Data Model

### Users
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key — mirrors auth provider user ID |
| email | text | Copied from auth provider on register |
| created_at | timestamp | Account creation date |

> **Design note:** This table is an abstraction layer over the auth provider (`auth.users` in Supabase). All other tables FK to `users.id` — not directly to the auth provider. This means swapping auth providers later (e.g. moving off Supabase) only requires changing how `users` gets populated, not the rest of the schema. Created automatically via a trigger on first login.

### Profiles
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK → users |
| timezone | text | Default 'Pacific/Auckland' |
| created_at | timestamp | |

> Extended in Phase 2 with financial defaults (tax %, km deduction rate).

### How users and profiles are populated

A Supabase database trigger fires automatically after every new auth signup — covers both email/password and Google OAuth. No API route needed.

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, created_at)
  VALUES (NEW.id, NEW.email, NOW());

  INSERT INTO profiles (id, user_id, timezone, created_at)
  VALUES (gen_random_uuid(), NEW.id, 'Pacific/Auckland', NOW());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

This migration lives in `supabase/migrations/` and runs on `supabase db push`. If the trigger fails, the auth user is not created — so `users` and `profiles` are always guaranteed to exist for every authenticated user.

### Job Types
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK → users |
| name | text | e.g. 'Uber Driver', 'Contract — ACME' |
| preset | text | uber \| bolt \| contract \| freelance \| custom |
| fields | jsonb | Array of field definitions for this template |
| reminder_threshold_hours | integer | Hours before first forgotten-session reminder (default 8) |
| created_at | timestamp | |

### Sessions
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | FK → users |
| job_id | uuid | FK → job_types |
| started_at | timestamp | Clock-in time (session is stateless — timer reconstructed from this) |
| ended_at | timestamp | Clock-out time (null if active) |
| data | jsonb | Template field values (odometer, trips, earnings, rate, km, etc.) |
| notes | text | Optional free-text notes |
| reminder_sent_at | timestamp | Tracks when last reminder email was sent |

### Session Edit Audit Log
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| session_id | uuid | FK → sessions |
| user_id | uuid | FK → users |
| edited_at | timestamp | When the edit was made |
| field_changed | text | Which field was edited |
| old_value | text | Original value |
| new_value | text | Updated value |
| note | text | Required user-provided reason for edit |

---

## 6. Job Templates & Presets

Users select a preset when creating a job type. Presets define the fields captured each session. Users can customise fields after selecting a preset.

| Preset | Fields Captured |
|---|---|
| Rideshare — Uber | Start time, End time, Start odometer, End odometer, Trips completed, Earnings (optional) |
| Rideshare — Bolt | Same as Uber (tracked separately for IRD) |
| Contract / Employed | Start time, End time, Employer/Client, Notes |
| Freelance | Start time, End time, Client, Project, Hourly rate |
| Custom | Fully user-defined fields |

---

## 7. Key UX Flows

### Onboarding
- First login → guided setup screen to create at least one job type
- Cannot reach dashboard until one job type exists

### Starting a Session
- User opens dashboard — sees active session (if any) or Start Session button
- Start Session is disabled if a session is already active
- Taps Start Session → selects job type
- For fields required at start (e.g. start odometer) → prompted immediately
- Live HH:MM:SS timer begins, reconstructed from `started_at` on every page load
- Timer remains accurate across devices and browser closes — no background process needed

### Stopping a Session
- User taps Stop Session
- Prompted for end-of-session fields (e.g. end odometer, trip count)
- Session saved with start/end timestamps and all field data

### Editing a Past Session
- User can edit any field on a completed session
- Edit requires a written note (reason for change)
- Every edit logged to the audit log with original value, new value, timestamp, and note

### Forgotten Session (Background Reminder)
- Supabase pg_cron job runs hourly
- Checks for sessions where `ended_at IS NULL` and `started_at < now() - reminder_threshold_hours`
- Calls `/api/sessions/remind` → sends reminder email via Resend
- After 8 hours: first reminder ("You have an active Uber Driver session started at 9:00am")
- After 16 hours: follow-up with direct link to stop or edit the session
- `reminder_sent_at` updated to prevent duplicate sends
- Reminder thresholds configurable per job type

```
Supabase pg_cron (hourly)
  → checks open sessions past threshold
  → POST /api/sessions/remind
  → Resend sends email to user
```

---

## 8. NZ IRD Compliance

Rideshare drivers in New Zealand are GST-registered from their first earning. The rideshare preset captures everything required for IRD reporting.

| IRD Requirement | How Captured |
|---|---|
| Business kilometres | Start + end odometer per session → km calculated automatically |
| Platform income | Uber and Bolt tracked as separate job types |
| GST records | Session earnings field + date → GST report in Phase 3 |
| Expense records | Notes field for Phase 1; dedicated expense tracking in Phase 3 |

NZ-first design. Multi-country support (Australia ATO, etc.) planned for Phase 4+.

---

## 9. Phased Roadmap

| Phase | Scope |
|---|---|
| MVP | Job presets, clock in/out, live session timer, session log, basic hour totals |
| Phase 2 | Supabase auth (email/password + Google OAuth), cloud sync, multi-device, hourly rate & tax % config per job, forgotten session email reminders via Resend |
| Phase 3 | IRD tax reports, CSV export, km deduction calculator, expense tracking, deduction summaries |
| Phase 4 | Mobile app (React Native or Flutter) consuming the same API, push notifications replace email reminders |

---

## 10. API Design (Shared with Mobile)

Next.js API routes are standard REST endpoints so the future mobile app can consume the same API without changes.

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/jobs | List all job types for user |
| POST | /api/jobs | Create a new job type |
| PUT | /api/jobs/:id | Update job type / template fields |
| DELETE | /api/jobs/:id | Delete a job type |
| GET | /api/sessions | List sessions (filterable by job, date) |
| POST | /api/sessions/start | Start a new session |
| POST | /api/sessions/:id/stop | Stop an active session |
| PUT | /api/sessions/:id | Update session data (requires audit note) |
| POST | /api/sessions/remind | Internal — triggered by cron for reminder emails |

---

## 11. Financial Configuration (Phase 2/3)

Captured as raw data from day one (stored in session `data` jsonb), with calculation UI added in Phase 2/3.

### User-Configurable Settings (per job type)
| Setting | Type | Notes |
|---|---|---|
| hourly_rate | decimal | Estimated earnings per hour |
| tax_percentage | decimal | User-defined income tax approximation |
| km_deduction_rate | decimal | IRD standard rate (e.g. 0.73 NZD/km for 2024) |
| custom_deductions | jsonb | List of named % or flat deductions |

### Design Decisions
- Raw fields (rate, km, trips, earnings) captured in MVP session data — no migration needed later
- Tax % is user-defined approximation (NZ brackets vary by total income)
- IRD mileage rate updated annually — surfaced as a configurable default, not hardcoded
- Calculation UI and summaries added in Phase 3 alongside IRD reporting

---

## 12. Decisions & Constraints

| Decision | Choice | Notes |
|---|---|---|
| Authentication | Email/password + Google OAuth | Via Supabase Auth — both supported out of the box |
| Concurrent sessions | One active session at a time | UI disables Start if a session is already open |
| Session editing | Allowed with audit log + required note | Each edit logged with timestamp, original value, new value, and user note — important for IRD integrity |
| Pricing | Free for now | Revisit when user base grows; Supabase free tier sufficient for MVP |
| Onboarding | Must create a job type before first clock-in | Guided setup screen on first login — can't reach dashboard until at least one job type exists |