import { useState } from 'react';
import { Lock, Download, Eye } from 'lucide-react';
import { Button } from './button';

interface ResumePreviewProps {
  content: string;
  title: string;
  type: 'original' | 'optimized';
  fileUrl?: string; // For original PDF files
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
  const borderColor = isOptimized ? 'border-green-400' : 'border-gray-300';
  const headerBg = isOptimized ? 'bg-green-50' : 'bg-gray-100';
  const headerText = isOptimized ? 'text-green-700' : 'text-gray-700';

  // Parse content into sections for better display
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // Headers (lines that are all caps or start with common resume headers)
      const isHeader = /^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|WORK EXPERIENCE|PROFESSIONAL|PROJECTS|CERTIFICATIONS|AWARDS)/i.test(line.trim());
      
      if (isHeader) {
        return (
          <h3 key={index} className="font-bold text-sm mt-4 mb-2 text-gray-900 border-b border-gray-200 pb-1">
            {line}
          </h3>
        );
      }
      
      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*')) {
        return (
          <p key={index} className="text-xs text-gray-700 ml-4 mb-1">
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
        <p key={index} className="text-xs text-gray-700 mb-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className={`border-2 ${borderColor} rounded-lg overflow-hidden shadow-lg`}>
      {/* Header */}
      <div className={`${headerBg} px-4 py-3 border-b ${borderColor} flex items-center justify-between`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${isOptimized ? 'bg-green-500' : 'bg-gray-400'} mr-2`} />
          <h4 className={`font-semibold ${headerText} text-sm`}>{title}</h4>
        </div>
        {isOptimized && !isUnlocked && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center">
            <Lock className="h-3 w-3 mr-1" />
            Preview
          </span>
        )}
      </div>

      {/* Document Preview Container */}
      <div className="relative bg-white">
        {/* PDF-like document styling */}
        <div className="bg-[#f8f9fa] p-4">
          <div 
            className="bg-white shadow-md mx-auto max-w-[400px] relative"
            style={{ 
              aspectRatio: '8.5/11',
              padding: '24px',
            }}
          >
            {/* Document content */}
            <div className="h-full overflow-hidden">
              <div className="font-serif">
                {formatContent(content)}
              </div>
            </div>

            {/* Overlay for locked content - covers bottom 80% */}
            {isOptimized && !isUnlocked && (
              <div 
                className="absolute inset-x-0 bottom-0 pointer-events-none"
                style={{ top: '20%' }}
              >
                {/* Gradient fade */}
                <div 
                  className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-transparent to-white"
                  style={{ top: '-16px' }}
                />
                
                {/* Solid overlay */}
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">
                      Unlock Full Resume
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 max-w-[200px]">
                      Purchase a plan to download your AI-optimized resume
                    </p>
                    <Button 
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Unlock Now button mouse down');
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Unlock Now button clicked');
                        alert('Unlock Now clicked - calling onUnlock');
                        if (onUnlock) {
                          onUnlock();
                        }
                      }}
                      type="button"
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
        <div className={`${headerBg} px-4 py-2 border-t ${borderColor} flex items-center justify-between`}>
          <span className="text-xs text-gray-500">
            {isOptimized ? 'AI-Optimized Version' : 'Original Document'}
          </span>
          <span className="text-xs text-gray-500">
            Page 1 of 1
          </span>
        </div>
      </div>
    </div>
  );
}

