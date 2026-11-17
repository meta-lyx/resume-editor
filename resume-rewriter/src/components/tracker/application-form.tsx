// Add / edit dialog for one tracked application.
import { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModalPortal } from '@/components/ui/modal-portal';
import { APPLICATION_STATUSES, type ApplicationStatus, type JobApplicationInput } from '@/lib/applications';

export type ApplicationFormValues = {
  company: string;
  role: string;
  jobUrl: string;
  location: string;
  status: ApplicationStatus;
  notes: string;
  jobDescription: string;
};

const input =
  'w-full rounded-lg border border-border bg-input px-3 py-2 text-sm outline-none focus:border-primary';

export function ApplicationForm({
  title,
  initial,
  showJobDescription = true,
  footnote,
  onSubmit,
  onClose,
}: {
  title: string;
  initial?: Partial<ApplicationFormValues>;
  showJobDescription?: boolean;
  footnote?: string;
  onSubmit: (values: JobApplicationInput) => Promise<boolean>;
  onClose: () => void;
}) {
  const [v, setV] = useState<ApplicationFormValues>({
    company: '', role: '', jobUrl: '', location: '', status: 'saved', notes: '', jobDescription: '',
    ...initial,
  });
  const [saving, setSaving] = useState(false);
  const set = (k: keyof ApplicationFormValues) => (e: { target: { value: string } }) => setV({ ...v, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onSubmit({
      company: v.company.trim(),
      role: v.role.trim(),
      jobUrl: v.jobUrl.trim() || null,
      location: v.location.trim() || null,
      status: v.status,
      notes: v.notes.trim() || null,
      ...(showJobDescription ? { jobDescription: v.jobDescription.trim() || null } : {}),
    });
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
        <form
          onSubmit={submit}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6"
        >
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1.5 block font-medium">Company *</span>
              <input className={input} value={v.company} onChange={set('company')} required maxLength={200} />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block font-medium">Role *</span>
              <input className={input} value={v.role} onChange={set('role')} required maxLength={200} />
            </label>
            <label className="text-sm sm:col-span-2">
              <span className="mb-1.5 block font-medium">Job link</span>
              <input className={input} value={v.jobUrl} onChange={set('jobUrl')} type="url" placeholder="https://" maxLength={2048} />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block font-medium">Location</span>
              <input className={input} value={v.location} onChange={set('location')} placeholder="New York, NY" maxLength={200} />
            </label>
            <label className="text-sm">
              <span className="mb-1.5 block font-medium">Status</span>
              <select className={input} value={v.status} onChange={set('status')}>
                {APPLICATION_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
            {showJobDescription && (
              <label className="text-sm sm:col-span-2">
                <span className="mb-1.5 block font-medium">Job description</span>
                <textarea className={input} rows={4} value={v.jobDescription} onChange={set('jobDescription')} placeholder="Paste the posting so you can compare against it later" />
              </label>
            )}
            <label className="text-sm sm:col-span-2">
              <span className="mb-1.5 block font-medium">Notes</span>
              <textarea className={input} rows={3} value={v.notes} onChange={set('notes')} placeholder="Recruiter name, referral, interview dates…" maxLength={5000} />
            </label>
          </div>
          {footnote && <p className="mt-4 text-xs text-muted-foreground">{footnote}</p>}
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </div>
    </ModalPortal>
  );
}
