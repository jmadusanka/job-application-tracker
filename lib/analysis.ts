// lib/analysis.ts
import { model } from './gemini';
import { AnalysisResults } from './types';

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

    const res = await model.generateContent(prompt);
    let raw = res.response.text()?.trim() || '';

    console.log('[Gemini Raw Response Length]:', raw.length);
    console.log('[Gemini Raw Response Preview]:', raw.substring(0, 400) + (raw.length > 400 ? '...' : ''));

    if (!raw) {
      throw new Error('Gemini returned empty response');
    }

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
    };
  }
}