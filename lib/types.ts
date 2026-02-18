// lib/types.ts
// Core application types

export type ApplicationStatus = 'Analyzed' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
export type ApplicationChannel = 'Email' | 'Company Portal' | 'LinkedIn';
export type SkillPriority = 'Required' | 'Nice-to-have';
export type ATSIssueType = 'structure' | 'keyword' | 'formatting' | 'ai_failure'; // ← added ai_failure
export type Severity = 'low' | 'medium' | 'high';

export type SuggestionCategory =
  | 'Summary'
  | 'Experience'
  | 'Skills'
  | 'Format'
  | 'General'
  | 'Other';

export type SuggestionPriority = 'high' | 'medium' | 'low';

export interface SkillGap {
  skill: string;
  priority: SkillPriority;
}

export interface ATSIssue {
  type: ATSIssueType;
  severity: Severity;
  message: string;
}

export interface Suggestion {
  category: SuggestionCategory;
  text: string;
  priority: SuggestionPriority;
}

// ── Extracted from Resume ───────────────────────────────────────────────────────
export interface ExtractedProfile {
  personalInfo: {
    name: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
    linkedin: string | null;
    portfolio: string | null;
  };
  summary: string | null;
  education: Array<{
    degree: string | null;
    field: string | null;
    institution: string | null;
    year: number | null;
    level: number | null; // 1=HS, 2=Assoc, 3=Bachelor, 4=Master, 5=PhD
  }>;
  experience: Array<{
    title: string | null;
    company: string | null;
    duration: string | null;
    yearsOfExperience: number | null;
    description?: string | null;
  }>;
  skills: string[];
  languages: Array<{
    language: string;
    proficiency: 'native' | 'fluent' | 'intermediate' | 'basic' | null;
  }>;
  totalYearsExperience: number;
}

// ── Extracted from Job Description ──────────────────────────────────────────────
export interface ExtractedJobRequirements {
  requiredSkills: string[];
  preferredSkills: string[];
  mustHaveSkills: string[];           // ← made required + always array
  requiredYearsExperience: number;    // ← made required + number (use 0 when unknown)
  requiredEducationLevel: number;     // ← made required + number (use 0 when unknown)
  requiredLanguages: string[];
}

// ── Dynamic Scoring Weights ─────────────────────────────────────────────────────
export interface ScoringWeights {
  skills: number;
  experience: number;
  education: number;
  language: number;
}

export interface WeightExplanation {
  skills: string;
  experience: string;
  education: string;
  language: string;
}

export interface ExtractedWeights {
  weights: ScoringWeights;
  explanations: WeightExplanation;
  signals: {
    isExperienceHeavy: boolean;
    isEducationRequired: boolean;
    isLanguageCritical: boolean;
    isSkillsHeavy: boolean;
  };
}

// ── Suitability Calculation Result ──────────────────────────────────────────────
export interface SuitabilitySubScores {
  skillsScore: number;      // 0–1
  experienceScore: number;  // 0–1
  educationScore: number;   // 0–1
  languageScore: number;    // 0–1
}

export interface SuitabilityResult {
  overallScore: number;           // 0–100
  subScores: SuitabilitySubScores;
  weights: ScoringWeights;
  weightExplanations?: WeightExplanation;
  matchedSkills: string[];
  missingSkills: string[];
  missingMustHaveSkills: string[];
  matchedLanguages: string[];
  missingLanguages: string[];
  hasMustHavePenalty: boolean;
}

// ── Main Analysis Result ────────────────────────────────────────────────────────
export interface AnalysisResults {
  overallMatch: number;           // 0–100
  subScores: {
    skillsMatch: number;          // 0–100
    experienceMatch: number;      // 0–100
    languageLocationMatch: number;// 0–100
  };
  atsScore: number;               // 0–100
  matchedSkills: string[];
  missingSkills: SkillGap[];
  atsIssues: ATSIssue[];
  suggestions: Suggestion[];
  jdKeywords: string[];
  cvKeywords: string[];
  mustHaveSkills: string[];       // ← added here (critical keywords)

  isError?: boolean;              // NEW: Explicit error flag
  errorMessage?: string;          // NEW: Clear error message for the UI

  extractedProfile?: ExtractedProfile;
  extractedJobRequirements?: ExtractedJobRequirements;
  suitability?: SuitabilityResult;
}

// ── Supabase / Form shapes ──────────────────────────────────────────────────────
export interface JobApplication {
  id: string;
  user_id?: string;
  job_title?: string;
  company?: string;
  location?: string;
  status?: ApplicationStatus;
  channel?: ApplicationChannel;
  application_date: Date | string | null;
  job_description?: string;
  resume_name?: string;
  resume_text?: string;
  resume_file_path?: string;
  analysis?: AnalysisResults;
  created_at?: string;
  updated_at?: string;
}

export interface NewApplicationInput {
  jobTitle: string;
  company: string;
  location: string;
  status: ApplicationStatus;
  channel: ApplicationChannel;
  jobDescription: string;
  resumeName: string;
  resumeText: string;
  resume_file_path?: string;
  analysis?: AnalysisResults;
}

export interface User {
  email: string;
  name: string;
}