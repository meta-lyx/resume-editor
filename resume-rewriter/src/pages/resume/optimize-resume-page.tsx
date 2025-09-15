import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { getResumeById, optimizeResume } from '@/services/resume-service';
import { Check, FileText, Terminal, Zap, AlertCircle, ChevronRight, Download } from 'lucide-react';

const optimizationTypes = [
  {
    id: 'ats-optimization',
    name: 'ATS Optimization',
    description: 'Optimize keywords and format to improve chances of passing screening systems',
    icon: <Terminal className="h-5 w-5" />,
  },
  {
    id: 'language-polish',
    name: 'Language Polish',
    description: 'Improve resume language quality with more professional descriptions and expressions',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'achievement-highlight',
    name: 'Achievement Highlight',
    description: 'Transform experiences into quantifiable achievements, highlighting your work value',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    id: 'job-match',
    name: 'Job Matching',
    description: 'Customize resume based on specific job descriptions to improve match rate',
    icon: <Check className="h-5 w-5" />,
  },
];

export function OptimizeResumePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [resume, setResume] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedType, setSelectedType] = useState<string>('ats-optimization');
  const [jobDescription, setJobDescription] = useState<string>('');
  const [optimizedContent, setOptimizedContent] = useState<string>('');
  const [originalContent, setOriginalContent] = useState<string>('');

  // 加载简历数据
  useEffect(() => {
    async function loadResume() {
      if (!id || !user) return;

      try {
        const resumeData = await getResumeById(id);
        setResume(resumeData);
        setOriginalContent(resumeData.original_content || '');
        setOptimizedContent(resumeData.optimized_content || '');
      } catch (error: any) {
        toast.error(error.message || 'Failed to load resume');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    loadResume();
  }, [id, user, navigate]);

  const handleOptimize = async () => {
    if (!id || !user || !originalContent) {
      toast.error('Missing required information');
      return;
    }

    if (selectedType === 'job-match' && !jobDescription) {
      toast.error('Job matching mode requires job description');
      return;
    }

    setOptimizing(true);

    try {
      const result = await optimizeResume({
        resumeId: id,
        resumeContent: originalContent,
        jobDescription: selectedType === 'job-match' ? jobDescription : undefined,
        optimizationType: selectedType,
      });

      setOptimizedContent(result.optimizedContent);
      toast.success('Resume optimization successful');
    } catch (error: any) {
      toast.error(error.message || 'Resume optimization failed');
    } finally {
      setOptimizing(false);
    }
  };

  const handleDownload = () => {
    if (!optimizedContent) {
      toast.error('No content to download');
      return;
    }

    // Create a text file and download
    const blob = new Blob([optimizedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resume?.title || 'Optimized Resume'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-6">Optimization Options</h2>

            <div className="space-y-4 mb-6">
              {optimizationTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${selectedType === type.id ? 'bg-primary/10 border border-primary/20' : 'bg-gray-50 hover:bg-gray-100 border border-transparent'}`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-full mr-3 ${selectedType === type.id ? 'bg-primary/20 text-primary' : 'bg-gray-200 text-gray-600'}`}
                    >
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="font-medium">{type.name}</h3>
                      <p className="text-gray-600 text-sm">{type.description}</p>
                    </div>
                    {selectedType === type.id && (
                      <ChevronRight className="ml-auto h-5 w-5 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedType === 'job-match' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Description
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Please paste the job description you're interested in"
                  className="w-full p-3 border border-gray-300 rounded-md h-32"
                  disabled={optimizing}
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  This will help AI optimize your resume based on specific job requirements
                </p>
              </div>
            )}

            <Button
              onClick={handleOptimize}
              disabled={optimizing}
              className="w-full"
            >
              {optimizing ? 'Optimizing...' : 'Start Optimization'}
            </Button>
          </div>
        </div>

        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">{resume?.title || 'My Resume'}</h2>
              {optimizedContent && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Result
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-3">
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                  <h3 className="font-medium">Original Resume</h3>
                </div>
                <div className="bg-gray-50 rounded-md p-4 h-[500px] overflow-y-auto border border-gray-200">
                  <pre className="whitespace-pre-wrap text-sm">{originalContent}</pre>
                </div>
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <Zap className="h-5 w-5 text-primary mr-2" />
                  <h3 className="font-medium">Optimization Result</h3>
                </div>
                {optimizedContent ? (
                  <div className="bg-primary/5 rounded-md p-4 h-[500px] overflow-y-auto border border-primary/20">
                    <pre className="whitespace-pre-wrap text-sm">{optimizedContent}</pre>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-md p-8 h-[500px] flex items-center justify-center border border-dashed border-gray-300">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No optimization results yet</h3>
                      <p className="text-gray-500">
                        Select an optimization mode and click the "Start Optimization" button
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {optimizedContent && (
              <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="font-medium text-green-800 mb-2 flex items-center">
                  <Check className="h-5 w-5 mr-2" />
                  Optimization Tips
                </h3>
                <ul className="list-disc list-inside text-green-700 text-sm space-y-2">
                  <li>Replace the optimized content in your resume</li>
                  <li>Update your LinkedIn profile to maintain consistency</li>
                  <li>Try different optimization modes to find the best results for you</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
