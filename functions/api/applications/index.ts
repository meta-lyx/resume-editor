// GET  /api/applications       list the user's tracked applications (newest change first)
// POST /api/applications       create one
import { ensureSchema, fromRow, getUserId, json, MAX_APPLICATIONS_PER_USER, preflight, toColumns, type ApplicationInput } from '../../lib/applications';

export async function onRequest(context: any) {
  const { request, env } = context;
  if (request.method === 'OPTIONS') return preflight();

  try {
    const userId = await getUserId(request, env.DB);
    if (!userId) return json({ error: 'Please log in to use the application tracker.' }, 401);
    await ensureSchema(env.DB);

    if (request.method === 'GET') {
      // The list omits the large text fields; fetch one application for those.
      const { results } = await env.DB.prepare(
        `SELECT id, company, role, job_url, location, status, ats_score, keyword_score, notes, applied_at, created_at, updated_at,
                (resume_text IS NOT NULL OR structured_resume IS NOT NULL) AS has_resume
         FROM job_applications WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?`,
      ).bind(userId, MAX_APPLICATIONS_PER_USER).all();
      return json({ applications: results.map((r: any) => ({ ...fromRow(r), hasResume: !!r.has_resume })) });
    }

    if (request.method === 'POST') {
      const body = (await request.json().catch(() => null)) as ApplicationInput | null;
      if (!body) return json({ error: 'Invalid request body' }, 400);
      const parsed = toColumns(body);
      if ('error' in parsed) return json({ error: parsed.error }, 400);
      const { cols } = parsed;
      if (!cols.company || !cols.role) return json({ error: 'Company and role are required' }, 400);

      const count = await env.DB.prepare('SELECT COUNT(*) AS n FROM job_applications WHERE user_id = ?').bind(userId).first<{ n: number }>();
      if ((count?.n ?? 0) >= MAX_APPLICATIONS_PER_USER) {
        return json({ error: `You can track up to ${MAX_APPLICATIONS_PER_USER} applications. Delete some old ones first.` }, 400);
      }

      const now = Math.floor(Date.now() / 1000);
      const status = (cols.status as string) || 'saved';
      if (status !== 'saved' && cols.applied_at === undefined) cols.applied_at = now;
      const row = { id: crypto.randomUUID(), user_id: userId, status, created_at: now, updated_at: now, ...cols };
      const keys = Object.keys(row);
      await env.DB.prepare(`INSERT INTO job_applications (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`)
        .bind(...keys.map((k) => (row as any)[k]))
        .run();
      const created = await env.DB.prepare('SELECT * FROM job_applications WHERE id = ?').bind(row.id).first();
      return json({ application: fromRow(created as any) }, 201);
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error: any) {
    console.error('applications error:', error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
