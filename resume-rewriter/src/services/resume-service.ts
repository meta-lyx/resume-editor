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

export async function extractResumeText(file: File) {
  const { data, error } = await apiClient.extractResumeText(file);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data;
}
