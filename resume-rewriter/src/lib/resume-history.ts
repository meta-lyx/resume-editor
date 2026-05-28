// Resume history storage for the dashboard + /history page.
// Uses localStorage so it costs nothing. Entry names are strictly
// auto-generated from the job description.
import type { ResumeData as PDFResumeData } from '@/components/pdf/resume-pdf-template';

const STORAGE_KEY = 'resume_history_v1';
const STORAGE_EVENT = 'resume-history:change';

export interface ResumeHistoryEntry {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;

  // Source material
  resumeFileName?: string;
  resumeTitle: string;
  extractedText: string;
  jobDescription: string;

  // AI output
  customizedResume: string;
  structuredResume?: PDFResumeData;
  aiAtsScore?: number;
  aiKeywordsMatched?: string[];
  aiSuggestions?: string[];
  aiProcessingTime?: number;

  // Meta
  lastTemplateUsed?: string;
  downloadCount?: number;
  status: 'completed';
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

function readAll(): ResumeHistoryEntry[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is ResumeHistoryEntry =>
        !!entry && typeof entry === 'object' && typeof entry.id === 'string'
    );
  } catch (error) {
    console.error('Failed to read resume history:', error);
    return [];
  }
}

function emitChange(): void {
  if (!isBrowser()) return;
  try {
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
  } catch {
    // CustomEvent unsupported — listeners can rely on the storage event
  }
}

function writeAll(entries: ResumeHistoryEntry[]): void {
  if (!isBrowser()) return;

  const trySave = (list: ResumeHistoryEntry[]): boolean => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      return true;
    } catch {
      return false;
    }
  };

  // Unlimited per product requirement, but fall back gracefully on quota errors.
  if (trySave(entries)) {
    emitChange();
    return;
  }

  // Quota exceeded — progressively drop oldest entries until it fits.
  let working = [...entries];
  while (working.length > 1) {
    working = working.slice(0, Math.max(1, Math.floor(working.length * 0.75)));
    if (trySave(working)) {
      emitChange();
      console.warn(
        `Resume history was trimmed to ${working.length} entries due to storage limits.`
      );
      return;
    }
  }
}

export function getResumeHistory(): ResumeHistoryEntry[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getResumeHistoryEntry(id: string): ResumeHistoryEntry | undefined {
  return readAll().find((entry) => entry.id === id);
}

export function deleteResumeHistoryEntry(id: string): void {
  writeAll(readAll().filter((entry) => entry.id !== id));
}

export function clearResumeHistory(): void {
  writeAll([]);
}

type AddEntryInput = Omit<
  ResumeHistoryEntry,
  'id' | 'name' | 'createdAt' | 'updatedAt' | 'status'
> & {
  status?: ResumeHistoryEntry['status'];
};

export function addResumeHistoryEntry(input: AddEntryInput): ResumeHistoryEntry {
  const now = new Date();
  const name = generateHistoryName(input.jobDescription, now);
  const id = generateId(now);

  const entry: ResumeHistoryEntry = {
    ...input,
    id,
    name,
    status: input.status ?? 'completed',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    downloadCount: input.downloadCount ?? 0,
  };

  writeAll([entry, ...readAll()]);
  return entry;
}

export function recordDownload(id: string, templateId?: string): void {
  const entries = readAll();
  const next = entries.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          downloadCount: (entry.downloadCount ?? 0) + 1,
          lastTemplateUsed: templateId ?? entry.lastTemplateUsed,
          updatedAt: new Date().toISOString(),
        }
      : entry
  );
  writeAll(next);
}

/**
 * Subscribe to history changes from anywhere on the page.
 * Returns an unsubscribe function.
 */
export function subscribeToResumeHistory(listener: () => void): () => void {
  if (!isBrowser()) return () => undefined;
  const onCustom = () => listener();
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener(STORAGE_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(STORAGE_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}

// ---------------------------------------------------------------------------
// Auto name generation
// ---------------------------------------------------------------------------

const SENIORITY = [
  'Senior',
  'Sr\\.?',
  'Lead',
  'Principal',
  'Staff',
  'Junior',
  'Jr\\.?',
  'Mid',
  'Mid-Level',
  'Associate',
  'Head of',
  'Director of',
  'VP of',
  'Chief',
];

const DOMAIN = [
  'Software',
  'Frontend',
  'Front-end',
  'Backend',
  'Back-end',
  'Full[-\\s]?Stack',
  'Mobile',
  'iOS',
  'Android',
  'Data',
  'Machine Learning',
  'ML',
  'AI',
  'DevOps',
  'Site Reliability',
  'Cloud',
  'Security',
  'Infrastructure',
  'Platform',
  'Product',
  'Project',
  'Program',
  'Engineering',
  'Design',
  'UX',
  'UI',
  'Visual',
  'Marketing',
  'Growth',
  'Sales',
  'Customer Success',
  'Operations',
  'Finance',
  'HR',
  'People',
  'Legal',
  'Research',
  'QA',
];

const ROLE = [
  'Engineer',
  'Developer',
  'Manager',
  'Designer',
  'Analyst',
  'Scientist',
  'Researcher',
  'Architect',
  'Lead',
  'Director',
  'VP',
  'Specialist',
  'Consultant',
  'Coordinator',
  'Officer',
  'President',
  'Founder',
  'Advocate',
  'Strategist',
  'Recruiter',
];

export function generateHistoryName(
  jobDescription: string,
  when: Date = new Date()
): string {
  const monthDay = when.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const cleaned = (jobDescription ?? '').trim();
  if (!cleaned) return `Resume Draft — ${monthDay}`;

  const titleAtCompany = extractTitleAtCompany(cleaned);
  if (titleAtCompany) return `${titleAtCompany} — ${monthDay}`;

  const labelled = extractLabelledTitle(cleaned);
  if (labelled) return `${labelled} — ${monthDay}`;

  const bareTitle = extractBareTitle(cleaned);
  if (bareTitle) return `${bareTitle} — ${monthDay}`;

  const firstLine = extractFirstMeaningfulLine(cleaned);
  if (firstLine) return `${firstLine} — ${monthDay}`;

  return `Resume Draft — ${monthDay}`;
}

function extractLabelledTitle(text: string): string | null {
  const re = /(?:^|\n)\s*(?:Position|Job Title|Role|Title|Job)\s*[:\-–—]\s*([^\n]+)/i;
  const match = text.match(re);
  return match ? sanitizePhrase(match[1]) : null;
}

function extractTitleAtCompany(text: string): string | null {
  const seniorityGroup = `(?:${SENIORITY.join('|')})`;
  const domainGroup = `(?:${DOMAIN.join('|')})`;
  const roleGroup = `(?:${ROLE.join('|')})`;
  const re = new RegExp(
    `\\b(${seniorityGroup}\\s+)?(${domainGroup}\\s+)?(${roleGroup})\\s+(?:at|@|with|for)\\s+([A-Z][\\w&.,'\\- ]{0,60})`,
    'i'
  );

  const head = text.slice(0, 1500);
  const match = head.match(re);
  if (!match) return null;

  const seniorityPart = (match[1] || '').trim();
  const domainPart = (match[2] || '').trim();
  const rolePart = (match[3] || '').trim();
  const companyPart = (match[4] || '')
    .trim()
    .replace(/[.,;]+$/, '')
    .split(/\s+/)
    .slice(0, 5)
    .join(' ')
    .slice(0, 40);

  const title = [seniorityPart, domainPart, rolePart].filter(Boolean).join(' ').replace(/\s+/g, ' ');
  if (!title || !companyPart) return null;
  return `${title} at ${companyPart}`;
}

function extractBareTitle(text: string): string | null {
  const seniorityGroup = `(?:${SENIORITY.join('|')})`;
  const domainGroup = `(?:${DOMAIN.join('|')})`;
  const roleGroup = `(?:${ROLE.join('|')})`;
  const re = new RegExp(
    `\\b(${seniorityGroup})\\s+(?:${domainGroup}\\s+)?(${roleGroup})\\b`,
    'i'
  );
  const head = text.slice(0, 1500);
  const match = head.match(re);
  return match ? sanitizePhrase(match[0]) : null;
}

function extractFirstMeaningfulLine(text: string): string | null {
  const skipPatterns = [
    /^(about|description|overview|summary|details?|the role|the position|qualifications|responsibilities|requirements|company|who we are|what you'll do|what we offer|benefits)\b/i,
  ];
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 8)) {
    if (line.length < 6 || line.length > 100) continue;
    if (skipPatterns.some((p) => p.test(line))) continue;
    if (/^https?:\/\//i.test(line)) continue;
    if (/^[\W_]+$/.test(line)) continue;
    return sanitizePhrase(line);
  }
  return null;
}

function sanitizePhrase(input: string): string {
  return input
    .replace(/\s+/g, ' ')
    .replace(/[.,;:!]+$/, '')
    .trim()
    .slice(0, 60);
}

function generateId(now: Date): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${now.getTime()}-${Math.random().toString(36).slice(2, 10)}`;
}
