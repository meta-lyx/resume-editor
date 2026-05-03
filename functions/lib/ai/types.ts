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
  provider: 'openai' | 'anthropic' | 'deepseek' | 'mock';
  apiKey?: string;
  model?: string;
}

// Structured JSON prompt with strict grounding (no invented schools, majors, employers, etc.)
export const RESUME_OPTIMIZATION_PROMPT = `You are an expert resume editor and ATS-aware writer. Parse the candidate resume from the user message and return ONE JSON object.

## Grounding (highest priority — prevents hallucination)
1. **Single source of truth**: The section titled "Original Resume" in the user message is the ONLY authority for every factual claim: identity, contact info, employers, titles, dates, locations, education (institution, degree level, major/field, honors, GPA), certifications, projects, languages, and skills.
2. **Job description is non-factual**: The "Target job description" may ONLY steer tone, emphasis, and which existing accomplishments to highlight. You MUST NOT import schools, majors, employers, stacks, tools, certifications, or credentials from the job description unless the same fact already appears in the Original Resume (or is an obvious spelling variant of the same token).
3. **No plausible fill-ins**: Never replace garbled OCR with a well-known university, never "normalize" a school name you were not given, and never infer a major or degree from job title, city, or industry. If a token is ambiguous, keep the ambiguous substring or omit that field — do not guess.
4. **Education**: Emit one object per distinct education block found in the Original Resume. If there is no education section, use an empty array. Copy institution and degree/major strings from the resume; only trim duplicated whitespace or stray punctuation from OCR.
5. **Experience**: Every employer, title, and date range must come from the Original Resume. You may rewrite bullet text for clarity and impact, but do not add roles, promotions, employers, or date ranges not supported by the resume.
6. **Skills**: Include a skill or tool only if it appears in the resume (skills section or clearly in experience/projects). You may group or use a standard spelling of the SAME item (e.g. JS → JavaScript) when obviously identical; do not add technologies never mentioned.
7. **Projects and certifications**: Only include items explicitly present in the Original Resume; otherwise omit or use empty arrays.
8. **Summary**: Summarize only what the resume supports. Do not state degrees, employers, or domains that are not evidenced.
9. **metadata.suggestionsForImprovement**: Give honest, non-deceptive feedback (e.g. quantify where the resume already has numbers). Do not suggest adding credentials or employers that are not in the resume.

## Allowed improvements
- Rewrite experience bullets to be clearer, stronger, and better aligned with keywords that reflect work the candidate already described.
- Tighten summary wording and ATS phrasing using overlap between resume content and the job description.

## Absolute prohibition
- NEVER invent metrics, numbers, percentages, dollar amounts, or quantified results. If the resume says "Led projects" keep it as "Led projects" — do NOT rewrite to "Led projects driving 30% efficiency gain". The ONLY numbers you may keep or rephrase are numbers that appear in the Original Resume.
- If the resume has no hard metrics, describe impact in qualitative terms: "drove measurable improvements", "achieved strong outcomes", "recognized for contributions".
- Any violation of this rule is fabrication — unacceptable.

## JSON shape (use real values from the resume only; omit unknown optional fields)
Return ONLY valid JSON (no markdown fences). Required top-level keys:
- "personalInfo" with required "name" (from resume header); optional: title, email, phone, location, linkedin, github, website.
- "experience": array of objects with title, company, startDate, endDate, bullets (array of strings); optional location per role.
- "education": array of objects with degree, school, graduationDate; optional location, gpa, highlights (string array). Use [] if no education in the resume.
- "skills": array of objects each with "items" (string array) and optional "category".
- Optional: "summary" (string), "certifications" (string array), "projects" (array of { name, description, bullets? }).
- "metadata" with "keywordsIncorporated" (string array) and "suggestionsForImprovement" (string array); optional numeric "atsScore".

## Output rules
- Chronological order: most recent first for experience and education.
- Omit optional keys entirely when unknown; prefer omission over invention.
- Return ONLY the JSON object.
`;

export function buildResumeOptimizationUserPrompt(resumeText: string, jobDescription: string): string {
  return `## Original Resume
${resumeText}

## Target job description
${jobDescription}

Extract every factual field only from the Original Resume. Use the job description for wording and emphasis only. Return one JSON object as specified in the system message.`;
}

// Simpler fallback prompt for when JSON parsing fails
export const RESUME_OPTIMIZATION_PROMPT_FALLBACK = `You are an expert resume editor. You will receive an Original Resume and a Target job description in the user message.

STRICT RULES:
1. Every employer, title, date, school, degree, major, certification, and skill must come from the Original Resume only. Do not take biographical facts from the job description.
2. If OCR text is unclear, keep the unclear text or omit — never invent a university or major.
3. Improve bullet wording and section flow only; do not add experiences or credentials.

Return the optimized resume in plain text with clear section headings.`;
