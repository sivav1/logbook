# Multi-Job Time Tracker

A web-based time tracking application designed for multi-job workers in New Zealand. Track work sessions across different job types with customisable templates for IRD-compliant record keeping.

## Features

- Track sessions across 4-5 different job types
- Support for IRD-compliant rideshare record keeping (Uber & Bolt)
- Real-time sync across devices
- Customisable job templates
- Session timer with live elapsed time display
- Session history with edit capabilities
- Audit logging for session modifications

## Tech Stack

- **Frontend**: Next.js 14 (React 18) with TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (email/password + Google OAuth)
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **Testing**: Vitest (unit/integration) + Playwright (E2E)
- **Email**: Resend for transactional emails

## Getting Started

### Prerequisites

- Node.js 20
- npm or yarn
- Supabase project
- Resend account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Supabase and Resend credentials

4. Set up the database:
   ```bash
   npx supabase db push
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── app/                    # Next.js app router pages
├── components/             # React components
│   ├── ui/                # shadcn/ui primitives
│   └── features/          # Feature-specific components
├── lib/                   # Shared utilities and types
├── hooks/                 # Custom React hooks
├── store/                 # Zustand state stores
├── api/                   # API routes
├── supabase/              # Database migrations
├── tests/                 # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   └── e2e/              # End-to-end tests
└── docs/                 # Documentation
```

## Testing

Run tests using:

```bash
npm test          # Unit and integration tests
npm run test:e2e  # End-to-end tests
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm test` - Run unit and integration tests
- `npm run test:e2e` - Run end-to-end tests

## Environment Variables

See `.env.local.example` for required environment variables.

## Contributing

1. Follow the conventions in `CONVENTIONS.md`
2. Write tests for new features
3. Use Conventional Commits

## License

MIT
