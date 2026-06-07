-- Initial database schema – users, profiles, job_types, sessions, audit_log, and trigger.
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table – abstraction over auth.users
CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Profiles table – user preferences
CREATE TABLE profiles (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  timezone text DEFAULT 'Pacific/Auckland',
  created_at timestamp with time zone DEFAULT now()
);

-- Job types table
CREATE TABLE job_types (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  preset text NOT NULL,
  fields jsonb NOT NULL,
  reminder_threshold_hours integer NOT NULL DEFAULT 8,
  created_at timestamp with time zone DEFAULT now()
);

-- Sessions table
CREATE TABLE sessions (
  id uuid PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES job_types(id) ON DELETE SET NULL,
  started_at timestamp with time zone NOT NULL,
  ended_at timestamp with time zone,
  data jsonb NOT NULL,
  notes text,
  reminder_sent_at timestamp with time zone
);

-- Audit log for session edits
CREATE TABLE session_edit_audit_log (
  id uuid PRIMARY KEY,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  edited_at timestamp with time zone DEFAULT now(),
  field_changed text NOT NULL,
  old_value text,
  new_value text,
  note text NOT NULL
);

-- Trigger to populate users and profiles on new auth signup
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
