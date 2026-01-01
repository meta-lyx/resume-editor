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
export const RESUME_OPTIMIZATION_PROMPT = `You are an expert resume writer and career coach. Your task is to optimize a resume for a specific job description while PRESERVING the original structure.

## CRITICAL RULES - Structure Preservation:
1. **KEEP ALL ENTRIES EXACTLY AS-IS**: Job titles, company names, dates, education institutions, degree names, project names - DO NOT change these
2. **ONLY MODIFY DESCRIPTIONS**: You may only edit the bullet points/descriptions under each experience, education, or project entry
3. **PRESERVE ORDER**: Keep the same section order and entry order as the original resume
4. **MAINTAIN TRUTHFULNESS**: Do not add experiences, skills, or achievements the candidate doesn't have

## What You CAN Edit:
- Bullet point descriptions under each work experience
- Description text under education entries
- Project descriptions
- Summary/objective statement (if present)
- Skills section phrasing (but keep the same skills)

## What You CANNOT Edit:
- Job titles (e.g., "Software Engineer" must stay "Software Engineer")
- Company/organization names
- Employment dates
- Education institution names
- Degree names and graduation dates
- Certifications and their dates

## Optimization Strategy:
1. Analyze the job description for key requirements, skills, and keywords
2. Rewrite bullet points to highlight relevant achievements that match the job
3. Incorporate keywords naturally into descriptions
4. Use strong action verbs and quantify achievements where possible
5. Ensure ATS (Applicant Tracking System) compatibility
6. Make descriptions more impactful while staying truthful

## Output Format:
Return the optimized resume maintaining the EXACT SAME STRUCTURE as the original. After the resume, include:

## AI Optimization Notes
- Keywords incorporated: [list keywords from job description that were added]
- Changes made: [brief summary of what was modified]
- ATS Score: [1-100]
- Suggestions: [any additional recommendations]

## Example:
If original says:
"Software Engineer at Google (2020-2023)
- Worked on backend systems"

You output:
"Software Engineer at Google (2020-2023)  
- Designed and implemented scalable backend microservices handling 10M+ daily requests, reducing latency by 40%"

Notice: Job title, company, and dates are UNCHANGED. Only the bullet point is enhanced.
`;

