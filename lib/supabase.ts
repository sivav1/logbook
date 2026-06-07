// Supabase client initialisation – client‑side and server‑side helpers.
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const createSupabaseServerClient = () =>
  createServerClient({ supabaseUrl, supabaseAnonKey })
