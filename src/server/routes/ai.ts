import { Hono } from 'hono';
import { authMiddleware, optionalAuthMiddleware, getCurrentUser } from '../lib/auth';
import { optimizeResume, generateSuggestions, type OptimizationType } from '../lib/ai';
import { createDb, resumes, optimizationHistory, resumeVersions } from '../db';
import { eq, and } from 'drizzle-orm';


export const aiRoutes = new Hono();

// Optional auth for public endpoints (process-resume, extract-text, health)
aiRoutes.use('/process-resume', optionalAuthMiddleware);
aiRoutes.use('/extract-text', optionalAuthMiddleware);
aiRoutes.use('/health', optionalAuthMiddleware);

// Strict auth for all other AI routes
aiRoutes.use('/*', authMiddleware);

// Process resume endpoint - matches frontend API client format
aiRoutes.post('/process-resume', async (c) => {
  try {
    const user = getCurrentUser(c);
    const body = await c.req.json();
    const { resumeText, jobDescription, options } = body;

    if (!resumeText) {
      return c.json({ error: 'Resume text is required' }, 400);
    }

    const db = createDb(c.env.DB);
    const startTime = Date.now();

    // Map frontend options to optimization type
    const focus = options?.focus || 'balanced';
    let optimizationType: OptimizationType = 'job-match';
    if (!jobDescription) {
      optimizationType = 'language-polish';
    }

    try {
      const result = await optimizeResume(
        {
          resumeContent: resumeText,
          jobDescription: jobDescription || '',
          optimizationType,
          model: 'deepseek-chat',
        },
        {
          OPENAI_API_KEY: c.env.OPENAI_API_KEY,
          ANTHROPIC_API_KEY: c.env.ANTHROPIC_API_KEY,
          DEEPSEEK_API_KEY: c.env.DEEPSEEK_API_KEY,
        }
      );

      const duration = Date.now() - startTime;

      await db.insert(optimizationHistory).values({
        id: crypto.randomUUID(),
        userId: user.id,
        resumeId: null,
        optimizationType,
        aiModel: result.model,
        tokensUsed: result.tokensUsed,
        duration,
        success: true,
      });

      // Also extract structured resume data from the optimized text for PDF generation
      let structuredData: any = null;
      try {
        const structureResp = await fetch('https://api.deepseek.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${c.env.DEEPSEEK_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'You extract structured resume data from plain text. Return ONLY valid JSON (no markdown, no code fences). Use this schema: { "personalInfo": { "name": string, "title": string|null, "email": string|null, "phone": string|null, "location": string|null, "linkedin": string|null, "github": string|null, "website": string|null }, "summary": string|null, "experience": [{ "title": string, "company": string, "location": string|null, "startDate": string|null, "endDate": string|null, "bullets": string[] }], "education": [{ "degree": string, "school": string, "location": string|null, "graduationDate": string|null, "gpa": string|null, "highlights": string[]|null }], "skills": [{ "category": string|null, "items": string[] }], "certifications": [{ "name": string, "issuer": string|null, "date": string|null }]|null, "projects": [{ "name": string, "description": string|null, "technologies": string[]|null }]|null }'
              },
              {
                role: 'user',
                content: result.optimizedContent
              }
            ],
            temperature: 0.1,
            max_tokens: 4096,
          }),
        });
        if (structureResp.ok) {
          const structureResult = await structureResp.json();
          const raw = structureResult.choices?.[0]?.message?.content || '';
          // Parse JSON, stripping any markdown fences if present
          const cleaned = raw.replace(/^```(?:json)?\s*|[\r\n]```\s*$/g, '').trim();
          structuredData = JSON.parse(cleaned);
        }
      } catch (structErr) {
        console.error('Structured extraction failed (non-fatal):', structErr);
      }

      return c.json({
        result: {
          customizedResume: result.optimizedContent,
          structuredResume: structuredData,
          model: result.model,
          tokensUsed: result.tokensUsed,
          processingTime: duration,
        },
      });
    } catch (error) {
      await db.insert(optimizationHistory).values({
        id: crypto.randomUUID(),
        userId: user.id,
        resumeId: null,
        optimizationType,
        aiModel: 'deepseek-chat',
        tokensUsed: 0,
        duration: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return c.json({
        error: error instanceof Error ? error.message : 'AI processing failed',
      }, 500);
    }
  } catch (error) {
    return c.json({
      error: 'Failed to process resume',
    }, 500);
  }
});

// Optimize resume (internal/legacy endpoint)
aiRoutes.post('/optimize', async (c) => {
  try {
    const user = getCurrentUser(c);
    const body = await c.req.json();
    const { resumeId, resumeContent, jobDescription, optimizationType, model } = body;
    
    if (!resumeContent || !optimizationType) {
      return c.json({ 
        error: 'Resume content and optimization type are required' 
      }, 400);
    }
    
    // Validate optimization type
    const validTypes: OptimizationType[] = [
      'ats-optimization',
      'language-polish',
      'achievement-highlight',
      'job-match',
    ];
    
    if (!validTypes.includes(optimizationType)) {
      return c.json({ error: 'Invalid optimization type' }, 400);
    }
    
    // If job-match, require job description
    if (optimizationType === 'job-match' && !jobDescription) {
      return c.json({ 
        error: 'Job description is required for job matching optimization' 
      }, 400);
    }
    
    const db = createDb(c.env.DB);
    const startTime = Date.now();
    
    try {
      // Call AI service
      const result = await optimizeResume(
        {
          resumeContent,
          jobDescription,
          optimizationType,
          model,
        },
        {
          OPENAI_API_KEY: c.env.OPENAI_API_KEY,
          ANTHROPIC_API_KEY: c.env.ANTHROPIC_API_KEY,
          DEEPSEEK_API_KEY: c.env.DEEPSEEK_API_KEY,
        }
      );
      
      const duration = Date.now() - startTime;
      
      // Log optimization history
      await db.insert(optimizationHistory).values({
        id: crypto.randomUUID(),
        userId: user.id,
        resumeId: resumeId || null,
        optimizationType,
        aiModel: result.model,
        tokensUsed: result.tokensUsed,
        duration,
        success: true,
      });
      
      // If resumeId provided, update the resume
      if (resumeId) {
        // Check if resume belongs to user
        const resume = await db
          .select()
          .from(resumes)
          .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)))
          .limit(1);
        
        if (resume.length > 0) {
          // Update resume with optimized content
          await db
            .update(resumes)
            .set({
              optimizedContent: result.optimizedContent,
              status: 'completed',
              updatedAt: new Date(),
            })
            .where(eq(resumes.id, resumeId));
          
          // Create a new version
          const latestVersion = await db
            .select()
            .from(resumeVersions)
            .where(eq(resumeVersions.resumeId, resumeId))
            .orderBy((resumeVersions) => resumeVersions.version)
            .limit(1);
          
          const newVersion = (latestVersion[0]?.version || 0) + 1;
          
          await db.insert(resumeVersions).values({
            id: crypto.randomUUID(),
            resumeId,
            content: result.optimizedContent,
            optimizationType,
            version: newVersion,
          });
        }
      }
      
      return c.json({
        success: true,
        optimizedContent: result.optimizedContent,
        model: result.model,
        tokensUsed: result.tokensUsed,
        duration,
      });
      
    } catch (aiError: any) {
      // Log failed optimization
      await db.insert(optimizationHistory).values({
        id: crypto.randomUUID(),
        userId: user.id,
        resumeId: resumeId || null,
        optimizationType,
        aiModel: model || 'gpt-4',
        duration: Date.now() - startTime,
        success: false,
        errorMessage: aiError.message,
      });
      
      throw aiError;
    }
    
  } catch (error: any) {
    console.error('AI optimization error:', error);
    return c.json({ 
      error: error.message || 'Resume optimization failed' 
    }, 500);
  }
});

// Generate improvement suggestions
aiRoutes.post('/suggestions', async (c) => {
  try {
    const user = getCurrentUser(c);
    const body = await c.req.json();
    const { resumeContent } = body;
    
    if (!resumeContent) {
      return c.json({ error: 'Resume content is required' }, 400);
    }
    
    const suggestions = await generateSuggestions(resumeContent, {
      OPENAI_API_KEY: c.env.OPENAI_API_KEY,
      ANTHROPIC_API_KEY: c.env.ANTHROPIC_API_KEY,
      DEEPSEEK_API_KEY: c.env.DEEPSEEK_API_KEY,
    });
    
    return c.json({ suggestions });
    
  } catch (error: any) {
    console.error('Generate suggestions error:', error);
    return c.json({ 
      error: error.message || 'Failed to generate suggestions' 
    }, 500);
  }
});

// Get optimization history for user
aiRoutes.get('/history', async (c) => {
  try {
    const user = getCurrentUser(c);
    const db = createDb(c.env.DB);
    
    const history = await db
      .select()
      .from(optimizationHistory)
      .where(eq(optimizationHistory.userId, user.id))
      .orderBy((optimizationHistory) => optimizationHistory.createdAt)
      .limit(50);
    
    // Calculate totals
    const totalOptimizations = history.length;
    const successfulOptimizations = history.filter(h => h.success).length;
    const totalTokens = history.reduce((sum, h) => sum + (h.tokensUsed || 0), 0);
    const totalCost = history.reduce((sum, h) => sum + (h.cost || 0), 0);
    
    return c.json({
      history,
      stats: {
        totalOptimizations,
        successfulOptimizations,
        failedOptimizations: totalOptimizations - successfulOptimizations,
        totalTokens,
        totalCost,
      },
    });
    
  } catch (error: any) {
    console.error('Get history error:', error);
    return c.json({ error: 'Failed to retrieve history' }, 500);
  }
});

// Get available AI models
aiRoutes.get('/models', async (c) => {
  const models = [
    {
      id: 'deepseek-chat',
      name: 'DeepSeek Chat',
      provider: 'DeepSeek',
      description: 'Fast and cost-effective model, great for resume optimization',
      available: !!c.env.DEEPSEEK_API_KEY,
      costPer1kTokens: 0.00014,
    },
    {
      id: 'gpt-4',
      name: 'GPT-4',
      provider: 'OpenAI',
      description: 'Most capable model, best for complex optimizations',
      available: !!c.env.OPENAI_API_KEY,
      costPer1kTokens: 0.03,
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      provider: 'OpenAI',
      description: 'Fast and efficient, good for quick optimizations',
      available: !!c.env.OPENAI_API_KEY,
      costPer1kTokens: 0.002,
    },
    {
      id: 'claude-3-opus',
      name: 'Claude 3 Opus',
      provider: 'Anthropic',
      description: 'Powerful model with excellent writing capabilities',
      available: !!c.env.ANTHROPIC_API_KEY,
      costPer1kTokens: 0.015,
    },
    {
      id: 'claude-3-sonnet',
      name: 'Claude 3 Sonnet',
      provider: 'Anthropic',
      description: 'Balanced performance and cost',
      available: !!c.env.ANTHROPIC_API_KEY,
      costPer1kTokens: 0.003,
    },
  ];
  
  return c.json({ models });
});

// Health check for AI services
aiRoutes.get('/health', async (c) => {
// Extract text from uploaded resume file
aiRoutes.post('/extract-text', async (c) => {
  try {
    const user = getCurrentUser(c);
    const formData = await c.req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Read file content
    const fileBuffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();
    const contentType = file.type;

    let rawText = '';

    // For plain text files, decode directly
    if (contentType === 'text/plain' || fileName.endsWith('.txt')) {
      rawText = new TextDecoder().decode(fileBuffer);
    } else if (contentType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|webp)$/)) {
      // Images: not directly supported by DeepSeek (non-multimodal)
      rawText = '[Image file uploaded. Please convert to plain text (.txt) format for processing.]';
    } else if (contentType === 'application/pdf' || fileName.endsWith('.pdf')) {
      // PDF parsing is done client-side (via pdfjs-dist). This endpoint handles text-based uploads.
      try {
        rawText = new TextDecoder().decode(fileBuffer);
        if (!rawText.trim() || rawText.includes('\x00\x00')) {
          rawText = '[Binary PDF file - text extraction not supported server-side. Please use the client-side upload.]';
        }
      } catch {
        rawText = '[PDF file uploaded. Please try plain text (.txt) format.]';
      }
    } else if (contentType.includes('word') || fileName.match(/\.(doc|docx)$/)) {
      rawText = '[Word document uploaded. Please save as .txt format for text extraction.]';
    } else {
      // Fallback: try plain text decode
      try {
        rawText = new TextDecoder().decode(fileBuffer).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, ' ');
      } catch {
        rawText = '[Unable to extract text from this file format]';
      }
    }

    // Clean up the extracted text
    const cleaned = rawText.trim();

    if (!cleaned) {
      return c.json({ error: 'No text could be extracted from the file. Please try uploading a plain text (.txt) file.' }, 400);
    }

    return c.json({
      extractedText: cleaned,
    });
  } catch (error: any) {
    console.error('Text extraction error:', error);
    return c.json({ error: 'Failed to extract text from file' }, 500);
  }
});

  const health = {
    deepseek: {
      configured: !!c.env.DEEPSEEK_API_KEY,
      status: c.env.DEEPSEEK_API_KEY ? 'available' : 'not configured',
    },
    openai: {
      configured: !!c.env.OPENAI_API_KEY,
      status: c.env.OPENAI_API_KEY ? 'available' : 'not configured',
    },
    anthropic: {
      configured: !!c.env.ANTHROPIC_API_KEY,
      status: c.env.ANTHROPIC_API_KEY ? 'available' : 'not configured',
    },
  };
  
  return c.json(health);
});





