import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Plus, Upload, FileText, AlertCircle } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { uploadResumeFile, createResume } from '@/services/resume-service';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [resumeTitle, setResumeTitle] = useState<string>('');

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
      setResumeTitle(file.name.replace(/\.[^/.]+$/, ''));
      setLoading(true);

      try {
        if (!user) {
          throw new Error('Please login first');
        }

        const result = await uploadResumeFile(file, user.id);
        setExtractedText(result.extractedText);
        toast.success('File uploaded and parsed successfully');
      } catch (error: any) {
        toast.error(error.message || 'File upload failed');
        console.error('File upload error:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleContinue = async () => {
    if (!extractedText || !resumeTitle) {
      toast.error('Please upload resume file first');
      return;
    }

    setLoading(true);
    try {
      if (!user) {
        throw new Error('请先登录');
      }

      const resume = await createResume({
        userId: user.id,
        title: resumeTitle,
        originalContent: extractedText,
      });

      toast.success('Resume created successfully');
      navigate(`/optimize/${resume.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Resume creation failed');
      console.error('Resume creation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleManualCreate = () => {
    navigate('/create-resume');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Upload Your Resume</h2>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-primary/5'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-primary">Drop files here...</p>
              ) : (
                <>
                  <p className="text-gray-600 mb-2">Drag and drop files here, or click to select files</p>
                  <p className="text-gray-500 text-sm">Supports PDF and Word documents</p>
                </>
              )}
            </div>

            {extractedText && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <label htmlFor="resume-title" className="block text-sm font-medium text-gray-700">
                    Resume Title
                  </label>
                </div>
                <input
                  type="text"
                  id="resume-title"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                  placeholder="Enter resume title"
                />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extracted Resume Content
                  </label>
                  <div className="bg-gray-50 rounded-md p-4 border border-gray-200 h-64 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm">{extractedText}</pre>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleContinue}
                    disabled={loading || !extractedText}
                    className="w-full md:w-auto"
                  >
                    {loading ? 'Processing...' : 'Continue Optimizing Resume'}
                  </Button>
                </div>
              </div>
            )}

            {!extractedText && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleManualCreate}
                  className="w-full md:w-auto"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Resume Manually
                </Button>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold mb-4">Quick Start</h2>

            <ul className="space-y-4">
              <li className="flex">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <Upload className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Upload Your Resume</h3>
                  <p className="text-gray-600 text-sm">Supports PDF and Word formats</p>
                </div>
              </li>
              <li className="flex">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Choose Optimization Mode</h3>
                  <p className="text-gray-600 text-sm">ATS optimization, job matching, and other modes</p>
                </div>
              </li>
              <li className="flex">
                <div className="bg-primary/10 p-2 rounded-full mr-3">
                  <AlertCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Get Optimization Results</h3>
                  <p className="text-gray-600 text-sm">Analysis suggestions and optimized resume content</p>
                </div>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <h3 className="font-medium text-blue-800 mb-2">Quick Tip</h3>
              <p className="text-blue-700 text-sm">
                After updating your resume, remember to also update your LinkedIn profile to maintain a consistent professional image.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
