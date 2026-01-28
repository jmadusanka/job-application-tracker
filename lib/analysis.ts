import { model } from './gemini';
import {
  JobApplication,
  NewApplicationInput,
  AnalysisResults,
  // SkillGap,
  // ATSIssue,
  // Suggestion
} from './types';

// ── Unified Analysis Prompt ──────────────────────────────────────────────────────
export async function generateAnalysis(
  jobDescription: string,
  resumeName: string,
  resumeText: string,
  jobTitle: string
): Promise<AnalysisResults> {
  const resumeContent = resumeText || resumeName || 'No resume content available';

  const prompt = `
Act as a professional Recruiter and ATS (Applicant Tracking System) Expert.

Analyze the provided Job Description (JD) and the Candidate's Resume Content.

Job Title:
${jobTitle}

Job Description:
${jobDescription.substring(0, 4000)}

Resume Content:
${resumeContent.substring(0, 4000)}

TASK:
Perform an ATS-style semantic analysis focused ONLY on:
- Role-specific skills
- Technical competencies
- Tools & software
- Domain-specific responsibilities

DO NOT extract:
- Section labels
- Generic HR terms
- Soft or vague words

FORBIDDEN KEYWORDS (must NOT appear in output):
role, responsibilities, requirements, experience, education, skills, growth, performance, teamwork, communication skills, leadership

OUTPUT RULES:
- Return ONLY a valid JSON object
- No markdown
- No explanations
- No extra text

Return JSON with EXACTLY this structure:

{
  "jdKeywords": string[],
  "cvKeywords": string[],
  "suggestions": [
    {
      "category": "Summary" | "Experience" | "Skills" | "Format",
      "text": string,
      "priority": "high" | "medium" | "low"
    }
  ],
  "extractedProfile": {
    "personalInfo": {
      "name": string,
      "email": string,
      "phone": string,
      "location": string,
      "linkedin": string,
      "portfolio": string
    },
    "summary": string,
    "skills": string[]
  }
}

STRICT INSTRUCTIONS:
1. jdKeywords must contain 15–20 UNIQUE, ATS-relevant, role-specific terms.
2. cvKeywords must contain 15–20 UNIQUE, ATS-relevant, role-specific terms.
3. Keywords must be concrete, matchable, and technical (e.g., tools, methods, standards).
4. Provide EXACTLY 4–6 actionable improvement suggestions.
5. Do NOT invent skills, experience, or personal information.
6. If information is missing, return an empty string.
7. Output ONLY the JSON object.
`;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Clean possible code fences
    const cleaned = responseText
      .replace(/^```json\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleaned);

    // Basic validation & defaults (Setting scores to 0 as per "Do NOT calculate scores" instruction)
    return {
      overallMatch: 0,
      subScores: {
        skillsMatch: 0,
        experienceMatch: 0,
        languageLocationMatch: 0,
      },
      matchedSkills: [],
      missingSkills: [],
      atsScore: 0,
      atsIssues: [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      jdKeywords: Array.isArray(parsed.jdKeywords) ? parsed.jdKeywords : [],
      cvKeywords: Array.isArray(parsed.cvKeywords) ? parsed.cvKeywords : [],
      extractedProfile: parsed.extractedProfile
    };
  } catch (err) {
    console.error('[generateAnalysis] Gemini Error:', err);
    return generateFallbackAnalysis();
  }
}

// ── Fallback Analysis (Static/Mock) ─────────────────────────────────────────────
function generateFallbackAnalysis(): AnalysisResults {
  return {
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
    suggestions: [
      { category: 'Format', text: 'Gemini analysis failed or was interrupted. Please try again.', priority: 'medium' }
    ],
    jdKeywords: [],
    cvKeywords: [],
    extractedProfile: {
      summary: 'Analysis failed.'
    }
  };
}

// ── Create Application Wrapper ──────────────────────────────────────────────────
export async function createApplication(input: NewApplicationInput): Promise<JobApplication> {
  const id = Date.now().toString()
  const analysis = await generateAnalysis(
    input.jobDescription,
    input.resumeName,
    input.resumeText,
    input.jobTitle
  )

  return {
    id,
    ...input,
    applicationDate: new Date(),
    analysis
  }
}

// ── Mock Data Generator ─────────────────────────────────────────────────────────
export function generateMockApplications(): JobApplication[] {
  // We keep this for the "first-load" experience
  return [
    {
      id: 'mock-1',
      jobTitle: 'Frontend Engineer',
      company: 'Apple',
      location: 'Cupertino, CA',
      status: 'Analyzed',
      channel: 'LinkedIn',
      applicationDate: new Date(),
      jobDescription: 'Seeking expert React developer...',
      resumeName: 'my_resume.pdf',
      resumeText: 'Experience in React and TypeScript...',
      analysis: {
        overallMatch: 85,
        subScores: { skillsMatch: 90, experienceMatch: 80, languageLocationMatch: 100 },
        matchedSkills: ['React', 'TypeScript', 'Tailwind'],
        missingSkills: [{ skill: 'Next.js', priority: 'Required' }],
        atsScore: 92,
        atsIssues: [],
        suggestions: [
          { category: 'Skills', text: 'Add Next.js to your resume.', priority: 'high' }
        ],
        jdKeywords: ['React', 'Next.js', 'TypeScript'],
        cvKeywords: ['React', 'TypeScript', 'JavaScript']
      }
    }
  ];
}