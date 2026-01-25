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
5. **EXTRACT NAME FIRST**: The person's name is typically at the TOP of the resume. Look for it in the first few lines. It is NOT "Your Name" - find the ACTUAL name!

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
    "name": "ACTUAL Full Name from resume - EXTRACT THE REAL NAME, NEVER use placeholders!",
    "title": "Professional Title from resume",
    "email": "REAL EMAIL from the resume",
    "phone": "REAL PHONE from the resume in its exact format",
    "location": "REAL LOCATION from the resume",
    "linkedin": "REAL linkedin URL from resume if present",
    "github": "REAL github URL from resume if present",
    "website": "REAL website URL from resume if present"
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
- The NAME field is REQUIRED - always extract the actual person's name from the resume header, NEVER use placeholders like "Your Name" or "Full Name"
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
