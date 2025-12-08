import { Hono } from 'hono';
import { authMiddleware, getCurrentUser } from '../lib/auth';
import { createDb, resumes, resumeVersions } from '../db';
import { eq, and, desc } from 'drizzle-orm';

export function createResumeApp() {
  const resumeRoutes = new Hono();

  // Apply auth middleware to all resume routes
  resumeRoutes.use('/*', authMiddleware);

// Create new resume
resumeRoutes.post('/', async (c) => {
  try {
    const user = getCurrentUser(c);
    const body = await c.req.json();
    const { title, originalContent, jobDescription } = body;
    
    if (!title || !originalContent) {
      return c.json({ error: 'Title and content are required' }, 400);
    }
    
    const db = createDb(c.env.DB);
    
    const newResume = await db.insert(resumes).values({
      id: crypto.randomUUID(),
      userId: user.id,
      title,
      originalContent,
      jobDescription: jobDescription || null,
      status: 'draft',
    }).returning();
    
    return c.json({
      message: 'Resume created successfully',
      resume: newResume[0],
    });
  } catch (error: any) {
    console.error('Create resume error:', error);
    return c.json({ error: error.message || 'Failed to create resume' }, 500);
  }
});

// Get all user's resumes
resumeRoutes.get('/', async (c) => {
  try {
    const user = getCurrentUser(c);
    const db = createDb(c.env.DB);
    
    const userResumes = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, user.id))
      .orderBy(desc(resumes.createdAt));
    
    return c.json({ resumes: userResumes });
  } catch (error: any) {
    console.error('Get resumes error:', error);
    return c.json({ error: 'Failed to retrieve resumes' }, 500);
  }
});

// Get single resume by ID
resumeRoutes.get('/:id', async (c) => {
  try {
    const user = getCurrentUser(c);
    const resumeId = c.req.param('id');
    const db = createDb(c.env.DB);
    
    const resume = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)))
      .limit(1);
    
    if (resume.length === 0) {
      return c.json({ error: 'Resume not found' }, 404);
    }
    
    return c.json({ resume: resume[0] });
  } catch (error: any) {
    console.error('Get resume error:', error);
    return c.json({ error: 'Failed to retrieve resume' }, 500);
  }
});

// Update resume
resumeRoutes.put('/:id', async (c) => {
  try {
    const user = getCurrentUser(c);
    const resumeId = c.req.param('id');
    const body = await c.req.json();
    const db = createDb(c.env.DB);
    
    // Check if resume exists and belongs to user
    const existingResume = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)))
      .limit(1);
    
    if (existingResume.length === 0) {
      return c.json({ error: 'Resume not found' }, 404);
    }
    
    // Update resume
    const updated = await db
      .update(resumes)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(resumes.id, resumeId))
      .returning();
    
    return c.json({
      message: 'Resume updated successfully',
      resume: updated[0],
    });
  } catch (error: any) {
    console.error('Update resume error:', error);
    return c.json({ error: 'Failed to update resume' }, 500);
  }
});

// Delete resume
resumeRoutes.delete('/:id', async (c) => {
  try {
    const user = getCurrentUser(c);
    const resumeId = c.req.param('id');
    const db = createDb(c.env.DB);
    
    // Check if resume exists and belongs to user
    const existingResume = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)))
      .limit(1);
    
    if (existingResume.length === 0) {
      return c.json({ error: 'Resume not found' }, 404);
    }
    
    // Delete resume (cascade will delete versions)
    await db.delete(resumes).where(eq(resumes.id, resumeId));
    
    return c.json({ message: 'Resume deleted successfully' });
  } catch (error: any) {
    console.error('Delete resume error:', error);
    return c.json({ error: 'Failed to delete resume' }, 500);
  }
});

// Get resume versions
resumeRoutes.get('/:id/versions', async (c) => {
  try {
    const user = getCurrentUser(c);
    const resumeId = c.req.param('id');
    const db = createDb(c.env.DB);
    
    // Check if resume belongs to user
    const resume = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)))
      .limit(1);
    
    if (resume.length === 0) {
      return c.json({ error: 'Resume not found' }, 404);
    }
    
    // Get all versions
    const versions = await db
      .select()
      .from(resumeVersions)
      .where(eq(resumeVersions.resumeId, resumeId))
      .orderBy(desc(resumeVersions.version));
    
    return c.json({ versions });
  } catch (error: any) {
    console.error('Get versions error:', error);
    return c.json({ error: 'Failed to retrieve versions' }, 500);
  }
});

// Create new version
resumeRoutes.post('/:id/versions', async (c) => {
  try {
    const user = getCurrentUser(c);
    const resumeId = c.req.param('id');
    const body = await c.req.json();
    const { content, optimizationType } = body;
    const db = createDb(c.env.DB);
    
    // Check if resume belongs to user
    const resume = await db
      .select()
      .from(resumes)
      .where(and(eq(resumes.id, resumeId), eq(resumes.userId, user.id)))
      .limit(1);
    
    if (resume.length === 0) {
      return c.json({ error: 'Resume not found' }, 404);
    }
    
    // Get latest version number
    const latestVersion = await db
      .select()
      .from(resumeVersions)
      .where(eq(resumeVersions.resumeId, resumeId))
      .orderBy(desc(resumeVersions.version))
      .limit(1);
    
    const newVersion = (latestVersion[0]?.version || 0) + 1;
    
    // Create new version
    const version = await db.insert(resumeVersions).values({
      id: crypto.randomUUID(),
      resumeId,
      content,
      optimizationType: optimizationType || null,
      version: newVersion,
    }).returning();
    
    return c.json({
      message: 'Version created successfully',
      version: version[0],
    });
  } catch (error: any) {
    console.error('Create version error:', error);
    return c.json({ error: 'Failed to create version' }, 500);
  }
});

// Get user statistics
resumeRoutes.get('/stats/overview', async (c) => {
  try {
    const user = getCurrentUser(c);
    const db = createDb(c.env.DB);
    
    // Count total resumes
    const totalResumes = await db
      .select()
      .from(resumes)
      .where(eq(resumes.userId, user.id));
    
    // Count optimized resumes
    const optimizedResumes = totalResumes.filter(r => r.optimizedContent);
    
    // Count drafts
    const drafts = totalResumes.filter(r => r.status === 'draft');
    
    return c.json({
      stats: {
        totalResumes: totalResumes.length,
        optimizedResumes: optimizedResumes.length,
        drafts: drafts.length,
        completedResumes: totalResumes.filter(r => r.status === 'completed').length,
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return c.json({ error: 'Failed to retrieve statistics' }, 500);
  }
});

  return resumeRoutes;
}

