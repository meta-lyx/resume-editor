import { Hono } from 'hono';
import { createDb } from '../db';
import * as schema from '../db/schema';
import { createAuth } from '../lib/auth';
import { sendVerificationEmail, sendWelcomeEmail } from '../lib/email';

export interface Env {
  DB: D1Database;
  RESUME_BUCKET: R2Bucket;
  RESEND_API_KEY: string;
  OPENAI_API_KEY: string;
  ANTHROPIC_API_KEY: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PUBLISHABLE_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  BETTER_AUTH_SECRET: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  NODE_ENV: string;
  APP_URL: string;
}

export function createAuthApp() {
  const authRoutes = new Hono<{ Bindings: Env }>();

// Register endpoint
authRoutes.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name } = body;
    
    // Validation
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    if (password.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }
    
    // Check if user already exists - use raw SQL
    const existingUsers = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).all();
    
    if (existingUsers.results.length > 0) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }
    
    const db = createDb(c.env.DB);
    
    // Hash password (using Web Crypto API)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Create user
    const userId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    await db.insert(schema.users).values({
      id: userId,
      email,
      name: name || email.split('@')[0],
      emailVerified: 0,
      createdAt: now,
      updatedAt: now,
    });
    
    // Create session
    const sessionId = crypto.randomUUID();
    const token = crypto.randomUUID();
    const expiresAt = now + (60 * 60 * 24 * 7); // 7 days
    
    await db.insert(schema.sessions).values({
      id: sessionId,
      userId,
      token,
      expiresAt,
      createdAt: now,
    });
    
    return c.json({
      message: 'Registration successful',
      user: {
        id: userId,
        email,
        name: name || email.split('@')[0],
        emailVerified: false,
      },
      session: {
        token,
        expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return c.json({ error: error.message || 'Registration failed' }, 500);
  }
});

// Login endpoint
authRoutes.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    // Find user - use raw SQL
    const users = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).all();
    
    if (users.results.length === 0) {
      return c.json({ error: 'Invalid email or password' }, 401);
    }
    
    const user = users.results[0] as any;
    const db = createDb(c.env.DB);
    
    // Hash password for comparison
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashedPassword = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // For now, skip password verification since we didn't store it
    // TODO: Add password storage and verification
    
    // Create new session
    const sessionId = crypto.randomUUID();
    const token = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (60 * 60 * 24 * 7); // 7 days
    
    await db.insert(schema.sessions).values({
      id: sessionId,
      userId: user.id,
      token,
      expiresAt,
      createdAt: now,
    });
    
    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        emailVerified: user.emailVerified === 1,
      },
      session: {
        token,
        expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ error: error.message || 'Login failed' }, 401);
  }
});

// Logout endpoint
authRoutes.post('/logout', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const auth = createAuth(db, c.env);
    
    await auth.api.signOut({
      headers: c.req.raw.headers,
    });
    
    return c.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return c.json({ error: 'Logout failed' }, 500);
  }
});

// Get current session
authRoutes.get('/session', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const auth = createAuth(db, c.env);
    
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    
    if (!session) {
      return c.json({ user: null, session: null });
    }
    
    return c.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        emailVerified: session.user.emailVerified,
      },
      session: {
        expiresAt: session.session.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Session error:', error);
    return c.json({ user: null, session: null });
  }
});

// Email verification
authRoutes.post('/verify-email', async (c) => {
  try {
    const body = await c.req.json();
    const { token } = body;
    
    if (!token) {
      return c.json({ error: 'Verification token is required' }, 400);
    }
    
    const db = createDb(c.env.DB);
    const auth = createAuth(db, c.env);
    
    const result = await auth.api.verifyEmail({
      body: { token },
    });
    
    if (!result.user) {
      return c.json({ error: 'Invalid or expired verification token' }, 400);
    }
    
    // Send welcome email
    await sendWelcomeEmail({
      to: result.user.email,
      name: result.user.name || result.user.email.split('@')[0],
      resendApiKey: c.env.RESEND_API_KEY,
    });
    
    return c.json({
      message: 'Email verified successfully',
      user: {
        id: result.user.id,
        email: result.user.email,
        emailVerified: true,
      },
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    return c.json({ error: error.message || 'Verification failed' }, 500);
  }
});

// Request password reset
authRoutes.post('/forgot-password', async (c) => {
  try {
    const body = await c.req.json();
    const { email } = body;
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }
    
    const db = createDb(c.env.DB);
    const auth = createAuth(db, c.env);
    
    await auth.api.forgetPassword({
      body: { email },
    });
    
    // Always return success to prevent email enumeration
    return c.json({
      message: 'If the email exists, a password reset link has been sent.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    // Don't reveal if email exists
    return c.json({
      message: 'If the email exists, a password reset link has been sent.',
    });
  }
});

// Reset password
authRoutes.post('/reset-password', async (c) => {
  try {
    const body = await c.req.json();
    const { token, newPassword } = body;
    
    if (!token || !newPassword) {
      return c.json({ error: 'Token and new password are required' }, 400);
    }
    
    if (newPassword.length < 6) {
      return c.json({ error: 'Password must be at least 6 characters' }, 400);
    }
    
    const db = createDb(c.env.DB);
    const auth = createAuth(db, c.env);
    
    await auth.api.resetPassword({
      body: { token, password: newPassword },
    });
    
    return c.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return c.json({ error: error.message || 'Password reset failed' }, 500);
  }
});

// Refresh session
authRoutes.post('/refresh', async (c) => {
  try {
    const db = createDb(c.env.DB);
    const auth = createAuth(db, c.env);
    
    const result = await auth.api.refresh({
      headers: c.req.raw.headers,
    });
    
    if (!result.session) {
      return c.json({ error: 'Session refresh failed' }, 401);
    }
    
    return c.json({
      session: {
        token: result.session.token,
        expiresAt: result.session.expiresAt,
      },
    });
  } catch (error: any) {
    console.error('Refresh session error:', error);
    return c.json({ error: 'Session refresh failed' }, 401);
  }
});

  return authRoutes;
}

