// Keyword matching between two texts
/**
 * Matches keywords between two arrays or texts.
 * @param sourceKeywords Array of keywords from source (e.g., resume)
 * @param targetKeywords Array of keywords from target (e.g., job description)
 * @returns { matched: string[], missing: string[] }
 */
// Partial/fuzzy matching: consider a match if one phrase contains the other (case-insensitive)
export function matchKeywords(sourceKeywords: string[], targetKeywords: string[]) {
  const matched: string[] = [];
  const missing: string[] = [];
  targetKeywords.forEach(target => {
    const found = sourceKeywords.some(src =>
      src.includes(target) || target.includes(src)
    );
    if (found) {
      matched.push(target);
    } else {
      missing.push(target);
    }
  });
  return { matched, missing };
}
import { ATSIssue, AnalysisResults, SkillGap } from '@/lib/types';

// Analyze ATS compatibility
export function analyzeATS(resumeText: string, jobDescription: string): AnalysisResults {
  // Extract skills from job description
  const requiredSkills = extractSkills(jobDescription);
  const resumeSkills = extractSkills(resumeText);

  // Calculate matches
  const matchedSkills = requiredSkills.filter(skill =>
    resumeSkills.some(rs => rs.toLowerCase() === skill.toLowerCase())
  );

  const missingSkills: SkillGap[] = requiredSkills
    .filter(skill => !matchedSkills.includes(skill))
    .map(skill => ({ skill, priority: 'Required' as const }));

  // Calculate scores
  const skillsMatch = requiredSkills.length > 0
    ? Math.round((matchedSkills.length / requiredSkills.length) * 100)
    : 0;

  const experienceMatch = 75; // Placeholder
  const languageLocationMatch = 80; // Placeholder
  const overallMatch = Math.round((skillsMatch + experienceMatch + languageLocationMatch) / 3);

  // ATS issues
  const atsIssues = detectATSIssues(resumeText);
  const atsScore = Math.max(0, 100 - (atsIssues.length * 10));

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
    suggestions: generateSuggestions(missingSkills, atsIssues),
    jdKeywords: [],
    cvKeywords: []
  };
}

// Extract keywords/phrases from text (improved for multi-word and real-world phrases)
// This is a simple phrase extraction: split by line, semicolon, or comma, then clean up
export function extractSkills(text: string): string[] {
  if (!text) return [];
  // Split by newlines, semicolons, commas, and periods
  let phrases = text
    .split(/\n|;|,|\.|\r/)
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .filter(s => s.length > 2 && !/^(and|or|the|a|an|to|for|with|in|on|by|of|at|as|is|are|was|were|be|been|has|have|had)$/.test(s));

  // Remove duplicates
  phrases = Array.from(new Set(phrases));
  return phrases;
}

// Detect ATS compatibility issues
function detectATSIssues(resumeText: string): ATSIssue[] {
  const issues: ATSIssue[] = [];

  if (resumeText.length < 100) {
    issues.push({
      type: 'structure',
      severity: 'high',
      message: 'Resume text is too short'
    });
  }

  // Check for common ATS problems
  if (!/email|@/.test(resumeText.toLowerCase())) {
    issues.push({
      type: 'structure',
      severity: 'medium',
      message: 'No email address found'
    });
  }

  return issues;
}

// Generate improvement suggestions
function generateSuggestions(missingSkills: SkillGap[], issues: ATSIssue[]) {
  const suggestions = [];

  if (missingSkills.length > 0) {
    suggestions.push({
      category: 'Skills' as const,
      text: `Add missing skills: ${missingSkills.slice(0, 3).map(s => s.skill).join(', ')}`,
      priority: 'high' as const
    });
  }

  if (issues.length > 0) {
    suggestions.push({
      category: 'Format' as const,
      text: 'Improve ATS compatibility by fixing detected issues',
      priority: 'high' as const
    });
  }

  return suggestions;
}