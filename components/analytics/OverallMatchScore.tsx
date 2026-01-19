'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface OverallMatchScoreProps {
  score: number;
}

export function OverallMatchScore({ score }: OverallMatchScoreProps) {
  const getColor = (score: number) => {
    if (score >= 80) return '#059669'; // green-600
    if (score >= 60) return '#d97706'; // amber-600
    return '#dc2626'; // red-600
  };

  const data = [
    { name: 'Match', value: score },
    { name: 'Gap', value: 100 - score }
  ];

  const color = getColor(score);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Overall Resume Match</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
              >
                <Cell fill={color} />
                <Cell fill="#e2e8f0" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold" style={{ color }}>
              {score}%
            </div>
            <div className="text-sm text-slate-500">Match Score</div>
          </div>
        </div>
        <p className="text-sm text-slate-600 text-center mt-4">
          {score >= 80 && 'Excellent match! Your resume aligns well with this role.'}
          {score >= 60 && score < 80 && 'Good match. Consider highlighting relevant skills.'}
          {score < 60 && 'Moderate match. Review missing skills and requirements.'}
        </p>
      </CardContent>
    </Card>
  );
}
