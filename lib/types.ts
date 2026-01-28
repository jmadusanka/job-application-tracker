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
      education?: unknown[];
      experience?: unknown[];
    skills?: string[];
  };
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
