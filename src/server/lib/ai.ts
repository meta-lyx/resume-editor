import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet' | 'deepseek-chat';
export type OptimizationType = 'ats-optimization' | 'language-polish' | 'achievement-highlight' | 'job-match';

export interface OptimizeResumeParams {
  resumeContent: string;
  jobDescription?: string;
  optimizationType: OptimizationType;
  model?: AIModel;
}

export interface OptimizeResumeResult {
  optimizedContent: string;
  model: AIModel;
  tokensUsed: number;
  suggestions?: string[];
}

// Get prompt based on optimization type
function getPrompt(type: OptimizationType, resumeContent: string, jobDescription?: string): string {
  const baseContext = `You are an expert resume writer and career coach. Your task is to optimize the following resume.

CRITICAL RULE - FACTUAL ACCURACY:
- NEVER fabricate or change company names, job titles, dates, locations, degrees, or school names.
- NEVER invent metrics, numbers, percentages, or concrete achievements that were not in the original resume.
- If the original resume says "Led a project" do NOT change it to "Led a project that increased revenue by X%" unless the original explicitly stated that number.
- If there are no metrics in the original, use qualitative language like "drove measurable improvements" or "achieved strong results" instead of inventing numbers.
- You may REPHRASE and IMPROVE wording, but you must preserve all factual content unchanged.
- Violation of these rules will result in a resume full of lies, which is unacceptable.`;
  
  const prompts: Record<OptimizationType, string> = {
    'ats-optimization': `${baseContext}

TASK: Optimize this resume for Applicant Tracking Systems (ATS).

REQUIREMENTS:
1. Use industry-standard keywords and phrases from the original resume content
2. Ensure proper formatting for ATS parsing
3. Reorganize skills and technologies for better ATS matching
4. Use action verbs at the beginning of bullet points
5. Keep only metrics that exist in the original resume - NEVER invent numbers
6. Remove any graphics, tables, or complex formatting
7. Use standard section headings (Experience, Education, Skills, etc.)

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n\n` : ''}

ORIGINAL RESUME:
${resumeContent}

Please provide the optimized resume in plain text format with clear section breaks.`,

    'language-polish': `${baseContext}

TASK: Enhance the language and writing quality of this resume.

REQUIREMENTS:
1. Use powerful, professional vocabulary while keeping all facts unchanged
2. Eliminate weak words (responsible for, helped with, etc.)
3. Start bullets with strong action verbs
4. Improve sentence structure and flow
5. Ensure consistent tense (past for previous roles, present for current)
6. Remove redundancy and filler words
7. Make descriptions more impactful and concise

ORIGINAL RESUME:
${resumeContent}

Please provide the enhanced resume maintaining the exact same facts, companies, titles, dates, and metrics, with significantly improved language.`,

    'achievement-highlight': `${baseContext}

TASK: Transform job responsibilities into achievement-focused bullet points.

REQUIREMENTS:
1. Rephrase vague responsibilities to sound more impactful using stronger language
2. KEEP all existing metrics, numbers, and percentages exactly as they appear - NEVER add new ones
3. If no metrics exist, use qualitative language like "drove measurable results" instead of inventing numbers
4. Highlight leadership, initiative, and problem-solving through better wording, not fabricated data
5. Use the CAR or STAR method structure when possible, but only with content present in the original
6. Emphasize ownership and impact through language choice, not invented achievements
7. PRESERVE all company names, job titles, dates, and locations exactly as written

ORIGINAL RESUME:
${resumeContent}

Please provide the resume with all experiences rewritten to sound more achievement-focused, using ONLY facts from the original resume.`,

    'job-match': `${baseContext}

TASK: Customize this resume to match the specific job description provided.

REQUIREMENTS:
1. Prioritize experiences and skills relevant to the target role - but keep all facts unchanged
2. Use keywords and phrases from the job description where they honestly match the original content
3. Reorder bullet points to put the most relevant achievements first
4. Adjust the professional summary to align with the role using only factual content
5. Emphasize relevant projects and achievements through ordering and wording, NOT fabrication
6. NEVER change company names, job titles, dates, or locations to match the job description
7. CRITICAL: Maintain complete authenticity - do NOT fabricate ANY experience, metric, or skill

TARGET JOB DESCRIPTION:
${jobDescription || '[No job description provided]'}

ORIGINAL RESUME:
${resumeContent}

Please provide a customized version that maximizes fit for this specific role while being 100% truthful. It is better to leave a bullet point as-is than to invent a number to make it look better.`,
  };
  
  return prompts[type];
}

// Optimize resume using OpenAI
async function optimizeWithOpenAI(
  params: OptimizeResumeParams,
  apiKey: string
): Promise<OptimizeResumeResult> {
  const openai = new OpenAI({ apiKey });
  
  const model = params.model || 'gpt-4';
  const prompt = getPrompt(params.optimizationType, params.resumeContent, params.jobDescription);
  
  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert resume writer and ATS optimization specialist with 15+ years of experience helping candidates land jobs at top companies.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });
    
    const optimizedContent = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || 0;
    
    return {
      optimizedContent,
      model: model as AIModel,
      tokensUsed,
    };
  } catch (error: any) {
    console.error('OpenAI optimization error:', error);
    throw new Error(`AI optimization failed: ${error.message}`);
  }
}

// Optimize resume using DeepSeek
async function optimizeWithDeepSeek(
  params: OptimizeResumeParams,
  apiKey: string
): Promise<OptimizeResumeResult> {
  const model = params.model === 'deepseek-chat' ? 'deepseek-chat' : 'deepseek-chat';
  const prompt = getPrompt(params.optimizationType, params.resumeContent, params.jobDescription);

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer and ATS optimization specialist with 15+ years of experience helping candidates land jobs at top companies.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`DeepSeek API error (${response.status}): ${errBody}`);
    }

    const data: any = await response.json();
    const optimizedContent = data.choices?.[0]?.message?.content || '';
    const tokensUsed = data.usage?.total_tokens || 0;

    return {
      optimizedContent,
      model: 'deepseek-chat' as AIModel,
      tokensUsed,
    };
  } catch (error: any) {
    console.error('DeepSeek optimization error:', error);
    throw new Error(`AI optimization failed: ${error.message}`);
  }
}

// Optimize resume using Anthropic Claude
async function optimizeWithAnthropic(
  params: OptimizeResumeParams,
  apiKey: string
): Promise<OptimizeResumeResult> {
  const anthropic = new Anthropic({ apiKey });
  
  const model = params.model || 'claude-3-sonnet-20240229';
  const prompt = getPrompt(params.optimizationType, params.resumeContent, params.jobDescription);
  
  try {
    const message = await anthropic.messages.create({
      model,
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });
    
    const optimizedContent = message.content[0]?.type === 'text' 
      ? message.content[0].text 
      : '';
    
    const tokensUsed = message.usage.input_tokens + message.usage.output_tokens;
    
    return {
      optimizedContent,
      model: model as AIModel,
      tokensUsed,
    };
  } catch (error: any) {
    console.error('Anthropic optimization error:', error);
    throw new Error(`AI optimization failed: ${error.message}`);
  }
}

// Main function to optimize resume (auto-selects provider)
export async function optimizeResume(
  params: OptimizeResumeParams,
  env: {
    OPENAI_API_KEY?: string;
    ANTHROPIC_API_KEY?: string;
    DEEPSEEK_API_KEY?: string;
  }
): Promise<OptimizeResumeResult> {
  // Determine which AI provider to use based on model or availability
  const model = params.model || 'deepseek-chat';
  
  if (model.startsWith('gpt-') || model.startsWith('gpt3')) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }
    return optimizeWithOpenAI(params, env.OPENAI_API_KEY);
  } else if (model.startsWith('claude-')) {
    if (!env.ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }
    return optimizeWithAnthropic(params, env.ANTHROPIC_API_KEY);
  } else if (model.startsWith('deepseek')) {
    if (!env.DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured');
    }
    return optimizeWithDeepSeek(params, env.DEEPSEEK_API_KEY);
  } else {
    // Default to DeepSeek if available, fallback through providers
    if (env.DEEPSEEK_API_KEY) {
      return optimizeWithDeepSeek(params, env.DEEPSEEK_API_KEY);
    } else if (env.OPENAI_API_KEY) {
      return optimizeWithOpenAI({ ...params, model: 'gpt-4' }, env.OPENAI_API_KEY);
    } else if (env.ANTHROPIC_API_KEY) {
      return optimizeWithAnthropic({ ...params, model: 'claude-3-sonnet-20240229' }, env.ANTHROPIC_API_KEY);
    } else {
      throw new Error('No AI provider configured');
    }
  }
}

// Generate suggestions for resume improvement
export async function generateSuggestions(
  resumeContent: string,
  env: { OPENAI_API_KEY?: string; ANTHROPIC_API_KEY?: string; DEEPSEEK_API_KEY?: string }
): Promise<string[]> {
  const prompt = `Analyze this resume and provide 5 specific, actionable suggestions for improvement. Format as a simple list.

RESUME:
${resumeContent}

Provide exactly 5 suggestions, each on a new line.`;
  
  async function callDeepSeekSuggestions(): Promise<string[]> {
    try {
      if (!env.DEEPSEEK_API_KEY) return [];
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });
      if (!response.ok) return [];
      const data: any = await response.json();
      return data.choices?.[0]?.message?.content
        ?.split('\n')
        .filter((line: string) => line.trim().length > 0)
        .slice(0, 5) || [];
    } catch {
      return [];
    }
  }
  
  try {
    if (env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      });
      
      const suggestions = completion.choices[0]?.message?.content
        ?.split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 5) || [];
      
      return suggestions;
    }
    
    // Fallback to DeepSeek if OpenAI not configured
    return callDeepSeekSuggestions();
  } catch (error) {
    console.error('Generate suggestions error:', error);
    // Try DeepSeek as fallback on error
    return callDeepSeekSuggestions();
  }
}

