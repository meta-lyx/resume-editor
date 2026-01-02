// AI Service Types and Interfaces

export interface ResumeProcessingInput {
  resumeText: string;
  jobDescription: string;
  options?: {
    tone?: 'professional' | 'creative' | 'technical';
    focus?: 'skills' | 'experience' | 'achievements' | 'balanced';
  };
}

// Structured resume data that AI will extract and optimize
export interface StructuredResume {
  personalInfo: {
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary?: string;
  experience: {
    title: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    degree: string;
    school: string;
    location?: string;
    graduationDate: string;
    gpa?: string;
    highlights?: string[];
  }[];
  skills: {
    category?: string;
    items: string[];
  }[];
  certifications?: string[];
  projects?: {
    name: string;
    description: string;
    bullets?: string[];
  }[];
}

export interface ResumeProcessingOutput {
  customizedResume: string;  // Plain text version for preview
  structuredResume: StructuredResume;  // Structured data for PDF
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

// Updated prompt that requests structured JSON output
export const RESUME_OPTIMIZATION_PROMPT = `You are an expert resume writer and ATS optimization specialist. Your task is to:
1. Parse the provided resume text (which may be messy from OCR extraction)
2. Optimize the content for the target job description
3. Return a properly structured JSON response

## CRITICAL RULES:
1. **PRESERVE FACTS**: Keep all job titles, company names, dates, schools, degrees EXACTLY as they appear
2. **ONLY ENHANCE DESCRIPTIONS**: Improve bullet points to be more impactful and keyword-rich
3. **MAINTAIN TRUTHFULNESS**: Do not add experiences or skills the candidate doesn't have
4. **UNDERSTAND OCR NOISE**: The text may have formatting issues from OCR - use context to understand the correct structure

## What to OPTIMIZE:
- Bullet point descriptions under each work experience (make them achievement-focused with metrics)
- Professional summary (if present)
- Skills phrasing (align with job description keywords)

## What to PRESERVE EXACTLY:
- Person's name
- Contact information (email, phone, LinkedIn, GitHub)
- Job titles
- Company names
- Employment dates
- School names
- Degree names
- Graduation dates

## OUTPUT FORMAT:
Return a JSON object with this EXACT structure:
{
  "personalInfo": {
    "name": "Full Name",
    "title": "Professional Title (e.g., Senior Software Engineer)",
    "email": "email@example.com",
    "phone": "+1-123-456-7890",
    "location": "City, State",
    "linkedin": "linkedin.com/in/username",
    "github": "github.com/username",
    "website": "portfolio.com"
  },
  "summary": "Professional summary paragraph optimized for the target role...",
  "experience": [
    {
      "title": "Job Title (UNCHANGED from original)",
      "company": "Company Name (UNCHANGED from original)",
      "location": "City, State",
      "startDate": "Jan 2020",
      "endDate": "Present",
      "bullets": [
        "Achievement-focused bullet with metrics and keywords from job description",
        "Another impactful bullet point..."
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name (UNCHANGED)",
      "school": "University Name (UNCHANGED)",
      "location": "City, State",
      "graduationDate": "2020",
      "gpa": "3.8",
      "highlights": ["Relevant coursework", "Honors"]
    }
  ],
  "skills": [
    {
      "category": "Technical Skills",
      "items": ["Skill1", "Skill2", "Skill3"]
    },
    {
      "category": "Tools & Technologies", 
      "items": ["Tool1", "Tool2"]
    }
  ],
  "certifications": ["Certification 1", "Certification 2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "bullets": ["Achievement 1", "Achievement 2"]
    }
  ],
  "metadata": {
    "atsScore": 85,
    "keywordsIncorporated": ["keyword1", "keyword2"],
    "suggestionsForImprovement": ["Add more metrics", "Consider adding..."]
  }
}

## IMPORTANT:
- Return ONLY the JSON object, no markdown code blocks or extra text
- Ensure all JSON is valid and properly escaped
- If a field is not found in the resume, omit it or use null
- Keep experience and education in chronological order (most recent first)
`;

// Simpler fallback prompt for when JSON parsing fails
export const RESUME_OPTIMIZATION_PROMPT_FALLBACK = `You are an expert resume writer. Optimize this resume for the target job description.

RULES:
1. Keep job titles, company names, dates, schools UNCHANGED
2. Only improve bullet point descriptions to be more impactful
3. Add relevant keywords from the job description naturally
4. Use action verbs and quantify achievements

Return the optimized resume in plain text format with clear sections.
`;
