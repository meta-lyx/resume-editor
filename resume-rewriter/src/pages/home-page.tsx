import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { FileText, CheckCircle, Award, Sparkles, ArrowRight, Target, BarChart3, Users } from 'lucide-react';

export function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: CheckCircle,
      title: "ATS Optimization",
      description: "Intelligent analysis of job descriptions to optimize keyword distribution and ensure your resume passes through applicant tracking systems.",
    },
    {
      icon: Target,
      title: "Job Matching",
      description: "Tailor your resume to specific job descriptions, highlighting relevant skills and experience to increase your success rate.",
    },
    {
      icon: Sparkles,
      title: "Language Polishing",
      description: "Enhance your resume with professional, powerful vocabulary and expressions to make a lasting impression on recruiters.",
    },
    {
      icon: BarChart3,
      title: "Achievement Quantification",
      description: "Transform abstract descriptions into concrete, measurable achievements using data and numbers to showcase your value.",
    },
    {
      icon: FileText,
      title: "LinkedIn Integration",
      description: "Seamlessly integrate your optimized resume content with your LinkedIn profile to create a consistent professional image.",
    },
    {
      icon: Award,
      title: "Expert Templates",
      description: "Access resume templates designed by experienced HR professionals and recruiters across various industries.",
    },
  ];

  const testimonials = [
    {
      name: "Michael Wang",
      role: "Software Engineer",
      initial: "M",
      quote: "After using this tool, my resume pass rate increased by 40%. The AI not only helped optimize my language but also highlighted key skills relevant to the positions I was applying for.",
    },
    {
      name: "Lisa Chen",
      role: "Marketing Manager",
      initial: "L",
      quote: "I always struggled with quantifying my achievements. This tool solved that problem. My rewritten resume is much more powerful, and I received multiple interview invitations within two weeks.",
    },
    {
      name: "James Zhang",
      role: "Product Manager",
      initial: "J",
      quote: "I've tried many resume tools, and this is the best. It not only provides ATS optimization but can also customize resumes for specific positions. Completely transformed my resume.",
    },
  ];

  return (
    <div className="relative">
      {/* Hero section */}
      <section className="relative py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Resume Optimization
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-6">
                Build Your <span className="text-primary">Professional Brand</span> with AI
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                AI-powered assistant based on professional resume writing principles to optimize your resume and boost your career competitiveness.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button size="lg" className="group">
                      Go to Dashboard 
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/">
                    <Button size="lg" className="group">
                      Get Started Free 
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
            
            {/* Before/After Card */}
            <div className="relative">
              <div className="border border-border rounded-xl bg-card p-6">
                {/* Before */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Before</span>
                  </div>
                  <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded">Original</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 mb-6 text-sm">
                  <p className="font-medium mb-2">John Smith | Frontend Developer</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground text-xs">
                    <li>Responsible for frontend development</li>
                    <li>Participated in multiple frontend projects</li>
                    <li>Worked with React and Vue frameworks</li>
                  </ul>
                </div>
                
                {/* After */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">After</span>
                  </div>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded border border-primary/20">AI Optimized</span>
                </div>
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/10 text-sm">
                  <p className="font-medium mb-2">John Smith | Senior Frontend Engineer</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground text-xs">
                    <li>Led frontend architecture, improving load speed by 40%</li>
                    <li>Spearheaded 5 enterprise apps, increasing productivity 30%</li>
                    <li>Engineered scalable component libraries using React/Vue</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key features */}
      <section className="relative py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Professional Resume Features
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              We offer multiple professional resume optimization features to help you stand out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div 
                key={feature.title}
                className="border border-border rounded-xl p-5 bg-card hover:border-primary/30 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10 w-fit mb-4">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-muted-foreground text-sm font-medium mb-4">
              <Users className="w-4 h-4" />
              Real User Feedback
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              What Our Users Say
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              See what our users are saying after using our AI resume optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div 
                key={testimonial.name}
                className="border border-border rounded-xl p-5 bg-card"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-semibold text-primary">
                    {testimonial.initial}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{testimonial.name}</h4>
                    <p className="text-muted-foreground text-xs">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="relative py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="border border-border rounded-xl bg-card p-10 md:p-14 text-center">
            <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Ready to Enhance Your Resume?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Start using our AI-powered resume optimization tool today and experience professional resume transformation.
            </p>
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="group">
                  Go to Dashboard 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <Link to="/">
                <Button size="lg" className="group">
                  Get Started Free 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
