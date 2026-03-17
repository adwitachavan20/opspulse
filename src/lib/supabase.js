import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

// ── Owner credentials (hardcoded — only 1 owner) ──────────────────
export const OWNER_EMAIL = 'adwitaalisha@gmail.com'      // ← change this
export const OWNER_PASSWORD = '12345678'    // ← change this
export const OWNER_PROFILE = {
  name: 'AdwitaAlisha',       // ← change this to owner's name
  role: 'owner',
  title: 'Business Owner',
}