// OpenAI Provider for AI Resume Processing

import { 
  AIProvider, 
  ResumeProcessingInput, 
  ResumeProcessingOutput, 
  StructuredResume,
  RESUME_OPTIMIZATION_PROMPT,
  buildResumeOptimizationUserPrompt,
} from './types';

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

    const userPrompt = buildResumeOptimizationUserPrompt(input.resumeText, input.jobDescription);

    try {
      // First attempt: Request structured JSON output
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
          temperature: 0.25,
          max_tokens: 4000,
          response_format: { type: "json_object" }, // Request JSON mode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      console.log('OpenAI raw response length:', content.length);

      // Parse the JSON response
      const parsed = this.parseStructuredResponse(content);

      return {
        customizedResume: this.convertToPlainText(parsed.structuredResume),
        structuredResume: parsed.structuredResume,
        suggestions: parsed.suggestions,
        keywordsMatched: parsed.keywordsMatched,
        atsScore: parsed.atsScore,
        processingTime: Date.now() - startTime,
      };
    } catch (error: any) {
      console.error('OpenAI processing error:', error);
      
      // Fallback: Try without JSON mode
      try {
        console.log('Attempting fallback without JSON mode...');
        return await this.processResumeFallback(input, startTime);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error(`Failed to process resume with OpenAI: ${error.message}`);
      }
    }
  }

  private async processResumeFallback(input: ResumeProcessingInput, startTime: number): Promise<ResumeProcessingOutput> {
    const userPrompt = buildResumeOptimizationUserPrompt(input.resumeText, input.jobDescription);

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
        temperature: 0.25,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Try to extract JSON from the response
    const parsed = this.parseStructuredResponse(content);

    return {
      customizedResume: this.convertToPlainText(parsed.structuredResume),
      structuredResume: parsed.structuredResume,
      suggestions: parsed.suggestions,
      keywordsMatched: parsed.keywordsMatched,
      atsScore: parsed.atsScore,
      processingTime: Date.now() - startTime,
    };
  }

  private parseStructuredResponse(content: string): {
    structuredResume: StructuredResume;
    suggestions: string[];
    keywordsMatched: string[];
    atsScore?: number;
  } {
    let jsonContent = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      const parsed = JSON.parse(jsonContent);
      
      // Extract metadata
      const metadata = parsed.metadata || {};
      
      // Build structured resume
      const structuredResume: StructuredResume = {
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

      return {
        structuredResume,
        suggestions: metadata.suggestionsForImprovement || ['Resume optimized for target job'],
        keywordsMatched: metadata.keywordsIncorporated || [],
        atsScore: metadata.atsScore,
      };
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Raw content that failed to parse:', jsonContent.substring(0, 500));
      
      // Return a minimal structure - try to extract name from first line
      const firstLine = content.split('\n').find(l => l.trim().length > 2 && !l.includes('@'))?.trim() || 'Resume';
      return {
        structuredResume: {
          personalInfo: { name: firstLine.slice(0, 50) }, // Use first meaningful line as name
          summary: content,
          experience: [],
          education: [],
          skills: [],
        },
        suggestions: ['Could not fully parse resume structure'],
        keywordsMatched: [],
        atsScore: undefined,
      };
    }
  }

  // Convert structured resume back to plain text for preview
  private convertToPlainText(resume: StructuredResume): string {
    const lines: string[] = [];

    // Personal info
    if (resume.personalInfo.name) {
      lines.push(resume.personalInfo.name);
    }
    if (resume.personalInfo.title) {
      lines.push(resume.personalInfo.title);
    }
    
    const contactParts: string[] = [];
    if (resume.personalInfo.email) contactParts.push(resume.personalInfo.email);
    if (resume.personalInfo.phone) contactParts.push(resume.personalInfo.phone);
    if (resume.personalInfo.location) contactParts.push(resume.personalInfo.location);
    if (contactParts.length > 0) {
      lines.push(contactParts.join(' | '));
    }
    
    const linkParts: string[] = [];
    if (resume.personalInfo.linkedin) linkParts.push(resume.personalInfo.linkedin);
    if (resume.personalInfo.github) linkParts.push(resume.personalInfo.github);
    if (resume.personalInfo.website) linkParts.push(resume.personalInfo.website);
    if (linkParts.length > 0) {
      lines.push(linkParts.join(' | '));
    }
    
    lines.push('');

    // Summary
    if (resume.summary) {
      lines.push('PROFESSIONAL SUMMARY');
      lines.push(resume.summary);
      lines.push('');
    }

    // Experience
    if (resume.experience.length > 0) {
      lines.push('EXPERIENCE');
      for (const exp of resume.experience) {
        lines.push(`${exp.title} at ${exp.company}`);
        if (exp.location) {
          lines.push(`${exp.location} | ${exp.startDate} - ${exp.endDate}`);
        } else {
          lines.push(`${exp.startDate} - ${exp.endDate}`);
        }
        for (const bullet of exp.bullets) {
          lines.push(`• ${bullet}`);
        }
        lines.push('');
      }
    }

    // Education
    if (resume.education.length > 0) {
      lines.push('EDUCATION');
      for (const edu of resume.education) {
        lines.push(`${edu.degree}`);
        lines.push(`${edu.school}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`);
        if (edu.graduationDate) {
          lines.push(edu.graduationDate);
        }
        if (edu.highlights) {
          for (const h of edu.highlights) {
            lines.push(`• ${h}`);
          }
        }
        lines.push('');
      }
    }

    // Skills
    if (resume.skills.length > 0) {
      lines.push('SKILLS');
      for (const skillGroup of resume.skills) {
        if (skillGroup.category) {
          lines.push(`${skillGroup.category}: ${skillGroup.items.join(', ')}`);
        } else {
          lines.push(skillGroup.items.join(', '));
        }
      }
      lines.push('');
    }

    // Certifications
    if (resume.certifications && resume.certifications.length > 0) {
      lines.push('CERTIFICATIONS');
      for (const cert of resume.certifications) {
        lines.push(`• ${cert}`);
      }
      lines.push('');
    }

    // Projects
    if (resume.projects && resume.projects.length > 0) {
      lines.push('PROJECTS');
      for (const proj of resume.projects) {
        lines.push(proj.name);
        lines.push(proj.description);
        if (proj.bullets) {
          for (const bullet of proj.bullets) {
            lines.push(`• ${bullet}`);
          }
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}
