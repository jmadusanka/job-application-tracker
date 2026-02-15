'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/context/SupabaseProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AnalysisHistory } from '@/components/history/AnalysisHistory';

export default function HistoryPage() {
  const router = useRouter();
  const { session } = useSupabase();

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  if (!session) return null;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Analysis History</h2>
          <p className="text-sm text-slate-500 mt-1">
            Track your resume performance and skill gaps over time
          </p>
        </div>
        <AnalysisHistory />
      </div>
    </DashboardLayout>
  );
}
