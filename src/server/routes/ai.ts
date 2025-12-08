import { Hono } from 'hono';
import { authMiddleware, getCurrentUser } from '../lib/auth';
import { optimizeResume, generateSuggestions, type OptimizationType } from '../lib/ai';
import { createDb, resumes, optimizationHistory, resumeVersions } from '../db';
import { eq, and } from 'drizzle-orm';

export function createAIApp() {
  const aiRoutes = new Hono();

  // Apply auth middleware to all AI routes
  aiRoutes.use('/*', authMiddleware);

// Optimize resume
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
  const health = {
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

  return aiRoutes;
}

