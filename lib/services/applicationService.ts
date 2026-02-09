// lib/services/applicationService.ts

import { JobApplication, NewApplicationInput, SkillGap, AnalysisResults } from '@/lib/types';
import { extractSkills, matchKeywords } from '@/lib/analyzers/atsAnalyzer';

/**
 * Creates and returns a new JobApplication object with basic ATS analysis.
 * This is a client-side / mock version — in production, move real analysis + DB save
 * to server actions or API routes.
 */
export function saveApplication(input: NewApplicationInput): JobApplication {
  // Guard against empty/missing inputs
  const jobDescription = input.jobDescription?.trim() || '';
  const resumeText = input.resumeText?.trim() || '';

  // Extract keywords
  const jdKeywordsRaw = extractSkills(jobDescription);
  const cvKeywordsRaw = extractSkills(resumeText);

  // Cleaned versions
  const jdKeywords = jdKeywordsRaw.map(k => k.trim()).filter((k): k is string => !!k);
  const cvKeywords = cvKeywordsRaw.map(k => k.trim()).filter((k): k is string => !!k);

  const jdKeywordsLower = jdKeywords.map(k => k.toLowerCase());
  const cvKeywordsLower = cvKeywords.map(k => k.toLowerCase());

  // Match using lowercase, then map back to original case
  const { matched: matchedLower, missing: missingLower } = matchKeywords(
    cvKeywordsLower,
    jdKeywordsLower
  );

  // Map matched back to original-case JD keywords
  const matchedSkills: string[] = matchedLower
    .map(lc => jdKeywords[jdKeywordsLower.indexOf(lc)])
    .filter((k): k is string => !!k);

  // Build missingSkills – safe version with explicit null check + type guard
  const missingSkills: SkillGap[] = missingLower
    .map((lc): SkillGap | null => {
      const originalSkill = jdKeywords[jdKeywordsLower.indexOf(lc)];
      if (!originalSkill) {
        return null;
      }
      return {
        skill: originalSkill,
        priority: 'Required'
      };
    })
    .filter((gap): gap is SkillGap => gap !== null);   // ← proper type predicate

  // Build full valid AnalysisResults
  const analysis: AnalysisResults = {
    overallMatch: 0,  // Will be updated by real engine later
    subScores: {
      skillsMatch: jdKeywords.length > 0
        ? Math.round((matchedSkills.length / jdKeywords.length) * 100)
        : 0,
      experienceMatch: 50,           // Placeholder
      languageLocationMatch: 80      // Placeholder
    },
    matchedSkills,
    missingSkills,
    atsScore: Math.max(0, 100 - (missingSkills.length * 10)),
    atsIssues: [],
    suggestions: missingSkills.length > 0
      ? [{
          category: 'Skills',
          text: `Add missing skills: ${missingSkills.slice(0, 3).map(s => s.skill).join(', ')}${missingSkills.length > 3 ? '...' : ''}`,
          priority: 'high'
        }]
      : [],
    jdKeywords,
    cvKeywords,
    mustHaveSkills: []  // Required field - empty for now
  };

  // Create full JobApplication shape
  const newApp: JobApplication = {
    id: crypto.randomUUID(),  // Modern, collision-safe ID (browser/Node 14+)
    user_id: undefined,       // Set on real save
    job_title: input.jobTitle,
    company: input.company,
    location: input.location,
    status: input.status,
    channel: input.channel,
    application_date: new Date(),
    job_description: input.jobDescription,
    resume_name: input.resumeName,
    resume_text: input.resumeText,
    resume_file_path: input.resume_file_path,
    analysis,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  return newApp;
}

/**
 * Placeholder: Fetch all applications (replace with Supabase query)
 */
export function getAllApplications(): JobApplication[] {
  return [];
}

/**
 * Placeholder: Update application status (replace with Supabase update)
 */
export function updateApplicationStatus(id: string, status: string): boolean {
  console.log(`[Mock] Updating application ${id} to status: ${status}`);
  return true;
}

/**
 * Optional mock delete
 */
export function deleteApplication(id: string): boolean {
  console.log(`[Mock] Deleting application ${id}`);
  return true;
}