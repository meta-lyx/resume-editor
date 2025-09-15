import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Check, FileText, Terminal, Zap, AlertCircle, ArrowRight, Upload, Download } from 'lucide-react';

export function FeaturesPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-6">ResumeOptimizer Pro Features</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Explore our AI-powered resume optimization tools to help you stand out in a competitive job market.
        </p>
      </div>

      {/* Core features section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
            <Terminal className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">ATS Optimization</h2>
          <p className="text-gray-600 mb-6">
            Our AI technology analyzes your resume to ensure it passes through Applicant Tracking Systems (ATS). We optimize keyword distribution and formatting to increase the chances of your resume being read.
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Keyword optimization and distribution</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Resume format standardization</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Improved resume readability</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
            <FileText className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Job Matching</h2>
          <p className="text-gray-600 mb-6">
            Tailor your resume to specific job descriptions. Our AI analyzes job requirements and highlights your most relevant skills and experience to improve matching.
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Job requirement analysis</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Skills and experience highlighting</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Customized resume content</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
            <Zap className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Achievement Quantification</h2>
          <p className="text-gray-600 mb-6">
            Transform abstract experiences into concrete, measurable achievements. Our AI helps you add data and metrics to showcase your work value and impact.
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Quantified achievement expressions</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Powerful action verb usage</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Work value demonstration</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
            <AlertCircle className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Language Polishing</h2>
          <p className="text-gray-600 mb-6">
            Enhance your resume's language quality with more professional and persuasive descriptions and expressions. Our AI optimizes every sentence to make it more impactful.
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Professional vocabulary optimization</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Expression enhancement</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Clear and concise language style</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
            <Upload className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">LinkedIn Integration</h2>
          <p className="text-gray-600 mb-6">
            Transform your optimized resume content into a powerful LinkedIn profile. Ensure your online presence aligns with your resume for a unified professional brand.
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Profile content optimization</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Skills and background section improvement</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Unified professional brand image</span>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="bg-primary/10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-6">
            <Download className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Expert Templates</h2>
          <p className="text-gray-600 mb-6">
            Access resume templates designed by industry experts, suitable for different industries and job levels. All templates are ATS-tested and optimized.
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Industry-specific templates</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>Professional HR design and validation</span>
            </li>
            <li className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span>ATS-friendly formats</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Workflow section */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Optimize Your Resume in Three Simple Steps</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform is designed to be simple and intuitive, requiring just a few easy steps to get a professionally optimized resume.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 relative">
            <div className="absolute -top-4 -left-4 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
              1
            </div>
            <div className="text-center mb-6">
              <Upload className="h-16 w-16 text-primary mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">Upload Resume</h3>
            <p className="text-gray-600 text-center">
              Simply upload your current resume (PDF or Word format), or directly input your resume content.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 relative">
            <div className="absolute -top-4 -left-4 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
              2
            </div>
            <div className="text-center mb-6">
              <Terminal className="h-16 w-16 text-primary mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">Select Optimization Mode</h3>
            <p className="text-gray-600 text-center">
              Choose the optimization mode that suits your needs, such as ATS optimization, job matching, or language polishing.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200 relative">
            <div className="absolute -top-4 -left-4 bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold">
              3
            </div>
            <div className="text-center mb-6">
              <Download className="h-16 w-16 text-primary mx-auto" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-center">Get Optimization Results</h3>
            <p className="text-gray-600 text-center">
              Receive AI-optimized resume content in seconds, ready to download or copy for immediate use.
            </p>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center bg-primary/5 py-16 px-4 rounded-2xl border border-primary/10">
        <h2 className="text-3xl font-bold mb-6">Ready to Enhance Your Resume?</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Start using our AI-powered resume optimization tool today and boost your job search competitiveness.
        </p>
        {user ? (
          <Link to="/dashboard">
            <Button size="lg" className="px-8">
              Start Optimizing <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Link to="/login">
            <Button size="lg" className="px-8">
              Try for Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
