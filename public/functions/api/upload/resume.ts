// Resume file upload endpoint with Google Cloud Vision OCR
import { performOCR } from '../../lib/ocr';

interface Env {
  DB: D1Database;
  RESUME_BUCKET: R2Bucket;
  GOOGLE_CLOUD_API_KEY: string;
  CLOUDFLARE_ACCOUNT_ID: string;
}

export async function onRequest(context: EventContext<Env, any, any>) {
  try {
    const { request, env } = context;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Get authorization token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Verify session
    const sessions = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?'
    ).bind(token, Math.floor(Date.now() / 1000)).all();
    
    if (sessions.results.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const userId = (sessions.results[0] as any).user_id;
    
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Validate file type
    const allowedTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ 
        error: 'Invalid file type. Supported: PDF, DOCX, PNG, JPG, WEBP' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Generate unique filename
    const fileId = crypto.randomUUID();
    const fileExtension = file.name.split('.').pop();
    const r2Key = `resumes/${userId}/${fileId}.${fileExtension}`;
    
    // Read file content for OCR
    const fileBuffer = await file.arrayBuffer();
    
    // Upload to R2
    await env.RESUME_BUCKET.put(r2Key, fileBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
    });
    
    // Generate file URL
    const fileUrl = `https://ai-resume-bucket.${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${r2Key}`;
    
    // Extract text using Google Cloud Vision OCR
    let extractedText = '';
    let ocrConfidence = 0;
    let ocrPages = 1;
    let ocrError: string | null = null;
    
    if (env.GOOGLE_CLOUD_API_KEY) {
      try {
        console.log('Starting OCR extraction...');
        const ocrResult = await performOCR(fileBuffer, file.type, env.GOOGLE_CLOUD_API_KEY);
        extractedText = ocrResult.text;
        ocrConfidence = ocrResult.confidence;
        ocrPages = ocrResult.pages;
        console.log(`OCR completed: ${extractedText.length} chars, ${ocrPages} pages, ${(ocrConfidence * 100).toFixed(1)}% confidence`);
      } catch (error: any) {
        console.error('OCR error:', error);
        ocrError = error.message;
        // Provide a fallback message
        extractedText = `[OCR extraction failed: ${error.message}]\n\nPlease ensure your resume is a clear, readable document.`;
      }
    } else {
      console.warn('GOOGLE_CLOUD_API_KEY not configured, skipping OCR');
      extractedText = `[OCR not configured]\n\nFile uploaded successfully but text extraction is not available. Please configure GOOGLE_CLOUD_API_KEY.`;
    }
    
    // Save file metadata to database
    const uploadId = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    
    await env.DB.prepare(
      'INSERT INTO file_uploads (id, user_id, file_name, file_size, mime_type, r2_key, r2_url, uploaded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(uploadId, userId, file.name, file.size, file.type, r2Key, fileUrl, now).run();
    
    // Return response with OCR results
    return new Response(JSON.stringify({
      success: true,
      fileId: uploadId,
      fileName: file.name,
      fileUrl,
      fileSize: file.size,
      mimeType: file.type,
      extractedText,
      text: extractedText, // Alternative field name for compatibility
      ocr: {
        confidence: ocrConfidence,
        pages: ocrPages,
        error: ocrError,
      },
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Upload failed',
      stack: error.stack,
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
