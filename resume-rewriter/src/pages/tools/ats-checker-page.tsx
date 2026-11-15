import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FaqSection, JobDescriptionInput, JsonLd, PrivacyNote, Prose, ResumeInput, ScoreDial, ToolCta,
  toolStructuredData, type ResumeValue,
} from '@/components/tools/tool-parts';
import { checkResume, extractJobKeywords, matchKeywords, type Check, type CheckStatus } from '@/lib/resume-analysis';

const STATUS_ICON: Record<CheckStatus, JSX.Element> = {
  pass: <CheckCircle2 className="h-5 w-5 text-primary" aria-label="Pass" />,
  warn: <AlertTriangle className="h-5 w-5 text-amber-400" aria-label="Needs attention" />,
  fail: <XCircle className="h-5 w-5 text-destructive" aria-label="Problem" />,
  info: <Info className="h-5 w-5 text-muted-foreground" aria-label="Note" />,
};
const STATUS_ORDER: Record<CheckStatus, number> = { fail: 0, warn: 1, info: 2, pass: 3 };

function CheckRow({ check }: { check: Check }) {
  return (
    <li className="flex gap-3 py-4">
      <span className="mt-0.5 shrink-0">{STATUS_ICON[check.status]}</span>
      <div>
        <p className="font-medium">{check.title}</p>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{check.detail}</p>
        {check.learnMore && check.status !== 'pass' && (
          <Link to={check.learnMore.href} className="mt-1 inline-block text-sm text-primary hover:underline">
            {check.learnMore.label} →
          </Link>
        )}
      </div>
    </li>
  );
}

const FAQS = [
  {
    q: 'What is an ATS?',
    a: 'An applicant tracking system is the software companies use to collect applications. It reads your resume into a database, and recruiters search that database by keyword. If the system cannot read your file, or your resume lacks the words recruiters search for, a human may never see it.',
  },
  {
    q: 'Is this ATS checker really free?',
    a: 'Yes. There is no sign-up and no limit. The checks run in your browser, so your resume is never uploaded to our servers.',
  },
  {
    q: 'Does a high score guarantee I will pass every ATS?',
    a: 'No checker can promise that, because every company configures its system differently. This tool tests the things that cause most problems: unreadable files, missing contact details, non-standard headings, missing keywords, and formatting habits that confuse parsers.',
  },
  {
    q: 'Why does it check for photos, birth dates and marital status?',
    a: 'Resumes written for China, much of Asia and parts of Europe often include them. US employers avoid this information because of anti-discrimination law, and some recruiters will set a resume aside rather than risk it. International students applying in the US should remove it.',
  },
  {
    q: 'Should I use PDF or Word?',
    a: 'Either works with modern systems as long as the PDF contains real text. Use Word (.docx) if the application asks for it. Avoid scanned PDFs, images and resumes exported from design tools as pictures.',
  },
];

const PATH = '/tools/ats-resume-checker';
const DESCRIPTION = 'Free ATS resume checker. Find formatting, keyword and content problems that stop applicant tracking systems from reading your resume.';

export function AtsCheckerPage() {
  const [resume, setResume] = useState<ResumeValue>({ text: '', file: {} });
  const [jd, setJd] = useState('');
  const [submitted, setSubmitted] = useState<{ resume: ResumeValue; jd: string }>();

  const result = useMemo(() => {
    if (!submitted) return undefined;
    const ats = checkResume(submitted.resume.text, submitted.resume.file);
    const keywords = submitted.jd.trim() ? matchKeywords(submitted.resume.text, extractJobKeywords(submitted.jd)) : undefined;
    // With a job description, keyword coverage is 30% of the overall score.
    const score = keywords ? Math.round(ats.score * 0.7 + keywords.score * 0.3) : ats.score;
    const checks = [...ats.checks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
    return { ...ats, checks, score, keywords };
  }, [submitted]);

  const counts = result?.checks.reduce((acc, c) => ({ ...acc, [c.status]: (acc[c.status] ?? 0) + 1 }), {} as Record<CheckStatus, number>);

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <JsonLd data={toolStructuredData('PixelPear ATS Resume Checker', PATH, DESCRIPTION)} />
      <div className="mx-auto max-w-4xl">
        <header>
          <PrivacyNote />
          <h1 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight">Free ATS Resume Checker</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            See whether applicant tracking systems can read your resume, and what to fix. Built with international
            students in mind: it also flags the habits that work at home but hurt you with US employers.
          </p>
        </header>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <ResumeInput value={resume} onChange={setResume} />
          <JobDescriptionInput value={jd} onChange={setJd} optional />
        </div>
        <Button
          className="mt-6 w-full md:w-auto"
          size="lg"
          disabled={!resume.text.trim()}
          onClick={() => setSubmitted({ resume, jd })}
        >
          Check my resume
        </Button>

        {result && (
          <section className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8" aria-live="polite">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
              <ScoreDial score={result.score} label="ATS score" />
              <div>
                <h2 className="text-2xl font-semibold">
                  {result.score >= 80 ? 'In good shape' : result.score >= 60 ? 'A few things to fix' : 'Needs work before you apply'}
                </h2>
                <p className="mt-2 text-muted-foreground">
                  {counts?.fail ?? 0} problem{counts?.fail === 1 ? '' : 's'} · {counts?.warn ?? 0} to improve · {counts?.pass ?? 0} passed
                  {result.keywords && ` · ${result.keywords.score}% keyword match`}
                </p>
              </div>
            </div>

            <ul className="mt-6 divide-y divide-border">
              {result.checks.map((c) => <CheckRow key={c.id} check={c} />)}
            </ul>

            {result.keywords && (
              <div className="mt-6 border-t border-border pt-6">
                <h3 className="font-semibold">Keywords from the job description</h3>
                {result.keywords.missing.length > 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Missing: <span className="text-foreground">{result.keywords.missing.slice(0, 12).map((k) => k.term).join(', ')}</span>.{' '}
                    <Link to="/tools/resume-keyword-matcher" className="text-primary hover:underline">See the full keyword report →</Link>
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Your resume covers every keyword we found.</p>
                )}
              </div>
            )}
          </section>
        )}

        {result && (
          <div className="mt-8">
            <ToolCta
              title="Fix these automatically"
              body="PixelPear rewrites your resume for a specific job: it adds the missing keywords where they are true, strengthens bullets with results, and exports a clean, ATS-friendly PDF."
            />
          </div>
        )}

        <Prose>
          <h2>What this checker looks at</h2>
          <ul>
            <li><strong>Readability.</strong> Whether text can be extracted at all. Scanned and image-based PDFs look blank to an ATS.</li>
            <li><strong>Contact details.</strong> Email, a US phone number and a LinkedIn URL, written as plain text.</li>
            <li><strong>Structure.</strong> Standard headings (Experience, Education, Skills) and a sensible length.</li>
            <li><strong>Content.</strong> Bullets with measurable results, strong action verbs, and no first-person pronouns.</li>
            <li><strong>US conventions.</strong> No photo, birth date, gender or marital status; English-only text; US date format; a GPA scale US readers understand.</li>
            <li><strong>Keywords</strong> (optional). Paste a job description to see which required skills your resume is missing.</li>
          </ul>
          <p>
            Want the reasoning behind each rule? Read <Link to="/blog/ats-friendly-resume-format">how to format an ATS-friendly resume</Link>{' '}
            and <Link to="/blog/us-resume-format-for-international-students">the US resume format guide for international students</Link>.
          </p>
        </Prose>

        <FaqSection faqs={FAQS} />
      </div>
    </div>
  );
}
