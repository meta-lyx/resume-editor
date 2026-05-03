import { apiClient } from '@/lib/api-client';

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

// Client-side PDF text extraction
async function extractPdfText(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs';
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => 'str' in item ? item.str : '').join(' ');
      fullText += pageText + '\n';
    }
    return fullText.trim();
  } catch (err) {
    console.error('PDF extraction error:', err);
    console.error('PDF extraction error details:', err instanceof Error ? err.message : JSON.stringify(err, null, 2));
    throw new Error('Failed to extract text from PDF: ' + (err instanceof Error ? err.message : 'Unknown error'));
  }
}

export async function extractResumeText(file: File) {
  // Handle PDF files client-side
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const text = await extractPdfText(file);
    return { extractedText: text };
  }
  
  // For other file types (images, docx, txt), send to backend
  const { data, error } = await apiClient.extractResumeText(file);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}
