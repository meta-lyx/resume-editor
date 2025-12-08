import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Sparkles, ArrowRight } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';

export function OnboardingPage() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState(false);

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
      
      // Simulate text extraction (you'll replace this with actual extraction)
      setLoading(true);
      try {
        // For now, just show a placeholder
        // In production, you'd call your extraction service
        const reader = new FileReader();
        reader.onload = (e) => {
          setExtractedText(`Resume file uploaded: ${file.name}\n\nContent will be extracted when you proceed to payment.`);
          setLoading(false);
        };
        reader.readAsText(file);
        toast.success('Resume file uploaded successfully');
      } catch (error) {
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

    // Store data in sessionStorage to access on payment page
    sessionStorage.setItem('onboarding_resume_file', resumeFile.name);
    sessionStorage.setItem('onboarding_job_description', jobDescription);
    sessionStorage.setItem('onboarding_resume_text', extractedText);

    // Navigate to payment page
    navigate('/pricing?onboarding=true');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Transform Your Resume with AI</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your resume and paste the job description you're targeting. Our AI will customize your resume to maximize your chances of getting hired.
          </p>
        </div>

        {/* Main Form */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
            {/* Step 1: Upload Resume */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  1
                </div>
                <h2 className="text-2xl font-bold">Upload Your Resume</h2>
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
                  </div>
                ) : isDragActive ? (
                  <p className="text-primary">Drop your resume here...</p>
                ) : (
                  <>
                    <p className="text-gray-600 mb-2">Drag and drop your resume, or click to browse</p>
                    <p className="text-gray-500 text-sm">Supports PDF and Word documents</p>
                  </>
                )}
              </div>
            </div>

            {/* Step 2: Job Description */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
                  2
                </div>
                <h2 className="text-2xl font-bold">Paste Job Description</h2>
              </div>

              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the full job description here. Include requirements, responsibilities, and qualifications. The more detail you provide, the better we can tailor your resume."
                className="w-full p-4 border border-gray-300 rounded-lg h-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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

            {/* Why This Works Section */}
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
                onClick={handleCustomizeResume}
                disabled={!canProceed || loading}
                size="lg"
                className="px-12 py-6 text-lg"
              >
                {loading ? (
                  'Processing...'
                ) : (
                  <>
                    Customize My Resume
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>

            {!canProceed && (
              <p className="text-center text-gray-500 text-sm mt-4">
                Complete both steps above to continue
              </p>
            )}
          </div>

          {/* Trust Indicators */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <FileText className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-2">No Account Required</h3>
                <p className="text-gray-600 text-sm">
                  Upload and customize first. Create an account only when you're ready to pay.
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="font-bold mb-2">AI-Powered</h3>
                <p className="text-gray-600 text-sm">
                  Advanced AI analyzes both your resume and target job for perfect matching.
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="font-bold mb-2">Secure & Private</h3>
                <p className="text-gray-600 text-sm">
                  Your data is encrypted and never shared. Delete anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

