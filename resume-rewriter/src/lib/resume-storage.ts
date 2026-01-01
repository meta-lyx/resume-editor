// Utility for persisting resume data in localStorage

const STORAGE_KEYS = {
  EXTRACTED_TEXT: 'resume_extracted_text',
  RESUME_TITLE: 'resume_title',
  JOB_DESCRIPTION: 'resume_job_description',
  CUSTOMIZED_RESUME: 'resume_customized',
  RESUME_PROCESSED: 'resume_processed',
  RESUME_FILE_NAME: 'resume_file_name',
  AI_PROCESSING_TIME: 'ai_processing_time',
  AI_ATS_SCORE: 'ai_ats_score',
  AI_KEYWORDS_MATCHED: 'ai_keywords_matched',
  AI_SUGGESTIONS: 'ai_suggestions',
} as const;

export interface ResumeData {
  extractedText: string;
  resumeTitle: string;
  jobDescription: string;
  customizedResume: string;
  resumeProcessed: boolean;
  resumeFileName?: string;
  aiProcessingTime?: number;
  aiAtsScore?: number;
  aiKeywordsMatched?: string[];
  aiSuggestions?: string[];
}

export function saveResumeData(data: Partial<ResumeData>) {
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

export function loadResumeData(): ResumeData {
  let aiKeywordsMatched: string[] = [];
  let aiSuggestions: string[] = [];
  
  try {
    const keywordsStr = localStorage.getItem(STORAGE_KEYS.AI_KEYWORDS_MATCHED);
    if (keywordsStr) aiKeywordsMatched = JSON.parse(keywordsStr);
  } catch {}
  
  try {
    const suggestionsStr = localStorage.getItem(STORAGE_KEYS.AI_SUGGESTIONS);
    if (suggestionsStr) aiSuggestions = JSON.parse(suggestionsStr);
  } catch {}
  
  return {
    extractedText: localStorage.getItem(STORAGE_KEYS.EXTRACTED_TEXT) || '',
    resumeTitle: localStorage.getItem(STORAGE_KEYS.RESUME_TITLE) || '',
    jobDescription: localStorage.getItem(STORAGE_KEYS.JOB_DESCRIPTION) || '',
    customizedResume: localStorage.getItem(STORAGE_KEYS.CUSTOMIZED_RESUME) || '',
    resumeProcessed: localStorage.getItem(STORAGE_KEYS.RESUME_PROCESSED) === 'true',
    resumeFileName: localStorage.getItem(STORAGE_KEYS.RESUME_FILE_NAME) || undefined,
    aiProcessingTime: parseInt(localStorage.getItem(STORAGE_KEYS.AI_PROCESSING_TIME) || '0', 10) || undefined,
    aiAtsScore: parseInt(localStorage.getItem(STORAGE_KEYS.AI_ATS_SCORE) || '0', 10) || undefined,
    aiKeywordsMatched,
    aiSuggestions,
  };
}

export function clearResumeData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

