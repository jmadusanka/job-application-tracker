'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { SkillGap } from '@/lib/types';

interface SkillsAnalysisProps {
  matchedSkills: string[];
  missingSkills: SkillGap[];
}

export function SkillsAnalysis({ matchedSkills, missingSkills }: SkillsAnalysisProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Skills Analysis</CardTitle>
      </CardHeader>
      <CardContent>
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
