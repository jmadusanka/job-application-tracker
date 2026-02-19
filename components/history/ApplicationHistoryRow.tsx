'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { JobApplication } from '@/lib/types';
import { scoreColor, scoreBg, formatDate } from '@/lib/utils/historyHelpers';
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

function fillColor(value: number): string {
  if (value >= 80) {
    return 'bg-green-500';
  } else if (value >= 60) {
    return 'bg-amber-500';
  } else {
    return 'bg-red-500';
  }
}

export function ApplicationHistoryRow({ app, index }: { app: JobApplication; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const analysis = app.analysis;

  if (!analysis) {
    return null;
  }

  const overall = analysis.overallMatch ?? 0;

  const jobTitle = app.job_title || 'Untitled';
  const company = app.company || '—';

  const matchedSkills = analysis.matchedSkills ?? [];
  const missingSkills = analysis.missingSkills ?? [];
  const jdKeywords = analysis.jdKeywords ?? [];
  const cvKeywords = analysis.cvKeywords ?? [];
  const mustHaveSkills = analysis.mustHaveSkills ?? [];

  function toggleRow() {
    setExpanded(!expanded);
  }

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={toggleRow}
        className="w-full flex items-center gap-4 px-5 py-4 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <span className="text-xs text-slate-400 w-5 text-center font-mono">{index + 1}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 truncate">
            {jobTitle} <span className="font-normal text-slate-500">@ {company}</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{formatDate(app.application_date)}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-sm font-bold px-2.5 py-1 rounded-full ${scoreBg(overall)}`}>
            {overall}% match
          </span>
          <span className="text-slate-400">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-5 py-5 space-y-5">

          {/* Sub-scores */}
          {analysis.subScores && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Sub-Scores</p>
              <div className="grid grid-cols-3 gap-3">

                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Skills</p>
                  <p className={`text-lg font-bold ${scoreColor(analysis.subScores.skillsMatch ?? 0)}`}>
                    {analysis.subScores.skillsMatch ?? 0}%
                  </p>
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${fillColor(analysis.subScores.skillsMatch ?? 0)}`}
                      style={{ width: `${analysis.subScores.skillsMatch ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Experience</p>
                  <p className={`text-lg font-bold ${scoreColor(analysis.subScores.experienceMatch ?? 0)}`}>
                    {analysis.subScores.experienceMatch ?? 0}%
                  </p>
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${fillColor(analysis.subScores.experienceMatch ?? 0)}`}
                      style={{ width: `${analysis.subScores.experienceMatch ?? 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-slate-200">
                  <p className="text-xs text-slate-500 mb-1">Language</p>
                  <p className={`text-lg font-bold ${scoreColor(analysis.subScores.languageLocationMatch ?? 0)}`}>
                    {analysis.subScores.languageLocationMatch ?? 0}%
                  </p>
                  <div className="mt-1.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${fillColor(analysis.subScores.languageLocationMatch ?? 0)}`}
                      style={{ width: `${analysis.subScores.languageLocationMatch ?? 0}%` }}
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Matched / Missing skills */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <p className="text-xs font-semibold text-slate-700">
                  Matched Skills ({matchedSkills.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.length === 0 && (
                  <span className="text-xs text-slate-400 italic">None</span>
                )}
                {matchedSkills.map((s) => (
                  <Badge key={s} variant="success" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <p className="text-xs font-semibold text-slate-700">
                  Missing Skills ({missingSkills.length})
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.length === 0 && (
                  <span className="text-xs text-slate-400 italic">None</span>
                )}
                {missingSkills.map((g) => (
                  <Badge
                    key={g.skill}
                    variant={g.priority === 'Required' ? 'danger' : 'secondary'}
                    className="text-xs"
                  >
                    {g.skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-white rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">JD Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {jdKeywords.length === 0 && (
                  <span className="text-xs text-slate-400 italic">—</span>
                )}
                {jdKeywords.map((k, i) => (
                  <Badge key={i} variant="secondary" className="bg-white border-blue-200 text-blue-700 text-xs">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-purple-700 uppercase tracking-wide mb-2">CV Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {cvKeywords.length === 0 && (
                  <span className="text-xs text-slate-400 italic">—</span>
                )}
                {cvKeywords.map((k, i) => (
                  <Badge key={i} variant="secondary" className="bg-white border-purple-200 text-purple-700 text-xs">
                    {k}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Must-have skills */}
          {mustHaveSkills.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <p className="text-xs font-semibold text-slate-700">Critical / Must-Have Keywords</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {mustHaveSkills.map((s, i) => (
                  <Badge key={i} variant="warning" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
