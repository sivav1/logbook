// TypeScript types for the application – shared across components, hooks, and API routes.
export interface User {
  id: string
  email: string
  created_at: string
}

export interface Profile {
  id: string
  user_id: string
  timezone: string
  created_at: string
}

export interface JobType {
  id: string
  user_id: string
  name: string
  preset: string
  fields: any[]
  reminder_threshold_hours: number
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  job_id: string
  started_at: string
  ended_at: string | null
  data: any
  notes: string | null
  reminder_sent_at: string | null
}
