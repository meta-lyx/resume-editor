import { useState, useMemo } from 'react';
import { X, Check, Download, Eye, Sparkles, Crown, Briefcase, Code, Palette } from 'lucide-react';
import { Button } from './button';
import { resumeTemplates, type ResumeTemplate } from '@/lib/resume-templates';
import type { ResumeData } from '@/components/pdf/resume-pdf-template';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  resumeData: ResumeData | null;
  isDownloading?: boolean;
}

// Template icon mapper
const getTemplateIcon = (id: string) => {
  switch (id) {
    case 'classic-executive':
      return <Crown className="h-5 w-5" />;
    case 'modern-minimal':
      return <Sparkles className="h-5 w-5" />;
    case 'creative-sidebar':
      return <Palette className="h-5 w-5" />;
    case 'tech-modern':
      return <Code className="h-5 w-5" />;
    default:
      return <Briefcase className="h-5 w-5" />;
  }
};

// Mini resume preview component
function MiniResumePreview({ 
  template, 
  resumeData,
  isSelected 
}: { 
  template: ResumeTemplate; 
  resumeData: ResumeData | null;
  isSelected: boolean;
}) {
  const name = resumeData?.name || 'Your Name';
  const title = resumeData?.title || 'Professional Title';
  const experience = resumeData?.experience?.[0];
  const skills = resumeData?.skills?.flatMap(g => g.items).slice(0, 6) || [];

  // Different preview layouts based on template
  if (template.layout === 'two-column') {
    return (
      <div 
        className={`aspect-[8.5/11] rounded-lg overflow-hidden transition-all duration-300 ${
          isSelected ? 'ring-2 ring-pear-400 ring-offset-2 ring-offset-surface-dark' : ''
        }`}
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="h-full flex">
          {/* Sidebar */}
          <div 
            className="w-[35%] h-full p-3"
            style={{ backgroundColor: template.primaryColor }}
          >
            <div className="text-white">
              <div 
                className="text-[10px] font-bold mb-1 truncate"
                style={{ color: '#FFFFFF' }}
              >
                {name}
              </div>
              <div 
                className="text-[6px] mb-3 truncate"
                style={{ color: template.accentColor }}
              >
                {title}
              </div>
              
              <div className="mb-2">
                <div className="text-[5px] font-bold mb-1" style={{ color: template.accentColor }}>
                  CONTACT
                </div>
                <div className="space-y-0.5">
                  <div className="h-[3px] w-full rounded bg-white/30" />
                  <div className="h-[3px] w-3/4 rounded bg-white/30" />
                </div>
              </div>
              
              <div>
                <div className="text-[5px] font-bold mb-1" style={{ color: template.accentColor }}>
                  SKILLS
                </div>
                <div className="space-y-0.5">
                  {skills.slice(0, 4).map((_, i) => (
                    <div key={i} className="h-[3px] w-full rounded bg-white/30" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-3">
            <div className="mb-2">
              <div className="text-[5px] font-bold mb-1" style={{ color: template.primaryColor }}>
                PROFILE
                <div className="h-[2px] w-8 mt-0.5" style={{ backgroundColor: template.accentColor }} />
              </div>
              <div className="space-y-0.5">
                <div className="h-[2px] w-full rounded bg-gray-200" />
                <div className="h-[2px] w-4/5 rounded bg-gray-200" />
              </div>
            </div>
            
            <div>
              <div className="text-[5px] font-bold mb-1" style={{ color: template.primaryColor }}>
                EXPERIENCE
                <div className="h-[2px] w-8 mt-0.5" style={{ backgroundColor: template.accentColor }} />
              </div>
              <div className="space-y-1">
                {[1, 2].map((_, i) => (
                  <div key={i}>
                    <div className="h-[3px] w-2/3 rounded bg-gray-300 mb-0.5" />
                    <div className="space-y-0.5 pl-1">
                      <div className="h-[2px] w-full rounded bg-gray-200" />
                      <div className="h-[2px] w-5/6 rounded bg-gray-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single column layouts
  return (
    <div 
      className={`aspect-[8.5/11] rounded-lg overflow-hidden p-3 transition-all duration-300 ${
        isSelected ? 'ring-2 ring-pear-400 ring-offset-2 ring-offset-surface-dark' : ''
      }`}
      style={{ backgroundColor: '#FFFFFF' }}
    >
      {/* Header */}
      <div 
        className="mb-3 pb-2"
        style={{ 
          borderBottomWidth: template.id === 'tech-modern' ? '1px' : '2px',
          borderBottomColor: template.accentColor,
        }}
      >
        {template.id === 'tech-modern' && (
          <div className="flex gap-1 mb-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
          </div>
        )}
        <div 
          className={`text-[12px] font-bold truncate ${template.fontStyle === 'serif' ? 'font-serif' : ''} ${template.id === 'tech-modern' ? 'font-mono' : ''}`}
          style={{ 
            color: template.primaryColor,
            textAlign: template.id === 'classic-executive' ? 'center' : 'left',
            letterSpacing: template.id === 'classic-executive' ? '0.1em' : '0',
            textTransform: template.id === 'classic-executive' ? 'uppercase' : 'none',
          }}
        >
          {name}
        </div>
        <div 
          className={`text-[7px] truncate ${template.id === 'tech-modern' ? 'font-mono' : ''}`}
          style={{ 
            color: template.accentColor,
            textAlign: template.id === 'classic-executive' ? 'center' : 'left',
          }}
        >
          {template.id === 'tech-modern' ? '// ' : ''}{title}
        </div>
      </div>

      {/* Content sections */}
      <div className="space-y-2">
        {/* Summary */}
        <div>
          <div 
            className="flex items-center gap-1 mb-1"
          >
            {template.id !== 'classic-executive' && (
              <div 
                className="w-1 h-3 rounded-sm"
                style={{ backgroundColor: template.accentColor }}
              />
            )}
            <span 
              className={`text-[6px] font-bold uppercase ${template.fontStyle === 'serif' ? 'font-serif' : ''}`}
              style={{ color: template.primaryColor }}
            >
              {template.id === 'tech-modern' ? '## ' : ''}Summary
            </span>
          </div>
          <div className="space-y-0.5">
            <div className="h-[2px] w-full rounded bg-gray-200" />
            <div className="h-[2px] w-5/6 rounded bg-gray-200" />
          </div>
        </div>

        {/* Experience */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            {template.id !== 'classic-executive' && (
              <div 
                className="w-1 h-3 rounded-sm"
                style={{ backgroundColor: template.accentColor }}
              />
            )}
            <span 
              className={`text-[6px] font-bold uppercase ${template.fontStyle === 'serif' ? 'font-serif' : ''}`}
              style={{ color: template.primaryColor }}
            >
              {template.id === 'tech-modern' ? '## ' : ''}Experience
            </span>
          </div>
          <div 
            className="space-y-1"
            style={{
              borderLeftWidth: template.id === 'tech-modern' ? '1px' : '0',
              borderLeftColor: template.accentColor,
              paddingLeft: template.id === 'tech-modern' ? '6px' : '0',
            }}
          >
            {[1, 2].map((_, i) => (
              <div key={i}>
                <div className="h-[3px] w-1/2 rounded mb-0.5" style={{ backgroundColor: template.primaryColor + '40' }} />
                <div className="space-y-0.5">
                  <div className="h-[2px] w-full rounded bg-gray-200" />
                  <div className="h-[2px] w-4/5 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div>
          <div className="flex items-center gap-1 mb-1">
            {template.id !== 'classic-executive' && (
              <div 
                className="w-1 h-3 rounded-sm"
                style={{ backgroundColor: template.accentColor }}
              />
            )}
            <span 
              className={`text-[6px] font-bold uppercase ${template.fontStyle === 'serif' ? 'font-serif' : ''}`}
              style={{ color: template.primaryColor }}
            >
              {template.id === 'tech-modern' ? '## ' : ''}Skills
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 6).map((skill, i) => (
              <div 
                key={i}
                className="px-1 py-0.5 rounded text-[4px]"
                style={{ 
                  backgroundColor: template.id === 'modern-minimal' 
                    ? template.accentColor + '20' 
                    : template.id === 'tech-modern'
                    ? '#F6F8FA'
                    : '#F3F4F6',
                  color: template.id === 'modern-minimal' ? template.accentColor : template.primaryColor,
                }}
              >
                {skill.length > 10 ? skill.slice(0, 10) + '...' : skill}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TemplateSelectorModal({
  isOpen,
  onClose,
  onSelectTemplate,
  resumeData,
  isDownloading = false,
}: TemplateSelectorModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('modern-minimal');

  const selectedTemplate = useMemo(
    () => resumeTemplates.find(t => t.id === selectedTemplateId),
    [selectedTemplateId]
  );

  if (!isOpen) return null;

  const handleDownload = () => {
    onSelectTemplate(selectedTemplateId);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-card max-w-5xl w-full max-h-[90vh] overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Choose Your Template</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Select a professional template for your optimized resume
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            disabled={isDownloading}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-180px)]">
          {/* Template List */}
          <div className="w-1/2 p-6 overflow-y-auto border-r border-white/10">
            <div className="grid grid-cols-2 gap-4">
              {resumeTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`group text-left p-4 rounded-xl transition-all duration-200 ${
                    selectedTemplateId === template.id
                      ? 'bg-pear-400/10 border-pear-400/30 border'
                      : 'bg-surface-light hover:bg-surface-light/80 border border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className={`p-2 rounded-lg transition-colors ${
                        selectedTemplateId === template.id
                          ? 'bg-pear-400/20 text-pear-400'
                          : 'bg-white/5 text-muted-foreground group-hover:text-foreground'
                      }`}
                    >
                      {getTemplateIcon(template.id)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-medium text-sm truncate ${
                          selectedTemplateId === template.id ? 'text-pear-400' : 'text-foreground'
                        }`}>
                          {template.name}
                        </h3>
                        {selectedTemplateId === template.id && (
                          <Check className="h-4 w-4 text-pear-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {template.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded-full"
                          style={{ 
                            backgroundColor: template.primaryColor + '20',
                            color: template.primaryColor,
                          }}
                        >
                          {template.category}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {template.layout === 'two-column' ? '2-Column' : 'Single'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 p-6 bg-surface-dark flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4 text-pear-400" />
              <h3 className="font-medium text-sm">Live Preview</h3>
            </div>

            {/* Large Preview */}
            <div className="flex-1 flex items-center justify-center bg-surface rounded-xl p-6 overflow-hidden">
              <div className="w-full max-w-[300px] shadow-2xl">
                {selectedTemplate && (
                  <MiniResumePreview 
                    template={selectedTemplate} 
                    resumeData={resumeData}
                    isSelected={true}
                  />
                )}
              </div>
            </div>

            {/* Template Features */}
            {selectedTemplate && (
              <div className="mt-4 p-4 bg-surface-light rounded-xl">
                <h4 className="text-xs font-medium text-muted-foreground mb-2">Template Features</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.features.map((feature, idx) => (
                    <span 
                      key={idx}
                      className="text-xs px-2 py-1 rounded-full bg-white/5 text-muted-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between bg-surface-light/50">
          <p className="text-sm text-muted-foreground">
            {selectedTemplate && (
              <>
                Selected: <span className="text-foreground font-medium">{selectedTemplate.name}</span>
              </>
            )}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isDownloading}>
              Cancel
            </Button>
            <Button onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

