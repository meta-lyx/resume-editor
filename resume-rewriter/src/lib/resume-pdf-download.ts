// Generate a resume PDF in the browser and download it.
import { pdf } from '@react-pdf/renderer';
import { preparePdfFonts } from '@/components/pdf/pdf-fonts';
import { renderTemplateDocument } from '@/components/pdf/render-template';
import type { ResumeData } from '@/components/pdf/resume-pdf-template';

export async function downloadResumePdf(data: ResumeData, templateId: string, fileName: string): Promise<void> {
  const fontChoice = await preparePdfFonts(data);
  const blob = await Promise.race([
    pdf(renderTemplateDocument(templateId, data)).toBlob(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('PDF generation timed out')), fontChoice === 'cjk-full' ? 120000 : 60000),
    ),
  ]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.replace(/[\\/:*?"<>|]+/g, '_');
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
