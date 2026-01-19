'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SubScoresProps {
  subScores: {
    skillsMatch: number;
    experienceMatch: number;
    languageLocationMatch: number;
  };
}

export function SubScores({ subScores }: SubScoresProps) {
  const getColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-amber-600';
    return 'bg-red-600';
  };

  const scores = [
    { label: 'Skills Match', value: subScores.skillsMatch, icon: '💼' },
    { label: 'Experience Level', value: subScores.experienceMatch, icon: '📊' },
    { label: 'Language & Location', value: subScores.languageLocationMatch, icon: '🌍' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Detailed Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {scores.map((score) => (
          <div key={score.label} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700 flex items-center gap-2">
                <span>{score.icon}</span>
                {score.label}
              </span>
              <span className="font-semibold text-slate-900">{score.value}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={cn('h-full transition-all duration-500', getColor(score.value))}
                style={{ width: `${score.value}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
