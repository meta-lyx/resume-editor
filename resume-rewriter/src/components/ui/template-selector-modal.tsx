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
  const phone = resumeData?.contact?.phone || '';
  const location = resumeData?.contact?.location || '';
  const summary = resumeData?.summary || 'Professional summary will appear here...';
  const experiences = resumeData?.experience || [];
  const education = resumeData?.education || [];
  const skills = resumeData?.skills?.flatMap(g => g.items) || ['Skill 1', 'Skill 2', 'Skill 3', 'Skill 4', 'Skill 5', 'Skill 6', 'Skill 7', 'Skill 8'];
  const certifications = resumeData?.certifications || [];

  // Two-column layout (Creative Sidebar)
  if (template.layout === 'two-column') {
    return (
      <div className="relative w-full bg-white rounded-lg shadow-xl overflow-hidden" style={{ aspectRatio: '8.5/11' }}>
        {/* Full resume content - all sections rendered */}
        <div className="relative h-full flex">
          {/* Sidebar */}
          <div className="w-[35%] h-full p-6 overflow-y-auto" style={{ backgroundColor: template.primaryColor }}>
            <div className="text-white">
              <div className="text-lg font-bold mb-1" style={{ color: '#FFFFFF' }}>{name}</div>
              <div className="text-xs mb-6 opacity-80" style={{ color: template.accentColor }}>{title}</div>
              
              <div className="mb-6">
                <div className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: template.accentColor }}>
                  Contact
                </div>
                <div className="text-[11px] opacity-80 leading-relaxed space-y-1">
                  <div>{email}</div>
                  {phone && <div>{phone}</div>}
                  {location && <div>{location}</div>}
                </div>
              </div>
              
              <div className="mb-6">
                <div className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: template.accentColor }}>
                  Skills
                </div>
                <div className="space-y-1">
                  {skills.map((skill, i) => (
                    <div key={i} className="text-[11px] opacity-80">• {skill}</div>
                  ))}
                </div>
              </div>

              {certifications.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold mb-2 uppercase tracking-wider" style={{ color: template.accentColor }}>
                    Certifications
                  </div>
                  <div className="space-y-1">
                    {certifications.slice(0, 3).map((cert, i) => (
                      <div key={i} className="text-[11px] opacity-80">• {cert}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Main content - Full resume */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-5">
              <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: template.primaryColor }}>
                Profile
                <div className="h-0.5 w-12 mt-1" style={{ backgroundColor: template.accentColor }} />
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">{summary}</p>
            </div>
            
            {experiences.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: template.primaryColor }}>
                  Experience
                  <div className="h-0.5 w-12 mt-1" style={{ backgroundColor: template.accentColor }} />
                </div>
                {experiences.map((exp, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="text-sm font-semibold text-gray-800">{exp.title}</div>
                    <div className="text-xs" style={{ color: template.primaryColor }}>{exp.company}</div>
                    <div className="text-[10px] text-gray-500 mb-2">{exp.startDate} - {exp.endDate || 'Present'}</div>
                    <div className="space-y-1">
                      {exp.bullets?.slice(0, 3).map((bullet, i) => (
                        <p key={i} className="text-[11px] text-gray-600 leading-relaxed">• {bullet}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {education.length > 0 && (
              <div className="mb-5">
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: template.primaryColor }}>
                  Education
                  <div className="h-0.5 w-12 mt-1" style={{ backgroundColor: template.accentColor }} />
                </div>
                {education.map((edu, idx) => (
                  <div key={idx} className="mb-3">
                    <div className="text-sm font-semibold text-gray-800">{edu.degree}</div>
                    <div className="text-xs text-gray-600">{edu.school}</div>
                    {edu.graduationDate && (
                      <div className="text-[10px] text-gray-500">{edu.graduationDate}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Frosted glass overlay for bottom 80% - blurs content underneath */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[80%] backdrop-blur-lg bg-white/70 pointer-events-none z-20"
          style={{
            maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          }}
        />
      </div>
    );
  }

  // Single column layouts
  const isClassic = template.id === 'classic-executive';
  const isTech = template.id === 'tech-modern';

  return (
    <div className="relative w-full bg-white rounded-lg shadow-xl overflow-hidden p-6" style={{ aspectRatio: '8.5/11' }}>
      {/* Full resume content - all sections rendered */}
      <div className="relative h-full overflow-y-auto">
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
          <div className="text-xs text-gray-500 mt-2">
            {email}
            {phone && ` • ${phone}`}
            {location && ` • ${location}`}
          </div>
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

        {/* Experience - Show all experiences */}
        {experiences.length > 0 && (
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
            {experiences.map((exp, idx) => (
              <div key={idx} className="mb-4" style={isTech ? { borderLeft: `2px solid ${template.accentColor}`, paddingLeft: '12px' } : {}}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{exp.title}</div>
                    <div className="text-xs" style={{ color: template.accentColor }}>{exp.company}</div>
                  </div>
                  <div className={`text-[10px] text-gray-500 ${isTech ? 'font-mono bg-gray-100 px-2 py-0.5 rounded' : ''}`}>
                    {exp.startDate} - {exp.endDate || 'Present'}
                  </div>
                </div>
                <div className="space-y-1 mt-2">
                  {exp.bullets?.slice(0, 3).map((bullet, i) => (
                    <p key={i} className="text-[11px] text-gray-600">
                      {isClassic ? '◆' : isTech ? '>' : '•'} {bullet}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {education.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              {!isClassic && (
                <div className="w-1 h-4 rounded-sm" style={{ backgroundColor: template.accentColor }} />
              )}
              <span 
                className={`text-xs font-bold uppercase tracking-wider ${isClassic ? 'font-serif' : ''}`}
                style={{ color: template.primaryColor }}
              >
                {isTech ? '## ' : ''}Education
              </span>
            </div>
            {education.map((edu, idx) => (
              <div key={idx} className="mb-3">
                <div className="text-sm font-semibold text-gray-800">{edu.degree}</div>
                <div className="text-xs text-gray-600">{edu.school}</div>
                {edu.graduationDate && (
                  <div className="text-[10px] text-gray-500">{edu.graduationDate}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        <div className="mb-5">
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

        {/* Certifications */}
        {certifications.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2">
              {!isClassic && (
                <div className="w-1 h-4 rounded-sm" style={{ backgroundColor: template.accentColor }} />
              )}
              <span 
                className={`text-xs font-bold uppercase tracking-wider ${isClassic ? 'font-serif' : ''}`}
                style={{ color: template.primaryColor }}
              >
                {isTech ? '## ' : ''}Certifications
              </span>
            </div>
            <div className="space-y-1">
              {certifications.map((cert, i) => (
                <div key={i} className="text-[11px] text-gray-600">
                  {isClassic ? '◆' : isTech ? '>' : '•'} {cert}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Frosted glass overlay for bottom 80% - blurs content underneath */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[80%] backdrop-blur-lg bg-white/70 pointer-events-none z-20"
        style={{
          maskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, black 0%, transparent 100%)',
        }}
      />
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
      <div className="bg-background rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
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

          {/* Preview - Large & Fills Right Side */}
          <div className="flex-1 p-8 overflow-y-auto bg-muted/10 flex items-center justify-center">
            <div className="w-full h-full flex items-center justify-center">
              {selectedTemplate && (
                <div className="w-full max-w-full h-full flex items-center justify-center">
                  <div className="w-full" style={{ maxHeight: '100%', maxWidth: '100%' }}>
                    <ResumePreview template={selectedTemplate} resumeData={resumeData} />
                  </div>
                </div>
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
