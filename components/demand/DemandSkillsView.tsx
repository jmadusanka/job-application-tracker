'use client';

import { useMemo } from 'react';
import { useApplications } from '@/context/ApplicationContext';
import { TrendingUp, Briefcase, CheckCircle, XCircle, Award } from 'lucide-react';

function normalizeSkill(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ');
}

function canonicalize(skill: string): string {
  const s = normalizeSkill(skill);
  const map: Record<string, string> = {
    js: 'JavaScript', javascript: 'JavaScript', ecmascript: 'JavaScript', es6: 'JavaScript',
    ts: 'TypeScript', typescript: 'TypeScript',
    react: 'React', reactjs: 'React', 'react.js': 'React',
    'node.js': 'Node.js', nodejs: 'Node.js', node: 'Node.js',
    'next.js': 'Next.js', nextjs: 'Next.js', next: 'Next.js',
    'vue.js': 'Vue.js', vuejs: 'Vue.js', vue: 'Vue.js',
    'angular.js': 'Angular', angularjs: 'Angular', angular: 'Angular',
    python: 'Python', py: 'Python',
    postgresql: 'PostgreSQL', postgres: 'PostgreSQL', psql: 'PostgreSQL',
    mongodb: 'MongoDB', mongo: 'MongoDB',
    kubernetes: 'Kubernetes', k8s: 'Kubernetes',
    aws: 'AWS', 'amazon web services': 'AWS',
    gcp: 'GCP', 'google cloud platform': 'GCP',
    'ci/cd': 'CI/CD', 'continuous integration': 'CI/CD', 'continuous deployment': 'CI/CD',
    ml: 'Machine Learning', 'machine learning': 'Machine Learning',
    ai: 'AI', 'artificial intelligence': 'AI',
    nlp: 'NLP', 'natural language processing': 'NLP',
    docker: 'Docker', git: 'Git', graphql: 'GraphQL',
    'rest api': 'REST API', restapi: 'REST API', rest: 'REST API',
    tailwind: 'Tailwind CSS', 'tailwind css': 'Tailwind CSS',
    css: 'CSS', html: 'HTML', sql: 'SQL',
    redux: 'Redux', prisma: 'Prisma', supabase: 'Supabase',
  };
  return map[s] ?? skill.charAt(0).toUpperCase() + skill.slice(1).toLowerCase();
}

export function DemandSkillsView() {
  const { applications } = useApplications();

  const analyzed = useMemo(
    () => applications.filter(a => a.analysis),
    [applications]
  );

  // Aggregate JD keywords and CV keywords across all applications.
  const { demandMap, allCvSkills, totalJobs } = useMemo(() => {
    const demand: Map<string, Set<string>> = new Map(); // canonical => Set of app IDs
    const cvSet: Set<string> = new Set();
    const total = analyzed.length;

    for (const app of analyzed) {
      const jdKws = app.analysis?.jdKeywords ?? [];
      const cvKws = app.analysis?.cvKeywords ?? [];

      for (const kw of jdKws) {
        const canon = canonicalize(kw);
        if (!demand.has(canon)) demand.set(canon, new Set());
        demand.get(canon)!.add(app.id);
      }

      for (const kw of cvKws) {
        cvSet.add(canonicalize(kw));
      }
    }

    return { demandMap: demand, allCvSkills: cvSet, totalJobs: total };
  }, [analyzed]);

  // Sort by frequency, keep the top skills.
  const ranked = useMemo(() => {
    return Array.from(demandMap.entries())
      .map(([skill, apps]) => ({
        skill,
        count: apps.size,
        pct: Math.round((apps.size / Math.max(totalJobs, 1)) * 100),
        have: allCvSkills.has(skill),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30);
  }, [demandMap, allCvSkills, totalJobs]);

  const chartSkills = ranked.slice(0, 14);
  const uniqueSkillsCount = demandMap.size;
  const coveredCount = ranked.filter(s => s.have).length;
  const coveragePct = ranked.length > 0 ? Math.round((coveredCount / ranked.length) * 100) : 0;
  const topSkill = ranked[0]?.skill ?? '-';
  const maxCount = Math.max(chartSkills[0]?.count ?? 1, 1);

  // Missing high-demand skills.
  const missing = ranked.filter(s => !s.have).slice(0, 8);

  if (analyzed.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <TrendingUp className="w-12 h-12 text-slate-300 mb-4" />
        <p className="text-lg font-semibold text-slate-600">No analyses yet</p>
        <p className="text-sm text-slate-400 mt-1">
          Analyse at least one job description to see industry skill demand.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Jobs Analysed" value={totalJobs} sub="job descriptions" icon={<Briefcase className="w-5 h-5 text-blue-500" />} />
        <StatCard label="Unique Skills" value={uniqueSkillsCount} sub="tracked across JDs" icon={<TrendingUp className="w-5 h-5 text-violet-500" />} />
        <StatCard label="Coverage" value={`${coveragePct}%`} sub={`${coveredCount} of ${ranked.length} skills`} icon={<CheckCircle className="w-5 h-5 text-emerald-500" />} />
        <StatCard label="Top Demand" value={topSkill} sub={`${ranked[0]?.pct ?? 0}% of jobs`} icon={<Award className="w-5 h-5 text-amber-500" />} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-8 bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Top Demanded Skills</h3>
          <p className="text-xs text-slate-500 mb-4">
            Sorted by frequency across all {totalJobs} job descriptions
          </p>

          <div className="space-y-2">
            {chartSkills.map(({ skill, count, pct, have }) => (
              <div key={skill} className="flex items-center gap-3 group">
                <span className="w-32 text-xs text-slate-700 font-medium truncate shrink-0 text-right">{skill}</span>
                <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden relative">
                  <div
                    className={`h-full rounded transition-all ${have ? 'bg-blue-500' : 'bg-rose-400'}`}
                    style={{ width: `${Math.max(4, Math.round((count / maxCount) * 100))}%` }}
                  />
                  <span className="absolute inset-0 flex items-center pl-2 text-[11px] font-medium text-white">
                    {pct}% of jobs
                  </span>
                </div>
                <span className="w-14 text-xs text-slate-500 shrink-0">{count} job{count !== 1 ? 's' : ''}</span>
                {have
                  ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  : <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                }
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-500" />
              <span className="text-xs text-slate-500">In your CV</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-rose-400" />
              <span className="text-xs text-slate-500">Not in CV</span>
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-800">Skill Coverage</h3>
                <p className="text-xs text-slate-500 mt-0.5">Across top {ranked.length} demanded skills</p>
              </div>
              <span className={`text-xl font-bold ${coveragePct >= 70 ? 'text-emerald-600' : coveragePct >= 40 ? 'text-amber-600' : 'text-red-500'}`}>
                {coveragePct}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${coveragePct >= 70 ? 'bg-emerald-500' : coveragePct >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${coveragePct}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5">
              <span>{coveredCount} covered</span>
              <span>{ranked.length - coveredCount} missing</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-1">Priority Skill Gaps</h3>
            <p className="text-xs text-slate-500 mb-3">
              Highest-demand skills not found in your CVs
            </p>

            {missing.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center py-5">
                <CheckCircle className="w-7 h-7 text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-slate-600">Great coverage</p>
                <p className="text-xs text-slate-400 mt-1">All top demanded skills are already covered.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {missing.map(({ skill, count, pct }, i) => (
                  <div key={skill} className="flex items-center gap-2.5 p-2 rounded-lg bg-rose-50 border border-rose-100">
                    <span className="text-[11px] font-bold text-rose-300 w-5 shrink-0">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 truncate">{skill}</p>
                      <p className="text-[10px] text-slate-400">{count} job{count !== 1 ? 's' : ''} | {pct}% market demand</p>
                    </div>
                    <div className="w-10 h-1.5 bg-rose-100 rounded-full overflow-hidden shrink-0">
                      <div className="h-full bg-rose-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Skill Demand Table</h3>
          <p className="text-xs text-slate-500 mt-0.5">Scrollable and compact list of top skills</p>
        </div>

        <div className="max-h-[320px] overflow-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="text-left px-4 py-2.5 text-slate-500 font-medium">#</th>
                <th className="text-left px-3 py-2.5 text-slate-500 font-medium">Skill</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium">Jobs</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium">Demand</th>
                <th className="text-center px-3 py-2.5 text-slate-500 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ranked.map(({ skill, count, pct, have }, i) => (
                <tr key={skill} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2 text-slate-400 font-mono">{i + 1}</td>
                  <td className="px-3 py-2 font-medium text-slate-700">{skill}</td>
                  <td className="px-3 py-2 text-center text-slate-500">{count} job{count !== 1 ? 's' : ''}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2 justify-center">
                      <div className="w-14 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${have ? 'bg-blue-400' : 'bg-rose-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-slate-500 w-7 text-right">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {have
                      ? <CheckCircle className="w-5 h-5 text-emerald-500 mx-auto" />
                      : <XCircle className="w-5 h-5 text-rose-400 mx-auto" />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, sub, icon,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-500 font-medium">{label}</span>
        {icon}
      </div>
      <p className="text-lg font-bold text-slate-800 truncate">{value}</p>
      <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}
