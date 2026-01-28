'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '@/context/SupabaseProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle } from 'lucide-react'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState<null | boolean>(null) // null = checking

  const router = useRouter()
  const { supabase } = useSupabase()

  // Validate recovery session (most reliable method)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && session.user) {
        setIsValidSession(true)
      } else {
        // Invalid or expired link
        router.push('/login?message=reset-link-expired')
      }
    }).catch(() => {
      router.push('/login?message=reset-link-expired')
    })
  }, [supabase, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    if (!password || !confirmPassword) {
      setError('Please fill both fields')
      setLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    // Force logout to prevent auto-login
    await supabase.auth.signOut()

    setSuccess(true)

    // Redirect to login with success message
    setTimeout(() => {
      router.push('/login?message=password-updated')
    }, 2000)
  }

  // Show loading while checking session
  if (isValidSession === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Verifying reset link...</p>
      </div>
    )
  }

  if (!isValidSession) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Job Application Tracker
          </h1>
          <p className="text-slate-600">Analytics & Feedback System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Set New Password</CardTitle>
            <CardDescription>
              Enter a strong new password for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm New Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat password"
                />
              </div>

              {error && (
                <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Password updated successfully! Redirecting to login...
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || success}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-slate-600">
              <a href="/login" className="hover:underline">Back to login</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}