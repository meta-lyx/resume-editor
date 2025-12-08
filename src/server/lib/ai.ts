import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type AIModel = 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
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
  const baseContext = `You are an expert resume writer and career coach. Your task is to optimize the following resume.`;
  
  const prompts: Record<OptimizationType, string> = {
    'ats-optimization': `${baseContext}

TASK: Optimize this resume for Applicant Tracking Systems (ATS).

REQUIREMENTS:
1. Use industry-standard keywords and phrases
2. Ensure proper formatting for ATS parsing
3. Include relevant skills and technologies
4. Use action verbs at the beginning of bullet points
5. Quantify achievements where possible
6. Remove any graphics, tables, or complex formatting
7. Use standard section headings (Experience, Education, Skills, etc.)

${jobDescription ? `TARGET JOB DESCRIPTION:\n${jobDescription}\n\n` : ''}

ORIGINAL RESUME:
${resumeContent}

Please provide the optimized resume in plain text format with clear section breaks.`,

    'language-polish': `${baseContext}

TASK: Enhance the language and writing quality of this resume.

REQUIREMENTS:
1. Use powerful, professional vocabulary
2. Eliminate weak words (responsible for, helped with, etc.)
3. Start bullets with strong action verbs
4. Improve sentence structure and flow
5. Ensure consistent tense (past for previous roles, present for current)
6. Remove redundancy and filler words
7. Make descriptions more impactful and concise

ORIGINAL RESUME:
${resumeContent}

Please provide the enhanced resume maintaining the same structure but with significantly improved language.`,

    'achievement-highlight': `${baseContext}

TASK: Transform job responsibilities into quantifiable achievements.

REQUIREMENTS:
1. Convert vague responsibilities into specific achievements
2. Add metrics, numbers, and percentages wherever possible
3. Show impact using before/after comparisons
4. Highlight cost savings, revenue increases, efficiency improvements
5. Use the CAR (Challenge-Action-Result) or STAR (Situation-Task-Action-Result) method
6. Emphasize leadership, initiative, and problem-solving
7. Make accomplishments measurable and concrete

ORIGINAL RESUME:
${resumeContent}

Please provide the resume with all experiences transformed into achievement-focused bullet points with quantifiable results.`,

    'job-match': `${baseContext}

TASK: Customize this resume to match the specific job description provided.

REQUIREMENTS:
1. Prioritize experiences and skills relevant to the target role
2. Use keywords and phrases from the job description
3. Highlight transferable skills matching job requirements
4. Adjust the professional summary to align with the role
5. Emphasize relevant projects and achievements
6. Match technical skills to those listed in the job posting
7. Maintain authenticity - don't fabricate experience

TARGET JOB DESCRIPTION:
${jobDescription || '[No job description provided]'}

ORIGINAL RESUME:
${resumeContent}

Please provide a customized version that maximizes fit for this specific role while remaining truthful and authentic.`,
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
      temperature: 0.7,
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
  }
): Promise<OptimizeResumeResult> {
  // Determine which AI provider to use based on model or availability
  const model = params.model || 'gpt-4';
  
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
  } else {
    // Default to OpenAI if available
    if (env.OPENAI_API_KEY) {
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
  env: { OPENAI_API_KEY?: string; ANTHROPIC_API_KEY?: string }
): Promise<string[]> {
  const prompt = `Analyze this resume and provide 5 specific, actionable suggestions for improvement. Format as a simple list.

RESUME:
${resumeContent}

Provide exactly 5 suggestions, each on a new line.`;
  
  try {
    if (env.OPENAI_API_KEY) {
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });
      
      const suggestions = completion.choices[0]?.message?.content
        ?.split('\n')
        .filter(line => line.trim().length > 0)
        .slice(0, 5) || [];
      
      return suggestions;
    }
    
    return [];
  } catch (error) {
    console.error('Generate suggestions error:', error);
    return [];
  }
}

