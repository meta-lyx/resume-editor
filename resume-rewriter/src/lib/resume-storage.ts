// Utility for persisting resume data in localStorage

const STORAGE_KEYS = {
  EXTRACTED_TEXT: 'resume_extracted_text',
  RESUME_TITLE: 'resume_title',
  JOB_DESCRIPTION: 'resume_job_description',
  CUSTOMIZED_RESUME: 'resume_customized',
  RESUME_PROCESSED: 'resume_processed',
  RESUME_FILE_NAME: 'resume_file_name',
} as const;

export interface ResumeData {
  extractedText: string;
  resumeTitle: string;
  jobDescription: string;
  customizedResume: string;
  resumeProcessed: boolean;
  resumeFileName?: string;
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
}

export function loadResumeData(): ResumeData {
  return {
    extractedText: localStorage.getItem(STORAGE_KEYS.EXTRACTED_TEXT) || '',
    resumeTitle: localStorage.getItem(STORAGE_KEYS.RESUME_TITLE) || '',
    jobDescription: localStorage.getItem(STORAGE_KEYS.JOB_DESCRIPTION) || '',
    customizedResume: localStorage.getItem(STORAGE_KEYS.CUSTOMIZED_RESUME) || '',
    resumeProcessed: localStorage.getItem(STORAGE_KEYS.RESUME_PROCESSED) === 'true',
    resumeFileName: localStorage.getItem(STORAGE_KEYS.RESUME_FILE_NAME) || undefined,
  };
}

export function clearResumeData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}

