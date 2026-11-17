// Shared pieces for /api/applications endpoints.

export const STATUSES = ['saved', 'applied', 'interviewing', 'offer', 'rejected'] as const;
export type Status = (typeof STATUSES)[number];
export const MAX_APPLICATIONS_PER_USER = 500;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
}

export function preflight(): Response {
  return new Response(null, { status: 204, headers: { ...CORS, 'Access-Control-Max-Age': '86400' } });
}

/** User ID for the request's bearer token, or null. */
export async function getUserId(request: Request, db: D1Database): Promise<string | null> {
  const token = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const row = await db
    .prepare('SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?')
    .bind(token, Math.floor(Date.now() / 1000))
    .first<{ user_id: string }>();
  return row?.user_id ?? null;
}

// The table also ships as drizzle/migrations/0002; creating it here too means the
// tracker works even if that migration hasn't been applied to this database yet.
let schemaReady = false;
export async function ensureSchema(db: D1Database): Promise<void> {
  if (schemaReady) return;
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS job_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      job_url TEXT,
      location TEXT,
      status TEXT NOT NULL DEFAULT 'saved',
      job_description TEXT,
      resume_text TEXT,
      structured_resume TEXT,
      ats_score INTEGER,
      keyword_score INTEGER,
      notes TEXT,
      applied_at INTEGER,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      updated_at INTEGER NOT NULL DEFAULT (unixepoch())
    )`),
    db.prepare('CREATE INDEX IF NOT EXISTS idx_job_applications_user ON job_applications(user_id, updated_at DESC)'),
  ]);
  schemaReady = true;
}

// Field limits keep one user from storing unbounded data.
const LIMITS: Record<string, number> = {
  company: 200, role: 200, job_url: 2048, location: 200,
  job_description: 30000, resume_text: 30000, structured_resume: 100000, notes: 5000,
};

export type ApplicationInput = Partial<{
  company: string; role: string; jobUrl: string; location: string; status: string;
  jobDescription: string; resumeText: string; structuredResume: unknown;
  atsScore: number; keywordScore: number; notes: string; appliedAt: number | null;
}>;

/** Map camelCase input to validated column values. Returns an error message on bad input. */
export function toColumns(input: ApplicationInput): { cols: Record<string, unknown> } | { error: string } {
  const cols: Record<string, unknown> = {};
  const str = (key: keyof ApplicationInput, col: string) => {
    const v = input[key];
    if (v === undefined) return;
    if (v === null || v === '') { cols[col] = null; return; }
    if (typeof v !== 'string') throw new Error(`${String(key)} must be text`);
    cols[col] = v.trim().slice(0, LIMITS[col]);
  };
  const score = (key: 'atsScore' | 'keywordScore', col: string) => {
    const v = input[key];
    if (v === undefined) return;
    if (v === null) { cols[col] = null; return; }
    if (typeof v !== 'number' || !Number.isFinite(v)) throw new Error(`${key} must be a number`);
    cols[col] = Math.max(0, Math.min(100, Math.round(v)));
  };
  try {
    str('company', 'company');
    str('role', 'role');
    str('jobUrl', 'job_url');
    str('location', 'location');
    str('jobDescription', 'job_description');
    str('resumeText', 'resume_text');
    str('notes', 'notes');
    score('atsScore', 'ats_score');
    score('keywordScore', 'keyword_score');
    if (input.jobUrl && !/^https?:\/\//i.test(input.jobUrl.trim())) return { error: 'Job link must start with http:// or https://' };
    if (input.status !== undefined) {
      if (!STATUSES.includes(input.status as Status)) return { error: `Status must be one of: ${STATUSES.join(', ')}` };
      cols.status = input.status;
    }
    if (input.structuredResume !== undefined) {
      const text = input.structuredResume === null ? null : JSON.stringify(input.structuredResume);
      if (text && text.length > LIMITS.structured_resume) return { error: 'Resume data is too large' };
      cols.structured_resume = text;
    }
    if (input.appliedAt !== undefined) {
      if (input.appliedAt !== null && (typeof input.appliedAt !== 'number' || !Number.isFinite(input.appliedAt))) return { error: 'appliedAt must be a Unix time in seconds' };
      cols.applied_at = input.appliedAt === null ? null : Math.floor(input.appliedAt);
    }
  } catch (e) {
    return { error: (e as Error).message };
  }
  return { cols };
}

/** Row from D1 to the API shape. */
export function fromRow(r: Record<string, any>) {
  let structuredResume = null;
  if (r.structured_resume) {
    try { structuredResume = JSON.parse(r.structured_resume); } catch { structuredResume = null; }
  }
  return {
    id: r.id,
    company: r.company,
    role: r.role,
    jobUrl: r.job_url,
    location: r.location,
    status: r.status,
    jobDescription: r.job_description,
    resumeText: r.resume_text,
    structuredResume,
    atsScore: r.ats_score,
    keywordScore: r.keyword_score,
    notes: r.notes,
    appliedAt: r.applied_at,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}
