import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { ResumePreview } from '@/components/ui/resume-preview';
import { LoginModal } from '@/components/auth/login-modal';
import { AccountInfo } from '@/components/ui/account-info';
import { Plus, Upload, FileText, AlertCircle, Check, Sparkles, ArrowRight, CreditCard, Loader2, Download } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { extractResumeText } from '@/services/resume-service';
import { apiClient } from '@/lib/api-client';
import { saveResumeData, loadResumeData, clearResumeData } from '@/lib/resume-storage';

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [resumeTitle, setResumeTitle] = useState<string>('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [resumeProcessed, setResumeProcessed] = useState(false);
  const [customizedResume, setCustomizedResume] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [purchasedPlan, setPurchasedPlan] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);

  // Wrapper to ensure payment modal only shows for logged-in users
  const showPaymentModalSafely = () => {
    console.log('=== showPaymentModalSafely called ===');
    console.log('User state:', user);
    console.log('Auth loading:', authLoading);
    
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading, cannot show payment modal yet');
      return;
    }
    
    if (!user) {
      // If user is not logged in, show login modal instead
      console.log('User not logged in, showing login modal instead of payment modal');
      setShowLoginModal(true);
      return;
    }
    console.log('User is logged in, showing payment modal');
    setShowPaymentModal(true);
  };

  // Handle plan selection - directly go to Stripe
  const handleSelectPlan = async (planId: string) => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading, cannot proceed with checkout');
      return;
    }
    
    // IMPORTANT: Check authentication first before proceeding to checkout
    if (!user) {
      console.log('User not logged in, showing login modal before checkout');
      setShowLoginModal(true);
      // Store the selected plan so we can proceed after login
      setPurchasedPlan(planId);
      return;
    }

    setCheckoutLoading(planId);
    try {
      const { data, error } = await apiClient.createCheckoutSession(planId);
      if (error) {
        console.log('Checkout error:', error);
        // If error is due to authentication, show login modal
        if (error.message?.includes('Unauthorized') || error.message?.includes('401') || error.code === '401') {
          console.log('Authentication error detected, showing login modal');
          setShowLoginModal(true);
          setPurchasedPlan(planId);
          setCheckoutLoading(null);
          return;
        }
        toast.error(error.message || 'Failed to create checkout session');
        setCheckoutLoading(null);
        return;
      }
      if (data?.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('No checkout URL returned');
      }
    } catch (err: any) {
      // If error is due to authentication, show login modal
      if (err.message?.includes('Unauthorized') || err.message?.includes('401')) {
        setShowLoginModal(true);
        setPurchasedPlan(planId);
        return;
      }
      toast.error(err.message || 'Failed to start checkout');
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Function to load persisted data
  const loadPersistedData = () => {
    try {
      const savedData = loadResumeData();
      if (savedData.extractedText || savedData.customizedResume) {
        console.log('Loading persisted resume data:', {
          hasExtractedText: !!savedData.extractedText,
          hasCustomizedResume: !!savedData.customizedResume,
          isProcessed: savedData.resumeProcessed,
        });
        setExtractedText(savedData.extractedText);
        setResumeTitle(savedData.resumeTitle);
        setJobDescription(savedData.jobDescription);
        setCustomizedResume(savedData.customizedResume);
        setResumeProcessed(savedData.resumeProcessed);
        return true; // Return true if data was loaded
      }
      return false;
    } catch (error) {
      console.error('Error loading persisted data:', error);
      return false;
    }
  };

  // Load persisted data on mount
  useEffect(() => {
    loadPersistedData();
  }, []);

  // Check subscription status and reload data when user logs in
  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setHasSubscription(false);
        // When user logs out, data should still be in localStorage
        // So we don't need to clear it
        return;
      }

      // When user logs in, try to reload persisted data
      // This ensures data is available even if page was reloaded
      const dataLoaded = loadPersistedData();
      if (dataLoaded) {
        console.log('Reloaded persisted resume data after login');
      }

      try {
        const { data, error } = await apiClient.getSubscriptionUsage();
        if (!error && data) {
          setHasSubscription(data.hasSubscription && data.remaining > 0);
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
      }
    }

    checkSubscription();
  }, [user]);

  // Handle payment success redirect from Stripe
  useEffect(() => {
    const payment = searchParams.get('payment');
    const plan = searchParams.get('plan');
    
    if (payment === 'success' && plan) {
      setPaymentSuccess(true);
      setPurchasedPlan(plan);
      setHasSubscription(true);
      toast.success('Payment successful! Your credits have been added.');
      
      // IMPORTANT: Reload persisted data after payment redirect
      // This ensures the resume data is restored even if the page was reloaded
      const savedData = loadResumeData();
      const dataLoaded = !!(savedData.extractedText || savedData.customizedResume);
      
      if (dataLoaded) {
        // Update state with loaded data
        setExtractedText(savedData.extractedText);
        setResumeTitle(savedData.resumeTitle);
        setJobDescription(savedData.jobDescription);
        setCustomizedResume(savedData.customizedResume);
        setResumeProcessed(savedData.resumeProcessed);
      } else {
        console.warn('No persisted resume data found after payment redirect');
      }
      
      // Reload subscription status and auto-download
      if (user) {
        apiClient.getSubscriptionUsage().then(({ data }) => {
          if (data) {
            const hasCredits = data.hasSubscription && data.remaining > 0;
            setHasSubscription(hasCredits);
            
            // Auto-download resume if user has credits and resume is ready
            if (hasCredits && savedData.customizedResume) {
              // Use the loaded data directly for download
              const blob = new Blob([savedData.customizedResume], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${savedData.resumeTitle || 'resume'}_optimized.txt`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
              
              toast.success('Resume downloaded successfully!');
            }
          }
        });
      }
      
      // Clear the URL params after showing success
      setTimeout(() => {
        setSearchParams({});
      }, 2000);
    } else if (payment === 'cancelled') {
      toast.error('Payment was cancelled.');
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, user]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/webp': ['.webp'],
    },
    maxFiles: 1,
    disabled: loading,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setResumeFile(file);
      const title = file.name.replace(/\.[^/.]+$/, '');
      setResumeTitle(title);
      setLoading(true);

      try {
        // Allow unauthenticated users to extract text
        const result = await extractResumeText(file);
        const text = result.extractedText || result.text || '';
        setExtractedText(text);
        
        // Persist to localStorage
        saveResumeData({
          extractedText: text,
          resumeTitle: title,
          resumeFileName: file.name,
        });
        
        toast.success('Resume uploaded and text extracted successfully');
      } catch (error: any) {
        toast.error(error.message || 'File upload failed');
        console.error('File upload error:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  // Check if user can proceed to customization
  const canProcess = extractedText && jobDescription.trim().length >= 50;

  const handleProcessResume = async () => {
    console.log('=== handleProcessResume called ===');
    console.log('User state:', user);
    console.log('Auth loading:', authLoading);
    
    // IMPORTANT: Check authentication first before processing
    // Wait for auth to finish loading
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }
    
    // If user is not logged in, show login modal immediately
    if (!user) {
      console.log('User not logged in, showing login modal before processing');
      alert('User not logged in - showing login modal');
      setShowLoginModal(true);
      return;
    }
    
    console.log('User is logged in, proceeding with processing');

    if (!extractedText || !resumeTitle) {
      toast.error('Please upload resume file first');
      return;
    }

    if (jobDescription.trim().length < 50) {
      toast.error('Please provide a more detailed job description (at least 50 characters)');
      return;
    }

    setLoading(true);
    try {
      // User is logged in, proceed with processing
      // Call the AI processing API
      const { data, error } = await apiClient.processResume(extractedText, jobDescription);
      
      if (error) {
        throw new Error(error.message || 'AI processing failed');
      }

      if (!data?.result?.customizedResume) {
        throw new Error('No result returned from AI service');
      }

      // Format the result with metadata
      const formattedResume = `${data.result.customizedResume}

---
📊 Processing Details:
• Provider: ${data.provider}
• ATS Score: ${data.result.atsScore || 'N/A'}/100
• Processing Time: ${(data.result.processingTime / 1000).toFixed(1)}s
• Keywords Matched: ${data.result.keywordsMatched.length > 0 ? data.result.keywordsMatched.join(', ') : 'See above'}

💡 Suggestions:
${data.result.suggestions.map(s => `• ${s}`).join('\n')}
`;
      
      setCustomizedResume(formattedResume);
      setResumeProcessed(true);
      
      // Persist to localStorage
      saveResumeData({
        customizedResume: formattedResume,
        resumeProcessed: true,
      });
      
      toast.success(`Resume optimized by ${data.provider}!`);
    } catch (error: any) {
      toast.error(error.message || 'Processing failed');
      console.error('Processing error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadResume = async () => {
    console.log('=== handleDownloadResume called ===');
    console.log('User state:', user);
    console.log('Auth loading:', authLoading);
    
    // IMPORTANT: Always check authentication first
    // Wait for auth to finish loading before checking
    if (authLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }
    
    // If user is not logged in, show login modal immediately
    if (!user) {
      console.log('User not logged in, showing login modal');
      setShowLoginModal(true);
      return;
    }
    
    console.log('User is logged in, proceeding with download check');

    // If user just completed payment (paymentSuccess is true), skip subscription check and download directly
    if (paymentSuccess && hasSubscription) {
      console.log('User just completed payment, downloading resume directly');
      downloadResumeFile();
      return;
    }

    // User is logged in, check if they have subscription/credits
    try {
      const { data, error } = await apiClient.getSubscriptionUsage();
      if (error || !data || (!data.hasSubscription || data.remaining <= 0)) {
        // Show payment modal if no subscription or no credits
        console.log('No subscription or credits, showing payment modal');
        showPaymentModalSafely();
        return;
      }
      
      // User has subscription and credits, proceed with download
      console.log('User has subscription, downloading resume');
      downloadResumeFile();
    } catch (error) {
      // On error, show payment modal
      console.error('Error checking subscription:', error);
      showPaymentModalSafely();
      return;
    }
  };

  const downloadResumeFile = () => {
    // Try to get resume from state first, fallback to localStorage
    let resumeContent = customizedResume;
    let resumeTitleToUse = resumeTitle;
    
    if (!resumeContent) {
      // Fallback to localStorage if state is not updated yet
      const savedData = loadResumeData();
      resumeContent = savedData.customizedResume;
      resumeTitleToUse = savedData.resumeTitle;
    }
    
    if (!resumeContent) {
      toast.error('No resume to download');
      return;
    }

    // Create a blob and download
    const blob = new Blob([resumeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeTitleToUse || 'resume'}_optimized.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Resume downloaded successfully!');
  };

  const handleLoginSuccess = async () => {
    // Close login modal
    setShowLoginModal(false);
    
    // If user had selected a plan before logging in, proceed to checkout
    if (purchasedPlan) {
      // Small delay to ensure modal closes
      setTimeout(() => {
        handleSelectPlan(purchasedPlan);
      }, 100);
      return;
    }
    
    // If user was trying to process resume, proceed with processing
    if (extractedText && jobDescription && !customizedResume) {
      // User just logged in and wants to process resume
      setTimeout(() => {
        handleProcessResume();
      }, 100);
      return;
    }
    
    // After login, check if user has subscription
    try {
      const { data, error } = await apiClient.getSubscriptionUsage();
      if (error || !data || (!data.hasSubscription || data.remaining <= 0)) {
        // Show payment modal if no subscription
        showPaymentModalSafely();
      } else {
        // User has subscription, allow download
        setHasSubscription(true);
        // Only download if resume is ready
        if (customizedResume) {
          downloadResumeFile();
        }
      }
    } catch (error) {
      // On error, show payment modal
      showPaymentModalSafely();
    }
  };

  const handleStartOver = () => {
    setExtractedText('');
    setResumeTitle('');
    setResumeFile(null);
    setJobDescription('');
    setResumeProcessed(false);
    setCustomizedResume('');
    clearResumeData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Payment Success Banner */}
        {paymentSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="font-bold text-green-900">Payment Successful!</h3>
                <p className="text-green-700 text-sm">
                  Your {purchasedPlan?.replace('-plan', '').replace('-', ' ')} plan has been activated. 
                  You can now download your customized resumes.
                </p>
              </div>
              <button 
                onClick={() => setPaymentSuccess(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Upload your resume and customize it for your target job.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              
              {/* Show processed result */}
              {resumeProcessed ? (
                <div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start">
                      <Check className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-green-900 mb-2">✓ Your Customized Resume is Ready!</h3>
                        <p className="text-green-800 text-sm">
                          Your resume has been optimized for ATS compatibility. Compare the original and customized versions below.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Side-by-side comparison with PDF-like previews */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold">Resume Comparison</h3>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Original</span>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">Optimized</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Original Resume Preview */}
                      <ResumePreview
                        content={extractedText}
                        title="📄 Original Resume"
                        type="original"
                        isUnlocked={true}
                      />
                      
                      {/* Optimized Resume Preview - Locked until payment/login */}
                      <ResumePreview
                        content={customizedResume}
                        title="✨ AI-Optimized Resume"
                        type="optimized"
                        isUnlocked={hasSubscription || paymentSuccess}
                        onUnlock={handleDownloadResume}
                      />
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4 border-t border-gray-200">
                    <Button
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert('Button mouse down - this should fire!');
                        console.log('Button mouse down!');
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        alert('Button clicked - handler fired!');
                        console.log('Button clicked!');
                        handleDownloadResume();
                      }}
                      onMouseUp={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Button mouse up!');
                      }}
                      type="button"
                      size="lg"
                      className="px-8"
                    >
                      Download My Custom Resume
                    </Button>
                    <Button
                      onClick={handleStartOver}
                      variant="outline"
                      size="lg"
                    >
                      Start New Customization
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1: Upload Resume */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 ${
                        extractedText ? 'bg-green-500 text-white' : 'bg-primary text-white'
                      }`}>
                        {extractedText ? <Check className="h-5 w-5" /> : '1'}
                      </div>
                      <h2 className="text-xl font-bold">Upload Your Resume</h2>
                    </div>

                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        isDragActive
                          ? 'border-primary bg-primary/5'
                          : resumeFile
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-300 hover:border-primary hover:bg-primary/5'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input {...getInputProps()} />
                      <Upload className={`h-12 w-12 mx-auto mb-4 ${resumeFile ? 'text-green-500' : 'text-gray-400'}`} />
                      {resumeFile ? (
                        <div>
                          <p className="text-green-700 font-medium mb-2">✓ Resume uploaded successfully</p>
                          <p className="text-gray-600 text-sm">{resumeFile.name}</p>
                          <p className="text-gray-500 text-xs mt-2">Click or drag to replace</p>
                        </div>
                      ) : isDragActive ? (
                        <p className="text-primary">Drop your resume here...</p>
                      ) : (
                        <>
                          <p className="text-gray-600 mb-2">Drag and drop your resume, or click to browse</p>
                          <p className="text-gray-500 text-sm">Supports PDF, Word, PNG, JPG, WEBP</p>
                        </>
                      )}
                    </div>

                    {/* Show extracted text preview */}
                    {extractedText && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Extracted Resume Content
                          </label>
                          <span className="text-xs text-gray-500">
                            {extractedText.length} characters extracted
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-md p-4 border border-gray-200 h-40 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700">{extractedText}</pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Job Description */}
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 ${
                        jobDescription.length >= 50 ? 'bg-green-500 text-white' : 'bg-primary text-white'
                      }`}>
                        {jobDescription.length >= 50 ? <Check className="h-5 w-5" /> : '2'}
                      </div>
                      <h2 className="text-xl font-bold">Paste Job Description</h2>
                    </div>

                    <textarea
                      value={jobDescription}
                      onChange={(e) => {
                        setJobDescription(e.target.value);
                        saveResumeData({ jobDescription: e.target.value });
                      }}
                      placeholder="Paste the full job description here. Include requirements, responsibilities, and qualifications. The more detail you provide, the better we can tailor your resume."
                      className="w-full p-4 border border-gray-300 rounded-lg h-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-gray-500">
                        {jobDescription.length} characters (minimum 50 required)
                      </p>
                      {jobDescription.length >= 50 && (
                        <p className="text-sm text-green-600 font-medium">✓ Looks good!</p>
                      )}
                    </div>
                  </div>

                  {/* How It Works Info Box */}
                  <div className="bg-blue-50 rounded-lg p-6 mb-8 border border-blue-100">
                    <div className="flex items-start">
                      <Sparkles className="h-6 w-6 text-blue-600 mr-3 mt-1 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-blue-900 mb-2">How Our AI Customization Works</h3>
                        <ul className="text-blue-800 text-sm space-y-2">
                          <li>✓ Extracts key requirements and keywords from the job description</li>
                          <li>✓ Highlights your most relevant experience and skills</li>
                          <li>✓ Optimizes for Applicant Tracking Systems (ATS)</li>
                          <li>✓ Rewrites accomplishments with powerful, quantifiable language</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex justify-center">
                    <Button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Customize My Resume button clicked!');
                        alert('Button clicked - calling handleProcessResume');
                        handleProcessResume();
                      }}
                      type="button"
                      disabled={!canProcess || loading}
                      size="lg"
                      className="px-12 py-6 text-lg"
                    >
                      {loading ? (
                        'Processing Your Resume...'
                      ) : (
                        <>
                          Customize My Resume
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>

                  {!canProcess && (
                    <p className="text-center text-gray-500 text-sm mt-4">
                      {!extractedText 
                        ? 'Upload your resume to continue' 
                        : jobDescription.length < 50 
                        ? `Add ${50 - jobDescription.length} more characters to the job description`
                        : 'Complete both steps above to continue'
                      }
                    </p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Start Guide */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold mb-4">Quick Start Guide</h2>

              <ul className="space-y-4">
                <li className="flex">
                  <div className={`p-2 rounded-full mr-3 ${extractedText ? 'bg-green-100' : 'bg-primary/10'}`}>
                    <Upload className={`h-5 w-5 ${extractedText ? 'text-green-600' : 'text-primary'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">1. Upload Your Resume</h3>
                    <p className="text-gray-600 text-sm">PDF, Word, or image formats</p>
                  </div>
                </li>
                <li className="flex">
                  <div className={`p-2 rounded-full mr-3 ${jobDescription.length >= 50 ? 'bg-green-100' : 'bg-primary/10'}`}>
                    <FileText className={`h-5 w-5 ${jobDescription.length >= 50 ? 'text-green-600' : 'text-primary'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">2. Paste Job Description</h3>
                    <p className="text-gray-600 text-sm">The job you're applying for</p>
                  </div>
                </li>
                <li className="flex">
                  <div className={`p-2 rounded-full mr-3 ${resumeProcessed ? 'bg-green-100' : 'bg-primary/10'}`}>
                    <Sparkles className={`h-5 w-5 ${resumeProcessed ? 'text-green-600' : 'text-primary'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium">3. Get AI-Optimized Resume</h3>
                    <p className="text-gray-600 text-sm">Tailored for the job</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Tips Box */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                <h3 className="font-medium text-amber-800 mb-2">💡 Pro Tip</h3>
                <p className="text-amber-700 text-sm">
                  For best results, paste the complete job description including requirements, responsibilities, and qualifications. Our AI uses this to match your experience with what employers are looking for.
                </p>
              </div>
            </div>

            {/* Account Info Component - Fixed position in bottom right (only when logged in) */}
            {user && (
              <div className="lg:fixed lg:bottom-6 lg:right-6 lg:w-80 z-10">
                <AccountInfo />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal - Only show if user is logged in */}
      {showPaymentModal && user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ✕
            </button>
            
            <h2 className="text-3xl font-bold mb-2 text-center">Choose Your Plan</h2>
            <p className="text-gray-600 mb-8 text-center">
              Select a plan to download your customized resume
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter Plan */}
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary transition-colors">
                <h3 className="text-xl font-bold mb-2">Starter</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$9</span>
                  <span className="text-gray-500"> one-time</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>3 Custom Resumes</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>ATS Optimization</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Job Matching</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Email Support</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSelectPlan('starter-plan')}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === 'starter-plan' ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    'Select Plan'
                  )}
                </Button>
              </div>

              {/* Professional Plan - Most Popular */}
              <div className="border-2 border-primary rounded-lg p-6 relative shadow-lg">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$19</span>
                  <span className="text-gray-500"> one-time</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>10 Custom Resumes</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Advanced ATS Optimization</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>AI-Powered Job Matching</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Priority Support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>LinkedIn Optimization Tips</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSelectPlan('professional-plan')}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === 'professional-plan' ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    'Select Plan'
                  )}
                </Button>
              </div>

              {/* Lifetime Plan */}
              <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-primary transition-colors">
                <h3 className="text-xl font-bold mb-2">Lifetime</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$49</span>
                  <span className="text-gray-500"> one-time</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="font-bold">Unlimited Custom Resumes</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>All Professional Features</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Lifetime Updates</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>VIP Support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>Early Access to New Features</span>
                  </li>
                </ul>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleSelectPlan('lifetime-plan')}
                  disabled={checkoutLoading !== null}
                >
                  {checkoutLoading === 'lifetime-plan' ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    'Select Plan'
                  )}
                </Button>
              </div>
            </div>

            <p className="text-center text-gray-500 text-sm mt-6">
              Secure payment powered by Stripe. Cancel anytime.
            </p>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}
