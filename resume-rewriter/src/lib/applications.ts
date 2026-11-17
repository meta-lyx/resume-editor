// Types and labels for the application tracker (stored in the user's account).
import type { ResumeData } from '@/components/pdf/resume-pdf-template';

export const APPLICATION_STATUSES = [
  { id: 'saved', label: 'Saved', color: 'bg-muted text-muted-foreground' },
  { id: 'applied', label: 'Applied', color: 'bg-sky-500/15 text-sky-300' },
  { id: 'interviewing', label: 'Interviewing', color: 'bg-amber-500/15 text-amber-300' },
  { id: 'offer', label: 'Offer', color: 'bg-primary/15 text-primary' },
  { id: 'rejected', label: 'Rejected', color: 'bg-destructive/15 text-red-300' },
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]['id'];

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  jobUrl?: string | null;
  location?: string | null;
  status: ApplicationStatus;
  jobDescription?: string | null;
  resumeText?: string | null;
  structuredResume?: ResumeData | null;
  atsScore?: number | null;
  keywordScore?: number | null;
  notes?: string | null;
  appliedAt?: number | null;
  createdAt: number;
  updatedAt: number;
  hasResume?: boolean;
};

export type JobApplicationInput = Partial<Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'hasResume'>>;

export function statusMeta(id: string) {
  return APPLICATION_STATUSES.find((s) => s.id === id) ?? APPLICATION_STATUSES[0];
}
