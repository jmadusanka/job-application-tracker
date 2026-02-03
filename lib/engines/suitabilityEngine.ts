/**
 * Suitability Engine - Mathematical CV-Job Matching System
 * 
 * Based on ATS CV Matching System logic:
 * - Skills Match: Matched Skills / Total Job Skills (50% weight)
 * - Experience Score: min(1, Candidate Years / Required Years) (25% weight)
 * - Education Score: min(1, CV Level / Job Level) (10% weight)
 * - Language Proficiency Score: Matched Languages / Required Languages (15% weight)
 * 
 * Must-Have Handling: Missing critical skills heavily reduces the score
 */

import {
  ExtractedProfile,
  ExtractedJobRequirements,
  SuitabilityResult,
  SuitabilitySubScores
} from '../types';

// ── Weight Configuration ────────────────────────────────────────────────────────
const WEIGHTS = {
  skills: 0.50,      // 50%
  experience: 0.25,  // 25%
  language: 0.15,    // 15%
  education: 0.10    // 10%
} as const;

// Penalty multiplier when missing must-have/critical skills
const MUST_HAVE_PENALTY_MULTIPLIER = 0.5;

// ── Helper Functions ────────────────────────────────────────────────────────────

/**
 * Normalize a keyword for comparison (lowercase, trim, remove special chars)
 */
function normalizeKeyword(keyword: string): string {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s\+\#\.]/gi, '')
    .replace(/\s+/g, ' ');
}

/**
 * Check if two keywords match (exact or partial match)
 * Handles cases like "React.js" matching "React" or "JavaScript" matching "JS"
 */
function keywordsMatch(cvKeyword: string, jdKeyword: string): boolean {
  const cv = normalizeKeyword(cvKeyword);
  const jd = normalizeKeyword(jdKeyword);
  
  // Exact match
  if (cv === jd) return true;
  
  // Partial match (one contains the other)
  if (cv.includes(jd) || jd.includes(cv)) return true;
  
  // Common abbreviations and aliases
  const aliases: Record<string, string[]> = {
    'javascript': ['js', 'ecmascript', 'es6', 'es2015'],
    'typescript': ['ts'],
    'react': ['reactjs', 'react.js'],
    'node': ['nodejs', 'node.js'],
    'next': ['nextjs', 'next.js'],
    'vue': ['vuejs', 'vue.js'],
    'angular': ['angularjs', 'angular.js'],
    'python': ['py'],
    'c++': ['cpp', 'cplusplus'],
    'c#': ['csharp', 'c sharp'],
    'postgresql': ['postgres', 'psql'],
    'mongodb': ['mongo'],
    'kubernetes': ['k8s'],
    'amazon web services': ['aws'],
    'google cloud platform': ['gcp'],
    'continuous integration': ['ci', 'ci/cd'],
    'machine learning': ['ml'],
    'artificial intelligence': ['ai'],
    'natural language processing': ['nlp'],
  };

  for (const [main, alts] of Object.entries(aliases)) {
    const allVariants = [main, ...alts];
    const cvMatches = allVariants.some(v => cv.includes(v) || v.includes(cv));
    const jdMatches = allVariants.some(v => jd.includes(v) || v.includes(jd));
    if (cvMatches && jdMatches) return true;
  }

  return false;
}

/**
 * Match CV skills against JD required skills
 */
function matchSkills(
  cvSkills: string[],
  jdRequiredSkills: string[],
  jdMustHaveSkills: string[] = []
): {
  matchedSkills: string[];
  missingSkills: string[];
  missingMustHaveSkills: string[];
  skillsScore: number;
  hasMustHavePenalty: boolean;
} {
  if (jdRequiredSkills.length === 0) {
    return {
      matchedSkills: [],
      missingSkills: [],
      missingMustHaveSkills: [],
      skillsScore: 1,
      hasMustHavePenalty: false
    };
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const jdSkill of jdRequiredSkills) {
    const isMatched = cvSkills.some(cvSkill => keywordsMatch(cvSkill, jdSkill));
    if (isMatched) {
      matchedSkills.push(jdSkill);
    } else {
      missingSkills.push(jdSkill);
    }
  }

  // Check must-have skills separately
  const missingMustHaveSkills: string[] = [];
  for (const mustHave of jdMustHaveSkills) {
    const isMatched = cvSkills.some(cvSkill => keywordsMatch(cvSkill, mustHave));
    if (!isMatched) {
      missingMustHaveSkills.push(mustHave);
    }
  }

  // Base skills score: Matched / Total
  let skillsScore = matchedSkills.length / jdRequiredSkills.length;

  // Apply must-have penalty if any critical skills are missing
  const hasMustHavePenalty = missingMustHaveSkills.length > 0;
  if (hasMustHavePenalty) {
    // Reduce score based on how many must-haves are missing
    const mustHavePenalty = (missingMustHaveSkills.length / jdMustHaveSkills.length) * MUST_HAVE_PENALTY_MULTIPLIER;
    skillsScore = Math.max(0, skillsScore - mustHavePenalty);
  }

  return {
    matchedSkills,
    missingSkills,
    missingMustHaveSkills,
    skillsScore,
    hasMustHavePenalty
  };
}

/**
 * Calculate experience score
 * Formula: min(1, Candidate Years / Required Years)
 */
function calculateExperienceScore(
  candidateYears: number | undefined,
  requiredYears: number | undefined
): number {
  // If no requirement specified, give full score
  if (!requiredYears || requiredYears <= 0) return 1;
  
  // If candidate experience unknown, give partial credit
  if (candidateYears === undefined || candidateYears < 0) return 0.5;
  
  return Math.min(1, candidateYears / requiredYears);
}

/**
 * Calculate education score
 * Formula: min(1, CV Level / Job Level)
 * Education Levels: 1=High School, 2=Associate, 3=Bachelor, 4=Master, 5=PhD
 */
function calculateEducationScore(
  candidateEducationLevel: number | undefined,
  requiredEducationLevel: number | undefined
): number {
  // If no requirement specified, give full score
  if (!requiredEducationLevel || requiredEducationLevel <= 0) return 1;
  
  // If candidate education unknown, give partial credit
  if (candidateEducationLevel === undefined || candidateEducationLevel <= 0) return 0.5;
  
  return Math.min(1, candidateEducationLevel / requiredEducationLevel);
}

/**
 * Extract highest education level from profile
 */
function getHighestEducationLevel(profile: ExtractedProfile): number {
  if (!profile.education || profile.education.length === 0) return 0;
  
  const levels = profile.education
    .map(edu => edu.level || 0)
    .filter(level => level > 0);
  
  if (levels.length === 0) {
    // Try to infer from degree names
    for (const edu of profile.education) {
      const degree = (edu.degree || '').toLowerCase();
      if (degree.includes('phd') || degree.includes('doctorate')) return 5;
      if (degree.includes('master') || degree.includes('msc') || degree.includes('mba')) return 4;
      if (degree.includes('bachelor') || degree.includes('bsc') || degree.includes('ba')) return 3;
      if (degree.includes('associate')) return 2;
      if (degree.includes('high school') || degree.includes('diploma')) return 1;
    }
    return 0;
  }
  
  return Math.max(...levels);
}

/**
 * Match CV languages against JD required languages
 */
function matchLanguages(
  cvLanguages: string[],
  jdRequiredLanguages: string[]
): {
  matchedLanguages: string[];
  missingLanguages: string[];
  languageScore: number;
} {
  if (jdRequiredLanguages.length === 0) {
    return {
      matchedLanguages: [],
      missingLanguages: [],
      languageScore: 1
    };
  }

  const matchedLanguages: string[] = [];
  const missingLanguages: string[] = [];

  for (const jdLang of jdRequiredLanguages) {
    const isMatched = cvLanguages.some(cvLang => 
      normalizeKeyword(cvLang) === normalizeKeyword(jdLang) ||
      normalizeKeyword(cvLang).includes(normalizeKeyword(jdLang)) ||
      normalizeKeyword(jdLang).includes(normalizeKeyword(cvLang))
    );
    
    if (isMatched) {
      matchedLanguages.push(jdLang);
    } else {
      missingLanguages.push(jdLang);
    }
  }

  const languageScore = matchedLanguages.length / jdRequiredLanguages.length;

  return {
    matchedLanguages,
    missingLanguages,
    languageScore
  };
}

// ── Main Suitability Calculation ────────────────────────────────────────────────

/**
 * Calculate overall suitability score between a CV profile and job requirements
 * 
 * @param cvProfile - Extracted profile from candidate's CV
 * @param jobRequirements - Extracted requirements from job description
 * @returns SuitabilityResult with overall score and breakdown
 */
export function calculateSuitability(
  cvProfile: ExtractedProfile,
  jobRequirements: ExtractedJobRequirements
): SuitabilityResult {
  // Get CV skills (combine from profile skills and keywords)
  const cvSkills = cvProfile.skills || [];
  
  // Get CV languages
  const cvLanguages = (cvProfile.languages || []).map(l => l.language);
  
  // Get candidate's total years of experience
  const candidateYears = cvProfile.totalYearsExperience;
  
  // Get highest education level
  const candidateEducationLevel = getHighestEducationLevel(cvProfile);

  // ── Calculate Individual Scores ───────────────────────────────────────────────

  // 1. Skills Score (50% weight)
  const allRequiredSkills = [
    ...jobRequirements.requiredSkills,
    ...(jobRequirements.preferredSkills || [])
  ];
  const skillsResult = matchSkills(
    cvSkills,
    allRequiredSkills,
    jobRequirements.mustHaveSkills || []
  );

  // 2. Experience Score (25% weight)
  const experienceScore = calculateExperienceScore(
    candidateYears,
    jobRequirements.requiredYearsExperience
  );

  // 3. Education Score (10% weight)
  const educationScore = calculateEducationScore(
    candidateEducationLevel,
    jobRequirements.requiredEducationLevel
  );

  // 4. Language Score (15% weight)
  const languageResult = matchLanguages(
    cvLanguages,
    jobRequirements.requiredLanguages || []
  );

  // ── Calculate Weighted Overall Score ──────────────────────────────────────────
  const subScores: SuitabilitySubScores = {
    skillsScore: skillsResult.skillsScore,
    experienceScore,
    educationScore,
    languageScore: languageResult.languageScore
  };

  // Final Formula: (0.5 × Skills) + (0.25 × Experience) + (0.15 × Language) + (0.10 × Education)
  const overallScore = (
    WEIGHTS.skills * subScores.skillsScore +
    WEIGHTS.experience * subScores.experienceScore +
    WEIGHTS.language * subScores.languageScore +
    WEIGHTS.education * subScores.educationScore
  ) * 100;

  return {
    overallScore: Math.round(overallScore * 10) / 10, // Round to 1 decimal
    subScores,
    matchedSkills: skillsResult.matchedSkills,
    missingSkills: skillsResult.missingSkills,
    missingMustHaveSkills: skillsResult.missingMustHaveSkills,
    matchedLanguages: languageResult.matchedLanguages,
    missingLanguages: languageResult.missingLanguages,
    hasMustHavePenalty: skillsResult.hasMustHavePenalty
  };
}

/**
 * Calculate suitability using raw keywords extracted by AI
 * This is a simplified version that uses keyword arrays directly
 */
export function calculateSuitabilityFromKeywords(
  cvKeywords: string[],
  jdKeywords: string[],
  mustHaveKeywords: string[] = [],
  additionalData?: {
    candidateYearsExperience?: number;
    requiredYearsExperience?: number;
    candidateEducationLevel?: number;
    requiredEducationLevel?: number;
    candidateLanguages?: string[];
    requiredLanguages?: string[];
  }
): SuitabilityResult {
  // Create profile and requirements from keywords
  const cvProfile: ExtractedProfile = {
    skills: cvKeywords,
    totalYearsExperience: additionalData?.candidateYearsExperience,
    education: additionalData?.candidateEducationLevel 
      ? [{ level: additionalData.candidateEducationLevel }] 
      : undefined,
    languages: (additionalData?.candidateLanguages || []).map(lang => ({ language: lang }))
  };

  const jobRequirements: ExtractedJobRequirements = {
    requiredSkills: jdKeywords,
    mustHaveSkills: mustHaveKeywords,
    requiredYearsExperience: additionalData?.requiredYearsExperience,
    requiredEducationLevel: additionalData?.requiredEducationLevel,
    requiredLanguages: additionalData?.requiredLanguages
  };

  return calculateSuitability(cvProfile, jobRequirements);
}

// Export weights for external use
export { WEIGHTS };
