// lib/analysis.ts
import { model } from './gemini';
import {
  AnalysisResults,
  ExtractedProfile,
  ExtractedJobRequirements,
} from './types';
import { calculateSuitabilityFromKeywords } from './engines/suitabilityEngine';

// TEMPORARY STUB - replace with real implementation later
async function matchKeywords(cvKeywords: string[], jdKeywords: string[]) {
  const cvLower = new Set(cvKeywords.map(k => k.toLowerCase()));
  const matched: string[] = [];
  const missing: string[] = [];
  
  jdKeywords.forEach(keyword => {
    const lower = keyword.toLowerCase();
    if (cvLower.has(lower)) {
      matched.push(lower);
    } else {
      missing.push(lower);
    }
  });
  
  return { matched, missing };
}

export async function generateAnalysis(
  jobDescription: string,
  resumeName: string,
  resumeText: string,
  jobTitle: string
): Promise<AnalysisResults> {
  // Truncate to avoid token limits
  const jdTruncated = jobDescription.slice(0, 3000).trim();
  const resumeTruncated = resumeText.slice(0, 3000).trim();

  const prompt = `
You are an expert ATS resume analyzer. Return ONLY valid JSON.

Job Title: ${jobTitle || 'Not provided'}
Job Description: ${jdTruncated}
Resume: ${resumeTruncated}

Schema:
{
  "jdKeywords": ["keyword1", "keyword2"],
  "cvKeywords": ["keyword1"],
  "mustHaveKeywords": ["critical1", "critical2"],
  "scoringWeights": {
    "weights": {"skills": 0.4, "experience": 0.3, "education": 0.2, "language": 0.1},
    "explanations": {"skills": "Many tech reqs", "experience": "3+ years", "education": "Bachelor", "language": "English"},
    "signals": {"isExperienceHeavy": true, "isEducationRequired": false, "isLanguageCritical": false, "isSkillsHeavy": true}
  },
  "suggestions": [{"category": "Skills", "text": "Add Docker", "priority": "high"}],
  "extractedProfile": {
    "personalInfo": {"name": "John Doe", "email": null, "phone": null, "location": null, "linkedin": null, "portfolio": null},
    "summary": "Senior developer",
    "skills": ["React", "Node"],
    "education": [{"degree": "BSc", "field": "CS", "institution": "Uni", "year": 2020, "level": 3}],
    "experience": [{"title": "Dev", "company": "ABC", "duration": "2 years", "yearsOfExperience": 2}],
    "languages": [{"language": "English", "proficiency": "fluent"}],
    "totalYearsExperience": 2
  },
  "extractedJobRequirements": {
    "requiredSkills": ["React", "Node"],
    "preferredSkills": ["AWS"],
    "mustHaveSkills": ["React"],
    "requiredYearsExperience": 3,
    "requiredEducationLevel": 3,
    "requiredLanguages": ["English"]
  }
}
`;

  try {
    console.log('[generateAnalysis] Sending prompt (length):', prompt.length);

    const res = await model.generateContent(prompt);
    let raw = res.response.text()?.trim() ?? '';

    if (!raw) {
      throw new Error('Model returned empty response');
    }

    // Clean markdown fences
    raw = raw.replace(/^```json?\s*/i, '').replace(/\s*```$/i, '').trim();

    const parsed = JSON.parse(raw);

    // ── Filter hallucinated CV keywords ───────────────────────────────
    const resumeTextLower = resumeText.toLowerCase();
    let cvKeywords: string[] = Array.isArray(parsed.cvKeywords) ? parsed.cvKeywords : [];
    cvKeywords = cvKeywords.filter((kw: any): kw is string => {
      if (typeof kw !== 'string') return false;
      const k = kw.toLowerCase().trim();
      return resumeTextLower.includes(k) || 
             resumeTextLower.includes(k.replace(/\./g, '')) ||
             resumeTextLower.includes(k.replace(/\.js$/i, ''));
    });

    const jdKeywords: string[] = Array.isArray(parsed.jdKeywords) ? parsed.jdKeywords.slice(0, 20) : [];
    const mustHaveKeywords: string[] = Array.isArray(parsed.mustHaveKeywords) ? parsed.mustHaveKeywords.slice(0, 10) : [];

    // ── Keyword matching ─────────────────────────────────────────────
    const { matched, missing } = await matchKeywords(cvKeywords, jdKeywords);

    const matchedSkills = matched
      .map((lc: string) => jdKeywords.find(k => k.toLowerCase() === lc)?.toString() || lc)
      .filter(Boolean) as string[];

    const missingSkills = missing.slice(0, 10).map((lc: string) => ({
      skill: jdKeywords.find(k => k.toLowerCase() === lc)?.toString() || lc,
      priority: 'Required' as const,
    }));

    // ── Safe extraction with proper null handling ───────────────────
    const extractedProfile: ExtractedProfile = {
      personalInfo: {
        name: typeof parsed.extractedProfile?.personalInfo?.name === 'string' ? parsed.extractedProfile.personalInfo.name : null,
        email: typeof parsed.extractedProfile?.personalInfo?.email === 'string' ? parsed.extractedProfile.personalInfo.email : null,
        phone: typeof parsed.extractedProfile?.personalInfo?.phone === 'string' ? parsed.extractedProfile.personalInfo.phone : null,
        location: typeof parsed.extractedProfile?.personalInfo?.location === 'string' ? parsed.extractedProfile.personalInfo.location : null,
        linkedin: typeof parsed.extractedProfile?.personalInfo?.linkedin === 'string' ? parsed.extractedProfile.personalInfo.linkedin : null,
        portfolio: typeof parsed.extractedProfile?.personalInfo?.portfolio === 'string' ? parsed.extractedProfile.personalInfo.portfolio : null,
      },
      summary: typeof parsed.extractedProfile?.summary === 'string' ? parsed.extractedProfile.summary : null,
      skills: Array.isArray(parsed.extractedProfile?.skills) ? parsed.extractedProfile.skills : [],
      education: Array.isArray(parsed.extractedProfile?.education) ? parsed.extractedProfile.education : [],
      experience: Array.isArray(parsed.extractedProfile?.experience) ? parsed.extractedProfile.experience : [],
      languages: Array.isArray(parsed.extractedProfile?.languages) ? parsed.extractedProfile.languages : [],
      totalYearsExperience: typeof parsed.extractedProfile?.totalYearsExperience === 'number' ? parsed.extractedProfile.totalYearsExperience : 0,
    };

    const extractedJobRequirements: ExtractedJobRequirements = {
      requiredSkills: Array.isArray(parsed.extractedJobRequirements?.requiredSkills) ? parsed.extractedJobRequirements.requiredSkills : [],
      preferredSkills: Array.isArray(parsed.extractedJobRequirements?.preferredSkills) ? parsed.extractedJobRequirements.preferredSkills : [],
      mustHaveSkills: mustHaveKeywords,  // ← Fixed: using mustHaveKeywords
      requiredYearsExperience: typeof parsed.extractedJobRequirements?.requiredYearsExperience === 'number' ? parsed.extractedJobRequirements.requiredYearsExperience : 0,
      requiredEducationLevel: typeof parsed.extractedJobRequirements?.requiredEducationLevel === 'number' ? parsed.extractedJobRequirements.requiredEducationLevel : 0,
      requiredLanguages: Array.isArray(parsed.extractedJobRequirements?.requiredLanguages) ? parsed.extractedJobRequirements.requiredLanguages : [],
    };

    // ── Calculate suitability (with fallback if function missing) ─────
    let suitability = {
      overallScore: 50,
      subScores: { skillsScore: 0.5, experienceScore: 0.5, languageScore: 0.9 }
    };

    try {
      suitability = calculateSuitabilityFromKeywords(
        cvKeywords,
        jdKeywords,
        mustHaveKeywords,
        {
          candidateYearsExperience: extractedProfile.totalYearsExperience,
          requiredYearsExperience: extractedJobRequirements.requiredYearsExperience,
          candidateEducationLevel: (extractedProfile.education[0]?.level as number) ?? 0,
          requiredEducationLevel: extractedJobRequirements.requiredEducationLevel,
          candidateLanguages: extractedProfile.languages.map((l: any) => l.language).filter(Boolean),
          requiredLanguages: extractedJobRequirements.requiredLanguages,
          customWeights: parsed.scoringWeights?.weights ?? null,
          weightExplanations: parsed.scoringWeights?.explanations ?? null,
        }
      );
    } catch (calcErr) {
      console.warn('[Suitability calc failed, using defaults]:', calcErr);
    }

    // ── SUCCESS RETURN (all types match) ──────────────────────────────
    return {
      overallMatch: Math.round(suitability.overallScore),
      subScores: {
        skillsMatch: Math.round(suitability.subScores.skillsScore * 100),
        experienceMatch: Math.round(suitability.subScores.experienceScore * 100),
        languageLocationMatch: Math.round(suitability.subScores.languageScore * 100),
      },
      atsScore: Math.round(suitability.subScores.skillsScore * 100),
      matchedSkills: matchedSkills.slice(0, 6),
      missingSkills: missingSkills,
      atsIssues: [],
      suggestions: Array.isArray(parsed.suggestions) ? (parsed.suggestions as any[]).slice(0, 6) : [],
      jdKeywords,
      cvKeywords: cvKeywords.slice(0, 15),
      extractedProfile,
      extractedJobRequirements,
      // Add mustHaveSkills if your AnalysisResults type requires it
      mustHaveSkills: mustHaveKeywords,
    };

  } catch (err: any) {
    console.error('[generateAnalysis] Failed:', err?.message ?? err);

    // ── ERROR RETURN (all required fields with proper types) ──────────
    return {
      overallMatch: 50,
      subScores: {
        skillsMatch: 50,
        experienceMatch: 50,
        languageLocationMatch: 90,
      },
      atsScore: 70,
      matchedSkills: [],
      missingSkills: [],
      atsIssues: [
        {
          type: 'ai_failure' as const,
          severity: 'high' as const,
          message: 'Analysis failed – model response invalid.',
        },
      ],
      suggestions: [
        {
          category: 'General' as const,
          text: 'Shorten inputs and retry.',
          priority: 'high' as const,
        },
      ],
      jdKeywords: [],
      cvKeywords: [],
      extractedProfile: {
        personalInfo: {
          name: null,
          email: null,
          phone: null,
          location: null,
          linkedin: null,
          portfolio: null,
        },
        summary: null,
        skills: [],
        education: [],
        experience: [],
        languages: [],
        totalYearsExperience: 0,
      },
      extractedJobRequirements: {
        requiredSkills: [],
        preferredSkills: [],
        mustHaveSkills: [],  // ← Fixed: proper array
        requiredYearsExperience: 0,  // ← Fixed: number not null
        requiredEducationLevel: 0,   // ← Fixed: number not null
        requiredLanguages: [],
      },
      mustHaveSkills: [],  // ← Added if required by AnalysisResults
    };
  }
}