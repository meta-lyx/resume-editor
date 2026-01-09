import { useState, useMemo } from 'react';
import { X, Check, Download, Crown, Sparkles, Code, Palette } from 'lucide-react';
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

const getTemplateIcon = (id: string) => {
  switch (id) {
    case 'classic-executive':
      return <Crown className="h-4 w-4" />;
    case 'modern-minimal':
      return <Sparkles className="h-4 w-4" />;
    case 'creative-sidebar':
      return <Palette className="h-4 w-4" />;
    case 'tech-modern':
      return <Code className="h-4 w-4" />;
    default:
      return <Sparkles className="h-4 w-4" />;
  }
};

// Large resume preview component
function ResumePreview({ 
  template, 
  resumeData,
}: { 
  template: ResumeTemplate; 
  resumeData: ResumeData | null;
}) {
  const name = resumeData?.name || 'Your Name';
  const title = resumeData?.title || 'Professional Title';
  const email = resumeData?.contact?.email || 'email@example.com';
  const summary = resumeData?.summary?.slice(0, 200) || 'Professional summary will appear here...';
  const experience = resumeData?.experience?.[0];
  const skills = resumeData?.skills?.flatMap(g => g.items).slice(0, 8) || ['Skill 1', 'Skill 2', 'Skill 3'];

  // Two-column layout (Creative Sidebar)
  if (template.layout === 'two-column') {
    return (
      <div className="w-full bg-white rounded-lg shadow-xl overflow-hidden" style={{ aspectRatio: '8.5/11' }}>
        <div className="h-full flex">
          {/* Sidebar */}
          <div className="w-[35%] h-full p-6" style={{ backgroundColor: template.primaryColor }}>
            <div className="text-white">
              <div className="text-lg font-bold mb-1" style={{ color: '#FFFFFF' }}>{name}</div>
              <div className="text-xs mb-6 opacity-80" style={{ color: template.accentColor }}>{title}</div>
              
              <div className="mb-6">
                <div className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: template.accentColor }}>
                  Contact
                </div>
                <div className="text-[11px] opacity-80 leading-relaxed">{email}</div>
              </div>
              
              <div>
                <div className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: template.accentColor }}>
                  Skills
                </div>
                <div className="space-y-1">
                  {skills.slice(0, 6).map((skill, i) => (
                    <div key={i} className="text-[11px] opacity-80">• {skill}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-6">
            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: template.primaryColor }}>
                Profile
                <div className="h-0.5 w-12 mt-1" style={{ backgroundColor: template.accentColor }} />
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{summary}</p>
            </div>
            
            {experience && (
              <div>
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: template.primaryColor }}>
                  Experience
                  <div className="h-0.5 w-12 mt-1" style={{ backgroundColor: template.accentColor }} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-800">{experience.title}</div>
                  <div className="text-xs" style={{ color: template.primaryColor }}>{experience.company}</div>
                  <div className="text-[10px] text-gray-500 mb-2">{experience.startDate} - {experience.endDate}</div>
                  <div className="space-y-1">
                    {experience.bullets.slice(0, 3).map((bullet, i) => (
                      <p key={i} className="text-[11px] text-gray-600 leading-relaxed">• {bullet.slice(0, 80)}...</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Single column layouts
  const isClassic = template.id === 'classic-executive';
  const isTech = template.id === 'tech-modern';

  return (
    <div className="w-full bg-white rounded-lg shadow-xl overflow-hidden p-6" style={{ aspectRatio: '8.5/11' }}>
      {/* Header */}
      <div 
        className="mb-5 pb-4"
        style={{ 
          borderBottomWidth: '2px',
          borderBottomColor: template.accentColor,
          textAlign: isClassic ? 'center' : 'left',
        }}
      >
        {isTech && (
          <div className="flex gap-1.5 mb-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
        )}
        <div 
          className={`text-xl font-bold ${isClassic ? 'uppercase tracking-widest' : ''} ${isTech ? 'font-mono' : ''}`}
          style={{ color: template.primaryColor }}
        >
          {name}
        </div>
        <div 
          className={`text-sm mt-1 ${isTech ? 'font-mono' : ''}`}
          style={{ color: template.accentColor }}
        >
          {isTech ? '// ' : ''}{title}
        </div>
        <div className="text-xs text-gray-500 mt-2">{email}</div>
      </div>

      {/* Summary */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          {!isClassic && (
            <div className="w-1 h-4 rounded-sm" style={{ backgroundColor: template.accentColor }} />
          )}
          <span 
            className={`text-xs font-bold uppercase tracking-wider ${isClassic ? 'font-serif' : ''}`}
            style={{ color: template.primaryColor }}
          >
            {isTech ? '## ' : ''}Summary
          </span>
        </div>
        <p 
          className={`text-[11px] text-gray-600 leading-relaxed ${isClassic ? 'italic' : ''}`}
          style={isTech ? { borderLeft: `2px solid ${template.accentColor}`, paddingLeft: '12px' } : {}}
        >
          {summary}
        </p>
      </div>

      {/* Experience */}
      {experience && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            {!isClassic && (
              <div className="w-1 h-4 rounded-sm" style={{ backgroundColor: template.accentColor }} />
            )}
            <span 
              className={`text-xs font-bold uppercase tracking-wider ${isClassic ? 'font-serif' : ''}`}
              style={{ color: template.primaryColor }}
            >
              {isTech ? '## ' : ''}Experience
            </span>
          </div>
          <div style={isTech ? { borderLeft: `2px solid ${template.accentColor}`, paddingLeft: '12px' } : {}}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-sm font-semibold text-gray-800">{experience.title}</div>
                <div className="text-xs" style={{ color: template.accentColor }}>{experience.company}</div>
              </div>
              <div className={`text-[10px] text-gray-500 ${isTech ? 'font-mono bg-gray-100 px-2 py-0.5 rounded' : ''}`}>
                {experience.startDate} - {experience.endDate}
              </div>
            </div>
            <div className="space-y-1 mt-2">
              {experience.bullets.slice(0, 2).map((bullet, i) => (
                <p key={i} className="text-[11px] text-gray-600">
                  {isClassic ? '◆' : isTech ? '>' : '•'} {bullet.slice(0, 100)}...
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Skills */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          {!isClassic && (
            <div className="w-1 h-4 rounded-sm" style={{ backgroundColor: template.accentColor }} />
          )}
          <span 
            className={`text-xs font-bold uppercase tracking-wider ${isClassic ? 'font-serif' : ''}`}
            style={{ color: template.primaryColor }}
          >
            {isTech ? '## ' : ''}Skills
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {skills.map((skill, i) => (
            <span 
              key={i}
              className={`px-2 py-1 rounded text-[10px] ${isTech ? 'font-mono' : ''}`}
              style={{ 
                backgroundColor: template.id === 'modern-minimal' 
                  ? template.accentColor + '15' 
                  : isTech ? '#F6F8FA' 
                  : '#F3F4F6',
                color: template.id === 'modern-minimal' ? template.accentColor : template.primaryColor,
              }}
            >
              {skill}
            </span>
          ))}
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Select Template</h2>
            <p className="text-muted-foreground text-sm">Choose a design for your resume</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            disabled={isDownloading}
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-160px)]">
          {/* Template List - Compact */}
          <div className="w-80 p-4 overflow-y-auto border-r border-border bg-muted/30">
            <div className="space-y-2">
              {resumeTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`w-full text-left p-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                    selectedTemplateId === template.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted border border-transparent'
                  }`}
                >
                  <div 
                    className={`p-2 rounded-lg ${
                      selectedTemplateId === template.id
                        ? 'bg-primary/20 text-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {getTemplateIcon(template.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${
                        selectedTemplateId === template.id ? 'text-primary' : 'text-foreground'
                      }`}>
                        {template.name}
                      </span>
                      {selectedTemplateId === template.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {template.category} • {template.layout === 'two-column' ? '2-Column' : 'Single'}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview - Large & Standalone */}
          <div className="flex-1 p-8 overflow-y-auto bg-muted/10 flex items-center justify-center">
            <div className="w-full max-w-md">
              {selectedTemplate && (
                <ResumePreview template={selectedTemplate} resumeData={resumeData} />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedTemplate?.name}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isDownloading}>
              Cancel
            </Button>
            <Button onClick={() => onSelectTemplate(selectedTemplateId)} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
