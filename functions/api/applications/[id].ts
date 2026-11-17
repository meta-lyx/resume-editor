// GET    /api/applications/:id   one application, including job description and resume
// PATCH  /api/applications/:id   update fields
// DELETE /api/applications/:id   delete
import { ensureSchema, fromRow, getUserId, json, preflight, toColumns, type ApplicationInput } from '../../lib/applications';

export async function onRequest(context: any) {
  const { request, env, params } = context;
  if (request.method === 'OPTIONS') return preflight();

  try {
    const userId = await getUserId(request, env.DB);
    if (!userId) return json({ error: 'Please log in to use the application tracker.' }, 401);
    await ensureSchema(env.DB);

    const id = String(params.id || '');
    // Every query is scoped to the user, so one user can never read or change another's rows.
    const existing = await env.DB.prepare('SELECT * FROM job_applications WHERE id = ? AND user_id = ?').bind(id, userId).first();
    if (!existing) return json({ error: 'Application not found' }, 404);

    if (request.method === 'GET') return json({ application: fromRow(existing as any) });

    if (request.method === 'DELETE') {
      await env.DB.prepare('DELETE FROM job_applications WHERE id = ? AND user_id = ?').bind(id, userId).run();
      return json({ ok: true });
    }

    if (request.method === 'PATCH') {
      const body = (await request.json().catch(() => null)) as ApplicationInput | null;
      if (!body) return json({ error: 'Invalid request body' }, 400);
      const parsed = toColumns(body);
      if ('error' in parsed) return json({ error: parsed.error }, 400);
      const { cols } = parsed;
      if (cols.company === null || cols.role === null) return json({ error: 'Company and role cannot be empty' }, 400);
      // First move out of "saved" records the application date, unless one was given.
      if (cols.status && cols.status !== 'saved' && (existing as any).applied_at == null && cols.applied_at === undefined) {
        cols.applied_at = Math.floor(Date.now() / 1000);
      }
      cols.updated_at = Math.floor(Date.now() / 1000);
      const keys = Object.keys(cols);
      await env.DB.prepare(`UPDATE job_applications SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ? AND user_id = ?`)
        .bind(...keys.map((k) => cols[k]), id, userId)
        .run();
      const updated = await env.DB.prepare('SELECT * FROM job_applications WHERE id = ?').bind(id).first();
      return json({ application: fromRow(updated as any) });
    }

    return json({ error: 'Method not allowed' }, 405);
  } catch (error: any) {
    console.error('application error:', error);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
}
