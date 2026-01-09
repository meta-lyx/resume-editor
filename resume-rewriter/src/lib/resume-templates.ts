// Resume Template Definitions
// Each template has unique styling characteristics and layout

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'Professional' | 'Modern' | 'Creative' | 'Minimal';
  primaryColor: string;
  accentColor: string;
  fontStyle: 'serif' | 'sans-serif' | 'modern';
  layout: 'single-column' | 'two-column' | 'sidebar';
  features: string[];
  previewImage?: string;
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'classic-executive',
    name: 'Classic Executive',
    description: 'Traditional and authoritative design perfect for senior positions and corporate roles',
    category: 'Professional',
    primaryColor: '#1E3A5F', // Deep navy blue
    accentColor: '#C49A3D', // Gold accent
    fontStyle: 'serif',
    layout: 'single-column',
    features: [
      'Elegant serif typography',
      'Gold accent highlights',
      'Traditional structure',
      'Perfect for executive roles',
    ],
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean, contemporary design with bold typography and strategic whitespace',
    category: 'Modern',
    primaryColor: '#0F172A', // Slate 900
    accentColor: '#10B981', // Emerald (matches Pixel Pear brand)
    fontStyle: 'sans-serif',
    layout: 'single-column',
    features: [
      'Clean modern look',
      'Strategic whitespace',
      'ATS-optimized format',
      'Great for tech roles',
    ],
  },
  {
    id: 'creative-sidebar',
    name: 'Creative Sidebar',
    description: 'Bold two-column layout with a striking sidebar for skills and contact info',
    category: 'Creative',
    primaryColor: '#6D28D9', // Violet 700
    accentColor: '#F472B6', // Pink 400
    fontStyle: 'modern',
    layout: 'two-column',
    features: [
      'Eye-catching sidebar',
      'Creative color scheme',
      'Visual skill indicators',
      'Ideal for design/creative roles',
    ],
  },
  {
    id: 'tech-modern',
    name: 'Tech Modern',
    description: 'Developer-focused template with clean lines and monospace elements',
    category: 'Modern',
    primaryColor: '#0D1117', // GitHub dark
    accentColor: '#22D3EE', // Cyan
    fontStyle: 'modern',
    layout: 'single-column',
    features: [
      'Code-inspired design',
      'Monospace accents',
      'Clean section dividers',
      'Perfect for developers',
    ],
  },
];

export function getTemplateById(id: string): ResumeTemplate | undefined {
  return resumeTemplates.find(t => t.id === id);
}

export function getTemplatesByCategory(category: ResumeTemplate['category']): ResumeTemplate[] {
  return resumeTemplates.filter(t => t.category === category);
}

