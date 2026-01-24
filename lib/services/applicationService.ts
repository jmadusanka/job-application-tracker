import { JobApplication, NewApplicationInput } from '@/lib/types';

// Save application (for now just returns mock data)
export function saveApplication(input: NewApplicationInput): JobApplication {
  const newApp: JobApplication = {
    id: Date.now().toString(),
    ...input,
    applicationDate: new Date(),
    analysis: {
      overallMatch: 0,
      subScores: {
        skillsMatch: 0,
        experienceMatch: 0,
        languageLocationMatch: 0
      },
      matchedSkills: [],
      missingSkills: [],
      atsScore: 0,
      atsIssues: [],
      suggestions: []
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