// DeepSeek Provider for AI Resume Processing
// Uses OpenAI-compatible API at https://api.deepseek.com

import { 
  AIProvider, 
  ResumeProcessingInput, 
  ResumeProcessingOutput, 
  StructuredResume,
  RESUME_OPTIMIZATION_PROMPT,
  buildResumeOptimizationUserPrompt,
} from './types';

export class DeepSeekProvider implements AIProvider {
  name = 'deepseek';
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(apiKey: string, model: string = 'deepseek-chat') {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = 'https://api.deepseek.com/v1';
  }

  async processResume(input: ResumeProcessingInput): Promise<ResumeProcessingOutput> {
    const startTime = Date.now();

    const userPrompt = buildResumeOptimizationUserPrompt(input.resumeText, input.jobDescription);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
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
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      console.log('DeepSeek raw response length:', content.length);

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
      console.error('DeepSeek processing error:', error);

      try {
        console.log('Attempting DeepSeek fallback without JSON mode...');
        return await this.processResumeFallback(input, startTime);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error(`Failed to process resume with DeepSeek: ${error.message}`);
      }
    }
  }

  private async processResumeFallback(input: ResumeProcessingInput, startTime: number): Promise<ResumeProcessingOutput> {
    const userPrompt = buildResumeOptimizationUserPrompt(input.resumeText, input.jobDescription);

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
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
      throw new Error(`DeepSeek API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

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
    
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    try {
      const parsed = JSON.parse(jsonContent);
      const metadata = parsed.metadata || {};
      
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
      
      const firstLine = content.split('\n').find(l => l.trim().length > 2 && !l.includes('@'))?.trim() || 'Resume';
      return {
        structuredResume: {
          personalInfo: { name: firstLine.slice(0, 50) },
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

  private convertToPlainText(resume: StructuredResume): string {
    const lines: string[] = [];

    if (resume.personalInfo.name) lines.push(resume.personalInfo.name);
    if (resume.personalInfo.title) lines.push(resume.personalInfo.title);
    
    const contactParts: string[] = [];
    if (resume.personalInfo.email) contactParts.push(resume.personalInfo.email);
    if (resume.personalInfo.phone) contactParts.push(resume.personalInfo.phone);
    if (resume.personalInfo.location) contactParts.push(resume.personalInfo.location);
    if (contactParts.length > 0) lines.push(contactParts.join(' | '));
    
    const linkParts: string[] = [];
    if (resume.personalInfo.linkedin) linkParts.push(resume.personalInfo.linkedin);
    if (resume.personalInfo.github) linkParts.push(resume.personalInfo.github);
    if (resume.personalInfo.website) linkParts.push(resume.personalInfo.website);
    if (linkParts.length > 0) lines.push(linkParts.join(' | '));
    
    lines.push('');

    if (resume.summary) {
      lines.push('PROFESSIONAL SUMMARY');
      lines.push(resume.summary);
      lines.push('');
    }

    if (resume.experience.length > 0) {
      lines.push('EXPERIENCE');
      for (const exp of resume.experience) {
        lines.push(`${exp.title} at ${exp.company}`);
        lines.push(exp.location ? `${exp.location} | ${exp.startDate} - ${exp.endDate}` : `${exp.startDate} - ${exp.endDate}`);
        for (const bullet of exp.bullets) lines.push(`• ${bullet}`);
        lines.push('');
      }
    }

    if (resume.education.length > 0) {
      lines.push('EDUCATION');
      for (const edu of resume.education) {
        lines.push(edu.degree);
        lines.push(`${edu.school}${edu.gpa ? ` | GPA: ${edu.gpa}` : ''}`);
        if (edu.graduationDate) lines.push(edu.graduationDate);
        if (edu.highlights) for (const h of edu.highlights) lines.push(`• ${h}`);
        lines.push('');
      }
    }

    if (resume.skills.length > 0) {
      lines.push('SKILLS');
      for (const s of resume.skills) {
        lines.push(s.category ? `${s.category}: ${s.items.join(', ')}` : s.items.join(', '));
      }
      lines.push('');
    }

    if (resume.certifications?.length) {
      lines.push('CERTIFICATIONS');
      for (const cert of resume.certifications) lines.push(`• ${cert}`);
      lines.push('');
    }

    if (resume.projects?.length) {
      lines.push('PROJECTS');
      for (const proj of resume.projects) {
        lines.push(proj.name);
        lines.push(proj.description);
        if (proj.bullets) for (const b of proj.bullets) lines.push(`• ${b}`);
        lines.push('');
      }
    }

    return lines.join('\n');
  }
}
