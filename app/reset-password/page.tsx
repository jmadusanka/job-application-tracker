'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/context/SupabaseProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { supabase } = useSupabase();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError('Please enter your email');
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`, // Redirect after reset
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your email to receive a reset link</CardDescription>
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

              {error && (
                <div className="flex items-center text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-center text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Reset link sent! Check your email.
                </div>
              )}

              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-slate-600">
              <a href="/login" className="hover:underline">Back to login</a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}