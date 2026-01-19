'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { ATSIssue } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ATSCompatibilityProps {
  atsScore: number;
  atsIssues: ATSIssue[];
}

export function ATSCompatibility({ atsScore, atsIssues }: ATSCompatibilityProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'high') return '🔴';
    if (severity === 'medium') return '🟡';
    return '🔵';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">ATS Compatibility</CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Score:</span>
            <span className={cn('text-2xl font-bold', getScoreColor(atsScore))}>
              {atsScore}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {atsIssues.length === 0 ? (
            <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-green-700 font-medium">
                No major ATS issues detected!
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-amber-700 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {atsIssues.length} issue{atsIssues.length > 1 ? 's' : ''} detected
                </span>
              </div>
              <div className="space-y-3">
                {atsIssues.map((issue, index) => (
                  <div
                    key={index}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{getSeverityIcon(issue.severity)}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={getSeverityVariant(issue.severity)} className="text-xs">
                            {issue.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-slate-500 capitalize">
                            {issue.type}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700">{issue.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
