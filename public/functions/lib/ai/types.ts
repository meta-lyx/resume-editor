// AI Service Types and Interfaces

export interface ResumeProcessingInput {
  resumeText: string;
  jobDescription: string;
  options?: {
    tone?: 'professional' | 'creative' | 'technical';
    focus?: 'skills' | 'experience' | 'achievements' | 'balanced';
  };
}

export interface ResumeProcessingOutput {
  customizedResume: string;
  suggestions: string[];
  keywordsMatched: string[];
  atsScore?: number;
  processingTime: number;
}

export interface AIProvider {
  name: string;
  processResume(input: ResumeProcessingInput): Promise<ResumeProcessingOutput>;
}

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic' | 'mock';
  apiKey?: string;
  model?: string;
}

// Default prompts
export const RESUME_OPTIMIZATION_PROMPT = `You are an expert resume writer and career coach. Your task is to optimize a resume for a specific job description.

## Instructions:
1. Analyze the job description to identify key requirements, skills, and keywords
2. Rewrite the resume to better match the job requirements while maintaining truthfulness
3. Use strong action verbs and quantify achievements where possible
4. Ensure the resume is ATS (Applicant Tracking System) friendly
5. Highlight relevant experience and skills that match the job description
6. Keep the formatting clean and professional

## Output Format:
Return the optimized resume in a clean, professional format. After the resume, include a section called "## AI Optimization Notes" with:
- Key keywords from the job description that were incorporated
- Suggestions for further improvement
- Estimated ATS compatibility score (1-100)

## Important:
- Do NOT fabricate experience or skills
- Maintain the candidate's authentic voice while improving clarity
- Focus on relevance to the target job
`;

