import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoginModal } from '@/components/auth/login-modal';
import { Upload, FileText, Sparkles, ArrowRight, Zap, Shield, Target, Check, ChevronRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/auth-context';

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: loading,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setResumeFile(file);
      
      setLoading(true);
      try {
        const reader = new FileReader();
        reader.onload = () => {
          setExtractedText(`Resume file uploaded: ${file.name}\n\nContent will be extracted when you proceed to payment.`);
          setLoading(false);
        };
        reader.readAsText(file);
        toast.success('Resume uploaded successfully!');
      } catch {
        toast.error('Failed to read file');
        setLoading(false);
      }
    },
  });

  const canProceed = resumeFile && jobDescription.trim().length > 50;

  const handleCustomizeResume = () => {
    if (!canProceed) {
      if (!resumeFile) {
        toast.error('Please upload your resume first');
      } else if (jobDescription.trim().length < 50) {
        toast.error('Please provide a more detailed job description (at least 50 characters)');
      }
      return;
    }

    sessionStorage.setItem('onboarding_resume_file', resumeFile.name);
    sessionStorage.setItem('onboarding_job_description', jobDescription);
    sessionStorage.setItem('onboarding_resume_text', extractedText);

    navigate('/dashboard');
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    navigate('/pricing?onboarding=true');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="container mx-auto px-4 py-12 relative">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pear-400/10 border border-pear-400/20 text-pear-400 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Resume Optimization
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Transform Your Resume
            <br />
            <span className="gradient-text">Into a Job Magnet</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload your resume, paste the job description, and let our AI 
            customize it to maximize your chances of getting hired.
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mt-10">
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-pear-400">94%</div>
              <div className="text-sm text-muted-foreground">ATS Pass Rate</div>
            </div>
            <div className="h-12 w-px bg-border hidden sm:block" />
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-cyan-400">3x</div>
              <div className="text-sm text-muted-foreground">More Interviews</div>
            </div>
            <div className="h-12 w-px bg-border hidden sm:block" />
            <div className="text-center">
              <div className="font-mono text-3xl font-bold text-pink-400">10k+</div>
              <div className="text-sm text-muted-foreground">Resumes Optimized</div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 md:p-10 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {/* Step 1: Upload Resume */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className={`step-indicator ${resumeFile ? 'completed' : ''}`}>
                  {resumeFile ? <Check className="w-5 h-5" /> : '1'}
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Upload Your Resume</h2>
                  <p className="text-sm text-muted-foreground">PDF or Word documents accepted</p>
                </div>
              </div>

              <div
                {...getRootProps()}
                className={`upload-zone p-10 text-center cursor-pointer ${
                  isDragActive ? 'active border-pear-400' : ''
                } ${resumeFile ? 'success-glow border-green-500/50' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input {...getInputProps()} />
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
                  resumeFile ? 'bg-green-500/20' : 'bg-pear-400/10'
                }`}>
                  <Upload className={`h-8 w-8 ${resumeFile ? 'text-green-400' : 'text-pear-400'}`} />
                </div>
                
                {resumeFile ? (
                  <div>
                    <p className="text-green-400 font-medium mb-2 flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" />
                      Resume uploaded successfully
                    </p>
                    <p className="text-muted-foreground text-sm">{resumeFile.name}</p>
                    <p className="text-muted-foreground/60 text-xs mt-2">Click or drag to replace</p>
                  </div>
                ) : isDragActive ? (
                  <p className="text-pear-400 font-medium">Drop your resume here...</p>
                ) : (
                  <>
                    <p className="text-foreground font-medium mb-2">Drag and drop your resume, or click to browse</p>
                    <p className="text-muted-foreground text-sm">Supports PDF and Word documents</p>
                  </>
                )}
              </div>
            </div>

            {/* Step 2: Job Description */}
            <div className="mb-10">
              <div className="flex items-center gap-4 mb-6">
                <div className={`step-indicator ${jobDescription.length >= 50 ? 'completed' : ''}`}>
                  {jobDescription.length >= 50 ? <Check className="w-5 h-5" /> : '2'}
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">Paste Job Description</h2>
                  <p className="text-sm text-muted-foreground">The more detail, the better the match</p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here. Include requirements, responsibilities, and qualifications. The more detail you provide, the better we can tailor your resume."
                  className="w-full p-5 bg-surface-light border border-border rounded-xl h-56 focus:outline-none focus:ring-2 focus:ring-pear-400/50 focus:border-pear-400/50 resize-none text-foreground placeholder:text-muted-foreground/60 transition-all"
                />
                <div className="absolute bottom-4 right-4 flex items-center gap-3">
                  <span className={`text-sm ${jobDescription.length >= 50 ? 'text-green-400' : 'text-muted-foreground'}`}>
                    {jobDescription.length} / 50 min
                  </span>
                  {jobDescription.length >= 50 && (
                    <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                      <Check className="w-4 h-4" /> Ready
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Features Box */}
            <div className="rounded-2xl bg-gradient-to-br from-pear-400/10 via-cyan-400/5 to-pink-400/10 border border-pear-400/20 p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="feature-icon flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-pear-400" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground mb-3">How Our AI Optimization Works</h3>
                  <ul className="grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-pear-400 flex-shrink-0 mt-0.5" />
                      <span>Extracts key requirements and keywords from the job</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-pear-400 flex-shrink-0 mt-0.5" />
                      <span>Highlights your most relevant experience</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-pear-400 flex-shrink-0 mt-0.5" />
                      <span>Optimizes for ATS (Applicant Tracking Systems)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight className="w-4 h-4 text-pear-400 flex-shrink-0 mt-0.5" />
                      <span>Rewrites with powerful, quantifiable language</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <Button
                onClick={handleCustomizeResume}
                disabled={!canProceed || loading}
                size="xl"
                className="px-12 group"
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    Customize My Resume
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>

              {!canProceed && (
                <p className="text-muted-foreground text-sm mt-4">
                  {!resumeFile 
                    ? 'Upload your resume to continue' 
                    : `Add ${50 - jobDescription.length} more characters to the job description`
                  }
                </p>
              )}
            </div>
          </div>

          {/* Login Modal */}
          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            onSuccess={handleLoginSuccess}
          />

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="glass-card-hover p-6 text-center">
              <div className="feature-icon mx-auto mb-4">
                <FileText className="h-6 w-6 text-pear-400" />
              </div>
              <h3 className="font-display font-semibold mb-2">No Account Required</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Upload and customize first. Create an account only when you're ready to download.
              </p>
            </div>
            
            <div className="glass-card-hover p-6 text-center">
              <div className="feature-icon mx-auto mb-4">
                <Target className="h-6 w-6 text-cyan-400" />
              </div>
              <h3 className="font-display font-semibold mb-2">Job-Specific Matching</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our AI analyzes both your resume and target job for perfect keyword alignment.
              </p>
            </div>
            
            <div className="glass-card-hover p-6 text-center">
              <div className="feature-icon mx-auto mb-4">
                <Shield className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="font-display font-semibold mb-2">Secure & Private</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your data is encrypted end-to-end and never shared with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
