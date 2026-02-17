'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/context/SupabaseProvider';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DemandSkillsView } from '@/components/demand/DemandSkillsView';

export default function DemandPage() {
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
          <h2 className="text-2xl font-bold text-slate-900">Skill Demand</h2>
          <p className="text-sm text-slate-500 mt-1">
            Industry keyword trends across all your analysed job descriptions
          </p>
        </div>
        <DemandSkillsView />
      </div>
    </DashboardLayout>
  );
}
