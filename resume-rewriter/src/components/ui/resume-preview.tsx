import { useState } from 'react';
import { Lock, Download, Eye, FileText } from 'lucide-react';
import { Button } from './button';

interface ResumePreviewProps {
  content: string;
  title: string;
  type: 'original' | 'optimized';
  fileUrl?: string;
  onUnlock?: () => void;
  isUnlocked?: boolean;
}

export function ResumePreview({
  content,
  title,
  type,
  fileUrl,
  onUnlock,
  isUnlocked = false,
}: ResumePreviewProps) {
  const [showFullPreview, setShowFullPreview] = useState(false);

  const isOptimized = type === 'optimized';

  const sanitizedContent = content.replace(/<\/?[^>]+(>|$)/g, '');
  const isErrorContent = /cloudflare|utm_source=error_100x|unknown error occurred/i.test(content);

  // Parse content into sections for better display
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers
      const isHeader = /^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|WORK EXPERIENCE|PROFESSIONAL|PROJECTS|CERTIFICATIONS|AWARDS)/i.test(line.trim());
      
      if (isHeader) {
        return (
          <h3 key={index} className="font-display font-semibold text-sm mt-4 mb-2 text-foreground border-b border-border pb-1">
            {line}
          </h3>
        );
      }
      
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <p key={index} className="text-xs text-muted-foreground ml-4 mb-1">
            {line}
          </p>
        );
      }
      
      // Empty lines
      if (!line.trim()) {
        return <div key={index} className="h-2" />;
      }
      
      // Regular text
      return (
        <p key={index} className="text-xs text-muted-foreground mb-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className={`glass-card overflow-hidden ${isOptimized ? 'border-pear-400/30' : 'border-white/10'}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b border-white/10 flex items-center justify-between ${
        isOptimized ? 'bg-pear-400/5' : 'bg-white/5'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isOptimized ? 'bg-pear-400 shadow-glow-sm' : 'bg-muted-foreground'}`} />
          <h4 className={`font-display font-medium text-sm ${isOptimized ? 'text-pear-400' : 'text-foreground'}`}>
            {title}
          </h4>
        </div>
        {isOptimized && !isUnlocked && (
          <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-1 rounded-full flex items-center border border-amber-500/20">
            <Lock className="h-3 w-3 mr-1" />
            Preview
          </span>
        )}
      </div>

      {/* Document Preview Container */}
      <div className="relative">
        {/* PDF-like document styling */}
        <div className="bg-surface-dark p-4">
          <div 
            className="bg-surface-light rounded-lg shadow-glass mx-auto max-w-[400px] relative border border-white/5"
            style={{ 
              aspectRatio: '8.5/11',
              padding: '24px',
            }}
          >
            {/* Document content */}
              <div className="h-full overflow-hidden scrollbar-hide">
                <div className="font-sans">
                {isErrorContent ? (
                  <p className="text-xs text-red-500">Content unavailable due to server error. Please retry optimization.</p>
                ) : (
                  formatContent(sanitizedContent)
                )}
                </div>
              </div>

            {/* Overlay for locked content */}
            {isOptimized && !isUnlocked && (
              <div 
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{ top: '20%' }}
              >
                {/* Gradient fade */}
                <div 
                  className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent to-surface-light"
                  style={{ top: '-16px' }}
                />
                
                {/* Solid overlay */}
                <div className="absolute inset-0 bg-surface-light/95 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-pear-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-pear-400/20">
                      <Lock className="h-8 w-8 text-pear-400" />
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                      Unlock Full Resume
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 max-w-[200px]">
                      Purchase a plan to download your AI-optimized resume
                    </p>
                    <Button 
                      onClick={() => onUnlock?.()}
                      size="sm"
                      className="pointer-events-auto"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Unlock Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer with page info */}
        <div className={`px-4 py-2 border-t border-white/10 flex items-center justify-between ${
          isOptimized ? 'bg-pear-400/5' : 'bg-white/5'
        }`}>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {isOptimized ? 'AI-Optimized' : 'Original'}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            Page 1/1
          </span>
        </div>
      </div>
    </div>
  );
}
