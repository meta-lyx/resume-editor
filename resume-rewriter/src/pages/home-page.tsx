import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { FileText, CheckCircle, Award, Sparkles, ArrowRight, Zap, Target, BarChart3, Users } from 'lucide-react';

export function HomePage() {
  const { user } = useAuth();

  const features = [
    {
      icon: CheckCircle,
      title: "ATS Optimization",
      description: "Intelligent analysis of job descriptions to optimize keyword distribution and ensure your resume passes through applicant tracking systems.",
      color: "pear",
    },
    {
      icon: Target,
      title: "Job Matching",
      description: "Tailor your resume to specific job descriptions, highlighting relevant skills and experience to increase your success rate.",
      color: "cyan",
    },
    {
      icon: Sparkles,
      title: "Language Polishing",
      description: "Enhance your resume with professional, powerful vocabulary and expressions to make a lasting impression on recruiters.",
      color: "pink",
    },
    {
      icon: BarChart3,
      title: "Achievement Quantification",
      description: "Transform abstract descriptions into concrete, measurable achievements using data and numbers to showcase your value.",
      color: "pear",
    },
    {
      icon: FileText,
      title: "LinkedIn Integration",
      description: "Seamlessly integrate your optimized resume content with your LinkedIn profile to create a consistent professional image.",
      color: "cyan",
    },
    {
      icon: Award,
      title: "Expert Templates",
      description: "Access resume templates designed by experienced HR professionals and recruiters across various industries.",
      color: "pink",
    },
  ];

  const testimonials = [
    {
      name: "Michael Wang",
      role: "Software Engineer",
      initial: "M",
      color: "pear",
      quote: "After using this tool, my resume pass rate increased by 40%. The AI not only helped optimize my language but also highlighted key skills relevant to the positions I was applying for.",
    },
    {
      name: "Lisa Chen",
      role: "Marketing Manager",
      initial: "L",
      color: "cyan",
      quote: "I always struggled with quantifying my achievements. This tool solved that problem. My rewritten resume is much more powerful, and I received multiple interview invitations within two weeks.",
    },
    {
      name: "James Zhang",
      role: "Product Manager",
      initial: "J",
      color: "pink",
      quote: "I've tried many resume tools, and this is the best. It not only provides ATS optimization but can also customize resumes for specific positions. Completely transformed my resume.",
    },
  ];

  const getIconColor = (color: string) => {
    switch (color) {
      case 'pear': return 'text-pear-400';
      case 'cyan': return 'text-cyan-400';
      case 'pink': return 'text-pink-400';
      default: return 'text-pear-400';
    }
  };

  const getIconBg = (color: string) => {
    switch (color) {
      case 'pear': return 'bg-pear-400/10';
      case 'cyan': return 'bg-cyan-400/10';
      case 'pink': return 'bg-pink-400/10';
      default: return 'bg-pear-400/10';
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Hero section */}
      <section className="relative py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pear-400/10 border border-pear-400/20 text-pear-400 text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                AI-Powered Resume Optimization
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Build Your{' '}
                <span className="gradient-text">Professional Brand</span>{' '}
                with AI
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                AI-powered assistant based on professional resume writing principles to optimize your resume and boost your career competitiveness.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <Link to="/dashboard">
                    <Button size="xl" className="px-8 group">
                      Go to Dashboard 
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/">
                    <Button size="xl" className="px-8 group">
                      Get Started Free 
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                )}
                <Link to="/features">
                  <Button variant="outline" size="xl" className="px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Before/After Card */}
            <div className="relative animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="glass-card p-6 relative z-10">
                {/* Before */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">Before</span>
                  </div>
                  <span className="px-3 py-1 bg-muted text-muted-foreground text-xs rounded-full">Original</span>
                </div>
                <div className="bg-surface-light rounded-xl p-4 mb-6 text-sm">
                  <p className="font-medium mb-2">John Smith | Frontend Developer</p>
                  <p className="text-muted-foreground mb-2">Work Experience:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground text-xs">
                    <li>Responsible for frontend development</li>
                    <li>Participated in multiple frontend projects</li>
                    <li>Worked with React and Vue frameworks</li>
                  </ul>
                </div>
                
                {/* After */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pear-400/10 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-pear-400" />
                    </div>
                    <span className="font-medium">After</span>
                  </div>
                  <span className="px-3 py-1 bg-pear-400/10 text-pear-400 text-xs rounded-full border border-pear-400/20">AI Optimized</span>
                </div>
                <div className="bg-pear-400/5 rounded-xl p-4 border border-pear-400/20 text-sm">
                  <p className="font-medium mb-2 text-foreground">John Smith | Senior Frontend Engineer</p>
                  <p className="text-muted-foreground mb-2">Work Experience:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground text-xs">
                    <li>Led frontend architecture, improving load speed by 40%</li>
                    <li>Spearheaded 5 enterprise apps, increasing productivity 30%</li>
                    <li>Engineered scalable component libraries using React/Vue</li>
                  </ul>
                </div>
              </div>
              
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-pear-400/10 border border-pear-400/20 flex items-center justify-center animate-float hidden lg:flex">
                <Sparkles className="h-10 w-10 text-pear-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key features */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Professional Resume Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We offer multiple professional resume optimization features to help you stand out.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={feature.title}
                className="glass-card-hover p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${getIconBg(feature.color)} p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4`}>
                  <feature.icon className={`h-6 w-6 ${getIconColor(feature.color)}`} />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-sm font-medium mb-6">
              <Users className="w-4 h-4" />
              Real User Feedback
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our users are saying after using our AI resume optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.name}
                className="glass-card p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl ${getIconBg(testimonial.color)} flex items-center justify-center font-display font-bold ${getIconColor(testimonial.color)}`}>
                    {testimonial.initial}
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-muted-foreground text-sm">{testimonial.role}</p>
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
      <section className="relative py-20">
        <div className="container mx-auto px-4">
          <div className="glass-card p-12 md:p-16 text-center relative overflow-hidden animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-br from-pear-400/10 via-transparent to-cyan-400/10" />
            
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-pear-400/10 border border-pear-400/20 flex items-center justify-center mx-auto mb-8">
                <Sparkles className="h-10 w-10 text-pear-400" />
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to Enhance Your Resume?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl mx-auto">
                Start using our AI-powered resume optimization tool today and experience professional resume transformation.
              </p>
              {user ? (
                <Link to="/dashboard">
                  <Button size="xl" className="px-10 group">
                    Go to Dashboard 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Link to="/">
                  <Button size="xl" className="px-10 group">
                    Get Started Free 
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
