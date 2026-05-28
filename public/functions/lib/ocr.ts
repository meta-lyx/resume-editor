// Text extraction for multiple file formats - Cloudflare Workers compatible
import { extractText as extractPdfText, getDocumentProxy } from 'unpdf';

interface OCRResult {
  text: string;
  confidence: number;
  pages: number;
  extractionMethod: 'docx' | 'ocr' | 'pdf';
}

interface VisionAPIResponse {
  responses: Array<{
    fullTextAnnotation?: {
      text: string;
      pages: Array<{
        confidence: number;
      }>;
    };
    textAnnotations?: Array<{
      description: string;
      locale?: string;
    }>;
    error?: {
      code: number;
      message: string;
    };
  }>;
}

function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  return String(error);
}

/**
 * Resolve MIME type from magic bytes and filename when the browser sends a generic type.
 */
export function resolveMimeType(
  fileBuffer: ArrayBuffer,
  declaredType: string,
  fileName = ''
): string {
  const bytes = new Uint8Array(fileBuffer.slice(0, 4));

  if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return 'application/pdf';
  }

  if (bytes.length >= 2 && bytes[0] === 0x50 && bytes[1] === 0x4b) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  if (declaredType && declaredType !== 'application/octet-stream') {
    return declaredType;
  }

  const ext = fileName.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'application/pdf';
  if (ext === 'docx') {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'webp') return 'image/webp';

  return declaredType;
}

/**
 * Extract text from a text-based PDF using unpdf (PDF.js for serverless).
 */
export async function extractTextFromPDFBuffer(fileBuffer: ArrayBuffer): Promise<OCRResult> {
  try {
    console.log('Extracting text from PDF using unpdf...');

    const pdf = await getDocumentProxy(new Uint8Array(fileBuffer));
    const { totalPages, text } = await extractPdfText(pdf, { mergePages: true });

    const extractedText = Array.isArray(text) ? text.join('\n') : text;
    const trimmed = extractedText.trim();

    if (!trimmed) {
      throw new Error('PDF file appears to be empty or contains no selectable text');
    }

    return {
      text: trimmed,
      confidence: 1.0,
      pages: totalPages || 1,
      extractionMethod: 'pdf',
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    throw new Error(`Failed to extract text from PDF: ${getErrorMessage(error)}`);
  }
}

/**
 * Extract text from an image or PDF using Google Cloud Vision API
 */
export async function extractTextWithVision(
  fileBuffer: ArrayBuffer,
  mimeType: string,
  apiKey: string
): Promise<OCRResult> {
  const base64Content = arrayBufferToBase64(fileBuffer);

  const featureType = mimeType === 'application/pdf'
    ? 'DOCUMENT_TEXT_DETECTION'
    : 'TEXT_DETECTION';

  const requestBody = {
    requests: [
      {
        image: {
          content: base64Content,
        },
        features: [
          {
            type: featureType,
            maxResults: 50,
          },
        ],
        imageContext: {
          languageHints: ['en'],
        },
      },
    ],
  };

  const response = await fetch(
    `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Vision API error: ${response.status} - ${errorText}`);
  }

  const data: VisionAPIResponse = await response.json();

  if (data.responses[0]?.error) {
    throw new Error(`Vision API error: ${data.responses[0].error.message}`);
  }

  const fullTextAnnotation = data.responses[0]?.fullTextAnnotation;
  const textAnnotations = data.responses[0]?.textAnnotations;

  let extractedText = '';
  let confidence = 0;
  let pages = 1;

  if (fullTextAnnotation) {
    extractedText = fullTextAnnotation.text;
    pages = fullTextAnnotation.pages?.length || 1;

    if (fullTextAnnotation.pages && fullTextAnnotation.pages.length > 0) {
      const totalConfidence = fullTextAnnotation.pages.reduce(
        (sum, page) => sum + (page.confidence || 0),
        0
      );
      confidence = totalConfidence / fullTextAnnotation.pages.length;
    }
  } else if (textAnnotations && textAnnotations.length > 0) {
    extractedText = textAnnotations[0].description;
    confidence = 0.9;
  }

  return {
    text: extractedText.trim(),
    confidence,
    pages,
    extractionMethod: 'ocr',
  };
}

/**
 * Extract text from a PDF using Google Cloud Vision (for scanned/image PDFs).
 */
export async function extractTextFromPDFWithVision(
  fileBuffer: ArrayBuffer,
  apiKey: string
): Promise<OCRResult> {
  const base64Content = arrayBufferToBase64(fileBuffer);

  const requestBody = {
    requests: [
      {
        inputConfig: {
          mimeType: 'application/pdf',
          content: base64Content,
        },
        features: [
          {
            type: 'DOCUMENT_TEXT_DETECTION',
          },
        ],
      },
    ],
  };

  const response = await fetch(
    `https://vision.googleapis.com/v1/files:annotate?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    console.log('PDF Vision batch endpoint failed, falling back to image endpoint');
    return extractTextWithVision(fileBuffer, 'application/pdf', apiKey);
  }

  const data = await response.json();

  let extractedText = '';
  let totalConfidence = 0;
  let pageCount = 0;

  if (data.responses && data.responses[0]?.responses) {
    for (const pageResponse of data.responses[0].responses) {
      if (pageResponse.fullTextAnnotation) {
        extractedText += pageResponse.fullTextAnnotation.text + '\n\n';
        pageCount++;

        if (pageResponse.fullTextAnnotation.pages) {
          for (const page of pageResponse.fullTextAnnotation.pages) {
            totalConfidence += page.confidence || 0;
          }
        }
      }
    }
  }

  return {
    text: extractedText.trim(),
    confidence: pageCount > 0 ? totalConfidence / pageCount : 0,
    pages: pageCount || 1,
    extractionMethod: 'pdf',
  };
}

/** @deprecated Use extractTextFromPDFWithVision */
export const extractTextFromPDF = extractTextFromPDFWithVision;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function loadMammoth() {
  const module = await import('mammoth');
  const mammoth = (module as { default?: typeof module }).default ?? module;
  if (!mammoth?.extractRawText) {
    throw new Error('DOCX parser is not available in this environment');
  }
  return mammoth;
}

export async function extractTextFromDOCX(fileBuffer: ArrayBuffer): Promise<OCRResult> {
  try {
    console.log('Extracting text from DOCX using mammoth...');

    const mammoth = await loadMammoth();
    const buffer = new Uint8Array(fileBuffer);
    const result = await mammoth.extractRawText({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error('DOCX file appears to be empty or could not be parsed');
    }

    if (result.messages && result.messages.length > 0) {
      console.log('DOCX extraction warnings:', result.messages);
    }

    return {
      text: result.value.trim(),
      confidence: 1.0,
      pages: 1,
      extractionMethod: 'docx',
    };
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX: ${getErrorMessage(error)}`);
  }
}

function getFileFormatCategory(mimeType: string): 'docx' | 'pdf' | 'image' {
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'docx';
  }
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  throw new Error(`Unsupported file format: ${mimeType}`);
}

const MIN_PDF_TEXT_LENGTH = 50;

/**
 * Main text extraction function that routes to appropriate parser based on file format.
 */
export async function performOCR(
  fileBuffer: ArrayBuffer,
  mimeType: string,
  apiKey: string,
  fileName = ''
): Promise<OCRResult> {
  const fileSizeMB = fileBuffer.byteLength / (1024 * 1024);
  if (fileSizeMB > 15) {
    throw new Error('File too large for processing. Maximum size is 15MB.');
  }

  const resolvedMimeType = resolveMimeType(fileBuffer, mimeType, fileName);
  const formatCategory = getFileFormatCategory(resolvedMimeType);

  console.log(`File format detected: ${formatCategory} (${resolvedMimeType})`);

  switch (formatCategory) {
    case 'docx':
      return await extractTextFromDOCX(fileBuffer);

    case 'pdf': {
      // Prefer local PDF parsing (no API key); fall back to Vision OCR for scanned PDFs.
      try {
        const localResult = await extractTextFromPDFBuffer(fileBuffer);
        if (localResult.text.length >= MIN_PDF_TEXT_LENGTH) {
          return localResult;
        }
        console.log('PDF has little selectable text, trying Vision OCR...');
      } catch (localError) {
        console.log('Local PDF extraction failed, trying Vision OCR:', getErrorMessage(localError));
      }

      if (!apiKey) {
        throw new Error(
          'Could not extract enough text from this PDF. Configure GOOGLE_CLOUD_API_KEY for scanned/image PDFs.'
        );
      }

      try {
        const visionResult = await extractTextFromPDFWithVision(fileBuffer, apiKey);
        if (visionResult.text.length > 0) {
          return { ...visionResult, extractionMethod: 'pdf' };
        }
      } catch (visionError) {
        console.log('Vision PDF extraction failed:', getErrorMessage(visionError));
      }

      try {
        const fallbackResult = await extractTextWithVision(fileBuffer, resolvedMimeType, apiKey);
        return { ...fallbackResult, extractionMethod: 'pdf' };
      } catch (fallbackError) {
        throw new Error(`Failed to extract text from PDF: ${getErrorMessage(fallbackError)}`);
      }
    }

    case 'image': {
      if (!apiKey) {
        throw new Error('OCR service not configured. Please add GOOGLE_CLOUD_API_KEY.');
      }
      const result = await extractTextWithVision(fileBuffer, resolvedMimeType, apiKey);
      return { ...result, extractionMethod: 'ocr' };
    }

    default:
      throw new Error(`Unsupported file format: ${resolvedMimeType}`);
  }
}
