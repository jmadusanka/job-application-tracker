import { JobApplication, AnalysisResults, NewApplicationInput } from './types';
import { model } from './gemini'; // Gemini model

// Common tech skills for extraction (kept for semi-mock)
const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 
  'Vue.js', 'Next.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Docker', 
  'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'REST API', 'GraphQL',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Microservices', 'Agile', 'Scrum',
  'TDD', 'Unit Testing', 'HTML', 'CSS', 'Tailwind CSS', 'Redux', 'SQL',
  'Communication', 'Leadership', 'Problem Solving', 'Team Collaboration'
];

// Extract skills from job description (simulated)
export function extractSkillsFromDescription(description: string): string[] {
  const descriptionLower = description.toLowerCase();
  return TECH_SKILLS.filter(skill => 
    descriptionLower.includes(skill.toLowerCase())
  );
}

// Generate AI-based suggestions using Gemini
async function generateAISuggestions(jobDescription: string, resumeContent: string): Promise<Suggestion[]> {
  const prompt = `
    Analyze the following job description and resume content. Provide improvement suggestions for the resume categorized into Summary, Experience, Skills, Format. 
    For each suggestion, assign a priority: high, medium, low. Output as JSON array of objects with {category, text, priority}.

    Job Description: ${jobDescription}
    Resume Content: ${resumeContent} // Mocked for now; integrate with upload
  `;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Parse JSON (assume Gemini outputs valid JSON)
  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini JSON parse error:', error);
    return []; // Fallback
  }
}

// Generate simulated analysis for a job application (semi-mock, with real AI suggestions)
export async function generateAnalysis(
  jobDescription: string,
  resumeName: string,
  jobTitle: string
): Promise<AnalysisResults> {
  // Extract required skills from job description
  const requiredSkills = extractSkillsFromDescription(jobDescription);
  
  // Simulate resume having some of the required skills (60-90% match)
  const matchPercentage = 0.6 + Math.random() * 0.3;
  const matchCount = Math.floor(requiredSkills.length * matchPercentage);
  const matchedSkills = requiredSkills.slice(0, matchCount);
  const missingSkills = requiredSkills.slice(matchCount).map(skill => ({
    skill,
    priority: Math.random() > 0.5 ? 'Required' : 'Nice-to-have'
  }));

  // Simulate scores
  const overallMatch = Math.floor(Math.random() * 40) + 60; // 60-100
  const subScores = {
    skillsMatch: Math.floor(Math.random() * 40) + 60,
    experienceMatch: Math.floor(Math.random() * 40) + 60,
    languageLocationMatch: Math.floor(Math.random() * 40) + 60,
  };

  // Simulate ATS
  const atsScore = Math.floor(Math.random() * 40) + 60;
  const atsIssues = [
    { type: 'structure', severity: 'medium', message: 'Missing clear section headings' },
    { type: 'keyword', severity: 'low', message: 'Could add more job-specific keywords' },
  ];

  // Mock resume content (replace with real parsed text from Manjula's upload)
  const mockResumeContent = 'Experienced developer with skills in React, Node.js, and AWS. 5 years experience.';

  // Real AI suggestions
  const suggestions = await generateAISuggestions(jobDescription, mockResumeContent);

  return {
    overallMatch,
    subScores,
    matchedSkills,
    missingSkills,
    atsScore,
    atsIssues,
    suggestions,
  };
}

// Generate mock applications (for initial load)
export function generateMockApplications(): JobApplication[] {
  const mockData: Omit<JobApplication, 'id' | 'analysis'>[] = [
    // ... (keep the existing mock data array here, truncated in your original)
    // For brevity, assuming the same as original; call generateAnalysis async if needed, but for init, use sync mock
  ];
  
  return mockData.map(app => ({
    ...app,
    id: Date.now().toString(), // Temp ID
    analysis: {} as AnalysisResults, // For init, use empty; in real, await
  }));
}

// Create new application with generated analysis (async)
export async function createApplication(input: NewApplicationInput): Promise<JobApplication> {
  const id = Date.now().toString();
  const analysis = await generateAnalysis(input.jobDescription, input.resumeName, input.jobTitle);
  
  return {
    id,
    ...input,
    applicationDate: new Date(),
    analysis
  };
}