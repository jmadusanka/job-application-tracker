import { model } from './gemini';
import {
  JobApplication,
  NewApplicationInput,
  AnalysisResults,
  ExtractedProfile,
  ExtractedJobRequirements,
  // SkillGap,
  // ATSIssue,
  // Suggestion
} from './types';
import { calculateSuitabilityFromKeywords } from './engines/suitabilityEngine';

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
- Years of experience required vs candidate experience
- Education requirements vs candidate education
- Language requirements vs candidate languages
- DYNAMIC WEIGHT ANALYSIS based on job description signals

DO NOT extract:
- Section labels
- Generic HR terms
- Soft or vague words

FORBIDDEN KEYWORDS (must NOT appear in jdKeywords or cvKeywords):
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
  "mustHaveKeywords": string[],
  "scoringWeights": {
    "weights": {
      "skills": number,
      "experience": number,
      "education": number,
      "language": number
    },
    "explanations": {
      "skills": string,
      "experience": string,
      "education": string,
      "language": string
    },
    "signals": {
      "isExperienceHeavy": boolean,
      "isEducationRequired": boolean,
      "isLanguageCritical": boolean,
      "isSkillsHeavy": boolean
    }
  },
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
    "skills": string[],
    "education": [
      {
        "degree": string,
        "field": string,
        "institution": string,
        "year": number,
        "level": number
      }
    ],
    "experience": [
      {
        "title": string,
        "company": string,
        "duration": string,
        "yearsOfExperience": number
      }
    ],
    "languages": [
      {
        "language": string,
        "proficiency": "native" | "fluent" | "intermediate" | "basic"
      }
    ],
    "totalYearsExperience": number
  },
  "extractedJobRequirements": {
    "requiredSkills": string[],
    "preferredSkills": string[],
    "mustHaveSkills": string[],
    "requiredYearsExperience": number,
    "requiredEducationLevel": number,
    "requiredLanguages": string[]
  }
}

WEIGHT CALCULATION RULES (weights MUST sum to 1.0):
Analyze the job description for these signals to determine appropriate weights:

1. SKILLS WEIGHT (0.30 - 0.60):
   - Higher (0.50-0.60) if: Long technical requirements list, many specific tools/frameworks, "expert in", "proficient in"
   - Lower (0.30-0.40) if: Few technical requirements, more focus on soft skills or experience

2. EXPERIENCE WEIGHT (0.15 - 0.35):
   - Higher (0.30-0.35) if: "5+ years", "senior", "lead", "extensive experience required"
   - Medium (0.20-0.25) if: "2-3 years", "mid-level"
   - Lower (0.15-0.20) if: "entry-level", "junior", "fresh graduates welcome", no years mentioned

3. EDUCATION WEIGHT (0.05 - 0.25):
   - Higher (0.20-0.25) if: "PhD required", "Master's degree required", "degree mandatory"
   - Medium (0.10-0.15) if: "Bachelor's required", "degree preferred"
   - Lower (0.05-0.10) if: "or equivalent experience", "degree not required", no education mentioned

4. LANGUAGE WEIGHT (0.05 - 0.25):
   - Higher (0.20-0.25) if: "Must speak Finnish", "Native English required", "bilingual", multiple languages required
   - Medium (0.10-0.15) if: "Finnish is an advantage", specific language mentioned as preferred
   - Lower (0.05-0.10) if: Only English required or no language requirements

EXAMPLE WEIGHT DISTRIBUTIONS:
- Senior Technical Role: skills=0.45, experience=0.30, education=0.10, language=0.15
- Entry-Level Developer: skills=0.55, experience=0.15, education=0.15, language=0.15
- Research Position (PhD): skills=0.35, experience=0.20, education=0.30, language=0.15
- Finland Local Role: skills=0.40, experience=0.25, education=0.10, language=0.25

STRICT INSTRUCTIONS:
1. jdKeywords must contain 15–20 UNIQUE, ATS-relevant, role-specific terms from the job description.
2. cvKeywords must contain ONLY keywords that ACTUALLY APPEAR in the resume text - DO NOT invent, infer, or assume any skills.
3. CRITICAL: For cvKeywords, extract ONLY exact terms or close variations that are explicitly written in the resume.
   - If resume says "React" → include "React"
   - If resume says "JavaScript" → include "JavaScript", but DO NOT add "Java" separately
   - If resume does NOT mention "Docker" anywhere → DO NOT include "Docker"
   - If resume does NOT mention "AWS" anywhere → DO NOT include "AWS"
   - If resume says "GitHub Actions" → include "GitHub Actions", you may include "CI/CD" only if those exact letters appear
4. mustHaveKeywords must contain 3–5 CRITICAL skills that are absolutely required for the role (from JD).
5. Keywords must be concrete, matchable, and technical (e.g., tools, methods, standards).
6. Provide EXACTLY 4–6 actionable improvement suggestions.
7. Education level: 1=High School, 2=Associate, 3=Bachelor, 4=Master, 5=PhD
8. Calculate totalYearsExperience by summing all experience durations.
9. requiredYearsExperience should be extracted from job description (e.g., "3+ years" = 3).
10. ABSOLUTELY DO NOT HALLUCINATE OR INVENT skills that are not explicitly stated in the CV.
11. If a skill is not mentioned in the CV, it should NOT appear in cvKeywords.
12. scoringWeights.weights MUST sum to exactly 1.0.
13. Provide clear explanations for each weight choice based on JD signals.
14. If information is missing, use null or empty array.
15. Output ONLY the JSON object.
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

    // Compute matchedSkills and missingSkills using matchKeywords
    const jdKeywords = Array.isArray(parsed.jdKeywords) ? parsed.jdKeywords : [];
    let cvKeywords = Array.isArray(parsed.cvKeywords) ? parsed.cvKeywords : [];
    const mustHaveKeywords = Array.isArray(parsed.mustHaveKeywords) ? parsed.mustHaveKeywords : [];
    
    // ── VALIDATION: Filter out CV keywords that don't actually appear in the resume ──
    // This prevents AI hallucination of skills
    const resumeTextLower = resumeContent.toLowerCase();
    cvKeywords = cvKeywords.filter((keyword: string) => {
      const keywordLower = keyword.toLowerCase();
      // Check if the keyword or a close variant exists in the resume
      if (resumeTextLower.includes(keywordLower)) return true;
      
      // Handle common variations (e.g., "Node.js" matches "nodejs" or "node")
      const variations = [
        keywordLower.replace(/\./g, ''),           // Remove dots: "Node.js" → "nodejs"
        keywordLower.replace(/\.js$/i, ''),        // Remove .js suffix: "React.js" → "React"
        keywordLower.replace(/-/g, ' '),           // Replace hyphens: "CI-CD" → "CI CD"
        keywordLower.replace(/\s+/g, ''),          // Remove spaces: "CI CD" → "CICD"
      ];
      
      return variations.some(variant => resumeTextLower.includes(variant));
    });

    // Lowercase for matching
    const jdKeywordsLower = jdKeywords.map((k: string) => k.toLowerCase());
    const cvKeywordsLower = cvKeywords.map((k: string) => k.toLowerCase());
    // Import matchKeywords from atsAnalyzer
    const { matchKeywords } = await import('./analyzers/atsAnalyzer');
    const { matched, missing } = matchKeywords(cvKeywordsLower, jdKeywordsLower);
    // Map back to original-case for display
    const matchedSkills = matched.map(lc => jdKeywords[jdKeywordsLower.indexOf(lc)]).filter(Boolean);
    const missingSkills = missing.map(lc => ({ skill: jdKeywords[jdKeywordsLower.indexOf(lc)], priority: 'Required' as const })).filter(gap => !!gap.skill);

    // ── Extract profile and job requirements from AI response ───────────────────
    const extractedProfile: ExtractedProfile = parsed.extractedProfile || {};
    const extractedJobRequirements: ExtractedJobRequirements = parsed.extractedJobRequirements || {
      requiredSkills: jdKeywords,
      mustHaveSkills: mustHaveKeywords
    };

    // ── Extract dynamic weights from AI response ────────────────────────────────
    const extractedWeights = parsed.scoringWeights?.weights || null;
    const weightExplanations = parsed.scoringWeights?.explanations || null;

    // ── Calculate Suitability Score using the Mathematical Engine ───────────────
    const suitability = calculateSuitabilityFromKeywords(
      cvKeywords,
      jdKeywords,
      mustHaveKeywords,
      {
        candidateYearsExperience: extractedProfile.totalYearsExperience,
        requiredYearsExperience: extractedJobRequirements.requiredYearsExperience,
        candidateEducationLevel: extractedProfile.education?.[0]?.level,
        requiredEducationLevel: extractedJobRequirements.requiredEducationLevel,
        candidateLanguages: extractedProfile.languages?.map(l => l.language),
        requiredLanguages: extractedJobRequirements.requiredLanguages,
        customWeights: extractedWeights,
        weightExplanations: weightExplanations
      }
    );

    // ── Build the final analysis results ─────────────────────────────────────────
    return {
      overallMatch: Math.round(suitability.overallScore),
      subScores: {
        skillsMatch: Math.round(suitability.subScores.skillsScore * 100),
        experienceMatch: Math.round(suitability.subScores.experienceScore * 100),
        languageLocationMatch: Math.round(suitability.subScores.languageScore * 100),
      },
      matchedSkills,
      missingSkills,
      atsScore: Math.round(suitability.subScores.skillsScore * 100), // ATS score based on keyword match
      atsIssues: [],
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
      jdKeywords,
      cvKeywords,
      extractedProfile,
      extractedJobRequirements,
      suitability
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