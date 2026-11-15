import { apiClient } from '@/lib/api-client';
import { extractPdfText } from '@/lib/file-text';

export async function uploadResumeFile(file: File) {
  const { data, error } = await apiClient.uploadResume(file);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}

export async function createResume(data: {
  title: string;
  originalContent: any;
  jobDescription?: string;
}) {
  const { data: resumeData, error } = await apiClient.createResume({
      title: data.title,
    content: data.originalContent,
    job_description: data.jobDescription,
  });
  
  if (error) {
    throw new Error(error.message);
  }
  
  return resumeData?.resume;
}

export async function optimizeResume(data: {
  resumeId: string;
  jobDescription: string;
}) {
  const { data: optimizeData, error } = await apiClient.optimizeResume(
    data.resumeId,
    data.jobDescription
  );
  
  if (error) {
    throw new Error(error.message);
  }
  
  return optimizeData;
}

export async function getUserResumes() {
  const { data, error } = await apiClient.getResumes();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data?.resumes || [];
}

export async function getResumeById(resumeId: string) {
  const { data, error } = await apiClient.getResume(resumeId);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data?.resume;
}

export async function deleteResume(resumeId: string) {
  const { error } = await apiClient.deleteResume(resumeId);
  
  if (error) {
    throw new Error(error.message);
  }
}

async function extractViaBackend(file: File) {
  const { data, error } = await apiClient.extractResumeText(file);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

// Below this many characters we assume the PDF is image-based (scanned or
// exported from a design tool) and needs server-side OCR instead.
const MIN_EXTRACTED_TEXT_LENGTH = 50;

export async function extractResumeText(file: File) {
  // For PDFs, try fast client-side extraction of the text layer first.
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    let clientText = '';
    try {
      clientText = await extractPdfText(file);
    } catch (err) {
      console.warn('Client-side PDF extraction failed, falling back to server OCR:', err);
    }

    if (clientText.length >= MIN_EXTRACTED_TEXT_LENGTH) {
      return { extractedText: clientText };
    }

    // No usable text layer (e.g. scanned or image-based PDF): use the
    // backend, which parses PDFs server-side and falls back to Vision OCR.
    return extractViaBackend(file);
  }

  // Other file types (images, docx) are always handled by the backend.
  return extractViaBackend(file);
}
