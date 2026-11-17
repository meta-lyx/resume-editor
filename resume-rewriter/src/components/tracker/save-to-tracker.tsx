// "Save to tracker" button for the dashboard results: stores the job and the tailored resume.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BookmarkPlus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApplicationForm } from '@/components/tracker/application-form';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { guessJobFromDescription } from '@/lib/resume-history';
import type { ResumeData } from '@/components/pdf/resume-pdf-template';

export function SaveToTrackerButton({
  jobDescription,
  resumeText,
  structuredResume,
  atsScore,
  includeResume,
}: {
  jobDescription: string;
  resumeText: string;
  structuredResume: ResumeData | null;
  atsScore?: number;
  /** False when the tailored resume is still locked behind payment: only the job is saved. */
  includeResume: boolean;
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  if (savedId) {
    return (
      <Button asChild variant="outline" size="lg">
        <Link to="/applications"><Check className="mr-2 h-4 w-4 text-primary" />Saved: view tracker</Link>
      </Button>
    );
  }

  const guess = guessJobFromDescription(jobDescription);

  return (
    <>
      <Button
        variant="outline"
        size="lg"
        onClick={() => {
          if (!user) {
            toast('Log in to save jobs to your tracker');
            navigate('/login');
            return;
          }
          setOpen(true);
        }}
      >
        <BookmarkPlus className="mr-2 h-4 w-4" />
        Save to tracker
      </Button>
      {open && (
        <ApplicationForm
          title="Save to application tracker"
          showJobDescription={false}
          initial={{ company: guess.company, role: guess.role }}
          footnote={
            includeResume
              ? 'The job description and this tailored resume are saved with it, so you can download the exact version later.'
              : 'The job description is saved. Unlock the tailored resume to save it with this job too.'
          }
          onSubmit={async (values) => {
            const { data, error } = await apiClient.createApplication({
              ...values,
              jobDescription,
              atsScore: atsScore || null,
              ...(includeResume ? { resumeText, structuredResume } : {}),
            });
            if (error || !data) {
              toast.error(error?.message || 'Could not save');
              return false;
            }
            setSavedId(data.application.id);
            toast.success('Saved to your tracker');
            return true;
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
