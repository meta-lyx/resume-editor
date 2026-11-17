// Application tracker: every job the user saved or applied to, with the resume version used.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Briefcase, Download, ExternalLink, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApplicationForm } from '@/components/tracker/application-form';
import { apiClient } from '@/lib/api-client';
import { APPLICATION_STATUSES, statusMeta, type ApplicationStatus, type JobApplication, type JobApplicationInput } from '@/lib/applications';
import { downloadResumePdf } from '@/lib/resume-pdf-download';

function formatDate(unix?: number | null) {
  if (!unix) return '';
  return new Date(unix * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ApplicationsPage() {
  const [apps, setApps] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | ApplicationStatus>('all');
  const [editing, setEditing] = useState<JobApplication | 'new' | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await apiClient.listApplications();
    if (error) toast.error(error.message);
    else setApps(data?.applications ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: apps.length };
    for (const a of apps) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [apps]);
  const shown = filter === 'all' ? apps : apps.filter((a) => a.status === filter);

  const replace = (updated: JobApplication) =>
    setApps((list) => [{ ...updated, hasResume: !!(updated.resumeText || updated.structuredResume) }, ...list.filter((a) => a.id !== updated.id)]);

  const create = async (input: JobApplicationInput) => {
    const { data, error } = await apiClient.createApplication(input);
    if (error || !data) { toast.error(error?.message || 'Could not save'); return false; }
    replace(data.application);
    toast.success('Saved to your tracker');
    return true;
  };

  const update = async (id: string, input: JobApplicationInput, quiet = false) => {
    const { data, error } = await apiClient.updateApplication(id, input);
    if (error || !data) { toast.error(error?.message || 'Could not update'); return false; }
    replace(data.application);
    if (!quiet) toast.success('Updated');
    return true;
  };

  const remove = async (app: JobApplication) => {
    if (!window.confirm(`Delete ${app.role} at ${app.company}? This can't be undone.`)) return;
    const { error } = await apiClient.deleteApplication(app.id);
    if (error) return toast.error(error.message);
    setApps((list) => list.filter((a) => a.id !== app.id));
  };

  const downloadResume = async (app: JobApplication) => {
    setBusyId(app.id);
    try {
      const { data, error } = await apiClient.getApplication(app.id);
      if (error || !data) throw new Error(error?.message || 'Could not load this application');
      const full = data.application;
      const base = `${full.company} ${full.role} resume`;
      if (full.structuredResume) {
        await downloadResumePdf(full.structuredResume, 'us-ats', `${base}.pdf`);
      } else if (full.resumeText) {
        const blob = new Blob([full.resumeText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${base}.txt`; a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Application tracker</h1>
            <p className="mt-2 text-muted-foreground">Every job you're going after, the resume you sent, and where it stands.</p>
          </div>
          <Button onClick={() => setEditing('new')}><Plus className="mr-1.5 h-4 w-4" />Add job</Button>
        </header>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
          {[{ id: 'all', label: 'All' }, ...APPLICATION_STATUSES].map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={filter === s.id}
              onClick={() => setFilter(s.id as typeof filter)}
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                filter === s.id ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              {s.label} <span className="tabular-nums text-muted-foreground">{counts[s.id] ?? 0}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="mt-16 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : apps.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center">
            <Briefcase className="mx-auto h-8 w-8 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No applications yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Tailor your resume to a job on the <Link to="/dashboard" className="text-primary hover:underline">dashboard</Link> and
              click "Save to tracker", or add a job by hand.
            </p>
            <Button className="mt-5" variant="outline" onClick={() => setEditing('new')}>Add a job</Button>
          </div>
        ) : shown.length === 0 ? (
          <p className="mt-10 text-center text-muted-foreground">Nothing in this stage.</p>
        ) : (
          <ul className="mt-6 divide-y divide-border rounded-2xl border border-border bg-card">
            {shown.map((app) => (
              <li key={app.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{app.role}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {[app.company, app.location].filter(Boolean).join(' · ')}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {app.appliedAt ? `Applied ${formatDate(app.appliedAt)}` : `Saved ${formatDate(app.createdAt)}`}
                    {app.atsScore != null && ` · ATS ${app.atsScore}`}
                    {app.notes && ` · ${app.notes.slice(0, 60)}${app.notes.length > 60 ? '…' : ''}`}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label={`Status for ${app.role} at ${app.company}`}
                    value={app.status}
                    onChange={(e) => update(app.id, { status: e.target.value as ApplicationStatus }, true)}
                    className={`rounded-full border-0 px-3 py-1 text-xs font-medium outline-none ${statusMeta(app.status).color}`}
                  >
                    {APPLICATION_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  {app.hasResume && (
                    <Button size="sm" variant="outline" onClick={() => downloadResume(app)} disabled={busyId === app.id} title="Download the resume you used for this job">
                      {busyId === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                      <span className="ml-1.5">Resume</span>
                    </Button>
                  )}
                  {app.jobUrl && (
                    <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" aria-label="Open job posting" className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  <button onClick={() => setEditing(app)} aria-label="Edit" className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => remove(app)} aria-label="Delete" className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editing && (
        <ApplicationForm
          title={editing === 'new' ? 'Add a job' : 'Edit application'}
          showJobDescription={editing === 'new'}
          initial={editing === 'new' ? undefined : {
            company: editing.company, role: editing.role, jobUrl: editing.jobUrl ?? '', location: editing.location ?? '',
            status: editing.status, notes: editing.notes ?? '',
          }}
          onSubmit={(values) => (editing === 'new' ? create(values) : update(editing.id, values))}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
