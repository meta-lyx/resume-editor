import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { FileText, CheckCircle, Award, Sparkles, ArrowRight } from 'lucide-react';

export function HomePage() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                Build Your <span className="text-primary">LinkedIn Personal Brand</span> with AI
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                AI-powered assistant based on professional resume writing principles to optimize your resume and boost your career competitiveness.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button size="lg">
                      Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/">
                    <Button size="lg">
                      Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Link to="/features">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-lg shadow-xl p-6 border border-gray-200 relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="ml-3 font-medium">Before</h3>
                  </div>
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">Original Resume</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg mb-8 text-sm">
                  <p className="mb-2">John Smith | Frontend Developer</p>
                  <p className="mb-2">Work Experience:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Responsible for frontend development of company website</li>
                    <li>Participated in multiple frontend projects</li>
                    <li>Worked with React and Vue frameworks</li>
                  </ul>
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Sparkles className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="ml-3 font-medium">After</h3>
                  </div>
                  <div className="bg-green-100 px-3 py-1 rounded-full text-sm text-green-700">AI Optimized</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-sm border border-green-100">
                  <p className="mb-2 font-medium">John Smith | Senior Frontend Engineer</p>
                  <p className="mb-2">Work Experience:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Led frontend architecture and development for company website, improving load speed by 40%</li>
                    <li>Spearheaded development of 5 enterprise applications, increasing team productivity by 30%</li>
                    <li>Engineered scalable component libraries using React and Vue, adopted by three departments</li>
                  </ul>
                </div>
              </div>
              <div className="absolute top-1/2 right-4 transform translate-x-1/2 -translate-y-1/2 bg-green-100 rounded-full p-4 border-4 border-white shadow-lg hidden lg:block">
                <div className="bg-white rounded-full p-3">
                  <Sparkles className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Professional Resume Optimization Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer multiple professional resume optimization features to help you stand out in your job search.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">ATS Optimization</h3>
              <p className="text-gray-600">
                Intelligent analysis of job descriptions to optimize keyword distribution and ensure your resume passes through applicant tracking systems.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Job Matching</h3>
              <p className="text-gray-600">
                Tailor your resume to specific job descriptions, highlighting relevant skills and experience to increase your success rate.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Language Polishing</h3>
              <p className="text-gray-600">
                Enhance your resume with professional, powerful vocabulary and expressions to make a lasting impression on recruiters.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Achievement Quantification</h3>
              <p className="text-gray-600">
                Transform abstract descriptions into concrete, measurable achievements using data and numbers to showcase your value.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">LinkedIn Integration</h3>
              <p className="text-gray-600">
                Seamlessly integrate your optimized resume content with your LinkedIn profile to create a consistent professional image.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Industry Expert Templates</h3>
              <p className="text-gray-600">
                Access resume templates designed by experienced HR professionals and recruiters across various industries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Real User Feedback</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our users are saying after using our AI resume optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center text-blue-700 font-bold">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Michael Wang</h4>
                  <p className="text-gray-600 text-sm">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-700">
                "After using this tool, my resume pass rate increased by 40%. The AI not only helped optimize my language but also highlighted key skills relevant to the positions I was applying for. Excellent!"
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center text-green-700 font-bold">
                  L
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">Lisa Chen</h4>
                  <p className="text-gray-600 text-sm">Marketing Manager</p>
                </div>
              </div>
              <p className="text-gray-700">
                "I always struggled with quantifying my achievements in my resume. This tool solved that problem for me. My rewritten resume is much more powerful, and I received multiple interview invitations within two weeks."
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center text-purple-700 font-bold">
                  J
                </div>
                <div className="ml-4">
                  <h4 className="font-bold">James Zhang</h4>
                  <p className="text-gray-600 text-sm">Product Manager</p>
                </div>
              </div>
              <p className="text-gray-700">
                "I've tried many resume tools, and this is the best. It not only provides ATS optimization but can also customize resumes for specific positions. It took my resume to a completely new level."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Enhance Your Resume?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start using our AI-powered resume optimization tool today and experience professional resume transformation.
          </p>
          {user ? (
            <Link to="/dashboard">
              <Button size="lg" className="px-8">
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button size="lg" className="px-8">
                Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
