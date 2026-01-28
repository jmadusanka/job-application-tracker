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

// Extract skills from text (basic keyword extraction)
function extractSkills(text: string): string[] {
  const commonSkills = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java',
    'SQL', 'Git', 'AWS', 'Docker', 'API', 'REST', 'GraphQL',
    'HTML', 'CSS', 'MongoDB', 'PostgreSQL', 'Express', 'Next.js'
  ];

  return commonSkills.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );
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