import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { ResumePreview } from '@/components/ui/resume-preview';
import { LoginModal } from '@/components/auth/login-modal';
import { AccountInfo } from '@/components/ui/account-info';
import { Plus, Upload, FileText, AlertCircle, Check, Sparkles, ArrowRight, CreditCard, Loader2, Download, Zap, ChevronRight, X, Crown, Rocket, Star } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { extractResumeText } from '@/services/resume-service';
import { apiClient } from '@/lib/api-client';
import { saveResumeData, loadResumeData, clearResumeData } from '@/lib/resume-storage';
import { jsPDF } from 'jspdf';

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
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    planName?: string;
    remaining: number;
    monthlyLimit: number;
    usageCount: number;
  } | null>(null);

  const showPaymentModalSafely = () => {
    if (authLoading) return;
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    setShowPaymentModal(true);
  };

  const handleSelectPlan = async (planId: string) => {
    if (authLoading) return;
    
    if (!user) {
      setShowLoginModal(true);
      setPurchasedPlan(planId);
      return;
    }

    setCheckoutLoading(planId);
    try {
      const { data, error } = await apiClient.createCheckoutSession(planId);
      if (error) {
        if (error.message?.includes('Unauthorized') || error.message?.includes('401') || error.code === '401') {
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
        window.location.href = data.checkoutUrl;
      } else {
        toast.error('No checkout URL returned');
      }
    } catch (err: any) {
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

  const loadPersistedData = () => {
    try {
      const savedData = loadResumeData();
      if (savedData.extractedText || savedData.customizedResume) {
        const sanitize = (s: string) => s ? s.replace(/<\/?[^>]+(>|$)/g, '') : '';
        const looksLikeError = (s: string) => /cloudflare|utm_source=error_100x|worker threw exception/i.test(s);
        const sanitizedExtracted = sanitize(savedData.extractedText);
        const sanitizedCustomized = sanitize(savedData.customizedResume);
        setExtractedText(sanitizedExtracted);
        setResumeTitle(savedData.resumeTitle);
        setJobDescription(savedData.jobDescription);
        if (sanitizedCustomized && !looksLikeError(savedData.customizedResume)) {
          setCustomizedResume(sanitizedCustomized);
        } else {
          setCustomizedResume('');
        }
        setResumeProcessed(savedData.resumeProcessed);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading persisted data:', error);
      return false;
    }
  };

  useEffect(() => {
    const onboardingFile = sessionStorage.getItem('onboarding_resume_file');
    const onboardingJob = sessionStorage.getItem('onboarding_job_description');
    const onboardingText = sessionStorage.getItem('onboarding_resume_text');

    if (onboardingText && onboardingJob) {
      // Prioritize onboarding data
      const newData = {
        extractedText: onboardingText,
        jobDescription: onboardingJob,
        resumeTitle: onboardingFile ? onboardingFile.replace(/\.[^/.]+$/, '') : '',
        resumeFileName: onboardingFile || '',
      };
      
      saveResumeData(newData);
      
      // Clear storage
      sessionStorage.removeItem('onboarding_resume_file');
      sessionStorage.removeItem('onboarding_job_description');
      sessionStorage.removeItem('onboarding_resume_text');
    }
    
    loadPersistedData();
  }, []);

  useEffect(() => {
    async function checkSubscription() {
      if (!user) {
        setHasSubscription(false);
        setSubscriptionInfo(null);
        return;
      }

      loadPersistedData();

      try {
        const { data, error } = await apiClient.getSubscriptionUsage();
        if (!error && data) {
          const hasCredits = data.hasSubscription && data.remaining > 0;
          setHasSubscription(hasCredits);
          setSubscriptionInfo({
            planName: data.planName,
            remaining: data.remaining,
            monthlyLimit: data.monthlyLimit,
            usageCount: data.usageCount,
          });
        } else {
          setSubscriptionInfo(null);
        }
      } catch (error) {
        console.error('Failed to check subscription:', error);
        setSubscriptionInfo(null);
      }
    }

    checkSubscription();
  }, [user]);

  useEffect(() => {
    const payment = searchParams.get('payment');
    const plan = searchParams.get('plan');
    
    if (payment === 'success' && plan) {
      setPaymentSuccess(true);
      setPurchasedPlan(plan);
      
      const savedData = loadResumeData();
      const dataLoaded = !!(savedData.extractedText || savedData.customizedResume);
      
      if (dataLoaded) {
        setExtractedText(savedData.extractedText);
        setResumeTitle(savedData.resumeTitle);
        setJobDescription(savedData.jobDescription);
        setCustomizedResume(savedData.customizedResume);
        setResumeProcessed(savedData.resumeProcessed);
      }
      
      const confirmAndDownload = async () => {
        if (!user) {
          toast.error('Please log in to complete your purchase');
          return;
        }
        
        try {
          const { data: confirmData, error: confirmError } = await apiClient.confirmPayment(plan);
          
          if (!confirmError && confirmData) {
            toast.success(`${confirmData.plan.name} plan activated! You have ${confirmData.plan.monthlyLimit} resume credits.`);
            setHasSubscription(true);
            setSubscriptionInfo({
              planName: confirmData.plan.name,
              remaining: confirmData.plan.monthlyLimit,
              monthlyLimit: confirmData.plan.monthlyLimit,
              usageCount: 0,
            });
          }
          
          const { data } = await apiClient.getSubscriptionUsage();
          if (data) {
            const hasCredits = data.hasSubscription && data.remaining > 0;
            setHasSubscription(hasCredits);
            setSubscriptionInfo({
              planName: data.planName,
              remaining: data.remaining,
              monthlyLimit: data.monthlyLimit,
              usageCount: data.usageCount,
            });
            
            if (hasCredits && savedData.customizedResume) {
              if (!customizedResume) {
                setCustomizedResume(savedData.customizedResume);
              }
              if (!resumeTitle && savedData.resumeTitle) {
                setResumeTitle(savedData.resumeTitle);
              }
              const consumeThenDownload = async () => {
                const { data: consumeData, error: consumeError } = await apiClient.consumeCredit();
                if (consumeError) {
                  toast.error(consumeError.message || 'Failed to use a credit');
                  return;
                }
                if (consumeData) {
                  setSubscriptionInfo({
                    planName: consumeData.planName,
                    remaining: (consumeData.remaining ?? data.remaining) as number,
                    monthlyLimit: consumeData.monthlyLimit,
                    usageCount: consumeData.usageCount,
                  });
                }
                downloadResumeFile();
              };
              setTimeout(() => {
                consumeThenDownload();
              }, 100);
            }
          }
        } catch (error) {
          console.error('Error confirming payment:', error);
        }
      };
      
      confirmAndDownload();
      
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
        const result = await extractResumeText(file);
        const text = result.extractedText || result.text || '';
        setExtractedText(text);
        
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

  const canProcess = extractedText && jobDescription.trim().length >= 50;

  const handleProcessResume = async () => {
    if (authLoading) return;
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }

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
      const { data, error } = await apiClient.processResume(extractedText, jobDescription);
      
      if (error) {
        throw new Error(error.message || 'AI processing failed');
      }

      if (!data?.result?.customizedResume) {
        throw new Error('No result returned from AI service');
      }

      const formattedResume = `${data.result.customizedResume}

---
📊 Processing Details:
• Provider: ${data.provider}
• ATS Score: ${data.result.atsScore || 'N/A'}/100
• Processing Time: ${(data.result.processingTime / 1000).toFixed(1)}s
• Keywords Matched: ${data.result.keywordsMatched.length > 0 ? data.result.keywordsMatched.join(', ') : 'See above'}

💡 Suggestions:
${data.result.suggestions.map((s: string) => `• ${s}`).join('\n')}
`;
      
      setCustomizedResume(formattedResume);
      setResumeProcessed(true);
      
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
    if (authLoading) return;
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (paymentSuccess) {
      const { data, error } = await apiClient.consumeCredit();
      if (error) {
        toast.error(error.message || 'Failed to use a credit');
        return;
      }
      if (data) {
        setHasSubscription(true);
        setSubscriptionInfo({
          planName: data.planName,
          remaining: (data.remaining ?? subscriptionInfo?.remaining ?? 0) as number,
          monthlyLimit: data.monthlyLimit,
          usageCount: data.usageCount,
        });
      }
      downloadResumeFile();
      return;
    }

    if (hasSubscription && subscriptionInfo && subscriptionInfo.remaining > 0) {
      const { data, error } = await apiClient.consumeCredit();
      if (error) {
        toast.error(error.message || 'Failed to use a credit');
        return;
      }
      if (data) {
        setSubscriptionInfo({
          planName: data.planName,
          remaining: (data.remaining ?? subscriptionInfo.remaining) as number,
          monthlyLimit: data.monthlyLimit,
          usageCount: data.usageCount,
        });
      }
      downloadResumeFile();
      return;
    }

    try {
      const { data, error } = await apiClient.getSubscriptionUsage();
      
      if (error) {
        toast.error('Failed to verify subscription. Please try again.');
        return;
      }
      
      if (!data) {
        showPaymentModalSafely();
        return;
      }
      
      setSubscriptionInfo({
        planName: data.planName,
        remaining: data.remaining,
        monthlyLimit: data.monthlyLimit,
        usageCount: data.usageCount,
      });
      
      if (!data.hasSubscription) {
        showPaymentModalSafely();
        return;
      }
      
      if (data.remaining <= 0) {
        toast.error(`You've used all ${data.monthlyLimit} resume credits. Please upgrade to continue.`);
        showPaymentModalSafely();
        return;
      }
      
      setHasSubscription(true);
      const { data: consumeData, error: consumeError } = await apiClient.consumeCredit();
      if (consumeError) {
        toast.error(consumeError.message || 'Failed to use a credit');
        return;
      }
      if (consumeData) {
        setSubscriptionInfo({
          planName: consumeData.planName,
          remaining: (consumeData.remaining ?? data.remaining) as number,
          monthlyLimit: consumeData.monthlyLimit,
          usageCount: consumeData.usageCount,
        });
      }
      downloadResumeFile();
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast.error('Failed to verify subscription. Please try again.');
    }
  };

  const parseMarkdownToPlainText = (markdown: string): string => {
    let text = markdown;
    text = text.replace(/<!DOCTYPE[^>]*>/gi, '');
    text = text.replace(/<!--[\s\S]*?-->/g, '');
    text = text.replace(/<\/?[^>]+(>|$)/g, '');
    text = text.replace(/^.*cdn-cgi\/styles\/cf\.errors\.css.*$/gmi, '');
    text = text.replace(/^.*Worker threw exception.*$/gmi, '');
    text = text.replace(/^#{1,6}\s+(.+)$/gm, '$1');
    text = text.replace(/\*\*(.+?)\*\*/g, '$1');
    text = text.replace(/__(.+?)__/g, '$1');
    text = text.replace(/\*(.+?)\*/g, '$1');
    text = text.replace(/_(.+?)_/g, '$1');
    text = text.replace(/`(.+?)`/g, '$1');
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    text = text.replace(/^[-*]{3,}$/gm, '');
    text = text.replace(/^[\s]*[-*+]\s+/gm, '• ');
    text = text.replace(/^\d+\.\s+/gm, '');
    text = text.replace(/```[\s\S]*?```/g, '');
    text = text.replace(/^>\s+(.+)$/gm, '$1');
    text = text.replace(/\n{3,}/g, '\n\n');
    return text.trim();
  };

  const downloadResumeFile = () => {
    let resumeContent = customizedResume;
    let resumeTitleToUse = resumeTitle;
    
    if (!resumeContent) {
      const savedData = loadResumeData();
      resumeContent = savedData.customizedResume;
      resumeTitleToUse = savedData.resumeTitle;
    }
    
    if (!resumeContent) {
      toast.error('No resume to download');
      return;
    }

    try {
      const parsedContent = parseMarkdownToPlainText(resumeContent);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const margin = 20;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;
      const lineHeight = 7;
      const fontSize = 11;

      const addWrappedText = (text: string, fs: number, isBold: boolean = false, indent: number = 0) => {
        pdf.setFontSize(fs);
        pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
        const lines = pdf.splitTextToSize(text, maxWidth - indent);
        
        if (yPosition + (lines.length * lineHeight) > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        
        lines.forEach((line: string) => {
          pdf.text(line, margin + indent, yPosition);
          yPosition += lineHeight;
        });
      };

      const lines = parsedContent.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (!line) {
          yPosition += lineHeight * 0.5;
          continue;
        }

        if (yPosition > pageHeight - margin - lineHeight) {
          pdf.addPage();
          yPosition = margin;
        }

        const isHeader = /^(EXPERIENCE|EDUCATION|SKILLS|SUMMARY|OBJECTIVE|WORK EXPERIENCE|PROFESSIONAL|PROJECTS|CERTIFICATIONS|AWARDS|PROCESSING DETAILS|SUGGESTIONS)/i.test(line) ||
                         /^---/.test(line) ||
                         (line.length < 50 && line === line.toUpperCase() && !line.includes('•'));

        if (/^---+/.test(line)) {
          yPosition += lineHeight;
          continue;
        }

        if (isHeader && !line.startsWith('•') && !line.startsWith('-') && !line.startsWith('*')) {
          yPosition += lineHeight * 0.5;
          addWrappedText(line, fontSize + 2, true);
          yPosition += lineHeight * 0.3;
          continue;
        }

        if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          const bulletText = line.replace(/^[•\-\*]\s*/, '');
          addWrappedText(`• ${bulletText}`, fontSize, false, 5);
          continue;
        }

        if (/^[📊💡🎯✅]/.test(line)) {
          yPosition += lineHeight * 0.5;
          addWrappedText(line, fontSize, true);
          continue;
        }

        addWrappedText(line, fontSize);
      }

      const fileName = `${resumeTitleToUse || 'resume'}_optimized.pdf`;
      pdf.save(fileName);
      toast.success('Resume downloaded as PDF!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Downloading as text file instead.');
      const fallbackText = parseMarkdownToPlainText(resumeContent);
      const blob = new Blob([fallbackText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeTitleToUse || 'resume'}_optimized.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleLoginSuccess = async () => {
    setShowLoginModal(false);
    
    if (purchasedPlan) {
      setTimeout(() => {
        handleSelectPlan(purchasedPlan);
      }, 100);
      return;
    }
    
    if (extractedText && jobDescription && !customizedResume) {
      setTimeout(() => {
        handleProcessResume();
      }, 100);
      return;
    }
    
    try {
      const { data, error } = await apiClient.getSubscriptionUsage();
      
      if (error) {
        showPaymentModalSafely();
        return;
      }
      
      if (data) {
        setSubscriptionInfo({
          planName: data.planName,
          remaining: data.remaining,
          monthlyLimit: data.monthlyLimit,
          usageCount: data.usageCount,
        });
        
        if (data.hasSubscription && data.remaining > 0) {
          setHasSubscription(true);
          toast.success(`Welcome back! You have ${data.remaining} resume credits remaining.`);
          if (customizedResume) {
            downloadResumeFile();
          }
        } else if (data.hasSubscription && data.remaining <= 0) {
          toast.error(`You've used all your resume credits. Please upgrade to continue.`);
          showPaymentModalSafely();
        } else {
          showPaymentModalSafely();
        }
      } else {
        showPaymentModalSafely();
      }
    } catch (error) {
      console.error('Error in post-login subscription check:', error);
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
    <div className="relative min-h-screen overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="orb orb-pear w-[500px] h-[500px] -top-32 -right-32 opacity-20" />
      <div className="orb orb-cyan w-[400px] h-[400px] bottom-0 -left-32 opacity-15" />
      
      <div className="container mx-auto px-4 py-8 relative">
        {/* Payment Success Banner */}
        {paymentSuccess && (
          <div className="mb-6 glass-card p-4 border-green-500/30 animate-scale-in">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center mr-4">
                <CreditCard className="h-5 w-5 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-semibold text-green-400">Payment Successful!</h3>
                <p className="text-muted-foreground text-sm">
                  Your {purchasedPlan?.replace('-plan', '').replace('-', ' ')} plan is now active. 
                </p>
              </div>
              <button 
                onClick={() => setPaymentSuccess(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-pear-400/10">
              <Zap className="h-6 w-6 text-pear-400" />
            </div>
            <h1 className="font-display text-3xl font-bold">Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            {user?.email ? `Welcome, ${user.email.split('@')[0]}!` : 'Welcome!'} Upload your resume and customize it for your target job.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 md:p-8 animate-fade-in-up">
              
              {/* Show processed result */}
              {resumeProcessed ? (
                <div>
                  <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Check className="h-6 w-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-green-400 mb-1">Your Customized Resume is Ready!</h3>
                        <p className="text-muted-foreground text-sm">
                          Your resume has been optimized for ATS compatibility. Compare the versions below.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subscription Status Banner */}
                  {user && subscriptionInfo && (
                    <div className={`rounded-2xl p-4 mb-6 flex items-center justify-between ${
                      hasSubscription 
                        ? 'bg-pear-400/10 border border-pear-400/20' 
                        : 'bg-amber-500/10 border border-amber-500/20'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          hasSubscription ? 'bg-pear-400/20' : 'bg-amber-500/20'
                        }`}>
                          <CreditCard className={`h-5 w-5 ${hasSubscription ? 'text-pear-400' : 'text-amber-400'}`} />
                        </div>
                        <div>
                          <p className={`font-medium ${hasSubscription ? 'text-pear-400' : 'text-amber-400'}`}>
                            {subscriptionInfo.planName || 'Your Plan'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {hasSubscription 
                              ? `${subscriptionInfo.remaining} of ${subscriptionInfo.monthlyLimit} credits remaining`
                              : subscriptionInfo.monthlyLimit > 0 
                                ? `All ${subscriptionInfo.monthlyLimit} credits used`
                                : 'No active plan'
                            }
                          </p>
                        </div>
                      </div>
                      {!hasSubscription && (
                        <Button 
                          size="sm" 
                          onClick={showPaymentModalSafely}
                        >
                          {subscriptionInfo.monthlyLimit > 0 ? 'Upgrade' : 'Get Started'}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Resume Comparison */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg font-semibold">Resume Comparison</h3>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-white/5 text-muted-foreground text-xs rounded-full border border-white/10">Original</span>
                        <span className="px-3 py-1 bg-pear-400/10 text-pear-400 text-xs rounded-full border border-pear-400/20">Optimized</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ResumePreview
                        content={extractedText}
                        title="📄 Original Resume"
                        type="original"
                        isUnlocked={true}
                      />
                      
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
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 border-t border-white/5">
                    <Button
                      onClick={handleDownloadResume}
                      type="button"
                      size="lg"
                      className="px-8"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download My Resume
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
                  <div className="mb-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`step-indicator ${extractedText ? 'completed' : ''}`}>
                        {extractedText ? <Check className="w-5 h-5" /> : '1'}
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-semibold">Upload Your Resume</h2>
                        <p className="text-sm text-muted-foreground">PDF, Word, or image formats</p>
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
                          <p className="text-muted-foreground text-sm">Supports PDF, Word, PNG, JPG, WEBP</p>
                        </>
                      )}
                    </div>

                    {/* Show extracted text preview */}
                    {extractedText && (
                      <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-muted-foreground">
                            Extracted Content
                          </label>
                          <span className="font-mono text-xs text-pear-400">
                            {extractedText.length} chars
                          </span>
                        </div>
                        <div className="bg-surface-light rounded-xl p-4 border border-border h-40 overflow-y-auto scrollbar-custom">
                          <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-mono">{extractedText}</pre>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 2: Job Description */}
                  <div className="mb-10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`step-indicator ${jobDescription.length >= 50 ? 'completed' : ''}`}>
                        {jobDescription.length >= 50 ? <Check className="w-5 h-5" /> : '2'}
                      </div>
                      <div>
                        <h2 className="font-display text-xl font-semibold">Paste Job Description</h2>
                        <p className="text-sm text-muted-foreground">The more detail, the better the match</p>
                      </div>
                    </div>

                    <div className="relative">
                      <textarea
                        value={jobDescription}
                        onChange={(e) => {
                          setJobDescription(e.target.value);
                          saveResumeData({ jobDescription: e.target.value });
                        }}
                        placeholder="Paste the full job description here. Include requirements, responsibilities, and qualifications."
                        className="w-full p-5 bg-surface-light border border-border rounded-xl h-48 focus:outline-none focus:ring-2 focus:ring-pear-400/50 focus:border-pear-400/50 resize-none text-foreground placeholder:text-muted-foreground/60 transition-all"
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

                  {/* How It Works Info Box */}
                  <div className="rounded-2xl bg-gradient-to-br from-pear-400/10 via-cyan-400/5 to-pink-400/10 border border-pear-400/20 p-6 mb-8">
                    <div className="flex items-start gap-4">
                      <div className="feature-icon flex-shrink-0">
                        <Sparkles className="h-6 w-6 text-pear-400" />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold mb-3">How Our AI Works</h3>
                        <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-pear-400 flex-shrink-0" />
                            Extracts key requirements
                          </li>
                          <li className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-pear-400 flex-shrink-0" />
                            Highlights relevant experience
                          </li>
                          <li className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-pear-400 flex-shrink-0" />
                            Optimizes for ATS systems
                          </li>
                          <li className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-pear-400 flex-shrink-0" />
                            Rewrites with impact
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="text-center">
                    <Button
                      onClick={handleProcessResume}
                      disabled={!canProcess || loading}
                      size="xl"
                      className="px-12 group"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Customize My Resume
                          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>

                    {!canProcess && (
                      <p className="text-muted-foreground text-sm mt-4">
                        {!extractedText 
                          ? 'Upload your resume to continue' 
                          : `Add ${50 - jobDescription.length} more characters to job description`
                        }
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Start Guide */}
            <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="font-display text-lg font-semibold mb-4">Quick Start</h2>

              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    extractedText ? 'bg-green-500/20' : 'bg-pear-400/10'
                  }`}>
                    <Upload className={`h-5 w-5 ${extractedText ? 'text-green-400' : 'text-pear-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">1. Upload Resume</h3>
                    <p className="text-muted-foreground text-xs">PDF, Word, or image</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    jobDescription.length >= 50 ? 'bg-green-500/20' : 'bg-pear-400/10'
                  }`}>
                    <FileText className={`h-5 w-5 ${jobDescription.length >= 50 ? 'text-green-400' : 'text-pear-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">2. Paste Job Description</h3>
                    <p className="text-muted-foreground text-xs">Target role details</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    resumeProcessed ? 'bg-green-500/20' : 'bg-pear-400/10'
                  }`}>
                    <Sparkles className={`h-5 w-5 ${resumeProcessed ? 'text-green-400' : 'text-pear-400'}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">3. Get AI-Optimized Resume</h3>
                    <p className="text-muted-foreground text-xs">Tailored for the job</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Tips Box */}
            <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                <h3 className="font-medium text-amber-400 mb-2 text-sm">💡 Pro Tip</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  For best results, paste the complete job description including requirements, responsibilities, and qualifications.
                </p>
              </div>
            </div>

            {/* Account Info Component */}
            {user && (
              <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <AccountInfo />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && user && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="glass-card max-w-4xl w-full p-8 relative max-h-[90vh] overflow-y-auto animate-scale-in">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
            
            <div className="text-center mb-8">
              <h2 className="font-display text-3xl font-bold mb-2">Choose Your Plan</h2>
              <p className="text-muted-foreground">
                Select a plan to download your customized resume
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter Plan */}
              <div className="glass-card-hover p-6 relative">
                <div className="w-12 h-12 rounded-xl bg-pear-400/10 flex items-center justify-center mb-4">
                  <Rocket className="h-6 w-6 text-pear-400" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Starter</h3>
                <div className="mb-4">
                  <span className="font-mono text-4xl font-bold text-pear-400">$9</span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">3 Custom Resumes</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">ATS Optimization</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Job Matching</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Email Support</span>
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
              <div className="glass-card p-6 relative border-pear-400/30 shadow-glow">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="px-4 py-1 bg-gradient-pear text-background text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
                <div className="w-12 h-12 rounded-xl bg-pear-400/20 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-pear-400" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Professional</h3>
                <div className="mb-4">
                  <span className="font-mono text-4xl font-bold text-pear-400">$19</span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">10 Custom Resumes</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Advanced ATS Optimization</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">AI-Powered Job Matching</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Priority Support</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">LinkedIn Tips</span>
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
              <div className="glass-card-hover p-6 relative">
                <div className="w-12 h-12 rounded-xl bg-pink-400/10 flex items-center justify-center mb-4">
                  <Crown className="h-6 w-6 text-pink-400" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">Lifetime</h3>
                <div className="mb-4">
                  <span className="font-mono text-4xl font-bold text-pink-400">$49</span>
                  <span className="text-muted-foreground"> one-time</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground font-medium">Unlimited Resumes</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">All Pro Features</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Lifetime Updates</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">VIP Support</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Early Access</span>
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

            <p className="text-center text-muted-foreground text-sm mt-8">
              🔒 Secure payment powered by Stripe
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
