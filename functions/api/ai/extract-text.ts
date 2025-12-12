// AI Text Extraction endpoint - uses Google Cloud Vision OCR
import { performOCR } from '../../lib/ocr';

interface Env {
  GOOGLE_CLOUD_API_KEY: string;
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
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
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
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check for Google Cloud API key
    if (!env.GOOGLE_CLOUD_API_KEY) {
      return new Response(JSON.stringify({
        error: 'OCR service not configured. Please add GOOGLE_CLOUD_API_KEY.',
        success: false,
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Read file content for OCR
    const fileBuffer = await file.arrayBuffer();

    // Extract text using Google Cloud Vision OCR
    console.log(`Starting OCR extraction for ${file.name} (${file.type})...`);
    const ocrResult = await performOCR(fileBuffer, file.type, env.GOOGLE_CLOUD_API_KEY);
    
    console.log(`OCR completed: ${ocrResult.text.length} chars, ${ocrResult.pages} pages, ${(ocrResult.confidence * 100).toFixed(1)}% confidence`);

    return new Response(JSON.stringify({
      success: true,
      extractedText: ocrResult.text,
      text: ocrResult.text, // Alias for compatibility
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      ocr: {
        confidence: ocrResult.confidence,
        pages: ocrResult.pages,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('OCR extraction error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to extract text from file',
      success: false,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

