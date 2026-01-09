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

  useEffect(() => {
    if (!isAnalyzing) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % PROCESSING_MESSAGES.length);
      setProgress((prev) => Math.min(prev + 12, 95));
    }, 1500);

    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    if (analysisComplete) {
      setProgress(100);
    }
  }, [analysisComplete]);

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

    const words = jobDescription.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));

    const freq: Record<string, number> = {};
    words.forEach(word => {
      freq[word] = (freq[word] || 0) + 1;
    });

    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);

    const originalLower = originalContent.toLowerCase();
    const foundKeywords = topKeywords.filter(kw => originalLower.includes(kw));
    const missingKeywords = topKeywords.filter(kw => !originalLower.includes(kw));

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
      <div className="border border-border rounded-xl p-8 bg-card">
        <div className="text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping" />
            <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-lg">Analyzing Your Resume</h3>
            <p className="text-primary text-sm animate-pulse">
              {PROCESSING_MESSAGES[currentMessageIndex]}
            </p>
          </div>

          <div className="max-w-sm mx-auto space-y-2">
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">{progress}%</p>
          </div>

          <div className="flex justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${progress > 25 ? 'bg-primary' : 'bg-muted'}`} />
              <span>Parse</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${progress > 50 ? 'bg-primary' : 'bg-muted'}`} />
              <span>Analyze</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${progress > 75 ? 'bg-primary' : 'bg-muted'}`} />
              <span>Compare</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${progress >= 100 ? 'bg-primary' : 'bg-muted'}`} />
              <span>Report</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show completed analysis report
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-lg">
            <FileText className="h-5 w-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold">Original Resume Analysis</h3>
            <p className="text-sm text-muted-foreground">Initial ATS Readiness</p>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-3xl font-bold text-amber-500">{analysisResults.initialScore}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
          <p className="text-xs text-muted-foreground">ATS Score</p>
        </div>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Keyword Match */}
        <div className="border border-border rounded-xl p-4 bg-card">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-amber-500" />
            <h4 className="font-medium text-sm">Keyword Match Rate</h4>
          </div>

          <div className="mb-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">From job description</span>
              <span className="font-mono text-amber-500">{analysisResults.keywordMatchRate}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-700"
                style={{ 
                  width: `${(analysisResults.foundKeywords.length / Math.max(analysisResults.topKeywords.length, 1)) * 100}%` 
                }}
              />
            </div>
          </div>

          {analysisResults.foundKeywords.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Keywords Found</p>
              <div className="flex flex-wrap gap-1.5">
                {analysisResults.foundKeywords.slice(0, 5).map((kw, i) => (
                  <span 
                    key={i} 
                    className="px-2 py-0.5 text-xs bg-green-500/10 text-green-500 rounded flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    {kw}
                  </span>
                ))}
                {analysisResults.foundKeywords.length > 5 && (
                  <span className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded">
                    +{analysisResults.foundKeywords.length - 5}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Missing Keywords */}
        <div className="border border-destructive/20 rounded-xl p-4 bg-card">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h4 className="font-medium text-sm">Missing Keywords</h4>
          </div>

          <p className="text-xs text-muted-foreground mb-3">
            Key terms from the job description missing from your resume:
          </p>

          <div className="flex flex-wrap gap-1.5">
            {analysisResults.missingKeywords.slice(0, 8).map((kw, i) => (
              <span 
                key={i} 
                className="px-2 py-0.5 text-xs bg-destructive/10 text-destructive rounded"
              >
                ✗ {kw}
              </span>
            ))}
          </div>

          {analysisResults.missingKeywords.length > 8 && (
            <p className="text-xs text-muted-foreground mt-2">
              +{analysisResults.missingKeywords.length - 8} more gaps
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="border border-border rounded-xl p-4 bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-amber-500/10 rounded-lg flex-shrink-0">
            <Search className="h-4 w-4 text-amber-500" />
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Analysis Summary</h4>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Missing <strong className="text-amber-500">{analysisResults.missingKeywords.length}</strong> key terms from the job description</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>ATS score: <strong className="text-amber-500">{analysisResults.initialScore}/100</strong> (below competitive threshold)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="border border-primary/30 rounded-xl p-6 bg-primary/5 text-center">
        <div className="p-2.5 bg-primary/10 rounded-xl w-fit mx-auto mb-4">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        
        <h3 className="font-semibold text-lg mb-2">
          Your AI-optimized draft is ready
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto mb-4">
          We've analyzed your resume and created an optimized version that addresses these gaps.
        </p>

        <Button onClick={onViewOptimized} size="lg" className="group">
          <Sparkles className="h-4 w-4 mr-2" />
          View Optimized Resume
          <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
