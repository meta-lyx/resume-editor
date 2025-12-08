// OpenAI Provider for AI Resume Processing

import { AIProvider, ResumeProcessingInput, ResumeProcessingOutput, RESUME_OPTIMIZATION_PROMPT } from './types';

export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private apiKey: string;
  private model: string;

  constructor(apiKey: string, model: string = 'gpt-4o-mini') {
    this.apiKey = apiKey;
    this.model = model;
  }

  async processResume(input: ResumeProcessingInput): Promise<ResumeProcessingOutput> {
    const startTime = Date.now();

    const userPrompt = `## Original Resume:
${input.resumeText}

## Target Job Description:
${input.jobDescription}

Please optimize this resume for the target job.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: RESUME_OPTIMIZATION_PROMPT },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Parse the response to extract structured data
      const { customizedResume, suggestions, keywordsMatched, atsScore } = this.parseResponse(content);

      return {
        customizedResume,
        suggestions,
        keywordsMatched,
        atsScore,
        processingTime: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('OpenAI processing error:', error);
      throw new Error(`Failed to process resume with OpenAI: ${error.message}`);
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

