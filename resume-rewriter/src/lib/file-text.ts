// Read the text out of a resume file entirely in the browser.
// Used by the free tools (nothing is uploaded) and by the main upload flow.

/** Text layer of a PDF. Returns '' for scanned or image-only PDFs. */
export async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs';

  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Rebuild line breaks from the items' end-of-line flags so section headings stay on their own lines.
    let text = '';
    for (const item of content.items) {
      if (!('str' in item)) continue;
      text += item.str + (item.hasEOL ? '\n' : ' ');
    }
    pages.push(text);
  }
  return pages.join('\n').replace(/[ \t]+\n/g, '\n').trim();
}

/** Number of pages in a PDF, or undefined if it can't be read. */
export async function countPdfPages(file: File): Promise<number | undefined> {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.7.284/build/pdf.worker.min.mjs';
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    return pdf.numPages;
  } catch {
    return undefined;
  }
}

// A .docx file is a zip archive; the text lives in word/document.xml.
// This reads that one entry without a zip library.
async function readZipEntry(buffer: ArrayBuffer, name: string): Promise<string | undefined> {
  const view = new DataView(buffer);
  // End of central directory record: signature 0x06054b50, within the last 64 KB + 22 bytes.
  let eocd = -1;
  for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return undefined;

  const entries = view.getUint16(eocd + 10, true);
  let ptr = view.getUint32(eocd + 16, true);
  const decoder = new TextDecoder();

  for (let n = 0; n < entries; n++) {
    if (view.getUint32(ptr, true) !== 0x02014b50) return undefined;
    const method = view.getUint16(ptr + 10, true);
    const compressedSize = view.getUint32(ptr + 20, true);
    const nameLen = view.getUint16(ptr + 28, true);
    const extraLen = view.getUint16(ptr + 30, true);
    const commentLen = view.getUint16(ptr + 32, true);
    const localOffset = view.getUint32(ptr + 42, true);
    const entryName = decoder.decode(new Uint8Array(buffer, ptr + 46, nameLen));

    if (entryName === name) {
      const localNameLen = view.getUint16(localOffset + 26, true);
      const localExtraLen = view.getUint16(localOffset + 28, true);
      const start = localOffset + 30 + localNameLen + localExtraLen;
      const data = new Uint8Array(buffer, start, compressedSize);
      if (method === 0) return decoder.decode(data);
      if (method !== 8) return undefined;
      const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
      return new Response(stream).text();
    }
    ptr += 46 + nameLen + extraLen + commentLen;
  }
  return undefined;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, '&');
}

export type DocxText = { text: string; hasTables: boolean; hasImages: boolean };

/** Paragraph text of a .docx file, plus layout hints an ATS cares about. */
export async function extractDocxText(file: File): Promise<DocxText | undefined> {
  const xml = await readZipEntry(await file.arrayBuffer(), 'word/document.xml');
  if (xml === undefined) return undefined;
  const text = decodeXmlEntities(
    xml
      .replace(/<w:tab\/>/g, '\t')
      .replace(/<w:br[^>]*\/>/g, '\n')
      .replace(/<\/w:p>/g, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return { text, hasTables: /<w:tbl[\s>]/.test(xml), hasImages: /<w:drawing[\s>]|<w:pict[\s>]/.test(xml) };
}

export type FileTextResult = {
  text: string;
  kind: 'pdf' | 'docx' | 'txt';
  pages?: number;
  hasTables?: boolean;
  hasImages?: boolean;
};

/** Text from a PDF, DOCX or TXT file. Throws with a readable message on unsupported files. */
export async function extractFileText(file: File): Promise<FileTextResult> {
  const name = file.name.toLowerCase();
  if (file.type === 'application/pdf' || name.endsWith('.pdf')) {
    const [text, pages] = await Promise.all([extractPdfText(file), countPdfPages(file)]);
    return { text, kind: 'pdf', pages };
  }
  if (name.endsWith('.docx')) {
    const docx = await extractDocxText(file);
    if (!docx) throw new Error('Could not read this .docx file. Try saving it again or export it as PDF.');
    return { kind: 'docx', ...docx };
  }
  if (name.endsWith('.txt') || file.type === 'text/plain') {
    return { text: await file.text(), kind: 'txt' };
  }
  if (name.endsWith('.doc')) {
    throw new Error('Old .doc files are not supported. Save it as .docx or PDF and try again.');
  }
  throw new Error('Please upload a PDF, DOCX or TXT file, or paste your resume text.');
}
