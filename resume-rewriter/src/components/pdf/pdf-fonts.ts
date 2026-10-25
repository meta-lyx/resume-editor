import { Font } from '@react-pdf/renderer';

// Every PDF template uses this one family name. Which files back it is decided
// per document by preparePdfFonts().
export const PDF_FONT_FAMILY = 'ResumeFont';

// Inter, served from our own site (public/fonts, ~600 KB per weight).
const LATIN_FONTS = [
  { src: '/fonts/Inter-Regular.otf', fontWeight: 400 },
  { src: '/fonts/Inter-Bold.otf', fontWeight: 700 },
];

// Noto Sans SC trimmed to GB2312 (all 6,763 common hanzi) plus Latin, punctuation
// and symbols. Served from our own site, ~2.5 MB per weight.
const CJK_COMMON_FONTS = [
  { src: '/fonts/NotoSansSC-common-Regular.ttf', fontWeight: 400 },
  { src: '/fonts/NotoSansSC-common-Bold.ttf', fontWeight: 700 },
];

// The CJK characters the trimmed font contains, one string. Fetched only for CJK resumes.
const CJK_COMMON_CHARS_URL = '/fonts/NotoSansSC-common.chars.txt';

// Full Noto Sans SC from Google Fonts (~6.3 MB per weight). Used only when a resume
// has a character the trimmed font lacks (rare names, Hangul, ...).
const CJK_FULL_FONTS = [
  {
    src: 'https://fonts.gstatic.com/s/notosanssc/v40/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaG9_FnYw.ttf',
    fontWeight: 400,
  },
  {
    src: 'https://fonts.gstatic.com/s/notosanssc/v40/k3kCo84MPvpLmixcA63oeAL7Iqp5IZJF9bmaGzjCnYw.ttf',
    fontWeight: 700,
  },
];

// CJK ideographs, kana, Hangul, and full-width punctuation.
// Keep in sync with the ranges used to build NotoSansSC-common.chars.txt.
const CJK_CHAR = /[　-ヿ㐀-䶿一-鿿가-힯豈-﫿＀-￯]/g;

export type PdfFontChoice = 'latin' | 'cjk-common' | 'cjk-full';

// Disable hyphenation to prevent layout issues.
Font.registerHyphenationCallback((word: string) => [word]);

let commonCharsPromise: Promise<Set<string> | null> | null = null;

function loadCommonChars(): Promise<Set<string> | null> {
  commonCharsPromise ??= fetch(CJK_COMMON_CHARS_URL)
    .then((res) => (res.ok ? res.text() : Promise.reject(new Error(`HTTP ${res.status}`))))
    .then((text) => new Set(Array.from(text)))
    .catch((error) => {
      console.warn('Could not load CJK coverage list, using the full font:', error);
      commonCharsPromise = null; // retry next time
      return null;
    });
  return commonCharsPromise;
}

function setPdfFonts(fonts: typeof LATIN_FONTS) {
  // FontFamily.register appends sources, so drop the previous registration first.
  const registered = Font.getRegisteredFonts() as Record<string, unknown>;
  delete registered[PDF_FONT_FAMILY];
  Font.register({ family: PDF_FONT_FAMILY, fonts });
}

/**
 * Point PDF_FONT_FAMILY at the smallest font that covers this resume.
 * Call (and await) before pdf(...).toBlob().
 */
export async function preparePdfFonts(data: unknown): Promise<PdfFontChoice> {
  const cjkChars = new Set(JSON.stringify(data ?? '').match(CJK_CHAR) ?? []);

  if (cjkChars.size === 0) {
    setPdfFonts(LATIN_FONTS);
    return 'latin';
  }

  const common = await loadCommonChars();
  const covered = common !== null && [...cjkChars].every((ch) => common.has(ch));
  setPdfFonts(covered ? CJK_COMMON_FONTS : CJK_FULL_FONTS);
  return covered ? 'cjk-common' : 'cjk-full';
}

// Default registration so templates also work if rendered without preparePdfFonts().
Font.register({ family: PDF_FONT_FAMILY, fonts: LATIN_FONTS });
