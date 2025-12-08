import type { R2Bucket } from '@cloudflare/workers-types';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface UploadOptions {
  userId: string;
  fileName: string;
  contentType: string;
  file: ArrayBuffer;
}

// Generate unique key for R2 storage
export function generateR2Key(userId: string, fileName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `resumes/${userId}/${timestamp}-${randomString}-${sanitizedFileName}`;
}

// Upload file to R2
export async function uploadToR2(
  bucket: R2Bucket,
  options: UploadOptions
): Promise<UploadResult> {
  const { userId, fileName, contentType, file } = options;
  
  // Generate unique key
  const key = generateR2Key(userId, fileName);
  
  try {
    // Upload to R2
    await bucket.put(key, file, {
      httpMetadata: {
        contentType,
      },
      customMetadata: {
        userId,
        originalFileName: fileName,
        uploadedAt: new Date().toISOString(),
      },
    });
    
    // R2 URL format (will be accessible via custom domain or R2.dev)
    const url = `https://resume-files.your-account.r2.cloudflarestorage.com/${key}`;
    
    return {
      key,
      url,
      size: file.byteLength,
      contentType,
    };
  } catch (error) {
    console.error('R2 upload error:', error);
    throw new Error('Failed to upload file to R2');
  }
}

// Get file from R2
export async function getFromR2(
  bucket: R2Bucket,
  key: string
): Promise<R2ObjectBody | null> {
  try {
    const object = await bucket.get(key);
    return object;
  } catch (error) {
    console.error('R2 get error:', error);
    return null;
  }
}

// Delete file from R2
export async function deleteFromR2(
  bucket: R2Bucket,
  key: string
): Promise<boolean> {
  try {
    await bucket.delete(key);
    return true;
  } catch (error) {
    console.error('R2 delete error:', error);
    return false;
  }
}

// List files for a user
export async function listUserFiles(
  bucket: R2Bucket,
  userId: string
): Promise<R2Object[]> {
  try {
    const prefix = `resumes/${userId}/`;
    const listed = await bucket.list({ prefix });
    return listed.objects;
  } catch (error) {
    console.error('R2 list error:', error);
    return [];
  }
}

// Get file metadata
export async function getFileMetadata(
  bucket: R2Bucket,
  key: string
): Promise<{
  size: number;
  uploaded: Date;
  contentType?: string;
  customMetadata?: Record<string, string>;
} | null> {
  try {
    const object = await bucket.head(key);
    
    if (!object) return null;
    
    return {
      size: object.size,
      uploaded: object.uploaded,
      contentType: object.httpMetadata?.contentType,
      customMetadata: object.customMetadata,
    };
  } catch (error) {
    console.error('R2 metadata error:', error);
    return null;
  }
}

// Validate file type
export function validateFileType(contentType: string): boolean {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'text/plain', // .txt
  ];
  
  return allowedTypes.includes(contentType);
}

// Validate file size (max 10MB)
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size <= maxSize;
}

// Extract text from PDF/DOCX (simplified - you may want to use a library)
export async function extractTextFromFile(
  file: ArrayBuffer,
  contentType: string
): Promise<string> {
  // This is a placeholder. In production, you'd want to use:
  // - pdf-parse for PDFs
  // - mammoth for DOCX
  // Or call an external service
  
  if (contentType === 'text/plain') {
    const text = new TextDecoder().decode(file);
    return text;
  }
  
  // For now, return a placeholder
  // TODO: Implement proper text extraction
  return '[Resume content will be extracted here]';
}

