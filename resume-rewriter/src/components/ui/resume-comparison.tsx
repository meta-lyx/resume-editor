import { useState, useMemo } from 'react';
import { 
  Lock, Download, FileText, TrendingUp, Target, Zap, Clock, 
  CheckCircle2, AlertTriangle, ArrowRight, Sparkles, Award,
  ChevronDown, ChevronUp, Search
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
  keywordsMatched = [],
  suggestions = [],
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
    
    // Count frequency
    const freq: Record<string, number> = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });
    
    // Get top keywords (sorted by frequency)
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);
  }, [jobDescription]);

  // Check which keywords are in original vs optimized
  const originalLower = originalContent.toLowerCase();
  const optimizedLower = optimizedContent.toLowerCase();
  
  const originalKeywordsFound = jobKeywords.filter(kw => originalLower.includes(kw));
  const optimizedKeywordsFound = jobKeywords.filter(kw => optimizedLower.includes(kw));
  const missingKeywords = jobKeywords.filter(kw => !originalLower.includes(kw));
  const addedKeywords = jobKeywords.filter(kw => !originalLower.includes(kw) && optimizedLower.includes(kw));

  // Calculate scores
  const originalAtsScore = Math.min(Math.round((originalKeywordsFound.length / Math.max(jobKeywords.length, 1)) * 70) + 25, 75);
  const optimizedAtsScore = atsScore || Math.min(Math.round((optimizedKeywordsFound.length / Math.max(jobKeywords.length, 1)) * 30) + 70, 95);
  const atsGain = optimizedAtsScore - originalAtsScore;

  // Format content with keyword highlighting
  const formatContentWithHighlights = (text: string, keywords: string[], isOptimized: boolean) => {
    const sanitized = text
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<\/?[^>]+(>|$)/g, '');
    
    const lines = sanitized.split('\n');
    
    return lines.map((line, index) => {
      const isHeader = /^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|WORK EXPERIENCE|PROFESSIONAL|PROJECTS|CERTIFICATIONS|AWARDS)/i.test(line.trim());
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || line.trim().startsWith('*');
      
      // Highlight keywords in optimized version
      let displayLine = line;
      if (isOptimized && keywords.length > 0) {
        keywords.forEach(kw => {
          const regex = new RegExp(`\\b(${kw})\\b`, 'gi');
          displayLine = displayLine.replace(regex, '**$1**');
        });
      }
      
      // Highlight numbers/metrics in optimized version
      if (isOptimized) {
        displayLine = displayLine.replace(/(\d+[%+]?|\$[\d,]+[KMB]?)/g, '[[NUM:$1]]');
      }
      
      if (isHeader) {
        return (
          <h3 key={index} className="font-display font-semibold text-xs mt-3 mb-1.5 text-foreground border-b border-border/50 pb-1">
            {displayLine}
          </h3>
        );
      }
      
      if (isBullet) {
        return (
          <p key={index} className="text-[10px] text-muted-foreground ml-3 mb-0.5 leading-relaxed">
            {renderHighlightedText(displayLine, isOptimized)}
          </p>
        );
      }
      
      if (!line.trim()) {
        return <div key={index} className="h-1" />;
      }
      
      return (
        <p key={index} className="text-[10px] text-muted-foreground mb-0.5 leading-relaxed">
          {renderHighlightedText(displayLine, isOptimized)}
        </p>
      );
    });
  };

  const renderHighlightedText = (text: string, isOptimized: boolean) => {
    if (!isOptimized) return text;
    
    // Split by bold markers and number markers
    const parts = text.split(/(\*\*[^*]+\*\*|\[\[NUM:[^\]]+\]\])/g);
    
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <span key={i} className="bg-pear-400/20 text-pear-400 px-0.5 rounded font-medium">
            {part.slice(2, -2)}
          </span>
        );
      }
      if (part.startsWith('[[NUM:') && part.endsWith(']]')) {
        return (
          <span key={i} className="bg-cyan-400/20 text-cyan-400 px-0.5 rounded font-semibold">
            {part.slice(6, -2)}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* Improvement Summary Banner */}
      <div className="glass-card p-6 border-pear-400/30 bg-gradient-to-r from-pear-400/5 via-cyan-400/5 to-pink-400/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-pear-400/10 rounded-2xl flex items-center justify-center border border-pear-400/20">
              <TrendingUp className="h-7 w-7 text-pear-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground">AI Optimization Complete</h3>
              <p className="text-muted-foreground text-sm">Your resume has been tailored for this specific job</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-pear-400/10 rounded-full border border-pear-400/20">
              <CheckCircle2 className="h-4 w-4 text-pear-400" />
              <span className="text-pear-400 font-semibold text-sm">+{atsGain} ATS Points</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-400/10 rounded-full border border-cyan-400/20">
              <Target className="h-4 w-4 text-cyan-400" />
              <span className="text-cyan-400 font-semibold text-sm">+{addedKeywords.length} Keywords</span>
            </div>
            {processingTime > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-pink-400/10 rounded-full border border-pink-400/20">
                <Clock className="h-4 w-4 text-pink-400" />
                <span className="text-pink-400 font-semibold text-sm">{(processingTime / 1000).toFixed(1)}s</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two Column Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column A: Original Resume Analysis */}
        <div className="glass-card overflow-hidden border-amber-400/20">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 bg-amber-400/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center border border-amber-400/20">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground">Your Original Resume</h4>
                  <p className="text-xs text-muted-foreground">Initial ATS Readiness Report</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-amber-400">{originalAtsScore}</div>
                <div className="text-xs text-muted-foreground">ATS Score</div>
              </div>
            </div>
          </div>

          {/* ATS Analysis */}
          <div className="p-5 border-b border-white/10 bg-amber-400/5">
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-foreground">Keyword Match Analysis</span>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-surface-dark rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${(originalKeywordsFound.length / Math.max(jobKeywords.length, 1)) * 100}%` }}
                />
              </div>
              <span className="text-sm font-mono text-amber-400 whitespace-nowrap">
                {originalKeywordsFound.length} of {jobKeywords.length}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Missing Keywords:</p>
              <div className="flex flex-wrap gap-1.5">
                {missingKeywords.slice(0, 8).map((kw, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 text-xs bg-red-500/10 text-red-400 rounded border border-red-500/20"
                  >
                    {kw}
                  </span>
                ))}
                {missingKeywords.length > 8 && (
                  <span className="px-2 py-0.5 text-xs bg-surface-light text-muted-foreground rounded">
                    +{missingKeywords.length - 8} more
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Resume Preview */}
          <div className="p-4 bg-surface-dark">
            <div 
              className={`bg-surface-light rounded-lg border border-white/5 p-4 overflow-hidden transition-all duration-300 ${
                showFullOriginal ? 'max-h-[600px]' : 'max-h-[300px]'
              }`}
            >
              <div className="font-sans">
                {formatContentWithHighlights(originalContent, [], false)}
              </div>
            </div>
            <button 
              onClick={() => setShowFullOriginal(!showFullOriginal)}
              className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
            >
              {showFullOriginal ? (
                <>Show Less <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>Show More <ChevronDown className="h-3 w-3" /></>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/10 bg-amber-400/5">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ We've identified key gaps. Your AI-optimized draft is ready for review →
            </p>
          </div>
        </div>

        {/* Column B: AI-Optimized Resume */}
        <div className="glass-card overflow-hidden border-pear-400/30">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 bg-pear-400/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pear-400/10 rounded-xl flex items-center justify-center border border-pear-400/20 shadow-glow-sm">
                  <Sparkles className="h-5 w-5 text-pear-400" />
                </div>
                <div>
                  <h4 className="font-display font-semibold text-foreground">AI-Optimized Resume</h4>
                  <p className="text-xs text-pear-400">Tailored for this job</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-mono font-bold text-pear-400">{optimizedAtsScore}</div>
                <div className="text-xs text-muted-foreground">ATS Score</div>
              </div>
            </div>
          </div>

          {/* Improvements Made */}
          <div className="p-5 border-b border-white/10 bg-pear-400/5">
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-pear-400" />
              <span className="text-sm font-medium text-foreground">Keywords Incorporated</span>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 bg-surface-dark rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pear-500 to-pear-400 rounded-full transition-all duration-500"
                  style={{ width: `${(optimizedKeywordsFound.length / Math.max(jobKeywords.length, 1)) * 100}%` }}
                />
              </div>
              <span className="text-sm font-mono text-pear-400 whitespace-nowrap">
                {optimizedKeywordsFound.length} of {jobKeywords.length}
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Keywords Added:</p>
              <div className="flex flex-wrap gap-1.5">
                {addedKeywords.slice(0, 10).map((kw, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 text-xs bg-pear-400/10 text-pear-400 rounded border border-pear-400/20"
                  >
                    ✓ {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Resume Preview */}
          <div className="p-4 bg-surface-dark relative">
            <div 
              className={`bg-surface-light rounded-lg border border-pear-400/10 p-4 overflow-hidden transition-all duration-300 ${
                showFullOptimized ? 'max-h-[600px]' : 'max-h-[300px]'
              }`}
            >
              <div className="font-sans">
                {formatContentWithHighlights(optimizedContent, addedKeywords, true)}
              </div>
            </div>
            
            {/* Lock overlay for non-subscribers */}
            {!isUnlocked && (
              <div className="absolute inset-4 top-[40%] bg-gradient-to-t from-surface-light via-surface-light/95 to-transparent rounded-b-lg flex flex-col items-center justify-end pb-8">
                <div className="w-12 h-12 bg-pear-400/10 rounded-xl flex items-center justify-center border border-pear-400/20 mb-3">
                  <Lock className="h-6 w-6 text-pear-400" />
                </div>
                <p className="text-sm text-muted-foreground mb-1">Full content locked</p>
                <p className="text-xs text-muted-foreground/70">Subscribe to download</p>
              </div>
            )}
            
            <button 
              onClick={() => setShowFullOptimized(!showFullOptimized)}
              className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 transition-colors"
            >
              {showFullOptimized ? (
                <>Show Less <ChevronUp className="h-3 w-3" /></>
              ) : (
                <>Show More <ChevronDown className="h-3 w-3" /></>
              )}
            </button>
          </div>

          {/* Footer with CTA */}
          <div className="px-5 py-4 border-t border-white/10 bg-gradient-to-r from-pear-400/10 to-cyan-400/10">
            <Button 
              onClick={onUnlock}
              size="lg"
              className="w-full group"
            >
              {isUnlocked ? (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Download My Pro Resume
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5 mr-2 group-hover:hidden" />
                  <Download className="h-5 w-5 mr-2 hidden group-hover:block" />
                  Unlock & Download My Pro Resume
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Summary Stats */}
      <div className="glass-card p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-pear-400/5 rounded-xl border border-pear-400/10">
            <div className="flex items-center justify-center gap-1 text-pear-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="font-mono text-2xl font-bold">+{atsGain}</span>
            </div>
            <p className="text-xs text-muted-foreground">ATS Points Gained</p>
          </div>
          
          <div className="text-center p-4 bg-cyan-400/5 rounded-xl border border-cyan-400/10">
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
              <Target className="h-4 w-4" />
              <span className="font-mono text-2xl font-bold">+{addedKeywords.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Keywords Added</p>
          </div>
          
          <div className="text-center p-4 bg-pink-400/5 rounded-xl border border-pink-400/10">
            <div className="flex items-center justify-center gap-1 text-pink-400 mb-1">
              <Zap className="h-4 w-4" />
              <span className="font-mono text-2xl font-bold">{optimizedAtsScore}</span>
            </div>
            <p className="text-xs text-muted-foreground">New ATS Score</p>
          </div>
          
          <div className="text-center p-4 bg-purple-400/5 rounded-xl border border-purple-400/10">
            <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
              <Clock className="h-4 w-4" />
              <span className="font-mono text-2xl font-bold">60+</span>
            </div>
            <p className="text-xs text-muted-foreground">Minutes Saved</p>
          </div>
        </div>
        
        <p className="text-center text-sm text-muted-foreground mt-4">
          ⚡ Optimized in {processingTime > 0 ? `${(processingTime / 1000).toFixed(1)}s` : 'seconds'} — 
          saving you hours of manual tailoring
        </p>
      </div>
    </div>
  );
}

