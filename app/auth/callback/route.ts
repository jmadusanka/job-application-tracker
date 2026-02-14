// app/auth/callback/route.ts
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  // Optional: support ?next= param for protected redirect after login
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (!code) {
    return NextResponse.redirect(
      new URL('/login?error=no_code', requestUrl.origin)
    )
  }

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('OAuth code exchange failed:', error.message)
    return NextResponse.redirect(
      new URL(`/login?error=auth_failed&message=${encodeURIComponent(error.message)}`, requestUrl.origin)
    )
  }

  // Success – redirect to dashboard (or 'next' path)
  return NextResponse.redirect(new URL(next, requestUrl.origin))
}