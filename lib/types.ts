// Core application types

export type ApplicationStatus = 'Analyzed' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
export type ApplicationChannel = 'Email' | 'Company Portal' | 'LinkedIn';
export type SkillPriority = 'Required' | 'Nice-to-have';
export type ATSIssueType = 'structure' | 'keyword' | 'formatting';
export type Severity = 'low' | 'medium' | 'high';
export type SuggestionCategory = 'Summary' | 'Experience' | 'Skills' | 'Format';
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

// ── Extracted Profile from CV ───────────────────────────────────────────────────
export interface ExtractedProfile {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary?: string;
  education?: {
    degree?: string;
    field?: string;
    institution?: string;
    year?: number;
    level?: number; // 1=High School, 2=Associate, 3=Bachelor, 4=Master, 5=PhD
  }[];
  experience?: {
    title?: string;
    company?: string;
    duration?: string;
    yearsOfExperience?: number;
    description?: string;
  }[];
  skills?: string[];
  languages?: {
    language: string;
    proficiency?: 'native' | 'fluent' | 'intermediate' | 'basic';
  }[];
  totalYearsExperience?: number;
}

// ── Extracted Requirements from Job Description ────────────────────────────────
export interface ExtractedJobRequirements {
  requiredSkills: string[];
  preferredSkills?: string[];
  mustHaveSkills?: string[]; // Critical skills that heavily impact score
  requiredYearsExperience?: number;
  requiredEducationLevel?: number; // 1=High School, 2=Associate, 3=Bachelor, 4=Master, 5=PhD
  requiredLanguages?: string[];
}

// ── Suitability Sub-Scores ──────────────────────────────────────────────────────
export interface SuitabilitySubScores {
  skillsScore: number;      // 0-1 (50% weight)
  experienceScore: number;  // 0-1 (25% weight)
  educationScore: number;   // 0-1 (10% weight)
  languageScore: number;    // 0-1 (15% weight)
}

// ── Suitability Result ──────────────────────────────────────────────────────────
export interface SuitabilityResult {
  overallScore: number;           // 0-100 percentage
  subScores: SuitabilitySubScores;
  matchedSkills: string[];
  missingSkills: string[];
  missingMustHaveSkills: string[];
  matchedLanguages: string[];
  missingLanguages: string[];
  hasMustHavePenalty: boolean;
}

export interface AnalysisResults {
  overallMatch: number; // 0-100
  subScores: {
    skillsMatch: number; // 0-100
    experienceMatch: number; // 0-100
    languageLocationMatch: number; // 0-100
  };
  matchedSkills: string[];
  missingSkills: SkillGap[];
  atsScore: number; // 0-100
  atsIssues: ATSIssue[];
  suggestions: Suggestion[];
  jdKeywords: string[];
  cvKeywords: string[];
  
  extractedProfile?: ExtractedProfile;
  extractedJobRequirements?: ExtractedJobRequirements;
  suitability?: SuitabilityResult;
}

export interface JobApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  status: ApplicationStatus;
  channel: ApplicationChannel;
  applicationDate: Date;
  jobDescription: string;
  resumeName: string;
  resumeText: string;
  analysis: AnalysisResults;
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
}

export interface User {
  email: string;
  name: string;
}
