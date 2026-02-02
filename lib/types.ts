// lib/types.ts
// Core application types

export type ApplicationStatus = 'Analyzed' | 'Applied' | 'Interview' | 'Offer' | 'Rejected';
export type ApplicationChannel = 'Email' | 'Company Portal' | 'LinkedIn';
export type SkillPriority = 'Required' | 'Nice-to-have';
export type ATSIssueType = 'structure' | 'keyword' | 'formatting';
export type Severity = 'low' | 'medium' | 'high';

/**
 * Allowed categories for resume improvement suggestions
 */
export type SuggestionCategory =
  | 'Summary'
  | 'Experience'
  | 'Skills'
  | 'Format'
  | 'General'     // ← Added: useful for fallback / system-level messages
  | 'Other';      // ← Optional extra: catch-all for uncategorized or future needs

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

export interface AnalysisResults {
  overallMatch: number; // 0-100
  subScores: {
    skillsMatch: number;     // 0-100
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

  // Optional richer profile extraction (can be populated later if you enhance parsing)
  extractedProfile?: {
    personalInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      portfolio?: string;
    };
    summary?: string;
    education?: unknown[];     // could be typed more strictly later
    experience?: unknown[];    // could be typed more strictly later
    skills?: string[];
  };
}

/**
 * Shape of data fetched from Supabase (snake_case column names)
 */
export interface JobApplication {
  id: string;
  user_id: string;                    // foreign key to auth.users
  job_title: string;
  company: string;
  location: string;
  status: ApplicationStatus;
  channel: ApplicationChannel;
  application_date: string;           // ISO string from Supabase
  job_description: string;
  resume_name: string;
  resume_text: string;
  resume_file_path?: string;          // path in storage bucket
  analysis: AnalysisResults;
  created_at?: string;
  updated_at?: string;
}

/**
 * Shape of data coming from the form / NewApplicationInput (camelCase is fine here)
 * Used in NewApplicationForm and passed to addApplication
 */
export interface NewApplicationInput {
  jobTitle: string;
  company: string;
  location: string;
  status: ApplicationStatus;
  channel: ApplicationChannel;
  jobDescription: string;
  resumeName: string;
  resumeText: string;
  resume_file_path?: string;          // comes from upload response
  analysis?: AnalysisResults;         // optional, usually added later
}

export interface User {
  email: string;
  name: string;
}