// proxy.ts    (root level)
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Refresh/validate session if a token exists (lightweight)
    await supabase.auth.getUser()

    return NextResponse.next()
  } catch (err) {
    console.error('[proxy] Supabase proxy error:', err)
    // Fail open — never block the request
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    // Run on almost all pages, but skip static assets, API routes, etc.
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next|api).*)',
  ],
}