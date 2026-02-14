// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { CookieOptions } from '@supabase/ssr'  // optional but helps TS

export async function createSupabaseServerClient() {
  // 1. Await the async cookies() – required in Next.js 15+
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Modern pattern: getAll / setAll (preferred in @supabase/ssr >=0.5)
        getAll() {
          return cookieStore.getAll()
        },

        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Ignore errors in Server Components (can't set cookies there anyway)
            // This is safe – middleware or route handlers will handle refresh
          }
        },
      },
    }
  )
}