import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { createDb } from './db';
import { authRoutes } from './routes/auth';
import { resumeRoutes } from './routes/resume';
import { subscriptionRoutes } from './routes/subscription';
import { uploadRoutes } from './routes/upload';
import { aiRoutes } from './routes/ai';

// Define Cloudflare Worker environment bindings
export type Env = {
  DB: D1Database;
  RESUME_BUCKET: R2Bucket;
  AUTH_KV: KVNamespace;
  
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
};

// Create Hono app with type-safe environment
const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());

// CORS configuration
app.use('/api/*', cors({
  origin: (origin) => {
    // Allow localhost in development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return origin;
    }
    // Allow production domains
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

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: c.env.NODE_ENV,
  });
});

// API routes
app.route('/api/auth', authRoutes);
app.route('/api/resumes', resumeRoutes);
app.route('/api/subscriptions', subscriptionRoutes);
app.route('/api/upload', uploadRoutes);
app.route('/api/ai', aiRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', path: c.req.path }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error(`Error: ${err.message}`, err);
  
  return c.json({
    error: c.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
    ...(c.env.NODE_ENV !== 'production' && { stack: err.stack }),
  }, 500);
});

// Export for Cloudflare Workers
export default app;

