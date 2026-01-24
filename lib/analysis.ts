// lib/analysis.ts
import { JobApplication, AnalysisResults, NewApplicationInput, Suggestion, SkillGap } from './types'
import { model } from './gemini' // Gemini model

// ── Common tech skills for fallback extraction (semi-mock) ────────────────────────
const TECH_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'Angular',
  'Vue.js', 'Next.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Docker',
  'Kubernetes', 'AWS', 'Azure', 'GCP', 'Git', 'CI/CD', 'REST API', 'GraphQL',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Microservices', 'Agile', 'Scrum',
  'TDD', 'Unit Testing', 'HTML', 'CSS', 'Tailwind CSS', 'Redux', 'SQL',
  'Communication', 'Leadership', 'Problem Solving', 'Team Collaboration'
]

// ── Extract skills from job description (fallback when no AI) ────────────────────
export function extractSkillsFromDescription(description: string): string[] {
  const descriptionLower = description.toLowerCase()
  return TECH_SKILLS.filter(skill =>
    descriptionLower.includes(skill.toLowerCase())
  )
}

// ── Generate real AI suggestions using Gemini ────────────────────────────────────
async function generateAISuggestions(
  jobDescription: string,
  resumeContent: string
): Promise<Suggestion[]> {
  const prompt = `
You are an expert resume writer and career coach.
Analyze this job description and the candidate's resume content (or summary).

Job Title: (inferred from context)
Job Description:
${jobDescription.substring(0, 3500)} ${jobDescription.length > 3500 ? '...' : ''}

Resume Content / Summary:
${resumeContent || 'Resume content not yet parsed (placeholder - filename or summary will be used)'}

Generate **exactly 4 to 6** highly specific, actionable resume improvement suggestions.
Focus on:
- Missing critical keywords from the job description
- Weak professional summary
- Experience bullets lacking impact or quantification
- Skills gaps (technical & soft)
- ATS/formatting issues

For each suggestion return:
- category: one of "Summary", "Experience", "Skills", "Format"
- text: 1-2 clear, professional sentences (actionable advice)
- priority: "high", "medium", or "low"

Output **only** valid JSON — an array of objects. No extra text, no markdown, no explanation.
Example output:
[
  {"category": "Skills", "text": "Add 'Next.js' and 'TypeScript' to your skills section — they appear 12 times in the JD.", "priority": "high"},
  {"category": "Experience", "text": "Quantify achievements: change 'improved performance' to 'improved performance by 40%'.", "priority": "medium"}
]
`

  try {
    const result = await model.generateContent(prompt)
    const responseText = result.response.text().trim()

    // Clean possible code fences or extra whitespace
    const cleaned = responseText
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()

    const parsed = JSON.parse(cleaned)

    if (!Array.isArray(parsed)) {
      throw new Error('Gemini did not return an array')
    }

    // Basic validation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return parsed.filter((item: any) =>
      item &&
      typeof item === 'object' &&
      ['Summary', 'Experience', 'Skills', 'Format'].includes(item.category) &&
      typeof item.text === 'string' &&
      ['high', 'medium', 'low'].includes(item.priority?.toLowerCase())
    ) as Suggestion[]
  } catch (err) {
    console.error('[generateAISuggestions] Error:', err)
    // Fallback mock suggestions when Gemini fails
    return [
      {
        category: 'Skills',
        text: 'Include key technologies mentioned in the JD (e.g., React, TypeScript, AWS) in your skills section.',
        priority: 'high'
      },
      {
        category: 'Summary',
        text: 'Rewrite your professional summary to directly target this role and highlight 2-3 strongest matching experiences.',
        priority: 'high'
      },
      {
        category: 'Experience',
        text: 'Use strong action verbs and add metrics wherever possible (e.g., "increased conversion by 35%").',
        priority: 'medium'
      },
      {
        category: 'Format',
        text: 'Ensure consistent formatting, bullet alignment, and ATS-friendly fonts (Arial/Calibri, 10-12pt).',
        priority: 'medium'
      },
      {
        category: 'Skills',
        text: 'Add soft skills like "Agile methodologies" or "Cross-functional collaboration" if relevant.',
        priority: 'low'
      }
    ]
  }
}

// ── Main analysis generator ──────────────────────────────────────────────────────
export async function generateAnalysis(
  jobDescription: string,
  resumeName: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _jobTitle: string  // Prefixed with _ to indicate intentionally unused
): Promise<AnalysisResults> {
  // Extract skills (fallback method)
  const requiredSkills = extractSkillsFromDescription(jobDescription)

  // Simulate resume skill match (60–95%)
  const matchRatio = 0.6 + Math.random() * 0.35
  const matchCount = Math.floor(requiredSkills.length * matchRatio)
  const matchedSkills = requiredSkills.slice(0, matchCount)

  // Fixed: use literal types that match SkillPriority union
  const missingSkills: SkillGap[] = requiredSkills.slice(matchCount).map(skill => ({
    skill,
    priority: Math.random() > 0.4 
      ? 'Required' as const 
      : 'Nice-to-have' as const
  }))

  // Simulated scores (will be replaced/improved later)
  const overallMatch = Math.floor(55 + Math.random() * 45) // 55–100
  const subScores = {
    skillsMatch: Math.floor(50 + Math.random() * 50),
    experienceMatch: Math.floor(50 + Math.random() * 50),
    languageLocationMatch: Math.floor(60 + Math.random() * 40)
  }

  // Simulated ATS
  const atsScore = Math.floor(60 + Math.random() * 40)
  const atsIssues = [
    { type: 'structure' as const, severity: 'medium' as const, message: 'Consider clearer section headings' },
    { type: 'keyword' as const, severity: 'low' as const, message: 'More job-specific keywords would help' }
  ]

  // ── Resume content for AI ──────────────────────────────────────────────────
  // In real version: parse uploaded PDF/docx here (Manjula's part)
  // For now: use filename or placeholder
  const resumeContentForAI = resumeName.includes('.pdf')
    ? `Resume filename: ${resumeName}. Experienced developer with frontend focus.`
    : resumeName || 'No resume content available yet (upload simulation)'

  // ── Get real or fallback suggestions ───────────────────────────────────────
  const suggestions = await generateAISuggestions(jobDescription, resumeContentForAI)

  return {
    overallMatch,
    subScores,
    matchedSkills,
    missingSkills,
    atsScore,
    atsIssues,
    suggestions
  }
}

// ── Mock applications (for initial load / testing) ──────────────────────────────
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
  
  // Generate simple mock analysis for each (non-async fallback)
  return mockData.map(app => ({
    ...app,
    analysis: generateSimpleAnalysis(app.jobDescription, app.resumeName)
  }));
}

// Simple synchronous analysis for initial mock data
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateSimpleAnalysis(jobDescription: string, _resumeName: string): AnalysisResults {
  const requiredSkills = extractSkillsFromDescription(jobDescription);
  const matchPercentage = 0.6 + Math.random() * 0.3;
  const matchCount = Math.floor(requiredSkills.length * matchPercentage);
  
  const shuffled = [...requiredSkills].sort(() => 0.5 - Math.random());
  const matchedSkills = shuffled.slice(0, matchCount);
  const missingSkillsList = shuffled.slice(matchCount);
  
  const missingSkills: SkillGap[] = missingSkillsList.map((skill, index) => ({
    skill,
    priority: index < missingSkillsList.length / 2 ? 'Required' as const : 'Nice-to-have' as const
  }));
  
  const skillsMatch = requiredSkills.length > 0 
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 85;
  
  const experienceMatch = 70 + Math.floor(Math.random() * 25);
  const languageLocationMatch = 85 + Math.floor(Math.random() * 15);
  
  const overallMatch = Math.round(
    skillsMatch * 0.4 + 
    experienceMatch * 0.3 + 
    languageLocationMatch * 0.3
  );
  
  const atsScore = 65 + Math.floor(Math.random() * 30);
  
  const atsIssues = [
    { type: 'structure' as const, severity: 'medium' as const, message: 'Consider clearer section headings' },
    { type: 'keyword' as const, severity: 'low' as const, message: 'More job-specific keywords would help' }
  ];
  
  const suggestions: Suggestion[] = [
    {
      category: 'Summary' as const,
      text: 'Tailor your professional summary to emphasize relevant experience and highlight key achievements',
      priority: 'high' as const
    },
    {
      category: 'Skills' as const,
      text: 'Consider adding or highlighting missing skills if you have experience with them',
      priority: 'high' as const
    },
    {
      category: 'Format' as const,
      text: 'Use a clean, single-column layout without tables for better ATS compatibility',
      priority: 'medium' as const
    },
    {
      category: 'Experience' as const,
      text: 'Quantify achievements with metrics (e.g., "Increased efficiency by 30%")',
      priority: 'medium' as const
    }
  ];
  
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

// ── Create new application with analysis ───────────────────────────────────────
export async function createApplication(input: NewApplicationInput): Promise<JobApplication> {
  const id = Date.now().toString()
  const analysis = await generateAnalysis(
    input.jobDescription,
    input.resumeName,
    input.jobTitle
  )

  return {
    id,
    ...input,
    applicationDate: new Date(),
    analysis
  }
}