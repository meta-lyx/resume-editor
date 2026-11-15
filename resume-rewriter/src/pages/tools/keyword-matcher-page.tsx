import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  FaqSection, JobDescriptionInput, JsonLd, PrivacyNote, Prose, ResumeInput, ScoreDial, ToolCta,
  toolStructuredData, type ResumeValue,
} from '@/components/tools/tool-parts';
import { extractJobKeywords, matchKeywords, type Keyword } from '@/lib/resume-analysis';

const IMPORTANCE_LABEL: Record<Keyword['importance'], string> = {
  required: 'Required',
  preferred: 'Nice to have',
  mentioned: 'Mentioned',
};

function KeywordChip({ kw, present }: { kw: Keyword; present: boolean }) {
  return (
    <li
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${
        present ? 'border-primary/40 bg-primary/10' : 'border-destructive/40 bg-destructive/10'
      }`}
    >
      {present ? <Check className="h-3.5 w-3.5 text-primary" aria-label="Found" /> : <X className="h-3.5 w-3.5 text-destructive" aria-label="Missing" />}
      {kw.term}
      {kw.count > 1 && <span className="text-xs text-muted-foreground">×{kw.count}</span>}
    </li>
  );
}

const FAQS = [
  {
    q: 'How does the keyword matcher work?',
    a: 'It reads the job description, picks out the skills, tools, certifications and repeated terms, and notes whether each one sits under requirements or nice-to-haves. Then it checks your resume for each term, including common variants such as "JS" for JavaScript or "Postgres" for PostgreSQL.',
  },
  {
    q: 'What match score should I aim for?',
    a: 'Aim to cover the required skills you genuinely have; for most people that means 70% or more. A perfect score is not the goal. Never add a skill you cannot discuss in an interview.',
  },
  {
    q: 'Where should I add missing keywords?',
    a: 'Put the most important ones in your experience bullets, attached to a result, for example "Built Tableau dashboards that cut weekly reporting time by 6 hours." Add tools to your skills section using the same spelling the employer uses.',
  },
  {
    q: 'Is my resume stored anywhere?',
    a: 'No. The matching runs in your browser. Your resume and the job description never leave your device.',
  },
];

const PATH = '/tools/resume-keyword-matcher';
const DESCRIPTION = 'Free resume keyword matcher. Compare your resume to a job description and see which required skills and keywords are missing.';

export function KeywordMatcherPage() {
  const [resume, setResume] = useState<ResumeValue>({ text: '', file: {} });
  const [jd, setJd] = useState('');
  const [submitted, setSubmitted] = useState<{ resume: string; jd: string }>();

  const result = useMemo(() => {
    if (!submitted) return undefined;
    const keywords = extractJobKeywords(submitted.jd);
    return { keywords, ...matchKeywords(submitted.resume, keywords) };
  }, [submitted]);

  const groups = result
    ? (['required', 'preferred', 'mentioned'] as const)
        .map((imp) => ({ imp, items: result.keywords.filter((k) => k.importance === imp) }))
        .filter((g) => g.items.length)
    : [];
  const matchedSet = new Set(result?.matched.map((k) => k.term));
  const missingRequired = result?.missing.filter((k) => k.importance === 'required') ?? [];

  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <JsonLd data={toolStructuredData('PixelPear Resume Keyword Matcher', PATH, DESCRIPTION)} />
      <div className="mx-auto max-w-4xl">
        <header>
          <PrivacyNote />
          <h1 className="mt-5 text-3xl md:text-4xl font-bold tracking-tight">Free Resume Keyword Matcher</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Paste a job description and your resume. See which skills and keywords the employer asks for, which ones
            you already have, and which ones are missing.
          </p>
        </header>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <JobDescriptionInput value={jd} onChange={setJd} />
          <ResumeInput value={resume} onChange={setResume} />
        </div>
        <Button
          className="mt-6 w-full md:w-auto"
          size="lg"
          disabled={!resume.text.trim() || !jd.trim()}
          onClick={() => setSubmitted({ resume: resume.text, jd })}
        >
          Compare keywords
        </Button>

        {result && (
          <section className="mt-12 rounded-2xl border border-border bg-card p-6 md:p-8" aria-live="polite">
            {result.keywords.length === 0 ? (
              <p className="text-muted-foreground">
                We could not find specific skills in that job description. Make sure you pasted the full posting, including the requirements.
              </p>
            ) : (
              <>
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  <ScoreDial score={result.score} label="match" />
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {result.matched.length} of {result.keywords.length} keywords found
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      {missingRequired.length
                        ? `Missing ${missingRequired.length} required: ${missingRequired.slice(0, 6).map((k) => k.term).join(', ')}${missingRequired.length > 6 ? '…' : ''}.`
                        : 'You cover every required keyword we found.'}{' '}
                      Required skills count double in the score.
                    </p>
                  </div>
                </div>

                {groups.map(({ imp, items }) => (
                  <div key={imp} className="mt-8">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{IMPORTANCE_LABEL[imp]}</h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {items.map((k) => <KeywordChip key={k.term} kw={k} present={matchedSet.has(k.term)} />)}
                    </ul>
                  </div>
                ))}

                <p className="mt-8 text-sm text-muted-foreground">
                  Only add a missing keyword if it is true. Put it in a bullet with a result, and list tools in your
                  skills section using the employer's spelling.{' '}
                  <Link to="/blog/resume-keywords-from-job-description" className="text-primary hover:underline">How to use keywords well →</Link>
                </p>
              </>
            )}
          </section>
        )}

        {result && result.keywords.length > 0 && (
          <div className="mt-8">
            <ToolCta
              title="Close the gaps in one step"
              body="PixelPear tailors your resume to this job: it works the keywords you can honestly claim into your bullets, keeps your facts intact, and exports an ATS-friendly PDF."
            />
          </div>
        )}

        <Prose>
          <h2>Why keywords decide who gets seen</h2>
          <p>
            Recruiters search their applicant tracking system for the skills and tools in the job posting, then read
            the resumes that come back. Search is literal. If the posting says "Power BI" and your resume only says
            "dashboards", you may not appear, even if you are a strong fit.
          </p>
          <p>
            This is a common trap for international students, who often describe the same work in different words
            than a US hiring manager would. Matching the employer's vocabulary, honestly, is one of the fastest ways
            to get more interviews.
          </p>
          <p>
            Next: run the <Link to="/tools/ats-resume-checker">free ATS checker</Link> to make sure the system can read
            your file, or read <Link to="/blog/how-to-tailor-your-resume-to-a-job-description">how to tailor your resume to a job description</Link>.
          </p>
        </Prose>

        <FaqSection faqs={FAQS} />
      </div>
    </div>
  );
}
