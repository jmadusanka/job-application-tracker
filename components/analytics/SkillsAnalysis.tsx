'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { SkillGap } from '@/lib/types';

interface SkillsAnalysisProps {
  matchedSkills: string[];
  missingSkills: SkillGap[];
  jdKeywords?: string[];
  cvKeywords?: string[];
}

export function SkillsAnalysis({ matchedSkills, missingSkills, jdKeywords = [], cvKeywords = [] }: SkillsAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Skills Analysis & Keyword Extraction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Keywords Section (Temporary Verification) */}
        <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <h4 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-3">
              JD Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {jdKeywords.length > 0 ? (
                jdKeywords.map((k, i) => (
                  <Badge key={i} variant="secondary" className="bg-white border-blue-200 text-blue-700">
                    {k}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No JD keywords extracted</span>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-3">
              CV Keywords
            </h4>
            <div className="flex flex-wrap gap-2">
              {cvKeywords.length > 0 ? (
                cvKeywords.map((k, i) => (
                  <Badge key={i} variant="secondary" className="bg-white border-purple-200 text-purple-700">
                    {k}
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No CV keywords extracted</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Matched Skills */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-slate-900">
                Matched Skills ({matchedSkills.length})
              </h4>
            </div>
            <div className="space-y-2">
              {matchedSkills.length === 0 ? (
                <p className="text-sm text-slate-500">No matched skills found</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((skill) => (
                    <Badge key={skill} variant="success" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Missing Skills */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-slate-900">
                Missing Skills ({missingSkills.length})
              </h4>
            </div>
            <div className="space-y-2">
              {missingSkills.length === 0 ? (
                <p className="text-sm text-slate-500">All required skills matched!</p>
              ) : (
                <div className="space-y-2">
                  {missingSkills.map((gap) => (
                    <div key={gap.skill} className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">{gap.skill}</span>
                      <Badge
                        variant={gap.priority === 'Required' ? 'danger' : 'secondary'}
                        className="text-xs"
                      >
                        {gap.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
