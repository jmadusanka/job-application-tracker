/**
 * Suitability Engine - Mathematical CV-Job Matching System
 * 
 * Based on ATS CV Matching System logic with DYNAMIC WEIGHTS:
 * - Skills Match: Matched Skills / Total Job Skills (dynamic weight, typically 30-60%)
 * - Experience Score: min(1, Candidate Years / Required Years) (dynamic weight, typically 15-35%)
 * - Education Score: min(1, CV Level / Job Level) (dynamic weight, typically 5-25%)
 * - Language Proficiency Score: Matched Languages / Required Languages (dynamic weight, typically 5-25%)
 * 
 * Weights are extracted from job description signals by AI
 * Must-Have Handling: Missing critical skills heavily reduces the score
 */

import {
  ExtractedProfile,
  ExtractedJobRequirements,
  SuitabilityResult,
  SuitabilitySubScores,
  ScoringWeights,
  WeightExplanation
} from '../types';

// ── Default Weight Configuration (fallback when AI doesn't provide weights) ─────────
const DEFAULT_WEIGHTS: ScoringWeights = {
  skills: 0.50,      // 50%
  experience: 0.25,  // 25%
  education: 0.10,   // 10%
  language: 0.15     // 15%
};

// Penalty multiplier when missing must-have/critical skills
const MUST_HAVE_PENALTY_MULTIPLIER = 0.5;

/**
 * Validate and normalize weights to ensure they sum to ~1.0 (±0.01 tolerance)
 */
function validateWeights(weights: Partial<ScoringWeights> | null | undefined): ScoringWeights {
  if (weights == null) return { ...DEFAULT_WEIGHTS };
  
  const w: ScoringWeights = {
    skills: weights.skills ?? DEFAULT_WEIGHTS.skills,
    experience: weights.experience ?? DEFAULT_WEIGHTS.experience,
    education: weights.education ?? DEFAULT_WEIGHTS.education,
    language: weights.language ?? DEFAULT_WEIGHTS.language
  };
  
  // Validate each weight is a number between 0 and 1
  for (const key of Object.keys(w) as (keyof ScoringWeights)[]) {
    const val = w[key];
    if (typeof val !== 'number' || isNaN(val) || val < 0 || val > 1) {
      return { ...DEFAULT_WEIGHTS };
    }
  }
  
  // Normalize if sum is off (floating-point safety)
  const sum = w.skills + w.experience + w.education + w.language;
  if (Math.abs(sum - 1.0) > 0.01) {
    w.skills /= sum;
    w.experience /= sum;
    w.education /= sum;
    w.language /= sum;
  }
  
  return w;
}

// ── Helper Functions ────────────────────────────────────────────────────────────

function normalizeKeyword(keyword: string): string {
  return keyword
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s\+\#\.]/gi, '')
    .replace(/\s+/g, ' ');
}

function keywordsMatch(cvKeyword: string, jdKeyword: string): boolean {
  const cv = normalizeKeyword(cvKeyword);
  const jd = normalizeKeyword(jdKeyword);
  
  if (cv === jd) return true;
  if (cv.includes(jd) || jd.includes(cv)) return true;
  
  const aliases: Record<string, string[]> = {
    'javascript': ['js', 'ecmascript', 'es6'],
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
    'aws': ['amazon web services'],
    'gcp': ['google cloud platform'],
    'ci/cd': ['continuous integration', 'continuous deployment'],
    'ml': ['machine learning'],
    'ai': ['artificial intelligence'],
    'nlp': ['natural language processing'],
  };

  for (const [main, alts] of Object.entries(aliases)) {
    const variants = [main, ...alts];
    if (variants.some(v => cv.includes(v) || v.includes(cv)) &&
        variants.some(v => jd.includes(v) || v.includes(jd))) {
      return true;
    }
  }

  return false;
}

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
    const matched = cvSkills.some(cv => keywordsMatch(cv, jdSkill));
    if (matched) {
      matchedSkills.push(jdSkill);
    } else {
      missingSkills.push(jdSkill);
    }
  }

  const missingMustHaveSkills = jdMustHaveSkills.filter(mustHave =>
    !cvSkills.some(cv => keywordsMatch(cv, mustHave))
  );

  let skillsScore = matchedSkills.length / jdRequiredSkills.length;

  const hasMustHavePenalty = missingMustHaveSkills.length > 0;
  if (hasMustHavePenalty && jdMustHaveSkills.length > 0) {
    const penaltyRatio = missingMustHaveSkills.length / jdMustHaveSkills.length;
    skillsScore = Math.max(0, skillsScore - penaltyRatio * MUST_HAVE_PENALTY_MULTIPLIER);
  }

  return {
    matchedSkills,
    missingSkills,
    missingMustHaveSkills,
    skillsScore,
    hasMustHavePenalty
  };
}

function calculateExperienceScore(
  candidateYears: number | undefined,
  requiredYears: number | undefined
): number {
  if (!requiredYears || requiredYears <= 0) return 1;
  if (candidateYears === undefined || candidateYears < 0) return 0.5;
  return Math.min(1, candidateYears / requiredYears);
}

function calculateEducationScore(
  candidateLevel: number | undefined,
  requiredLevel: number | undefined
): number {
  if (!requiredLevel || requiredLevel <= 0) return 1;
  if (candidateLevel === undefined || candidateLevel <= 0) return 0.5;
  return Math.min(1, candidateLevel / requiredLevel);
}

function getHighestEducationLevel(profile: ExtractedProfile): number {
  if (!profile.education?.length) return 0;

  let maxLevel = 0;

  for (const edu of profile.education) {
    if (edu.level && edu.level > maxLevel) {
      maxLevel = edu.level;
    }
  }

  if (maxLevel === 0) {
    // Fallback inference from degree name
    for (const edu of profile.education) {
      const deg = (edu.degree || '').toLowerCase();
      if (/phd|doctorate/.test(deg)) return 5;
      if (/master|msc|mba/.test(deg)) return 4;
      if (/bachelor|bsc|ba/.test(deg)) return 3;
      if (/associate/.test(deg)) return 2;
      if (/high school|diploma/.test(deg)) return 1;
    }
  }

  return maxLevel;
}

function matchLanguages(
  cvLanguages: string[],
  requiredLanguages: string[]
): {
  matchedLanguages: string[];
  missingLanguages: string[];
  languageScore: number;
} {
  if (requiredLanguages.length === 0) {
    return { matchedLanguages: [], missingLanguages: [], languageScore: 1 };
  }

  const matched: string[] = [];
  const missing: string[] = [];

  for (const reqLang of requiredLanguages) {
    const matchedLang = cvLanguages.find(cvLang =>
      normalizeKeyword(cvLang) === normalizeKeyword(reqLang) ||
      normalizeKeyword(cvLang).includes(normalizeKeyword(reqLang)) ||
      normalizeKeyword(reqLang).includes(normalizeKeyword(cvLang))
    );

    if (matchedLang) {
      matched.push(reqLang);
    } else {
      missing.push(reqLang);
    }
  }

  const languageScore = matched.length / requiredLanguages.length;

  return { matchedLanguages: matched, missingLanguages: missing, languageScore };
}

// ── Main Suitability Calculation ────────────────────────────────────────────────

export function calculateSuitability(
  cvProfile: ExtractedProfile,
  jobRequirements: ExtractedJobRequirements,
  customWeights?: Partial<ScoringWeights> | null,
  weightExplanations?: WeightExplanation | null
): SuitabilityResult {
  const weights = validateWeights(customWeights);

  const cvSkills = cvProfile.skills || [];
  const cvLanguages = (cvProfile.languages || []).map(l => l.language);
  const candidateYears = cvProfile.totalYearsExperience;
  const candidateEducationLevel = getHighestEducationLevel(cvProfile);

  const allRequiredSkills = [
    ...jobRequirements.requiredSkills,
    ...(jobRequirements.preferredSkills || [])
  ];

  const skillsResult = matchSkills(
    cvSkills,
    allRequiredSkills,
    jobRequirements.mustHaveSkills || []
  );

  const experienceScore = calculateExperienceScore(
    candidateYears,
    jobRequirements.requiredYearsExperience
  );

  const educationScore = calculateEducationScore(
    candidateEducationLevel,
    jobRequirements.requiredEducationLevel
  );

  const languageResult = matchLanguages(
    cvLanguages,
    jobRequirements.requiredLanguages || []
  );

  const subScores: SuitabilitySubScores = {
    skillsScore: skillsResult.skillsScore,
    experienceScore,
    educationScore,
    languageScore: languageResult.languageScore
  };

  const overallScore = (
    weights.skills * subScores.skillsScore +
    weights.experience * subScores.experienceScore +
    weights.language * subScores.languageScore +
    weights.education * subScores.educationScore
  ) * 100;

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    subScores,
    weights,
    weightExplanations: weightExplanations ?? undefined,
    matchedSkills: skillsResult.matchedSkills,
    missingSkills: skillsResult.missingSkills,
    missingMustHaveSkills: skillsResult.missingMustHaveSkills,
    matchedLanguages: languageResult.matchedLanguages,
    missingLanguages: languageResult.missingLanguages,
    hasMustHavePenalty: skillsResult.hasMustHavePenalty
  };
}

/**
 * Simplified version using raw keyword arrays (used by generateAnalysis)
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
    customWeights?: Partial<ScoringWeights> | null;
    weightExplanations?: WeightExplanation | null;
  }
): SuitabilityResult {
  // Build minimal profile from keywords + additional data
  const cvProfile: ExtractedProfile = {
    personalInfo: {
      name: null,
      email: null,
      phone: null,
      location: null,
      linkedin: null,
      portfolio: null
    },
    summary: null,
    skills: cvKeywords,
    education: additionalData?.candidateEducationLevel != null
      ? [{ 
          degree: null,
          field: null,
          institution: null,
          year: null,
          level: additionalData.candidateEducationLevel 
        }]
      : [],
    experience: [],
    languages: (additionalData?.candidateLanguages || []).map(lang => ({
      language: lang,
      proficiency: null
    })),
    totalYearsExperience: additionalData?.candidateYearsExperience ?? 0
  };

  const jobRequirements: ExtractedJobRequirements = {
    requiredSkills: jdKeywords,
    preferredSkills: [],
    mustHaveSkills: mustHaveKeywords,
    requiredYearsExperience: additionalData?.requiredYearsExperience ?? 0,
    requiredEducationLevel: additionalData?.requiredEducationLevel ?? 0,
    requiredLanguages: additionalData?.requiredLanguages ?? []
  };

  return calculateSuitability(
    cvProfile,
    jobRequirements,
    additionalData?.customWeights,
    additionalData?.weightExplanations
  );
}

export { DEFAULT_WEIGHTS };