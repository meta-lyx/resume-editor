import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import type { Database } from '../db';
import { createDb } from '../db';
import * as schema from '../db/schema';

export function createAuth(db: Database, env: any) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verificationTokens,
      },
    }),
    
    baseURL: env.APP_URL || 'https://ai-resume-editor.pages.dev',
    
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // Disable for testing
      sendResetPassword: async ({ user, url }) => {
        // TODO: Implement with Resend
        console.log('Send reset password email:', user.email, url);
      },
    },
    
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // 1 day
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes
      },
    },
    
    socialProviders: {
      // Can add Google, GitHub, etc. later
    },
    
    // Security
    trustedOrigins: [
      env.APP_URL || 'https://ai-resume-editor.pages.dev',
      'http://localhost:5173',
      'http://localhost:8787',
    ],
    
    secret: env.BETTER_AUTH_SECRET || 'fallback-secret-for-development-only-change-in-production',
    
    advanced: {
      generateId: () => {
        // Generate custom IDs (using crypto.randomUUID or nanoid)
        return crypto.randomUUID();
      },
    },
  });
}

// Auth middleware for Hono
export async function authMiddleware(c: any, next: any) {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
      if (!c.env.DB) {
        console.error('Auth middleware: DB binding is missing');
        return c.json({ error: 'Server configuration error: Database not connected' }, 500);
      }
      const now = Math.floor(Date.now() / 1000);
    const sessionResult = await c.env.DB.prepare(
      'SELECT s.user_id as userId, u.email as email, u.name as name FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?'
    ).bind(token, now).all();
    const row = sessionResult.results?.[0];
    if (!row) {
      return c.json({ error: 'Invalid session' }, 401);
    }
    c.set('user', { id: row.userId, email: row.email, name: row.name });
    c.set('session', { token, expiresAt: now });
    
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
}

// Optional auth middleware (doesn't block if not authenticated)
export async function optionalAuthMiddleware(c: any, next: any) {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token) {
      const now = Math.floor(Date.now() / 1000);
      const sessionResult = await c.env.DB.prepare(
        'SELECT s.user_id as userId, u.email as email, u.name as name FROM sessions s JOIN users u ON s.user_id = u.id WHERE s.token = ? AND s.expires_at > ?'
      ).bind(token, now).all();
      const row = sessionResult.results?.[0];
      if (row) {
        c.set('user', { id: row.userId, email: row.email, name: row.name });
        c.set('session', { token, expiresAt: now });
      }
    }
  } catch (error) {
    console.error('Optional auth middleware error:', error);
  }
  
  await next();
}

// Helper to get current user from context
export function getCurrentUser(c: any) {
  return c.get('user');
}

// Helper to check if user is authenticated
export function requireAuth(c: any) {
  const user = getCurrentUser(c);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

