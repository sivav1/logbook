# Environment Variables — Multi-Job Time Tracker

---

## 1. Variables

| Variable | Public | Required | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Yes | Supabase anon/public key — safe to expose |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Yes | Supabase service role key — server only, never expose |
| `RESEND_API_KEY` | No | Yes | Resend API key for sending reminder emails |
| `NEXT_PUBLIC_APP_URL` | Yes | Yes | Full app URL — used for OAuth redirects and email links |
| `CRON_SECRET` | No | Yes | Protects `/api/sessions/remind` from public access |

---

## 2. .env.local.example

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
RESEND_API_KEY=re_your_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=a-long-random-secret-string
```

---

## 3. Vercel Setup

Add all variables under **Project → Settings → Environment Variables**.

| Variable | Environments |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview |
| `RESEND_API_KEY` | Production, Preview |
| `NEXT_PUBLIC_APP_URL` | Production (`https://your-domain.com`), Preview (Vercel sets automatically) |
| `CRON_SECRET` | Production, Preview |

---

## 4. Protecting the Cron Endpoint

`/api/sessions/remind` is internal — validate the secret on every request:

```ts
const secret = request.headers.get('x-cron-secret')
if (secret !== process.env.CRON_SECRET) {
  return Response.json({ error: 'Forbidden', code: 'FORBIDDEN' }, { status: 403 })
}
```

Pass the secret from the Supabase pg_cron job:

```sql
SELECT cron.schedule(
  'forgotten-session-reminder',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-domain.com/api/sessions/remind',
    headers := '{"x-cron-secret": "your-cron-secret"}'::jsonb
  )
  $$
);
```

---

## 5. Security Rules

- Never commit `.env.local` — it is in `.gitignore`
- Never use `SUPABASE_SERVICE_ROLE_KEY` in client-side code
- Never log environment variables
- `NEXT_PUBLIC_` variables are bundled into the client — only put non-sensitive config there
- Rotate `CRON_SECRET` and `RESEND_API_KEY` if accidentally exposed
