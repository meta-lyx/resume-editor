// Cloudflare Pages Function - Main API Handler
// This handles ALL /api/* routes using Hono

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';

// Import our route handlers
import { createAuthApp } from '../../src/server/routes/auth';
import { createResumeApp } from '../../src/server/routes/resume';
import { createAIApp } from '../../src/server/routes/ai';
import { createUploadApp } from '../../src/server/routes/upload';
import { createSubscriptionApp } from '../../src/server/routes/subscription';

// Define environment type
export interface Env {
  DB: D1Database;
  RESUME_BUCKET: R2Bucket;
  
  // Secrets
  RESEND_API_KEY: string;
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  BETTER_AUTH_SECRET: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  
  // Environment variables
  NODE_ENV: string;
  APP_URL: string;
}

// Create main app
const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());

// CORS
app.use('*', cors({
  origin: (origin) => {
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    if (origin.includes('pages.dev') || origin.includes('workers.dev')) {
      return origin;
    }
    return null;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env?.NODE_ENV || 'production',
    platform: 'Cloudflare Pages Functions',
    bindings: {
      hasDB: !!c.env?.DB,
      hasR2: !!c.env?.RESUME_BUCKET,
    },
  });
});

// Mount route handlers - create them inline to ensure env is passed
const authApp = createAuthApp();
const resumeApp = createResumeApp();
const aiApp = createAIApp();
const uploadApp = createUploadApp();
const subscriptionApp = createSubscriptionApp();

app.route('/auth', authApp);
app.route('/resumes', resumeApp);
app.route('/ai', aiApp);
app.route('/upload', uploadApp);
app.route('/subscriptions', subscriptionApp);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err);
  
  return c.json({
    error: c.env?.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(c.env?.NODE_ENV !== 'production' && { stack: err.stack }),
  }, 500);
});

// Export as Pages Function
export const onRequest: PagesFunction<Env> = app.fetch;

