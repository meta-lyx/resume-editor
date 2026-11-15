// Shared pieces for the free tools: resume input (file or paste), score dial, CTA and FAQ.
import { useCallback, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FileText, Loader2, Lock, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { extractFileText } from '@/lib/file-text';
import type { FileInfo } from '@/lib/resume-analysis';

export type ResumeValue = { text: string; file: FileInfo; fileName?: string };

export function PrivacyNote() {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
      <Lock className="h-3.5 w-3.5 text-primary" />
      Free, no sign-up. Runs in your browser; your resume is never uploaded.
    </p>
  );
}

export function ResumeInput({ value, onChange }: { value: ResumeValue; onChange: (v: ResumeValue) => void }) {
  const [mode, setMode] = useState<'file' | 'paste'>('file');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file) return;
      setError(undefined);
      setLoading(true);
      try {
        const result = await extractFileText(file);
        onChange({
          text: result.text,
          fileName: file.name,
          file: { kind: result.kind, pages: result.pages, hasTables: result.hasTables, hasImages: result.hasImages },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not read that file.');
      } finally {
        setLoading(false);
      }
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
  });

  return (
    <div>
      <div className="mb-3 flex h-8 items-center justify-between">
        <label className="text-sm font-medium">Your resume</label>
        <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs" role="tablist">
          {(['file', 'paste'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 transition-colors ${mode === m ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {m === 'file' ? 'Upload file' : 'Paste text'}
            </button>
          ))}
        </div>
      </div>

      {mode === 'file' ? (
        value.fileName ? (
          <div className="flex items-center justify-between rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <FileText className="h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{value.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {value.text.split(/\s+/).filter(Boolean).length} words read
                  {value.file.pages ? ` · ${value.file.pages} page${value.file.pages > 1 ? 's' : ''}` : ''}
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Remove file"
              onClick={() => onChange({ text: '', file: {} })}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            {loading ? (
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
            ) : (
              <Upload className="h-7 w-7 text-muted-foreground" />
            )}
            <p className="mt-3 text-sm font-medium">{loading ? 'Reading your resume…' : 'Drop your resume here, or click to choose'}</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX or TXT</p>
          </div>
        )
      ) : (
        <textarea
          value={value.text}
          onChange={(e) => onChange({ text: e.target.value, file: { kind: 'paste' } })}
          rows={12}
          placeholder="Paste the full text of your resume…"
          className="w-full rounded-xl border border-border bg-input p-4 text-sm outline-none focus:border-primary"
        />
      )}
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function JobDescriptionInput({ value, onChange, optional }: { value: string; onChange: (v: string) => void; optional?: boolean }) {
  return (
    <div>
      <label htmlFor="jd" className="mb-3 flex h-8 items-center gap-1 text-sm font-medium">
        Job description {optional && <span className="font-normal text-muted-foreground">(optional, adds a keyword check)</span>}
      </label>
      <textarea
        id="jd"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        placeholder="Paste the full job posting, including the requirements…"
        className="w-full rounded-xl border border-border bg-input p-4 text-sm outline-none focus:border-primary"
      />
    </div>
  );
}

export function ScoreDial({ score, label }: { score: number; label: string }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const color = score >= 80 ? 'hsl(var(--primary))' : score >= 60 ? 'hsl(42 93% 56%)' : 'hsl(var(--destructive))';
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold tabular-nums">{score}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

export function ToolCta({ title, body }: { title: string; body: string }) {
  return (
    <aside className="rounded-2xl border border-primary/30 bg-primary/5 p-6 md:p-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{body}</p>
      <Button asChild className="mt-5">
        <Link to="/">Optimize my resume with PixelPear</Link>
      </Button>
    </aside>
  );
}

export type Faq = { q: string; a: string };

/** Visible FAQ plus matching FAQPage structured data. */
export function FaqSection({ faqs }: { faqs: Faq[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };
  return (
    <section className="mt-16">
      <JsonLd data={data} />
      <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
      <dl className="mt-6 divide-y divide-border">
        {faqs.map((f) => (
          <div key={f.q} className="py-5">
            <dt className="font-medium">{f.q}</dt>
            <dd className="mt-2 text-muted-foreground leading-relaxed">{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

export function toolStructuredData(name: string, path: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name,
    url: `https://pixelpear.io${path}`,
    description,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any (web browser)',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function Prose({ children }: { children: ReactNode }) {
  return <div className="prose prose-neutral mt-16 max-w-none">{children}</div>;
}
