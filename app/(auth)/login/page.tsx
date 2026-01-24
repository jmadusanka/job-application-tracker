// app/(auth)/login/page.tsx
'use client'

import { useState, FormEvent, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/context/SupabaseProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  const { supabase } = useSupabase()

  // Debug: check if client is really working
  useEffect(() => {
    console.log('[LoginPage] Supabase client available:', !!supabase)
    if (supabase) {
      supabase.auth.getSession().then(({ data, error }) => {
        console.log('[LoginPage] Current session check:', { data, error })
      })
    }
  }, [supabase])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('[Login] signInWithPassword error:', signInError)
        setError(signInError.message || 'Invalid login credentials')
        return
      }

      router.push('/dashboard')
    } catch (err) {
      console.error('[Login] Unexpected error:', err)
      setError('Something went wrong. Check console for details.')
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      console.error('[Google SignIn] Error:', err)
      setError('Google sign-in failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Job Application Tracker
          </h1>
          <p className="text-slate-600">
            Analytics & Feedback System
          </p>
          <div className="mt-2">
            <Badge variant="warning">Demo Mode</Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </form>

            <div className="mt-4">
              <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                Sign in with Google
              </Button>
            </div>

            <div className="mt-4 text-center text-sm text-slate-600">
              <a href="/signup" className="hover:underline">Create an account</a> |{' '}
              <a href="/reset-password" className="hover:underline">Forgot password?</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}