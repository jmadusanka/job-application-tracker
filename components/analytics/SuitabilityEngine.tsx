'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SuitabilityResult } from '@/lib/types';
import { DEFAULT_WEIGHTS } from '@/lib/engines/suitabilityEngine';

interface SuitabilityEngineProps {
  suitability?: SuitabilityResult;
  cvKeywords?: string[];
  jdKeywords?: string[];
  candidateName?: string;
  jobTitle?: string;
  company?: string;
}

/**
 * Displays the suitability score breakdown based on the mathematical engine:
 * Uses DYNAMIC WEIGHTS extracted from job description by AI
 * - Skills Match (dynamic weight based on JD signals)
 * - Experience Score (dynamic weight based on seniority level)
 * - Language Score (dynamic weight based on language requirements)
 * - Education Score (dynamic weight based on education requirements)
 */
export function SuitabilityEngine({
  suitability,
  cvKeywords = [],
  jdKeywords = [],
  candidateName = 'Candidate',
  jobTitle = 'Position',
  company = 'Company'
}: SuitabilityEngineProps) {
  const [showExplanations, setShowExplanations] = useState(false);

  // Use weights from suitability result, or default weights
  const weights = suitability?.weights || DEFAULT_WEIGHTS;
  
  const scoreColor = useMemo(() => {
    if (!suitability) return 'text-slate-500';
    const score = suitability.overallScore;
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  }, [suitability]);

  const getScoreBarColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    if (score >= 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  if (!suitability) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>CV Suitability Engine</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Loading suitability analysis...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>CV Suitability Engine</span>
          {suitability.weightExplanations && (
            <button
              onClick={() => setShowExplanations(!showExplanations)}
              className="text-xs font-normal text-blue-600 hover:text-blue-800"
            >
              {showExplanations ? 'Hide' : 'Show'} weight reasoning
            </button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Header with overall score */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Candidate</p>
            <p className="text-base font-semibold text-slate-900">
              {candidateName}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-500">Overall Suitability</p>
            <p className={`text-3xl font-bold ${scoreColor}`}>
              {suitability.overallScore.toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Must-have penalty warning */}
        {suitability.hasMustHavePenalty && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ Missing Critical Skills
            </p>
            <p className="text-xs text-red-600 mt-1">
              {suitability.missingMustHaveSkills.join(', ')}
            </p>
          </div>
        )}

        {/* Score breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-800">Score Breakdown (Dynamic Weights)</h4>
          
          {/* Weight explanations panel */}
          {showExplanations && suitability.weightExplanations && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2">
              <p className="text-xs font-medium text-blue-800">Why these weights?</p>
              <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                <div><strong>Skills:</strong> {suitability.weightExplanations.skills}</div>
                <div><strong>Experience:</strong> {suitability.weightExplanations.experience}</div>
                <div><strong>Language:</strong> {suitability.weightExplanations.language}</div>
                <div><strong>Education:</strong> {suitability.weightExplanations.education}</div>
              </div>
            </div>
          )}
          
          {/* Skills Score */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Skills Match ({Math.round(weights.skills * 100)}%)</span>
              <span className="font-medium">{Math.round(suitability.subScores.skillsScore * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreBarColor(suitability.subScores.skillsScore)} transition-all duration-300`}
                style={{ width: `${suitability.subScores.skillsScore * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {suitability.matchedSkills.length}/{suitability.matchedSkills.length + suitability.missingSkills.length} skills matched
            </p>
          </div>

          {/* Experience Score */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Experience ({Math.round(weights.experience * 100)}%)</span>
              <span className="font-medium">{Math.round(suitability.subScores.experienceScore * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreBarColor(suitability.subScores.experienceScore)} transition-all duration-300`}
                style={{ width: `${suitability.subScores.experienceScore * 100}%` }}
              />
            </div>
          </div>

          {/* Language Score */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Language Proficiency ({Math.round(weights.language * 100)}%)</span>
              <span className="font-medium">{Math.round(suitability.subScores.languageScore * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreBarColor(suitability.subScores.languageScore)} transition-all duration-300`}
                style={{ width: `${suitability.subScores.languageScore * 100}%` }}
              />
            </div>
            {suitability.matchedLanguages.length > 0 && (
              <p className="text-xs text-slate-500">
                {suitability.matchedLanguages.length}/{suitability.matchedLanguages.length + suitability.missingLanguages.length} languages matched
              </p>
            )}
          </div>

          {/* Education Score */}
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Education ({Math.round(weights.education * 100)}%)</span>
              <span className="font-medium">{Math.round(suitability.subScores.educationScore * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getScoreBarColor(suitability.subScores.educationScore)} transition-all duration-300`}
                style={{ width: `${suitability.subScores.educationScore * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Skills details */}
        <div className="space-y-3 pt-2 border-t border-slate-200">
          {/* Matched Skills */}
          {suitability.matchedSkills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">✓ Matched Skills</p>
              <div className="flex flex-wrap gap-1">
                {suitability.matchedSkills.slice(0, 10).map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {suitability.matchedSkills.length > 10 && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                    +{suitability.matchedSkills.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Missing Skills */}
          {suitability.missingSkills.length > 0 && (
            <div>
              <p className="text-sm font-medium text-orange-700 mb-1">✗ Missing Skills</p>
              <div className="flex flex-wrap gap-1">
                {suitability.missingSkills.slice(0, 10).map((skill, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 bg-orange-100 text-orange-800 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {suitability.missingSkills.length > 10 && (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                    +{suitability.missingSkills.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Job info footer */}
        <div className="text-sm text-slate-600 pt-2 border-t border-slate-200">
          <p className="font-medium text-slate-800">
            {jobTitle} at {company}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Formula: ({Math.round(weights.skills * 100)}% × Skills) + ({Math.round(weights.experience * 100)}% × Experience) + ({Math.round(weights.language * 100)}% × Language) + ({Math.round(weights.education * 100)}% × Education)
          </p>
          <p className="text-xs text-blue-600 mt-1">
            💡 Weights are dynamically calculated based on job description signals
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
