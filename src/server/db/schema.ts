import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table (managed by Better Auth)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  emailVerified: integer('email_verified', { mode: 'boolean' }).default(false),
  name: text('name'),
  image: text('image'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Sessions table (Better Auth)
export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Accounts table (Better Auth - for OAuth)
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(), // 'email', 'google', 'github', etc.
  providerAccountId: text('provider_account_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  expiresAt: integer('expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Verification tokens (for email verification)
export const verificationTokens = sqliteTable('verification_tokens', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(), // email
  token: text('token').notNull().unique(),
  expires: integer('expires', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Resumes table
export const resumes = sqliteTable('resumes', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  originalContent: text('original_content').notNull(), // Original resume text
  optimizedContent: text('optimized_content'), // AI-optimized content
  jobDescription: text('job_description'), // Target job description
  status: text('status').notNull().default('draft'), // 'draft', 'optimizing', 'completed'
  fileUrl: text('file_url'), // R2 URL to uploaded file
  fileName: text('file_name'),
  fileSize: integer('file_size'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Resume versions (history)
export const resumeVersions = sqliteTable('resume_versions', {
  id: text('id').primaryKey(),
  resumeId: text('resume_id').notNull().references(() => resumes.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  optimizationType: text('optimization_type'), // 'ats', 'language', 'achievement', 'job-match'
  version: integer('version').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Subscription plans
export const subscriptionPlans = sqliteTable('subscription_plans', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  planType: text('plan_type').notNull().unique(), // 'free', 'basic', 'premium', 'enterprise'
  price: real('price').notNull().default(0),
  currency: text('currency').notNull().default('USD'),
  interval: text('interval').notNull().default('month'), // 'month', 'year'
  monthlyLimit: integer('monthly_limit').notNull().default(0), // Number of optimizations
  features: text('features'), // JSON string of features
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// User subscriptions
export const userSubscriptions = sqliteTable('user_subscriptions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull().references(() => subscriptionPlans.id),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeCustomerId: text('stripe_customer_id'),
  status: text('status').notNull().default('active'), // 'active', 'cancelled', 'expired', 'past_due'
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
  usageCount: integer('usage_count').notNull().default(0), // Monthly usage counter
  usageResetAt: integer('usage_reset_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Optimization history (for tracking AI usage)
export const optimizationHistory = sqliteTable('optimization_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resumeId: text('resume_id').references(() => resumes.id, { onDelete: 'set null' }),
  optimizationType: text('optimization_type').notNull(),
  aiModel: text('ai_model').notNull(), // 'gpt-4', 'claude-3', etc.
  tokensUsed: integer('tokens_used'),
  cost: real('cost'),
  duration: integer('duration'), // milliseconds
  success: integer('success', { mode: 'boolean' }).notNull().default(true),
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Email logs
export const emailLogs = sqliteTable('email_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id, { onDelete: 'set null' }),
  to: text('to').notNull(),
  subject: text('subject').notNull(),
  emailType: text('email_type').notNull(), // 'verification', 'welcome', 'subscription', 'notification'
  provider: text('provider').notNull().default('resend'),
  providerMessageId: text('provider_message_id'),
  status: text('status').notNull().default('sent'), // 'sent', 'delivered', 'bounced', 'failed'
  errorMessage: text('error_message'),
  sentAt: integer('sent_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// File uploads (R2 tracking)
export const fileUploads = sqliteTable('file_uploads', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  resumeId: text('resume_id').references(() => resumes.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  r2Key: text('r2_key').notNull().unique(), // R2 object key
  r2Url: text('r2_url').notNull(), // Public URL
  uploadedAt: integer('uploaded_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type UserSubscription = typeof userSubscriptions.$inferSelect;

