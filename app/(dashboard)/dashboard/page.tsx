'use client';

import { useEffect, useState } from 'react';
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
import { SuitabilityEngine } from '@/components/analytics/SuitabilityEngine';
import { Card, CardContent } from '@/components/ui/card';
import { FileSearch } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { session } = useSupabase();
  const { selectedApplication } = useApplications();
  const [showJobDescription, setShowJobDescription] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push('/login');
    }
  }, [session, router]);

  if (!session) {
    return null;
  }

  // Safe resume name with fallback
  const resumeName = selectedApplication?.resume_name ?? 'No resume uploaded';
  const shortResumeName = resumeName.length > 25 
    ? `${resumeName.substring(0, 25)}...` 
    : resumeName;

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
                      <h2 className="text-2xl font-bold text-slate-900 mb-1">
                        {selectedApplication.job_title || 'Untitled Application'}
                      </h2>
                      <p className="text-lg text-slate-600 mb-2">
                        {selectedApplication.company || 'Unknown Company'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>📍 {selectedApplication.location || 'N/A'}</span>
                        <span>
                          📅 Applied{' '}
                          {selectedApplication.application_date
                            ? new Date(selectedApplication.application_date).toLocaleDateString('en-GB', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : 'N/A'}
                        </span>
                        <span>
                          📄{' '}
                          <a
                            href={`/uploads/resumes/${selectedApplication.resume_file_path || 'resume.pdf'}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                            title={resumeName}
                          >
                            {shortResumeName}
                          </a>
                        </span>
                        <span>
                          📋{' '}
                          <button
                            onClick={() => setShowJobDescription(true)}
                            className="text-blue-600 hover:underline"
                          >
                            Job Description
                          </button>
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overall Match Score */}
              <OverallMatchScore score={selectedApplication?.analysis?.overallMatch ?? 0} />

              {/* Sub-Scores */}
              <SubScores 
                subScores={selectedApplication?.analysis?.subScores ?? {
                  skillsMatch: 50,
                  experienceMatch: 50,
                  languageLocationMatch: 90
                }} 
              />

              {/* Suitability Engine */}
              <SuitabilityEngine />

              {/* Skills Analysis */}
              <SkillsAnalysis
                matchedSkills={selectedApplication?.analysis?.matchedSkills ?? []}
                missingSkills={selectedApplication?.analysis?.missingSkills ?? []}
                jdKeywords={selectedApplication?.analysis?.jdKeywords ?? []}
                cvKeywords={selectedApplication?.analysis?.cvKeywords ?? []}
              />

              {/* ATS Compatibility */}
              <ATSCompatibility
                atsScore={selectedApplication?.analysis?.atsScore ?? 70}
                atsIssues={selectedApplication?.analysis?.atsIssues ?? []}
              />

              {/* Improvement Suggestions */}
              <ImprovementSuggestions 
                suggestions={selectedApplication?.analysis?.suggestions ?? []} 
              />
            </>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <FileSearch className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Application Selected
                </h3>
                <p className="text-slate-600 max-w-md mx-auto">
                  Select an application from the list on the left to view its detailed analysis, match score, and improvement suggestions.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Job Description Modal */}
      {showJobDescription && selectedApplication && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowJobDescription(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Job Description</h3>
              <button
                onClick={() => setShowJobDescription(false)}
                className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">
                {selectedApplication.job_description || 'No description available'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}