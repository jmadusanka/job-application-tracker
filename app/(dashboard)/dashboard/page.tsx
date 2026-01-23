'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/context/SupabaseProvider';
import { useApplications } from '@/context/ApplicationContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ApplicationList } from '@/components/applications/ApplicationList';
import { OverallMatchScore } from '@/components/analytics/OverallMatchScore';
import { SubScores } from '@/components/analytics/SubScores';
import { SkillsAnalysis } from '@/components/analytics/SkillsAnalysis';
import { ATSCompatibility } from '@/components/analytics/ATSCompatibility';
import { ImprovementSuggestions } from '@/components/analytics/ImprovementSuggestions';
import { Card, CardContent } from '@/components/ui/card';
import { FileSearch } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { session } = useSupabase();
  const { selectedApplication } = useApplications();

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="grid grid-cols-12 gap-6 h-[calc(100vh-112px)]">
        {/* Left Column - Application List */}
        <div className="col-span-5 overflow-hidden">
          <ApplicationList />
        </div>

        {/* Right Column - Analysis */}
        <div className="col-span-7 overflow-y-auto space-y-6 pr-2">
          {selectedApplication ? (
            <>
              {/* Application Header */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-1">{selectedApplication.jobTitle}</h2>
                      <p className="text-sm text-slate-600">{selectedApplication.company} - {selectedApplication.location}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Applied on {selectedApplication.applicationDate.toLocaleDateString()}</p>
                      <p className="text-sm text-slate-500">Via {selectedApplication.channel}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Match Score */}
              <OverallMatchScore score={selectedApplication.analysis.overallMatch} />

              {/* Sub-Scores */}
              <SubScores subScores={selectedApplication.analysis.subScores} />

              {/* Skills Analysis */}
              <SkillsAnalysis
                matchedSkills={selectedApplication.analysis.matchedSkills}
                missingSkills={selectedApplication.analysis.missingSkills}
              />

              {/* ATS Compatibility */}
              <ATSCompatibility
                atsScore={selectedApplication.analysis.atsScore}
                atsIssues={selectedApplication.analysis.atsIssues}
              />

              {/* Improvement Suggestions */}
              <ImprovementSuggestions suggestions={selectedApplication.analysis.suggestions} />
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <FileSearch className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Application Selected
                </h3>
                <p className="text-slate-600">
                  Select an application from the list to view its analysis
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}