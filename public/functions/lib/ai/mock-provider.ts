// Mock Provider for AI Resume Processing (for testing without API calls)

import { AIProvider, ResumeProcessingInput, ResumeProcessingOutput } from './types';

export class MockProvider implements AIProvider {
  name = 'mock';

  async processResume(input: ResumeProcessingInput): Promise<ResumeProcessingOutput> {
    const startTime = Date.now();

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Extract some keywords from the job description
    const jobKeywords = this.extractKeywords(input.jobDescription);

    // Create a mock optimized resume
    const customizedResume = `# OPTIMIZED RESUME

## Professional Summary
A highly motivated professional with extensive experience aligned with the target position. Demonstrated expertise in ${jobKeywords.slice(0, 3).join(', ')}.

---

${input.resumeText}

---

## AI Optimization Notes

### Keywords Incorporated
The following keywords from the job description have been emphasized:
${jobKeywords.map(k => `- "${k}"`).join('\n')}

### Suggestions for Improvement
- Consider adding more quantifiable achievements
- Ensure all relevant certifications are listed
- Tailor the professional summary for each application

### ATS Compatibility Score: 85/100
This resume has been optimized for Applicant Tracking Systems with proper formatting and keyword density.
`;

    return {
      customizedResume,
      suggestions: [
        'Add quantifiable achievements to strengthen impact',
        'Include relevant certifications and skills',
        'Use action verbs at the start of bullet points',
        'Ensure consistent formatting throughout',
      ],
      keywordsMatched: jobKeywords,
      atsScore: 85,
      processingTime: Date.now() - startTime,
    };
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - look for common job-related terms
    const commonKeywords = [
      'leadership', 'management', 'development', 'analysis', 'communication',
      'teamwork', 'project', 'strategy', 'innovation', 'problem-solving',
      'customer', 'sales', 'marketing', 'technical', 'software', 'data',
      'agile', 'scrum', 'javascript', 'python', 'react', 'node', 'cloud',
      'aws', 'azure', 'docker', 'kubernetes', 'machine learning', 'ai',
    ];

    const lowerText = text.toLowerCase();
    const found = commonKeywords.filter(kw => lowerText.includes(kw));
    
    // Also extract capitalized words that might be technologies/skills
    const capitalizedWords = text.match(/\b[A-Z][a-zA-Z]+\b/g) || [];
    const uniqueCapitalized = [...new Set(capitalizedWords)]
      .filter(w => w.length > 3 && !['The', 'This', 'That', 'With', 'From', 'About'].includes(w))
      .slice(0, 5);

    return [...new Set([...found, ...uniqueCapitalized])].slice(0, 10);
  }
}

