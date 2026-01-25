// Text extraction for multiple file formats - Cloudflare Workers compatible
import mammoth from 'mammoth';

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

/**
 * Extract text from an image or PDF using Google Cloud Vision API
 * @param fileBuffer - The file content as ArrayBuffer
 * @param mimeType - The MIME type of the file
 * @param apiKey - Google Cloud API key
 * @returns OCR result with extracted text
 */
export async function extractTextWithVision(
  fileBuffer: ArrayBuffer,
  mimeType: string,
  apiKey: string
): Promise<OCRResult> {
  // Convert file to base64
  const base64Content = arrayBufferToBase64(fileBuffer);
  
  // Determine the feature type based on file type
  // For PDFs, we need to use DOCUMENT_TEXT_DETECTION
  // For images, TEXT_DETECTION works well
  const featureType = mimeType === 'application/pdf' 
    ? 'DOCUMENT_TEXT_DETECTION' 
    : 'TEXT_DETECTION';
  
  // Build the Vision API request
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
          languageHints: ['en'], // Optimize for English
        },
      },
    ],
  };
  
  // Call Google Cloud Vision API
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
  
  // Check for API errors
  if (data.responses[0]?.error) {
    throw new Error(`Vision API error: ${data.responses[0].error.message}`);
  }
  
  // Extract text from response
  const fullTextAnnotation = data.responses[0]?.fullTextAnnotation;
  const textAnnotations = data.responses[0]?.textAnnotations;
  
  let extractedText = '';
  let confidence = 0;
  let pages = 1;
  
  if (fullTextAnnotation) {
    // Use full text annotation for better formatting
    extractedText = fullTextAnnotation.text;
    pages = fullTextAnnotation.pages?.length || 1;
    
    // Calculate average confidence
    if (fullTextAnnotation.pages && fullTextAnnotation.pages.length > 0) {
      const totalConfidence = fullTextAnnotation.pages.reduce(
        (sum, page) => sum + (page.confidence || 0),
        0
      );
      confidence = totalConfidence / fullTextAnnotation.pages.length;
    }
  } else if (textAnnotations && textAnnotations.length > 0) {
    // Fall back to text annotations (first one contains full text)
    extractedText = textAnnotations[0].description;
    confidence = 0.9; // Default confidence for text annotations
  }
  
  return {
    text: extractedText.trim(),
    confidence,
    pages,
    extractionMethod: 'ocr',
  };
}

/**
 * Extract text from a PDF using Google Cloud Vision Document AI
 * This is more suitable for multi-page PDFs
 * @param fileBuffer - The PDF content as ArrayBuffer
 * @param apiKey - Google Cloud API key
 * @returns OCR result with extracted text
 */
export async function extractTextFromPDF(
  fileBuffer: ArrayBuffer,
  apiKey: string
): Promise<OCRResult> {
  // For PDFs, we'll use the batch annotation endpoint which handles PDFs better
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
    const errorText = await response.text();
    // If the files:annotate endpoint fails, fall back to images:annotate
    // This can happen with single-page PDFs
    console.log('PDF endpoint failed, falling back to image endpoint');
    return extractTextWithVision(fileBuffer, 'application/pdf', apiKey);
  }
  
  const data = await response.json();
  
  // Process multi-page PDF response
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

/**
 * Convert ArrayBuffer to base64 string
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Extract text from DOCX files using mammoth
 * DOCX files are structured documents (ZIP archives with XML), not images
 * Direct text extraction is faster and more accurate than OCR
 */
export async function extractTextFromDOCX(fileBuffer: ArrayBuffer): Promise<OCRResult> {
  try {
    console.log('Extracting text from DOCX using mammoth...');
    
    // Convert ArrayBuffer to Uint8Array for mammoth (Cloudflare Workers compatible)
    const buffer = new Uint8Array(fileBuffer);
    
    // Extract raw text from DOCX
    const result = await mammoth.extractRawText({ buffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('DOCX file appears to be empty or could not be parsed');
    }
    
    // Log any warnings from mammoth
    if (result.messages && result.messages.length > 0) {
      console.log('DOCX extraction warnings:', result.messages);
    }
    
    return {
      text: result.value.trim(),
      confidence: 1.0, // Direct text extraction has perfect confidence
      pages: 1, // DOCX doesn't have distinct pages in the same way as PDF
      extractionMethod: 'docx',
    };
  } catch (error: any) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX: ${error.message}`);
  }
}

/**
 * Determine file format category for routing to appropriate parser
 */
function getFileFormatCategory(mimeType: string): 'docx' | 'pdf' | 'image' {
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return 'docx';
  }
  if (mimeType === 'application/pdf') {
    return 'pdf';
  }
  // Images: png, jpeg, jpg, webp
  if (mimeType.startsWith('image/')) {
    return 'image';
  }
  
  throw new Error(`Unsupported file format: ${mimeType}`);
}

/**
 * Main text extraction function that routes to appropriate parser based on file format
 * Supports: DOCX, PDF, and images (PNG, JPG, WEBP)
 */
export async function performOCR(
  fileBuffer: ArrayBuffer,
  mimeType: string,
  apiKey: string
): Promise<OCRResult> {
  // Check file size (Vision API has a 20MB limit for base64 encoded content)
  const fileSizeMB = fileBuffer.byteLength / (1024 * 1024);
  if (fileSizeMB > 15) { // Leave some margin for base64 encoding
    throw new Error('File too large for processing. Maximum size is 15MB.');
  }
  
  // Determine file format and route to appropriate extractor
  const formatCategory = getFileFormatCategory(mimeType);
  
  console.log(`File format detected: ${formatCategory} (${mimeType})`);
  
  // Route to appropriate extraction method
  switch (formatCategory) {
    case 'docx':
      // DOCX: Use mammoth for direct text extraction (no OCR needed)
      return await extractTextFromDOCX(fileBuffer);
      
    case 'pdf':
      // PDF: Use Google Cloud Vision OCR
      try {
        const result = await extractTextFromPDF(fileBuffer, apiKey);
        return { ...result, extractionMethod: 'pdf' };
      } catch (error) {
        // Fall back to standard vision API
        console.log('PDF extraction failed, trying standard vision API');
        const result = await extractTextWithVision(fileBuffer, mimeType, apiKey);
        return { ...result, extractionMethod: 'pdf' };
      }
      
    case 'image':
      // Images: Use Google Cloud Vision OCR
      const result = await extractTextWithVision(fileBuffer, mimeType, apiKey);
      return { ...result, extractionMethod: 'ocr' };
      
    default:
      throw new Error(`Unsupported file format: ${mimeType}`);
  }
}

