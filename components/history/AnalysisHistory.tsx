'use client';

import { useMemo } from 'react';
import { useApplications } from '@/context/ApplicationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SkillGap } from '@/lib/types';
import { TrendingUp, CheckCircle2, BarChart2 } from 'lucide-react';
import { ApplicationHistoryRow } from './ApplicationHistoryRow';

function cardBg(color: string): string {
  if (color === 'text-green-600') return 'bg-green-100';
  if (color === 'text-amber-600') return 'bg-amber-100';
  if (color === 'text-red-600') return 'bg-red-100';
  if (color === 'text-blue-600') return 'bg-blue-100';
  return 'bg-slate-100';
}

function textColor(score: number): string {
  if (score >= 70) {
    return 'text-green-600';
  } else if (score >= 50) {
    return 'text-amber-600';
  } else {
    return 'text-red-600';
  }
}

function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
}) {
  const bgClass = cardBg(color);

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${bgClass}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnalysisHistory() {
  const { applications, loading } = useApplications();

  const analyzedApps = useMemo(() => {
    const filtered = applications.filter((a) => {
      return a.analysis && typeof a.analysis.overallMatch === 'number';
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.application_date ?? 0).getTime();
      const dateB = new Date(b.application_date ?? 0).getTime();
      return dateA - dateB;
    });

    return filtered;
  }, [applications]);

  const stats = useMemo(() => {
    if (analyzedApps.length === 0) {
      return null;
    }

    let totalScore = 0;
    let best = 0;

    for (let i = 0; i < analyzedApps.length; i++) {
      const score = analyzedApps[i].analysis!.overallMatch;

      totalScore = totalScore + score;

      if (score > best) {
        best = score;
      }
    }

    return {
      total: analyzedApps.length,
      avg: Math.round(totalScore / analyzedApps.length),
      best: best,
    };
  }, [analyzedApps]);

  const commonGaps = useMemo(() => {
    const counts = new Map<string, { count: number; priority: SkillGap['priority'] }>();

    for (const app of analyzedApps) {
      const missingSkills = app.analysis?.missingSkills ?? [];

      for (const gap of missingSkills) {
        const key = gap.skill.toLowerCase();
        const existing = counts.get(key);

        if (existing) {
          existing.count = existing.count + 1;
        } else {
          counts.set(key, { count: 1, priority: gap.priority });
        }
      }
    }

    const list = [];
    for (const [skill, data] of counts.entries()) {
      list.push({ skill, count: data.count, priority: data.priority });
    }

    list.sort((a, b) => b.count - a.count);

    return list.slice(0, 15);
  }, [analyzedApps]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
        Loading history...
      </div>
    );
  }

  if (analyzedApps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <BarChart2 className="w-14 h-14 text-slate-300 mb-4" />
        <p className="text-lg font-semibold text-slate-700">No analyzedApps applications yet</p>
        <p className="text-sm text-slate-400 mt-1">Add applications and run analysis to see your history here.</p>
      </div>
    );
  }

  const matchColor = textColor(stats!.avg);

  const historyList = [...analyzedApps].reverse();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total Analyses"
          value={stats!.total}
          sub="applications analyzedApps"
          icon={BarChart2}
          color="text-blue-600"
        />
        <StatCard
          label="Avg Match Score"
          value={`${stats!.avg}%`}
          sub="across all applications"
          icon={TrendingUp}
          color={matchColor}
        />
        <StatCard
          label="Best Match"
          value={`${stats!.best}%`}
          sub="highest score achieved"
          icon={CheckCircle2}
          color="text-green-600"
        />
      </div>

      {commonGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recurring Skill Gaps</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Skills that keep appearing as missing across your applications
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {commonGaps.map(({ skill, count, priority }) => (
                <div key={skill} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                  <span className="text-sm text-slate-700 capitalize">{skill}</span>
                  <Badge variant={priority === 'Required' ? 'danger' : 'secondary'} className="text-xs">
                    {priority}
                  </Badge>
                  <span className="text-xs font-semibold text-slate-400">×{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Application History</CardTitle>
          <p className="text-xs text-slate-500 mt-0.5">
            Click any row to expand scores, matched/missing skills, and keywords
          </p>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {historyList.map((app, i) => (
            <ApplicationHistoryRow key={app.id} app={app} index={i} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
