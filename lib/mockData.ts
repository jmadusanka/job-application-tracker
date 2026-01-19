import { JobApplication, AnalysisResults, NewApplicationInput } from './types';

// Common tech skills for extraction
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

// Generate simulated analysis for a job application
export function generateAnalysis(
  jobDescription: string,
  resumeName: string,
  jobTitle: string
): AnalysisResults {
  // Extract required skills from job description
  const requiredSkills = extractSkillsFromDescription(jobDescription);
  
  // Simulate resume having some of the required skills (60-90% match)
  const matchPercentage = 0.6 + Math.random() * 0.3;
  const matchCount = Math.floor(requiredSkills.length * matchPercentage);
  
  // Randomly select matched skills
  const shuffled = [...requiredSkills].sort(() => 0.5 - Math.random());
  const matchedSkills = shuffled.slice(0, matchCount);
  const missingSkillsList = shuffled.slice(matchCount);
  
  // Create missing skills with priorities
  const missingSkills = missingSkillsList.map((skill, index) => ({
    skill,
    priority: index < missingSkillsList.length / 2 ? 'Required' as const : 'Nice-to-have' as const
  }));
  
  // Calculate skill match score
  const skillsMatch = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 85;
  
  // Generate other sub-scores
  const experienceMatch = 70 + Math.floor(Math.random() * 25);
  const languageLocationMatch = 85 + Math.floor(Math.random() * 15);
  
  // Calculate overall match (weighted average)
  const overallMatch = Math.round(
    skillsMatch * 0.4 + 
    experienceMatch * 0.3 + 
    languageLocationMatch * 0.3
  );
  
  // Generate ATS score
  const atsScore = 65 + Math.floor(Math.random() * 30);
  
  // Generate ATS issues
  const atsIssues = generateATSIssues(atsScore, missingSkills.length);
  
  // Generate suggestions
  const suggestions = generateSuggestions(missingSkills, atsScore, jobTitle);
  
  return {
    overallMatch,
    subScores: {
      skillsMatch,
      experienceMatch,
      languageLocationMatch
    },
    matchedSkills,
    missingSkills,
    atsScore,
    atsIssues,
    suggestions
  };
}

// Generate ATS issues based on score
function generateATSIssues(atsScore: number, missingSkillsCount: number) {
  const issues = [];
  
  if (atsScore < 80) {
    issues.push({
      type: 'structure' as const,
      severity: 'medium' as const,
      message: 'Resume may contain complex formatting that ATS systems struggle to parse'
    });
  }
  
  if (missingSkillsCount > 3) {
    issues.push({
      type: 'keyword' as const,
      severity: 'high' as const,
      message: `Missing ${missingSkillsCount} key skills mentioned in job description`
    });
  }
  
  if (atsScore < 75) {
    issues.push({
      type: 'structure' as const,
      severity: 'medium' as const,
      message: 'Consider using standard section headers like "Experience" and "Education"'
    });
  }
  
  if (Math.random() > 0.5) {
    issues.push({
      type: 'keyword' as const,
      severity: 'low' as const,
      message: 'Some job-specific keywords could be added to improve visibility'
    });
  }
  
  return issues;
}

// Generate improvement suggestions
function generateSuggestions(missingSkills: any[], atsScore: number, jobTitle: string) {
  const suggestions = [];
  
  // Summary suggestions
  suggestions.push({
    category: 'Summary' as const,
    text: `Tailor your professional summary to emphasize ${jobTitle} experience and highlight relevant achievements`,
    priority: 'high' as const
  });
  
  // Experience suggestions
  if (missingSkills.length > 0) {
    suggestions.push({
      category: 'Experience' as const,
      text: `Add specific examples demonstrating ${missingSkills[0].skill} in your work experience`,
      priority: 'high' as const
    });
  }
  
  // Skills suggestions
  if (missingSkills.length > 2) {
    const topMissing = missingSkills.slice(0, 3).map(s => s.skill).join(', ');
    suggestions.push({
      category: 'Skills' as const,
      text: `Consider adding or highlighting these skills if you have them: ${topMissing}`,
      priority: 'high' as const
    });
  }
  
  suggestions.push({
    category: 'Skills' as const,
    text: 'Organize skills into categories (Technical, Tools, Soft Skills) for better readability',
    priority: 'medium' as const
  });
  
  // Format suggestions
  if (atsScore < 80) {
    suggestions.push({
      category: 'Format' as const,
      text: 'Use a clean, single-column layout without tables or text boxes for better ATS compatibility',
      priority: 'high' as const
    });
  }
  
  suggestions.push({
    category: 'Format' as const,
    text: 'Use standard fonts (Arial, Calibri, or Times New Roman) and avoid images or graphics',
    priority: 'medium' as const
  });
  
  suggestions.push({
    category: 'Experience' as const,
    text: 'Quantify achievements with metrics (e.g., "Increased efficiency by 30%")',
    priority: 'medium' as const
  });
  
  return suggestions;
}

// Generate mock job applications
export function generateMockApplications(): JobApplication[] {
  const mockData = [
    {
      id: '1',
      jobTitle: 'Senior Frontend Developer',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      status: 'Interview' as const,
      channel: 'LinkedIn' as const,
      applicationDate: new Date('2026-01-15'),
      resumeName: 'resume_techcorp.pdf',
      jobDescription: 'We are seeking a Senior Frontend Developer with expertise in React, TypeScript, Next.js, and modern web technologies. The ideal candidate will have 5+ years of experience building scalable web applications, strong knowledge of REST API integration, state management with Redux, and experience with Tailwind CSS. Knowledge of CI/CD pipelines and Docker is a plus.'
    },
    {
      id: '2',
      jobTitle: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      status: 'Applied' as const,
      channel: 'Company Portal' as const,
      applicationDate: new Date('2026-01-12'),
      resumeName: 'resume_startupxyz.pdf',
      jobDescription: 'Looking for a Full Stack Engineer proficient in Node.js, Express, React, PostgreSQL, and AWS. You will be responsible for building and maintaining microservices, implementing REST APIs, and working with Docker and Kubernetes. Strong problem-solving skills and experience with Agile methodologies required.'
    },
    {
      id: '3',
      jobTitle: 'React Developer',
      company: 'Digital Innovations Inc',
      location: 'New York, NY',
      status: 'Applied' as const,
      channel: 'Email' as const,
      applicationDate: new Date('2026-01-10'),
      resumeName: 'resume_digital.pdf',
      jobDescription: 'We need a React Developer with strong JavaScript and TypeScript skills. Experience with React hooks, Redux, and modern CSS frameworks like Tailwind CSS is essential. You should be comfortable with Git, unit testing, and working in an Agile Scrum environment.'
    },
    {
      id: '4',
      jobTitle: 'Software Engineer',
      company: 'Enterprise Tech',
      location: 'Austin, TX',
      status: 'Rejected' as const,
      channel: 'LinkedIn' as const,
      applicationDate: new Date('2026-01-05'),
      resumeName: 'resume_enterprise.pdf',
      jobDescription: 'Enterprise Tech is hiring a Software Engineer with experience in Java, Spring Boot, microservices architecture, and cloud platforms (AWS or Azure). Strong understanding of SQL databases, REST APIs, and CI/CD pipelines is required. Experience with Docker and team collaboration skills are essential.'
    },
    {
      id: '5',
      jobTitle: 'Frontend Engineer',
      company: 'CloudNine Systems',
      location: 'Seattle, WA',
      status: 'Applied' as const,
      channel: 'Company Portal' as const,
      applicationDate: new Date('2026-01-08'),
      resumeName: 'resume_cloudnine.pdf',
      jobDescription: 'Seeking a Frontend Engineer skilled in Vue.js, JavaScript, HTML, CSS, and modern frontend tooling. Experience with GraphQL, responsive design, and cross-browser compatibility is important. Good communication and team collaboration abilities are a must.'
    },
    {
      id: '6',
      jobTitle: 'Backend Developer',
      company: 'DataFlow Analytics',
      location: 'Boston, MA',
      status: 'Applied' as const,
      channel: 'Email' as const,
      applicationDate: new Date('2026-01-14'),
      resumeName: 'resume_dataflow.pdf',
      jobDescription: 'DataFlow Analytics needs a Backend Developer with Python, Django, Flask experience. You will work with PostgreSQL, Redis, and build REST APIs. Knowledge of AWS, Docker, and microservices architecture is valuable. Strong problem-solving skills required.'
    },
    {
      id: '7',
      jobTitle: 'Lead Software Engineer',
      company: 'FinTech Solutions',
      location: 'Chicago, IL',
      status: 'Interview' as const,
      channel: 'LinkedIn' as const,
      applicationDate: new Date('2026-01-11'),
      resumeName: 'resume_fintech.pdf',
      jobDescription: 'Lead Software Engineer position requiring expertise in Node.js, TypeScript, React, MongoDB, and AWS. Leadership experience, strong communication skills, and ability to mentor junior developers essential. Experience with TDD, Agile, and CI/CD pipelines required.'
    },
    {
      id: '8',
      jobTitle: 'DevOps Engineer',
      company: 'Infrastructure Pro',
      location: 'Denver, CO',
      status: 'Applied' as const,
      channel: 'Company Portal' as const,
      applicationDate: new Date('2026-01-09'),
      resumeName: 'resume_infrastructure.pdf',
      jobDescription: 'DevOps Engineer role focused on AWS, Docker, Kubernetes, and CI/CD pipeline automation. Experience with infrastructure as code, monitoring tools, and scripting (Python or Bash) required. Strong problem-solving and team collaboration skills necessary.'
    }
  ];
  
  return mockData.map(app => ({
    ...app,
    analysis: generateAnalysis(app.jobDescription, app.resumeName, app.jobTitle)
  }));
}

// Create new application with generated analysis
export function createApplication(input: NewApplicationInput): JobApplication {
  const id = Date.now().toString();
  const analysis = generateAnalysis(input.jobDescription, input.resumeName, input.jobTitle);
  
  return {
    id,
    ...input,
    applicationDate: new Date(),
    analysis
  };
}
