// Utility for persisting resume data in localStorage
import type { ResumeData as PDFResumeData } from '@/components/pdf/resume-pdf-template';

const STORAGE_KEYS = {
  EXTRACTED_TEXT: 'resume_extracted_text',
  RESUME_TITLE: 'resume_title',
  JOB_DESCRIPTION: 'resume_job_description',
  CUSTOMIZED_RESUME: 'resume_customized',
  STRUCTURED_RESUME: 'resume_structured', // NEW: Structured JSON data from AI
  RESUME_PROCESSED: 'resume_processed',
  RESUME_FILE_NAME: 'resume_file_name',
  AI_PROCESSING_TIME: 'ai_processing_time',
  AI_ATS_SCORE: 'ai_ats_score',
  AI_KEYWORDS_MATCHED: 'ai_keywords_matched',
  AI_SUGGESTIONS: 'ai_suggestions',
} as const;

export interface ResumeStorageData {
  extractedText: string;
  resumeTitle: string;
  jobDescription: string;
  customizedResume: string;
  structuredResume?: PDFResumeData; // Structured data for PDF generation
  resumeProcessed: boolean;
  resumeFileName?: string;
  aiProcessingTime?: number;
  aiAtsScore?: number;
  aiKeywordsMatched?: string[];
  aiSuggestions?: string[];
}

export function saveResumeData(data: Partial<ResumeStorageData>) {
  if (data.extractedText !== undefined) {
    localStorage.setItem(STORAGE_KEYS.EXTRACTED_TEXT, data.extractedText);
  }
  if (data.resumeTitle !== undefined) {
    localStorage.setItem(STORAGE_KEYS.RESUME_TITLE, data.resumeTitle);
  }
  if (data.jobDescription !== undefined) {
    localStorage.setItem(STORAGE_KEYS.JOB_DESCRIPTION, data.jobDescription);
  }
  if (data.customizedResume !== undefined) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMIZED_RESUME, data.customizedResume);
  }
  if (data.structuredResume !== undefined) {
    localStorage.setItem(STORAGE_KEYS.STRUCTURED_RESUME, JSON.stringify(data.structuredResume));
  }
  if (data.resumeProcessed !== undefined) {
    localStorage.setItem(STORAGE_KEYS.RESUME_PROCESSED, String(data.resumeProcessed));
  }
  if (data.resumeFileName !== undefined) {
    localStorage.setItem(STORAGE_KEYS.RESUME_FILE_NAME, data.resumeFileName);
  }
  if (data.aiProcessingTime !== undefined) {
    localStorage.setItem(STORAGE_KEYS.AI_PROCESSING_TIME, String(data.aiProcessingTime));
  }
  if (data.aiAtsScore !== undefined) {
    localStorage.setItem(STORAGE_KEYS.AI_ATS_SCORE, String(data.aiAtsScore));
  }
  if (data.aiKeywordsMatched !== undefined) {
    localStorage.setItem(STORAGE_KEYS.AI_KEYWORDS_MATCHED, JSON.stringify(data.aiKeywordsMatched));
  }
  if (data.aiSuggestions !== undefined) {
    localStorage.setItem(STORAGE_KEYS.AI_SUGGESTIONS, JSON.stringify(data.aiSuggestions));
  }
}

export function loadResumeData(): ResumeStorageData {
  let aiKeywordsMatched: string[] = [];
  let aiSuggestions: string[] = [];
  let structuredResume: PDFResumeData | undefined;
  
  try {
    const keywordsStr = localStorage.getItem(STORAGE_KEYS.AI_KEYWORDS_MATCHED);
    if (keywordsStr) aiKeywordsMatched = JSON.parse(keywordsStr);
  } catch {}
  
  try {
    const suggestionsStr = localStorage.getItem(STORAGE_KEYS.AI_SUGGESTIONS);
    if (suggestionsStr) aiSuggestions = JSON.parse(suggestionsStr);
  } catch {}
  
  try {
    const structuredStr = localStorage.getItem(STORAGE_KEYS.STRUCTURED_RESUME);
    if (structuredStr) {
      const parsed = JSON.parse(structuredStr);
      // Convert from AI format to PDF format if needed
      structuredResume = convertToResumeData(parsed);
    }
  } catch (e) {
    console.error('Error loading structured resume:', e);
  }
  
  return {
    extractedText: localStorage.getItem(STORAGE_KEYS.EXTRACTED_TEXT) || '',
    resumeTitle: localStorage.getItem(STORAGE_KEYS.RESUME_TITLE) || '',
    jobDescription: localStorage.getItem(STORAGE_KEYS.JOB_DESCRIPTION) || '',
    customizedResume: localStorage.getItem(STORAGE_KEYS.CUSTOMIZED_RESUME) || '',
    structuredResume,
    resumeProcessed: localStorage.getItem(STORAGE_KEYS.RESUME_PROCESSED) === 'true',
    resumeFileName: localStorage.getItem(STORAGE_KEYS.RESUME_FILE_NAME) || undefined,
    aiProcessingTime: parseInt(localStorage.getItem(STORAGE_KEYS.AI_PROCESSING_TIME) || '0', 10) || undefined,
    aiAtsScore: parseInt(localStorage.getItem(STORAGE_KEYS.AI_ATS_SCORE) || '0', 10) || undefined,
    aiKeywordsMatched,
    aiSuggestions,
  };
}

// Convert AI structured resume to PDF template format
function convertToResumeData(aiResume: any): PDFResumeData {
  // Handle both formats: data might have personalInfo object OR have fields at top level
  const personalInfo = aiResume.personalInfo || {};
  const contact = aiResume.contact || {};
  
  // Try to get name from multiple possible locations
  const name = aiResume.name || personalInfo.name || 'Your Name';
  const title = aiResume.title || personalInfo.title;
  
  // Contact info can be in personalInfo, contact object, or at top level
  const email = contact.email || personalInfo.email || aiResume.email;
  const phone = contact.phone || personalInfo.phone || aiResume.phone;
  const location = contact.location || personalInfo.location || aiResume.location;
  const linkedin = contact.linkedin || personalInfo.linkedin || aiResume.linkedin;
  const github = contact.github || personalInfo.github || aiResume.github;
  const website = contact.website || personalInfo.website || aiResume.website;
  
  return {
    name,
    title,
    contact: {
      email,
      phone,
      location,
      linkedin,
      github,
      website,
    },
    summary: aiResume.summary || '',
    experience: (aiResume.experience || []).map((exp: any) => ({
      title: exp.title || '',
      company: exp.company || '',
      location: exp.location,
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      bullets: exp.bullets || [],
    })),
    education: (aiResume.education || []).map((edu: any) => ({
      degree: edu.degree || '',
      school: edu.school || '',
      location: edu.location,
      graduationDate: edu.graduationDate || '',
      gpa: edu.gpa,
      highlights: edu.highlights,
    })),
    skills: (aiResume.skills || []).map((skill: any) => ({
      category: skill.category,
      items: skill.items || [],
    })),
    certifications: aiResume.certifications,
    projects: aiResume.projects?.map((proj: any) => ({
      name: proj.name || '',
      description: proj.description || '',
      bullets: proj.bullets,
    })),
  };
}

export function clearResumeData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

// Export the old type name for backwards compatibility
export type ResumeData = ResumeStorageData;
