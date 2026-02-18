'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/context/SupabaseProvider';
import { useApplications } from '@/context/ApplicationContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ApplicationList } from '@/components/applications/ApplicationList';
import { OverallMatchScore } from '@/components/analytics/OverallMatchScore';
import { SkillsAnalysis } from '@/components/analytics/SkillsAnalysis';
import { ImprovementSuggestions } from '@/components/analytics/ImprovementSuggestions';
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

              {/* Overall Match Score (Only if NOT error) */}
              {selectedApplication.analysis?.isError ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-6 pb-6 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">Analysis Failed</h3>
                    <p className="text-red-700 max-w-md mx-auto mb-4">
                      {selectedApplication.analysis.errorMessage || 'Something went wrong while analyzing this application.'}
                    </p>
                    <div className="flex justify-center gap-3">
                      <p className="text-sm text-red-600 italic">
                        Check your API key in the environmental variables and try again.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <OverallMatchScore score={selectedApplication?.analysis?.overallMatch ?? 0} />

                  {/* Skills Analysis */}
                  <SkillsAnalysis
                    matchedSkills={selectedApplication?.analysis?.matchedSkills ?? []}
                    missingSkills={selectedApplication?.analysis?.missingSkills ?? []}
                    jdKeywords={selectedApplication?.analysis?.jdKeywords ?? []}
                    cvKeywords={selectedApplication?.analysis?.cvKeywords ?? []}
                  />

                  {/* Improvement Suggestions */}
                  {(() => {
                    const suggestions = selectedApplication?.analysis?.suggestions ?? [];
                    console.log('Resume Improvement Suggestions API return:', suggestions);
                    return (
                      <ImprovementSuggestions suggestions={suggestions} />
                    );
                  })()}
                </>
              )}
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