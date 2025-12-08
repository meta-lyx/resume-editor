import { Hono } from 'hono';
import { authMiddleware, getCurrentUser } from '../lib/auth';
import { uploadToR2, validateFileType, validateFileSize, extractTextFromFile } from '../lib/r2';
import { createDb, fileUploads } from '../db';

export function createUploadApp() {
  const uploadRoutes = new Hono();

  // Apply auth middleware to all upload routes
  uploadRoutes.use('/*', authMiddleware);

// Upload resume file
uploadRoutes.post('/', async (c) => {
  try {
    const user = getCurrentUser(c);
    
    // Get file from request
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Validate file type
    if (!validateFileType(file.type)) {
      return c.json({
        error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.',
      }, 400);
    }
    
    // Validate file size
    if (!validateFileSize(file.size)) {
      return c.json({
        error: 'File too large. Maximum size is 10MB.',
      }, 400);
    }
    
    // Read file as ArrayBuffer
    const fileBuffer = await file.arrayBuffer();
    
    // Extract text content
    const extractedText = await extractTextFromFile(fileBuffer, file.type);
    
    // Upload to R2
    const uploadResult = await uploadToR2(c.env.RESUME_BUCKET, {
      userId: user.id,
      fileName: file.name,
      contentType: file.type,
      file: fileBuffer,
    });
    
    // Save to database
    const db = createDb(c.env.DB);
    const fileRecord = await db.insert(fileUploads).values({
      id: crypto.randomUUID(),
      userId: user.id,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      r2Key: uploadResult.key,
      r2Url: uploadResult.url,
    }).returning();
    
    return c.json({
      message: 'File uploaded successfully',
      file: {
        id: fileRecord[0].id,
        fileName: file.name,
        fileSize: file.size,
        url: uploadResult.url,
      },
      extractedText,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return c.json({ error: error.message || 'File upload failed' }, 500);
  }
});

// Get user's uploaded files
uploadRoutes.get('/', async (c) => {
  try {
    const user = getCurrentUser(c);
    const db = createDb(c.env.DB);
    
    const files = await db.query.fileUploads.findMany({
      where: (fileUploads, { eq }) => eq(fileUploads.userId, user.id),
      orderBy: (fileUploads, { desc }) => [desc(fileUploads.uploadedAt)],
    });
    
    return c.json({ files });
  } catch (error: any) {
    console.error('Get files error:', error);
    return c.json({ error: 'Failed to retrieve files' }, 500);
  }
});

// Delete uploaded file
uploadRoutes.delete('/:id', async (c) => {
  try {
    const user = getCurrentUser(c);
    const fileId = c.req.param('id');
    const db = createDb(c.env.DB);
    
    // Find file
    const file = await db.query.fileUploads.findFirst({
      where: (fileUploads, { eq, and }) =>
        and(eq(fileUploads.id, fileId), eq(fileUploads.userId, user.id)),
    });
    
    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }
    
    // Delete from R2
    await c.env.RESUME_BUCKET.delete(file.r2Key);
    
    // Delete from database
    await db.delete(fileUploads).where((fileUploads) => fileUploads.id === fileId);
    
    return c.json({ message: 'File deleted successfully' });
  } catch (error: any) {
    console.error('Delete file error:', error);
    return c.json({ error: 'Failed to delete file' }, 500);
  }
});

// Get file download URL
uploadRoutes.get('/:id/download', async (c) => {
  try {
    const user = getCurrentUser(c);
    const fileId = c.req.param('id');
    const db = createDb(c.env.DB);
    
    // Find file
    const file = await db.query.fileUploads.findFirst({
      where: (fileUploads, { eq, and }) =>
        and(eq(fileUploads.id, fileId), eq(fileUploads.userId, user.id)),
    });
    
    if (!file) {
      return c.json({ error: 'File not found' }, 404);
    }
    
    // Get file from R2
    const r2Object = await c.env.RESUME_BUCKET.get(file.r2Key);
    
    if (!r2Object) {
      return c.json({ error: 'File not found in storage' }, 404);
    }
    
    // Return file as response
    return new Response(r2Object.body, {
      headers: {
        'Content-Type': file.mimeType,
        'Content-Disposition': `attachment; filename="${file.fileName}"`,
        'Content-Length': file.fileSize.toString(),
      },
    });
  } catch (error: any) {
    console.error('Download file error:', error);
    return c.json({ error: 'Failed to download file' }, 500);
  }
});

  return uploadRoutes;
}

