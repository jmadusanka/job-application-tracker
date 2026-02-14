import { ATSIssue, AnalysisResults, SkillGap } from '@/lib/types';


// Keyword matching between two arrays (resume vs job description)


export function matchKeywords(
  sourceKeywords: string[],   //  extracted from resume
  targetKeywords: string[]    //extracted from job description
): { matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];

  const sourceLower = sourceKeywords.map(s => s.toLowerCase().trim());
  const targetLowerSet = new Set(targetKeywords.map(t => t.toLowerCase().trim()));

  targetKeywords.forEach((target) => {
    const targetLower = target.toLowerCase().trim();

    const isMatched = sourceLower.some(src =>
      src.includes(targetLower) || targetLower.includes(src)
    );

    if (isMatched) {
      matched.push(target);
    } else {
      missing.push(target);
    }
  });

  return { matched, missing };
}

// Main ATS compatibility analysis function

export function analyzeATS(resumeText: string, jobDescription: string): AnalysisResults {
  // Extract keywords/skills
  const requiredSkills = extractSkills(jobDescription);
  const resumeSkills = extractSkills(resumeText);

  // Match keywords
  const { matched, missing } = matchKeywords(resumeSkills, requiredSkills);

  const matchedSkills = matched;

  const missingSkills: SkillGap[] = missing.map(skill => ({
    skill,
    priority: 'Required' as const,
  }));

  // Simple score calculations
  const skillsMatch =
    requiredSkills.length > 0
      ? Math.round((matched.length / requiredSkills.length) * 100)
      : 0;

  // Placeholder values 
  const experienceMatch = 75;
  const languageLocationMatch = 80;

  const overallMatch = Math.round(
    (skillsMatch + experienceMatch + languageLocationMatch) / 3
  );

  // Detect common ATS formatting/structure issues
  const atsIssues = detectATSIssues(resumeText);

  const atsScore = Math.max(0, 100 - atsIssues.length * 10);

  // Generate actionable suggestions
  const suggestions = generateSuggestions(missingSkills, atsIssues);

  // Return complete AnalysisResults shape 
  return {
    overallMatch,
    subScores: {
      skillsMatch,
      experienceMatch,
      languageLocationMatch,
    },
    matchedSkills,
    missingSkills,
    atsScore,
    atsIssues,
    suggestions,
    jdKeywords: requiredSkills.slice(0, 20),     // top keywords from JD
    cvKeywords: resumeSkills.slice(0, 20),       // top keywords from resume
    mustHaveSkills: requiredSkills.slice(0, 8),  // first 8 as must-have
   
    extractedProfile: undefined,
    extractedJobRequirements: undefined,
    suitability: undefined,
  };
}


// Very basic skill/phrase extraction

export function extractSkills(text: string): string[] {
  if (!text?.trim()) return [];

  // Split on common separators, clean, remove very short/generic words
  const phrases = text
    .split(/[\n;,.\r•|–—−]/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .filter(s => s.length > 2)
    .filter(s => !/^(and|or|the|a|an|to|for|with|in|on|by|of|at|as|is|are|was|were|be|been|has|have|had|this|that|these|those)$/.test(s));

  // Remove duplicates and sort by length (longer phrases usually more specific)
  const unique = Array.from(new Set(phrases));
  unique.sort((a, b) => b.length - a.length);

  return unique;
}


// Detect common ATS-related formatting/structure issues

function detectATSIssues(resumeText: string): ATSIssue[] {
  const issues: ATSIssue[] = [];

  const lower = resumeText.toLowerCase();

  // Too short
  if (resumeText.length < 150) {
    issues.push({
      type: 'structure',
      severity: 'high',
      message: 'Resume content is too short – likely parsing or upload issue',
    });
  }

  // No contact info (very rough check)
  if (!/(@|email|tel:|phone|linkedin|github|portfolio)/.test(lower)) {
    issues.push({
      type: 'structure',
      severity: 'medium',
      message: 'No contact information (email, phone, LinkedIn, etc.) detected',
    });
  }

  // Tables / complex formatting warning (very basic)
  if (/(table|tabular|column|row)/i.test(lower) || resumeText.includes('│') || resumeText.includes('└')) {
    issues.push({
      type: 'formatting',
      severity: 'medium',
      message: 'Possible table or complex layout – ATS may not parse correctly',
    });
  }

  return issues;
}


// Generate a improvement suggestions

function generateSuggestions(
  missingSkills: SkillGap[],
  issues: ATSIssue[]
): Array<{ category: 'Skills' | 'Format' | 'General'; text: string; priority: 'high' | 'medium' | 'low' }> {
  const suggestions: any[] = [];

  // Skills suggestions
  if (missingSkills.length > 0) {
    const topMissing = missingSkills.slice(0, 4).map(s => s.skill).join(', ');
    suggestions.push({
      category: 'Skills' as const,
      text: `Add missing key skills: ${topMissing}${missingSkills.length > 4 ? ' and others' : ''}`,
      priority: 'high' as const,
    });
  }

  // Format / structure issues
  if (issues.length > 0) {
    suggestions.push({
      category: 'Format' as const,
      text: 'Fix ATS compatibility issues (short content, missing contact info, possible tables)',
      priority: 'high' as const,
    });
  }

  // Fallback suggestion if almost nothing found
  if (suggestions.length === 0) {
    suggestions.push({
      category: 'General' as const,
      text: 'Resume looks good – consider tailoring keywords more closely to the job',
      priority: 'medium' as const,
    });
  }

  return suggestions;
}