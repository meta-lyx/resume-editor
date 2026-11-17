// One place that maps a template ID to its react-pdf document.
import type { ReactElement } from 'react';
import { ResumePDF, type ResumeData } from './resume-pdf-template';
import { ClassicExecutivePDF, ModernMinimalPDF, CreativeSidebarPDF, TechModernPDF } from './template-pdf-renderers';
import { USAtsPDF } from './us-ats-pdf';

export function renderTemplateDocument(templateId: string, data: ResumeData): ReactElement {
  switch (templateId) {
    case 'us-ats':
      return <USAtsPDF data={data} />;
    case 'classic-executive':
      return <ClassicExecutivePDF data={data} showBranding={true} />;
    case 'modern-minimal':
      return <ModernMinimalPDF data={data} showBranding={true} />;
    case 'creative-sidebar':
      return <CreativeSidebarPDF data={data} showBranding={true} />;
    case 'tech-modern':
      return <TechModernPDF data={data} showBranding={true} />;
    default:
      return <ResumePDF data={data} showBranding={true} />;
  }
}
