// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug logs – very important right now
console.log('[supabase init] NODE_ENV:', process.env.NODE_ENV)
console.log('[supabase init] NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'present' : 'MISSING')
console.log('[supabase init] NEXT_PUBLIC_SUPABASE_ANON_KEY length:', supabaseAnonKey?.length || 'MISSING')
if (supabaseAnonKey) {
  console.log('[supabase init] Anon key starts with:', supabaseAnonKey.slice(0, 10) + '...')
}

let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        flowType: 'pkce',  // Added to force secure PKCE code flow
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
    console.log('[supabase init] Client created SUCCESSFULLY')
  } catch (err) {
    console.error('[supabase init] Failed to create client:', err)
    supabase = null
  }
} else {
  console.error('[supabase init] FAILED – missing URL or ANON_KEY in .env.local')
}

export { supabase }