// lib/analysis.ts
import { model } from './gemini';
import { AnalysisResults } from './types';
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

export async function generateAnalysis(
  jobDescription: string,
  resumeName: string,
  resumeText: string,
  jobTitle: string
): Promise<AnalysisResults> {
  // Ultra-conservative truncation + trim
  const jdTruncated = jobDescription.slice(0, 3000).trim();
  const resumeTruncated = resumeText.slice(0, 3000).trim();

  const prompt = `
You are an expert ATS resume analyzer. Be EXTREMELY concise and short.

Job Title: ${jobTitle || 'Not provided'}

Job Description (short):
${jdTruncated}

Resume (short):
${resumeTruncated}

Return ONLY valid, COMPLETE JSON matching the schema.
Rules you MUST follow:
- matchedSkills: max 6 items
- missingSkills: max 6 items
- suggestions: max 3 items
- jdKeywords & cvKeywords: max 10 items each
- All strings short and closed properly
- Close every array with ], every object with }
- NO extra text, NO markdown, NO explanations, NO comments
- Do NOT truncate or leave anything open
`;

  try {
    console.log('[generateAnalysis] Prompt length:', prompt.length);
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

    const res = await model.generateContent(prompt);
    let raw = res.response.text()?.trim() || '';

    console.log('[Gemini Raw Response Length]:', raw.length);
    console.log('[Gemini Raw Response Preview]:', raw.substring(0, 400) + (raw.length > 400 ? '...' : ''));

    if (!raw) {
      throw new Error('Gemini returned empty response');
    }
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

    let data;
    try {
      data = JSON.parse(raw);
      console.log('[Gemini Parse Success] Full parsed data:', JSON.stringify(data, null, 2));
    } catch (parseErr: any) {
      console.error('[JSON Parse Failed] Position:', parseErr.message?.match(/position (\d+)/)?.[1] || 'unknown');
      console.error('[Broken JSON snippet (first 400 chars)]:', raw.substring(0, 400));
      throw parseErr;
    }

    return {
      overallMatch: Number(data.overallMatch) ?? 50,
      subScores: {
        skillsMatch: Number(data.subScores?.skillsMatch) ?? 50,
        experienceMatch: Number(data.subScores?.experienceMatch) ?? 50,
        languageLocationMatch: Number(data.subScores?.languageLocationMatch) ?? 90,
      },
      atsScore: Number(data.atsScore) ?? 70,
      matchedSkills: Array.isArray(data.matchedSkills) ? data.matchedSkills.slice(0, 6) : [],
      missingSkills: Array.isArray(data.missingSkills) ? data.missingSkills.slice(0, 6) : [],
      atsIssues: [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : [],
      jdKeywords: Array.isArray(data.jdKeywords) ? data.jdKeywords.slice(0, 10) : [],
      cvKeywords: Array.isArray(data.cvKeywords) ? data.cvKeywords.slice(0, 10) : [],
    };
  } catch (err: any) {
    console.error('[generateAnalysis] FULL ERROR:', err.message || err, err.stack);

    return {
      overallMatch: 50,
      subScores: {
        skillsMatch: 50,
        experienceMatch: 50,
        languageLocationMatch: 90,
      },
      matchedSkills: [],
      missingSkills: [],
      atsScore: 70,
      atsIssues: [
        {
          type: 'formatting',
          severity: 'high',
          message: 'AI response was incomplete or invalid. Try shorter text or retry.',
        },
      ],
      suggestions: [
        {
          category: 'General',
          text: 'Analysis failed - Gemini output was cut off. Shorten resume/job description and try again.',
          priority: 'high',
        },
      ],
      jdKeywords: [],
      cvKeywords: [],
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
  }
}