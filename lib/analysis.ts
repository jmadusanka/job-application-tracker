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
  jobTitle: string
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
  // Keep your existing mock data array here
  // For now returning empty or placeholder — replace with real mocks if needed
  return []
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