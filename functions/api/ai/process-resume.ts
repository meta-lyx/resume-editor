// API endpoint for AI resume processing
// POST /api/ai/process-resume

import { createAIService } from '../../lib/ai';

interface Env {
  DB: D1Database;
  AI_PROVIDER?: string;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  AI_MODEL?: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }

  try {
    // Authentication is optional for AI processing (freemium model)
    // Users can preview AI results without logging in
    // Credits are only consumed when downloading
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    let userId: string | null = null;

    if (token) {
      // Verify session if token provided (for tracking/analytics)
    const sessionResult = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?'
    ).bind(token, Math.floor(Date.now() / 1000)).all();

      if (sessionResult.results && sessionResult.results.length > 0) {
        userId = sessionResult.results[0].user_id as string;
      }
    }

    // Parse request body
    const body = await request.json() as {
      resumeText: string;
      jobDescription: string;
      options?: {
        tone?: 'professional' | 'creative' | 'technical';
        focus?: 'skills' | 'experience' | 'achievements' | 'balanced';
      };
    };

    if (!body.resumeText || !body.jobDescription) {
      return new Response(JSON.stringify({ error: 'Missing required fields: resumeText and jobDescription' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Create AI service
    const aiService = createAIService({
      AI_PROVIDER: env.AI_PROVIDER,
      OPENAI_API_KEY: env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: env.ANTHROPIC_API_KEY,
      DEEPSEEK_API_KEY: env.DEEPSEEK_API_KEY,
      AI_MODEL: env.AI_MODEL,
    });

    console.log(`Processing resume with ${aiService.getProviderName()} provider`);

    // Process the resume
    const result = await aiService.processResume({
      resumeText: body.resumeText,
      jobDescription: body.jobDescription,
      options: body.options,
    });

    return new Response(JSON.stringify({
      success: true,
      provider: aiService.getProviderName(),
      result: {
        customizedResume: result.customizedResume,
        structuredResume: result.structuredResume,  // Include structured data for PDF
        suggestions: result.suggestions,
        keywordsMatched: result.keywordsMatched,
        atsScore: result.atsScore,
        processingTime: result.processingTime,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('AI processing error:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to process resume',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

