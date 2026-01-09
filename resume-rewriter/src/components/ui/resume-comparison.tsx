import { useState, useMemo } from 'react';
import { 
  Lock, Download, FileText, TrendingUp, Target, 
  CheckCircle2, ChevronDown, ChevronUp, ArrowRight
} from 'lucide-react';
import { Button } from './button';

interface ResumeComparisonProps {
  originalContent: string;
  optimizedContent: string;
  jobDescription: string;
  isUnlocked: boolean;
  onUnlock: () => void;
  processingTime?: number;
  atsScore?: number;
  keywordsMatched?: string[];
  suggestions?: string[];
}

export function ResumeComparison({
  originalContent,
  optimizedContent,
  jobDescription,
  isUnlocked,
  onUnlock,
  processingTime = 0,
  atsScore = 0,
}: ResumeComparisonProps) {
  const [showFullOriginal, setShowFullOriginal] = useState(false);
  const [showFullOptimized, setShowFullOptimized] = useState(false);

  // Extract keywords from job description
  const jobKeywords = useMemo(() => {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'we', 'you', 'they', 'it', 'he', 'she', 'i', 'this', 'that', 'these', 'those', 'what', 'which', 'who', 'whom', 'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'about', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'any', 'our', 'your', 'their', 'its']);
    
    const words = jobDescription.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    const freq: Record<string, number> = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });
    
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);
  }, [jobDescription]);

  const originalLower = originalContent.toLowerCase();
  const optimizedLower = optimizedContent.toLowerCase();
  
  const originalKeywordsFound = jobKeywords.filter(kw => originalLower.includes(kw));
  const optimizedKeywordsFound = jobKeywords.filter(kw => optimizedLower.includes(kw));
  const addedKeywords = jobKeywords.filter(kw => !originalLower.includes(kw) && optimizedLower.includes(kw));

  const originalAtsScore = Math.min(Math.round((originalKeywordsFound.length / Math.max(jobKeywords.length, 1)) * 70) + 25, 75);
  const optimizedAtsScore = atsScore || Math.min(Math.round((optimizedKeywordsFound.length / Math.max(jobKeywords.length, 1)) * 30) + 70, 95);
  const atsGain = optimizedAtsScore - originalAtsScore;

  const formatContent = (text: string, keywords: string[], isOptimized: boolean) => {
    const sanitized = text
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<\/?[^>]+(>|$)/g, '');
    
    const lines = sanitized.split('\n');
    
    return lines.map((line, index) => {
      const isHeader = /^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|WORK EXPERIENCE|PROFESSIONAL|PROJECTS|CERTIFICATIONS|AWARDS)/i.test(line.trim());
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
      
      let displayLine = line;
      if (isOptimized && keywords.length > 0) {
        keywords.forEach(kw => {
          const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
          displayLine = displayLine.replace(regex, '**$1**');
        });
      }
      
      if (isOptimized) {
        displayLine = displayLine.replace(/(\d+[%+]?|\$[\d,]+[KMB]?)/g, '[[NUM:$1]]');
      }
      
      if (isHeader) {
        return (
          <h3 key={index} className="font-semibold text-xs mt-3 mb-1.5 text-foreground border-b border-border/30 pb-1">
            {displayLine}
          </h3>
        );
      }
      
      if (isBullet) {
        return (
          <p key={index} className="text-[11px] text-muted-foreground ml-3 mb-0.5 leading-relaxed">
            {renderHighlightedText(displayLine, isOptimized)}
          </p>
        );
      }
      
      if (!line.trim()) {
        return <div key={index} className="h-1" />;
      }
      
      return (
        <p key={index} className="text-[11px] text-muted-foreground mb-0.5 leading-relaxed">
          {renderHighlightedText(displayLine, isOptimized)}
        </p>
      );
    });
  };

  const renderHighlightedText = (text: string, isOptimized: boolean) => {
    if (!isOptimized) return text;
    
    const parts = text.split(/(\*\*[^*]+\*\*|\[\[NUM:[^\]]+\]\])/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={i} className="bg-primary/15 text-primary px-0.5 rounded font-medium">
            {part.slice(2, -2)}
          </span>
        );
      }
      if (part.startsWith('[[NUM:') && part.endsWith(']]')) {
        return (
          <span key={i} className="text-primary font-semibold">
            {part.slice(6, -2)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* Simple Success Header */}
      <div className="flex items-center justify-between py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Optimization Complete</h3>
            <p className="text-sm text-muted-foreground">
              {processingTime > 0 ? `Processed in ${(processingTime / 1000).toFixed(1)}s` : 'Your resume is ready'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">+{atsGain}</div>
            <div className="text-xs text-muted-foreground">ATS Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">+{addedKeywords.length}</div>
            <div className="text-xs text-muted-foreground">Keywords</div>
          </div>
        </div>
      </div>

      {/* Two Column Comparison - Clean Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Resume */}
        <div className="border border-border rounded-xl overflow-hidden bg-background">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Original</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{originalKeywordsFound.length}/{jobKeywords.length} keywords</span>
              <span className="text-sm font-mono text-muted-foreground">{originalAtsScore}</span>
            </div>
          </div>

          <div className="p-4">
            <div 
              className={`bg-muted/30 rounded-lg p-4 overflow-hidden transition-all duration-300 ${
                showFullOriginal ? 'max-h-[500px]' : 'max-h-[280px]'
              }`}
            >
              {formatContent(originalContent, [], false)}
            </div>
            <button 
              onClick={() => setShowFullOriginal(!showFullOriginal)}
              className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
            >
              {showFullOriginal ? <>Show Less <ChevronUp className="h-3 w-3" /></> : <>Show More <ChevronDown className="h-3 w-3" /></>}
            </button>
          </div>
        </div>

        {/* Optimized Resume */}
        <div className="border border-primary/30 rounded-xl overflow-hidden bg-background">
          <div className="px-4 py-3 border-b border-primary/20 bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-primary">Optimized</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-primary">{optimizedKeywordsFound.length}/{jobKeywords.length} keywords</span>
              <span className="text-sm font-mono font-bold text-primary">{optimizedAtsScore}</span>
            </div>
          </div>

          <div className="p-4 relative">
            <div 
              className={`bg-primary/5 rounded-lg p-4 overflow-hidden transition-all duration-300 ${
                showFullOptimized ? 'max-h-[500px]' : 'max-h-[280px]'
              }`}
            >
              {formatContent(optimizedContent, addedKeywords, true)}
            </div>
            
            {/* Lock overlay */}
            {!isUnlocked && (
              <div className="absolute inset-4 top-[50%] bg-gradient-to-t from-background via-background/95 to-transparent rounded-b-lg flex flex-col items-center justify-end pb-6">
                <Lock className="h-5 w-5 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Subscribe to download</p>
              </div>
            )}
            
            <button 
              onClick={() => setShowFullOptimized(!showFullOptimized)}
              className="w-full mt-3 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
            >
              {showFullOptimized ? <>Show Less <ChevronUp className="h-3 w-3" /></> : <>Show More <ChevronDown className="h-3 w-3" /></>}
            </button>
          </div>

          {/* Download CTA */}
          <div className="px-4 py-4 border-t border-primary/20 bg-primary/5">
            <Button onClick={onUnlock} className="w-full">
              {isUnlocked ? (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download Resume
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Unlock & Download
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Keywords Added - Simple List */}
      {addedKeywords.length > 0 && (
        <div className="py-4 border-t border-border">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Keywords Added</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {addedKeywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 text-xs bg-primary/10 text-primary rounded-full">
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
