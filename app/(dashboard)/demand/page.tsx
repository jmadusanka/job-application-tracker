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
    <DashboardLayout
      title="Skill Demand"
      subtitle="Industry keyword trends across all your analysed job descriptions"
    >
      <div className="max-w-5xl mx-auto">
        <DemandSkillsView />
      </div>
    </DashboardLayout>
  );
}
