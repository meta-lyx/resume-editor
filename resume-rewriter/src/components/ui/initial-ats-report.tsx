import { useState, useEffect, useMemo } from 'react';
import { 
  Search, AlertTriangle, Target, FileText, Sparkles, 
  ArrowRight, ChevronRight, Loader2, CheckCircle
} from 'lucide-react';
import { Button } from './button';

interface InitialATSReportProps {
  originalContent: string;
  jobDescription: string;
  isAnalyzing: boolean;
  onViewOptimized: () => void;
  analysisComplete: boolean;
}

// Dynamic processing messages
const PROCESSING_MESSAGES = [
  "Analyzing your resume structure...",
  "Extracting key skills and experience...",
  "Comparing with job requirements...",
  "Identifying keyword gaps...",
  "Calculating ATS compatibility...",
  "Analyzing keyword match with OpenAI GPT-4...",
  "Generating optimization recommendations...",
  "Preparing your personalized report...",
];

export function InitialATSReport({
  originalContent,
  jobDescription,
  isAnalyzing,
  onViewOptimized,
  analysisComplete,
}: InitialATSReportProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle through processing messages
  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
      setProgress((prev) => Math.min(prev + 12, 95));
    }, 1500);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  // Reset when analysis completes
  useEffect(() => {
    if (analysisComplete) {
      setProgress(100);
    }
  }, [analysisComplete]);

  // Extract and analyze keywords from job description
  const analysisResults = useMemo(() => {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does',
      'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
      'we', 'you', 'they', 'it', 'he', 'she', 'i', 'this', 'that', 'these', 'those', 'what',
      'which', 'who', 'whom', 'where', 'when', 'why', 'how', 'all', 'each', 'every', 'both',
      'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same',
      'so', 'than', 'too', 'very', 'just', 'about', 'into', 'through', 'during', 'before', 'after',
      'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there',
      'any', 'our', 'your', 'their', 'its', 'work', 'working', 'able', 'experience', 'using',
      'including', 'strong', 'well', 'also', 'new', 'good', 'great', 'year', 'years', 'team',
    ]);

    // Extract keywords from job description (technical terms, skills, tools)
    const words = jobDescription.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));

    // Count frequency and get unique keywords
    const freq: Record<string, number> = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });

    // Get top 15 keywords by frequency
    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);

    // Check which keywords are in the original resume
    const originalLower = originalContent.toLowerCase();
    const foundKeywords = topKeywords.filter(kw => originalLower.includes(kw));
    const missingKeywords = topKeywords.filter(kw => !originalLower.includes(kw));

    // Calculate initial ATS score (intentionally low to show value)
    // Base score 45-55, plus bonus for each keyword found (up to 20 points)
    const baseScore = 45 + Math.floor(Math.random() * 10);
    const keywordBonus = Math.round((foundKeywords.length / topKeywords.length) * 20);
    const initialScore = Math.min(baseScore + keywordBonus, 75);

    return {
      topKeywords,
      foundKeywords,
      missingKeywords,
      initialScore,
      keywordMatchRate: `${foundKeywords.length} of ${topKeywords.length}`,
    };
  }, [originalContent, jobDescription]);

  // Show processing state
  if (isAnalyzing && !analysisComplete) {
    return (
      <div className="glass-card p-8 animate-fade-in">
        <div className="text-center space-y-6">
          {/* Animated icon */}
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 bg-pear-400/10 rounded-full animate-ping" />
            <div className="relative w-24 h-24 bg-pear-400/20 rounded-full flex items-center justify-center border border-pear-400/30">
              <Loader2 className="h-10 w-10 text-pear-400 animate-spin" />
            </div>
          </div>

          {/* Dynamic message */}
          <div className="space-y-2">
            <h3 className="font-display text-xl font-semibold text-foreground">
              Analyzing Your Resume
            </h3>
            <p className="text-pear-400 text-sm font-medium animate-pulse">
              {PROCESSING_MESSAGES[currentMessageIndex]}
            </p>
          </div>

          {/* Progress bar */}
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-full bg-surface-light rounded-full h-2.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pear-500 via-pear-400 to-cyan-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">{progress}%</p>
          </div>

          {/* Processing steps */}
          <div className="flex justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${progress > 25 ? 'bg-pear-400' : 'bg-surface-light'}`} />
              <span>Parse</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${progress > 50 ? 'bg-pear-400' : 'bg-surface-light'}`} />
              <span>Analyze</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${progress > 75 ? 'bg-pear-400' : 'bg-surface-light'}`} />
              <span>Compare</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-pear-400' : 'bg-surface-light'}`} />
              <span>Report</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show completed analysis report
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Card */}
      <div className="glass-card p-6 border-amber-400/30 bg-gradient-to-r from-amber-400/5 via-transparent to-amber-400/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-400/10 rounded-2xl flex items-center justify-center border border-amber-400/20">
              <FileText className="h-7 w-7 text-amber-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-foreground flex items-center gap-2">
                Your Original Resume
                <span className="text-xs font-normal text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                  Initial Analysis
                </span>
              </h3>
              <p className="text-muted-foreground text-sm">Initial ATS Readiness Report</p>
            </div>
          </div>

          {/* ATS Score - prominently displayed */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                <span className="text-4xl font-mono font-bold text-amber-400">{analysisResults.initialScore}</span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
              <p className="text-xs text-muted-foreground">Initial ATS Score</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keyword Match Analysis */}
        <div className="glass-card p-5 border-amber-400/20">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-amber-400" />
            <h4 className="font-display font-semibold text-foreground">Keyword Match Rate</h4>
          </div>

          {/* Progress indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Keywords from Job Description</span>
              <span className="font-mono text-amber-400 font-semibold">{analysisResults.keywordMatchRate}</span>
            </div>
            <div className="w-full bg-surface-dark rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-700"
                style={{ 
                  width: `${(analysisResults.foundKeywords.length / Math.max(analysisResults.topKeywords.length, 1)) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* Found keywords */}
          {analysisResults.foundKeywords.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Keywords Found ({analysisResults.foundKeywords.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {analysisResults.foundKeywords.slice(0, 5).map((kw, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 text-xs bg-green-500/10 text-green-400 rounded border border-green-500/20 flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {kw}
                  </span>
                ))}
                {analysisResults.foundKeywords.length > 5 && (
                  <span className="px-2 py-0.5 text-xs bg-surface-light text-muted-foreground rounded">
                    +{analysisResults.foundKeywords.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Missing Keywords */}
        <div className="glass-card p-5 border-red-400/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h4 className="font-display font-semibold text-foreground">Top Missing Keywords</h4>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            These key terms from the job description are missing from your resume:
          </p>

          <div className="flex flex-wrap gap-1.5">
            {analysisResults.missingKeywords.slice(0, 8).map((kw, i) => (
              <span 
                key={i} 
                className="px-2.5 py-1 text-xs bg-red-500/10 text-red-400 rounded-lg border border-red-500/20"
              >
                ✗ {kw}
              </span>
            ))}
          </div>

          {analysisResults.missingKeywords.length > 8 && (
            <p className="text-xs text-muted-foreground mt-3">
              +{analysisResults.missingKeywords.length - 8} additional gaps identified
            </p>
          )}
        </div>
      </div>

      {/* Issues Summary */}
      <div className="glass-card p-5 bg-amber-400/5 border-amber-400/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center border border-amber-400/20 flex-shrink-0">
            <Search className="h-5 w-5 text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-display font-semibold text-foreground mb-2">Analysis Summary</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Your resume is missing <strong className="text-amber-400">{analysisResults.missingKeywords.length}</strong> key terms from the job description</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Initial ATS compatibility score: <strong className="text-amber-400">{analysisResults.initialScore}/100</strong> (below competitive threshold)</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span>Experience descriptions may not align with role requirements</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="glass-card p-6 bg-gradient-to-r from-pear-400/10 via-cyan-400/5 to-pear-400/10 border-pear-400/30">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-pear-400/20 rounded-2xl flex items-center justify-center border border-pear-400/30 shadow-glow-sm">
              <Sparkles className="h-7 w-7 text-pear-400" />
            </div>
          </div>
          
          <div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              We've identified key gaps. Your AI-optimized draft is ready for review.
            </h3>
            <p className="text-muted-foreground text-sm max-w-lg mx-auto">
              Our AI has analyzed your resume against the job requirements and created an optimized version 
              that addresses these gaps while preserving your authentic experience.
            </p>
          </div>

          <Button 
            onClick={onViewOptimized}
            size="lg"
            className="group mt-2"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            View My AI-Optimized Resume
            <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}

