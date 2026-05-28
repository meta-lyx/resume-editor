import { Hono } from 'hono';
import { performOCR } from '../lib/ocr';
import type { Env } from '../index';

export const extractTextRoutes = new Hono<{ Bindings: Env }>();

extractTextRoutes.post('/', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return c.json({ error: 'No file provided', success: false }, 400);
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type) && file.type !== 'application/octet-stream') {
      return c.json({
        error: 'Invalid file type. Supported: PDF, DOCX, PNG, JPG, WEBP',
        success: false,
      }, 400);
    }

    const fileBuffer = await file.arrayBuffer();
    const apiKey = (c.env as Env & { GOOGLE_CLOUD_API_KEY?: string }).GOOGLE_CLOUD_API_KEY ?? '';

    console.log(`Starting text extraction for ${file.name} (${file.type})...`);
    const ocrResult = await performOCR(fileBuffer, file.type, apiKey, file.name);

    return c.json({
      success: true,
      extractedText: ocrResult.text,
      text: ocrResult.text,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      extraction: {
        method: ocrResult.extractionMethod,
        confidence: ocrResult.confidence,
        pages: ocrResult.pages,
      },
      ocr: {
        confidence: ocrResult.confidence,
        pages: ocrResult.pages,
      },
    });
  } catch (error: unknown) {
    console.error('Text extraction error:', error);
    const message = error && typeof error === 'object' && 'message' in error
      ? String((error as { message: unknown }).message)
      : 'Failed to extract text from file';

    return c.json({ error: message, success: false }, 500);
  }
});
