# Problem

While I do multiple jobs, I want to record the start and end time to track how many hours I work on each jobs. The jobs may include different contract jobs, ride share, etc. The issue is, there is not generalized solution exist that can work for multiple scenarios. For example, in normal jobs, just the time of start and end time may be required for calculating total hours in each day while for ride share, I may have to record the total hours, total number of trips, start and end kilometers of each session, etc for tax purposes.

# Solution

A mobile-first PWA with smart job templates — presets for common NZ job types that are compliant out of the box, with optional customisation.

## Core Concept: Job Templates

Each job type has a preset template defining what fields to capture. Users pick a preset when adding a job, tweak if needed, then just clock in/out.

### Built-in Presets

|Job Type|Key Fields|
|-|-|
|Rideshare (Uber)|Platform, start/end time, start/end odometer, trips completed, earnings|
|Rideshare (Bolt)|Same as above|
|Contract/Employed|Start/end time, employer/client, notes|
|Freelance|Start/end time, client, project, hourly rate|
|Custom|Fully user-defined fields|

## Stack

* **Frontend:** Next.js (web interface for MVP, mobile app later)
* **Backend:** Next.js API routes
* **DB:** Supabase (auth, Postgres, real-time sync)
* **Hosting:** Vercel

## UX Notes

* Single prominent **Start Session** button on the home screen — tap to begin, tap again to **Stop Session**
* Prompts for any required template fields either before starting or after stopping (e.g. odometer reading at end of shift)
* Live timer displayed while a session is active, showing elapsed time (HH:MM:SS) — visible until the session is stopped

## NZ Tax (IRD) Compliance

Rideshare drivers are GST-registered from first earning. The rideshare template captures everything IRD needs:

* Start/end odometer per session (business vs personal km split)
* Income per platform (Uber and Bolt tracked separately)
* GST records (2-monthly filing support)
* Expense hooks for vehicle running costs, phone, etc.

Designed NZ-first, extendable to other countries later.

## Phased Roadmap

|Phase|Scope|
|-|-|
|MVP|Job presets, clock in/out, session log, basic hour totals|
|Phase 2|Cloud sync, multi-device, Supabase auth|
|Phase 3|IRD tax reports, CSV export, km deduction calculator|
|Phase 4|Claude-powered natural language input \& summaries|

## Project Structure

my-app/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/
│   ├── jobs/
│   ├── sessions/
│   └── layout.tsx
├── components/
│   ├── ui/              → buttons, inputs, cards (shadcn/ui)
│   └── features/        → JobCard, SessionTimer, TemplateForm
├── lib/
│   ├── supabase.ts      → supabase client
│   ├── utils.ts
│   └── types.ts         → shared TypeScript types
├── api/                 → Next.js API routes
│   ├── jobs/
│   └── sessions/
├── hooks/               → useSession, useJobs, useTimer
├── store/               → global state (Zustand or Context)
└── supabase/
└── migrations/      → DB schema migrations



### Key Decisions

* **shadcn/ui** for components — fast, clean, customisable
* **hooks/** keeps timer and session logic reusable for mobile later
* **supabase/migrations/** keeps schema version-controlled
* **api/** is the shared layer the mobile app will also consume

