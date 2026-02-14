'use client'

import { useState, FormEvent, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation' // ← Added/ensured useSearchParams import
import { useSupabase } from '@/context/SupabaseProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'

// Force dynamic rendering to avoid prerender errors during build
export const dynamic = 'force-dynamic'

// Tiny fallback to prevent layout jump
function SuspenseFallback() {
  return <div className="min-h-[40px]" />
}

// Password reset success message
function PasswordResetSuccess() {
  const searchParams = useSearchParams() // safe here
  if (searchParams.get('message') === 'password-updated') {
    return (
      <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-md mb-4">
        <CheckCircle className="w-4 h-4 mr-2" />
        Password updated successfully! Please sign in.
      </div>
    )
  }
  return null
}

// OAuth error display
function OAuthErrorDisplay() {
  const searchParams = useSearchParams() // safe here
  const [error, setError] = useState('')

  useEffect(() => {
    const err = searchParams.get('error')
    const msg = searchParams.get('message')

    if (err === 'no_code') {
      setError('Authentication failed: No authorization code received. Please try again.')
    } else if (err === 'auth_failed') {
      setError(msg || 'Authentication failed. Please check your connection and try again.')
    }

    // Clean URL
    if (err) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  if (!error) return null

  return (
    <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
      <AlertCircle className="w-4 h-4 mr-2" />
      {error}
    </div>
  )
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const router = useRouter()
  const { supabase } = useSupabase()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push('/dashboard')
      }
    })
  }, [supabase, router])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!email || !password) {
      setFormError('Please enter both email and password')
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      setFormError(error.message)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Google Sign-In Error:', error)
      setFormError('Google Sign-In failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and password to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Password reset message – isolated */}
            <Suspense fallback={<SuspenseFallback />}>
              <PasswordResetSuccess />
            </Suspense>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
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

              {formError && (
                <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {formError}
                </div>
              )}

              {/* OAuth error – isolated */}
              <Suspense fallback={<SuspenseFallback />}>
                <OAuthErrorDisplay />
              </Suspense>

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