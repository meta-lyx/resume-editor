// Normalize a structured resume to US conventions before rendering the US ATS PDF.
// Pure functions so they can be tested without a browser.
import type { ResumeData } from '@/components/pdf/resume-pdf-template';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * "2023.06", "2023/6", "2023-06", "2023年6月", "06/2023" -> "Jun 2023".
 * "至今", "现在", "present", "current", "now" -> "Present".
 * Anything else is returned trimmed and unchanged.
 */
export function toUSDate(input: string | undefined): string {
  if (!input) return '';
  const s = input.trim();
  if (/^(至今|现在|目前|今|present|current|now|ongoing)$/i.test(s)) return 'Present';

  let m = s.match(/^((?:19|20)\d{2})\s*(?:[./\-]|年)\s*(\d{1,2})\s*(?:月)?$/);
  if (m) {
    const month = Number(m[2]);
    if (month >= 1 && month <= 12) return `${MONTHS[month - 1]} ${m[1]}`;
  }
  m = s.match(/^(\d{1,2})\s*[./\-]\s*((?:19|20)\d{2})$/);
  if (m) {
    const month = Number(m[1]);
    if (month >= 1 && month <= 12) return `${MONTHS[month - 1]} ${m[2]}`;
  }
  m = s.match(/^((?:19|20)\d{2})\s*年?$/);
  if (m) return m[1];
  return s;
}

/** A date range for one line, using an en dash: "Jun 2023 – Aug 2023". */
export function usDateRange(start?: string, end?: string): string {
  const a = toUSDate(start);
  const b = toUSDate(end);
  if (a && b) return `${a} – ${b}`;
  return a || b;
}

/** "88" -> "88/100"; "3.8" -> "3.8/4.0"; values that already have a scale are left alone. */
export function gpaWithScale(gpa: string | undefined): string | undefined {
  if (!gpa) return undefined;
  const s = gpa.trim().replace(/^gpa[:：]?\s*/i, '');
  if (/\//.test(s)) return s;
  const n = Number(s);
  if (Number.isNaN(n)) return s;
  if (n > 5 && n <= 100) return `${s}/100`;
  if (n > 0 && n <= 4.3) return `${s}/4.0`;
  return s;
}

// Labels that US resumes leave out; dropped from free-text lines like the summary.
const PERSONAL_LINE = /\b(date of birth|d\.?o\.?b\.?|birth ?date|age|gender|sex|marital status|nationality|ethnicity|political (status|affiliation)|height|weight|religion)\s*[:：]/i;

function stripPersonalSentences(text: string | undefined): string | undefined {
  if (!text) return text;
  const kept = text.split(/(?<=[.;。；])\s+|\n/).filter((part) => !PERSONAL_LINE.test(part));
  return kept.join(' ').trim() || undefined;
}

/** Copy of the resume with US date format, GPA scales and personal-detail lines removed. */
export function normalizeForUS(data: ResumeData): ResumeData {
  return {
    ...data,
    summary: stripPersonalSentences(data.summary),
    experience: (data.experience || []).map((e) => ({
      ...e,
      startDate: toUSDate(e.startDate),
      endDate: toUSDate(e.endDate),
      bullets: (e.bullets || []).filter((b) => b && b.trim()),
    })),
    education: (data.education || []).map((e) => ({
      ...e,
      graduationDate: toUSDate(e.graduationDate),
      gpa: gpaWithScale(e.gpa),
    })),
  };
}
