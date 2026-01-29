'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type CvKeywords = {
  candidateName: string;
  source: string;
  keywords: string[];
};

type JobDescriptionKeywords = {
  jobTitle: string;
  company: string;
  source: string;
  keywords: {
    required: string[];
  };
};

type SuitabilityResult = {
  requiredMatch: number;
  overallScore: number;
  matchedRequired: string[];
};

function normalizeKeywords(list: string[]) {
  return list.map((item) => item.trim()).filter(Boolean);
}

function calculateSuitability(
  cv: CvKeywords,
  jd: JobDescriptionKeywords
): SuitabilityResult {
  const cvSet = new Set(
    normalizeKeywords(cv.keywords).map((k) => k.toLowerCase())
  );

  const required = normalizeKeywords(jd.keywords.required);

  const matchedRequired = required.filter((k) =>
    cvSet.has(k.toLowerCase())
  );

  const requiredMatch =
    required.length > 0 ? matchedRequired.length / required.length : 1;

  const overallScore = requiredMatch * 100;

  return {
    requiredMatch,
    overallScore,
    matchedRequired
  };
}

export function SuitabilityEngine() {
  const [cv, setCv] = useState<CvKeywords | null>(null);
  const [jd, setJd] = useState<JobDescriptionKeywords | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const [cvRes, jdRes] = await Promise.all([
          fetch('/sample-data/cv-keywords.json'),
          fetch('/sample-data/job-description-keywords.json')
        ]);

        if (!cvRes.ok || !jdRes.ok) {
          throw new Error('Failed to load sample keyword data.');
        }

        const [cvData, jdData] = await Promise.all([
          cvRes.json(),
          jdRes.json()
        ]);

        if (!active) return;

        setCv(cvData);
        setJd(jdData);
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const result = useMemo(() => {
    if (!cv || !jd) return null;
    return calculateSuitability(cv, jd);
  }, [cv, jd]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>CV Suitability Engine</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !result || !cv || !jd ? (
          <p className="text-sm text-slate-600">
            Loading suitability analysis...
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{cv.source}</p>
                <p className="text-base font-semibold text-slate-900">
                  {cv.candidateName}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm text-slate-500">
                  Overall suitability
                </p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(result.overallScore)}%
                </p>
              </div>
            </div>

            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-800">
                Required match: {Math.round(result.requiredMatch * 100)}%
              </p>
              <p>
                {result.matchedRequired.length}/
                {jd.keywords.required.length} required keywords
              </p>
            </div>

            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-800">
                Job description: {jd.jobTitle} at {jd.company}
              </p>
              <p className="text-xs text-slate-500">
                {jd.source}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
