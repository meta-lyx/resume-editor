// Anthropic Claude Provider for AI Resume Processing

import {
  AIProvider,
  ResumeProcessingInput,
  ResumeProcessingOutput,
  StructuredResume,
  RESUME_OPTIMIZATION_PROMPT,
  buildResumeOptimizationUserPrompt,
} from './types';

export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'claude-3-5-sonnet-20241022') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async processResume(input: ResumeProcessingInput): Promise<ResumeProcessingOutput> {
    const startTime = Date.now();

    const userPrompt = buildResumeOptimizationUserPrompt(input.resumeText, input.jobDescription);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 4000,
          system: RESUME_OPTIMIZATION_PROMPT,
          messages: [
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Anthropic API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';

      // Parse the response to extract structured data
      const { customizedResume, suggestions, keywordsMatched, atsScore } = this.parseResponse(content);

      // Try to extract structured JSON data from the response
      let structuredResume: StructuredResume | undefined;
      const parsedStructured = this.parseStructuredData(content);
      if (parsedStructured) {
        structuredResume = parsedStructured;
      }

      return {
        customizedResume,
        structuredResume,
        suggestions,
        keywordsMatched,
        atsScore,
        processingTime: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('Anthropic processing error:', error);
      throw new Error(`Failed to process resume with Anthropic: ${error.message}`);
    }
  }

  // Try to extract structured JSON data from the response if it's embedded
  private parseStructuredData(content: string): StructuredResume | null {
    try {
      // Look for a JSON object in the response (the prompt asks to return one JSON object)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;

      const parsed = JSON.parse(jsonMatch[0]);

      // Check if it has the expected structure
      if (!parsed.personalInfo && !parsed.experience) {
        // This might be a plain text response, not structured JSON
        return null;
      }

      return {
        personalInfo: parsed.personalInfo || { name: 'Resume' },
        summary: parsed.summary || '',
        experience: (parsed.experience || []).map((exp: any) => ({
          title: exp.title || 'Position',
          company: exp.company || '',
          location: exp.location,
          startDate: exp.startDate || '',
          endDate: exp.endDate || 'Present',
          bullets: Array.isArray(exp.bullets) ? exp.bullets : [],
        })),
        education: (parsed.education || []).map((edu: any) => ({
          degree: edu.degree || 'Degree',
          school: edu.school || '',
          location: edu.location,
          graduationDate: edu.graduationDate || '',
          gpa: edu.gpa,
          highlights: edu.highlights,
        })),
        skills: (parsed.skills || []).map((skill: any) => ({
          category: skill.category,
          items: Array.isArray(skill.items) ? skill.items : [],
        })),
        certifications: parsed.certifications,
        projects: parsed.projects,
      };
    } catch {
      return null;
    }
  }

  private parseResponse(content: string): {
    customizedResume: string;
    suggestions: string[];
    keywordsMatched: string[];
    atsScore?: number;
  } {
    // Split content at "## AI Optimization Notes" if present
    const parts = content.split(/##\s*AI Optimization Notes/i);
    const customizedResume = parts[0].trim();
    const notes = parts[1] || '';

    // Extract suggestions (look for bullet points or numbered items)
    const suggestions: string[] = [];
    const suggestionMatches = notes.match(/[-•*]\s*(.+?)(?=\n|$)/g) || [];
    suggestionMatches.forEach(match => {
      const cleaned = match.replace(/^[-•*]\s*/, '').trim();
      if (cleaned && cleaned.length > 10) {
        suggestions.push(cleaned);
      }
    });

    // Extract keywords (look for words in quotes or after "keywords:")
    const keywordsMatched: string[] = [];
    const keywordSection = notes.match(/keywords?[:\s]+([^\n]+)/i);
    if (keywordSection) {
      const keywords = keywordSection[1].match(/["']([^"']+)["']|(\w+)/g) || [];
      keywords.forEach(kw => {
        const cleaned = kw.replace(/["']/g, '').trim();
        if (cleaned && cleaned.length > 2) {
          keywordsMatched.push(cleaned);
        }
      });
    }

    // Extract ATS score
    let atsScore: number | undefined;
    const scoreMatch = notes.match(/ATS[^:]*:\s*(\d+)/i) || notes.match(/score[^:]*:\s*(\d+)/i);
    if (scoreMatch) {
      atsScore = parseInt(scoreMatch[1], 10);
      if (atsScore > 100) atsScore = undefined; // Invalid score
    }

    return {
      customizedResume,
      suggestions: suggestions.length > 0 ? suggestions : ['Resume optimized for target job', 'Keywords aligned with job description'],
      keywordsMatched: keywordsMatched.length > 0 ? keywordsMatched : [],
      atsScore,
    };
  }
}
