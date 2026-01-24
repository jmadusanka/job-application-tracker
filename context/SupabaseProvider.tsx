// context/SupabaseProvider.tsx
'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Session, SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface SupabaseContextType {
  supabase: SupabaseClient
  session: Session | null
}

const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined)

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!supabase) {
      console.error('[SupabaseProvider] supabase client is null – check .env.local and restart')
      return
    }

    // Load initial session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        setSession(session)
      })
      .catch((err) => {
        console.error('[SupabaseProvider] getSession failed:', err)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  if (!supabase) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        color: '#dc2626',
        background: '#fef2f2',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>Supabase Not Initialized</h2>
        <p style={{ maxWidth: '500px', marginBottom: '1.5rem' }}>
          The Supabase client could not be created. This is usually caused by missing or incorrect environment variables.
        </p>
        <ul style={{ textAlign: 'left', maxWidth: '600px', marginBottom: '2rem' }}>
          <li>Check that <code>.env.local</code> contains:</li>
          <li style={{ margin: '0.5rem 0' }}>NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co</li>
          <li style={{ margin: '0.5rem 0' }}>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</li>
          <li>Make sure the anon key is the <strong>public anon key</strong> (not service_role)</li>
          <li>Restart the dev server after changes (<code>npm run dev</code>)</li>
        </ul>
        <p>Open terminal and check logs for "[supabase init]" messages.</p>
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