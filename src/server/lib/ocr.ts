// Re-export shared OCR utilities for the Workers API bundle
export {
  performOCR,
  resolveMimeType,
  extractTextFromPDFBuffer,
  extractTextFromDOCX,
  extractTextWithVision,
  extractTextFromPDFWithVision,
  extractTextFromPDF,
} from '../../../functions/lib/ocr';
