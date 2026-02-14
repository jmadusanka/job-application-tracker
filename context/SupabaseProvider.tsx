// context/SupabaseProvider.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'  // Correct import – from ssr package
import type { SupabaseClient } from '@supabase/supabase-js'

interface SupabaseContextType {
  supabase: SupabaseClient
  session: Session | null
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  // Create browser client with cookie-based storage for PKCE verifier
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (typeof document === 'undefined') return [] // SSR fallback
          return document.cookie.split('; ').map((c) => {
            const [name, ...valueParts] = c.split('=')
            return { name, value: valueParts.join('=') }
          })
        },
        setAll(cookiesToSet) {
          if (typeof document === 'undefined') return // SSR fallback
          cookiesToSet.forEach(({ name, value, options }) => {
            let cookieStr = `${name}=${value}`
            if (options?.maxAge) cookieStr += `; Max-Age=${options.maxAge}`
            if (options?.expires) cookieStr += `; Expires=${options.expires.toUTCString()}`
            if (options?.path) cookieStr += `; Path=${options.path}`
            if (options?.domain) cookieStr += `; Domain=${options.domain}`
            if (options?.secure) cookieStr += '; Secure'
            if (options?.sameSite) cookieStr += `; SameSite=${options.sameSite}`
            document.cookie = cookieStr
          })
        },
      },
    }
  )

  useEffect(() => {
    if (!supabase) {
      console.error('[SupabaseProvider] supabase client is null – check .env.local and restart')
      return
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Fallback UI if env vars missing (unchanged)
  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-red-100 p-6 rounded-lg max-w-md">
          <h3 className="text-lg font-bold text-red-800 mb-4">Supabase Not Initialized</h3>
          <p className="text-red-700 mb-4">Missing .env.local variables. Add these and restart:</p>
          <ul className="list-disc pl-5 text-red-700 text-sm">
            <li>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</li>
            <li>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</li>
            <li>Make sure the anon key is the <strong>public anon key</strong> (not service_role)</li>
            <li>Restart the dev server after changes (<code>npm run dev</code>)</li>
          </ul>
          <p className="text-red-700 mt-4">Open terminal and check logs for "[supabase init]" messages.</p>
        </div>
      </div>
    )
  }

  return (
    <SupabaseContext.Provider value={{ supabase, session }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export function useSupabase() {
  const context = useContext(SupabaseContext)
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider')
  }
  return context
}