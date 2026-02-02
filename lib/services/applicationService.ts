import { JobApplication, NewApplicationInput, SkillGap } from '@/lib/types';
import { extractSkills, matchKeywords } from '@/lib/analyzers/atsAnalyzer';

// Save application (for now just returns mock data)
export function saveApplication(input: NewApplicationInput): JobApplication {
  // Extract keywords from job description and resume

  // Extract original-case keywords
  const jdKeywordsRaw = extractSkills(input.jobDescription);
  const cvKeywordsRaw = extractSkills(input.resumeText);

  // Lowercase versions for matching
  const jdKeywords = jdKeywordsRaw.map(k => k.trim()).filter(Boolean);
  const cvKeywords = cvKeywordsRaw.map(k => k.trim()).filter(Boolean);
  const jdKeywordsLower = jdKeywords.map(k => k.toLowerCase());
  const cvKeywordsLower = cvKeywords.map(k => k.toLowerCase());

  // Match using lowercased arrays, but return/display original-case
  const { matched, missing } = matchKeywords(cvKeywordsLower, jdKeywordsLower);
  // Map back to original-case for display
  const matchedSkills = matched.map(lc => jdKeywords[jdKeywordsLower.indexOf(lc)]).filter(Boolean);
  const missingSkills: SkillGap[] = missing.map(lc => ({ skill: jdKeywords[jdKeywordsLower.indexOf(lc)], priority: 'Required' as const })).filter(gap => !!gap.skill);

  const newApp: JobApplication = {
    id: Date.now().toString(),
    ...input,
    applicationDate: new Date(),
    analysis: {
      overallMatch: 0,
      subScores: {
        skillsMatch: jdKeywords.length > 0 ? Math.round((matchedSkills.length / jdKeywords.length) * 100) : 0,
        experienceMatch: 0,
        languageLocationMatch: 0
      },
      matchedSkills,
      missingSkills,
      atsScore: 0,
      atsIssues: [],
      suggestions: [],
      jdKeywords,
      cvKeywords
    }
  };

  return newApp;
}

// Get all applications (placeholder)
export function getAllApplications(): JobApplication[] {
  return [];
}

// Update application status
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function updateApplicationStatus(_id: string, _status: string): boolean {
  // TODO: Implement actual storage
  return true;
}