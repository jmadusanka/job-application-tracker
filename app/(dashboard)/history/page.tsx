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
    <DashboardLayout
      title="Analysis History"
      subtitle="Track your resume performance and skill gaps over time"
    >
      <div className="max-w-5xl mx-auto">
        <AnalysisHistory />
      </div>
    </DashboardLayout>
  );
}
