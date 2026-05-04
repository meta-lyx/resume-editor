import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Check, FileText, Terminal, Zap, Sparkles, ArrowRight, Upload, Download, Target, Shield, Cpu, BarChart3 } from 'lucide-react';

export function FeaturesPage() {
  const { user } = useAuth();

  const features = [
    {
      icon: Terminal,
      title: "ATS Optimization",
      description: "Our AI analyzes your resume to ensure it passes through Applicant Tracking Systems. We optimize keyword distribution and formatting.",
      color: "pear",
      benefits: [
        "Keyword optimization and distribution",
        "Resume format standardization",
        "Improved resume readability",
      ]
    },
    {
      icon: Target,
      title: "Job Matching",
      description: "Tailor your resume to specific job descriptions. Our AI analyzes requirements and highlights your most relevant skills.",
      color: "cyan",
      benefits: [
        "Job requirement analysis",
        "Skills and experience highlighting",
        "Customized resume content",
      ]
    },
    {
      icon: BarChart3,
      title: "Achievement Quantification",
      description: "Transform abstract experiences into concrete, measurable achievements with data and metrics.",
      color: "pink",
      benefits: [
        "Quantified achievement expressions",
        "Powerful action verb usage",
        "Work value demonstration",
      ]
    },
    {
      icon: Sparkles,
      title: "Language Polishing",
      description: "Enhance your resume's language with professional and persuasive descriptions that make an impact.",
      color: "pear",
      benefits: [
        "Professional vocabulary optimization",
        "Expression enhancement",
        "Clear and concise language",
      ]
    },
    {
      icon: Cpu,
      title: "LinkedIn Integration",
      description: "Transform your optimized resume into a powerful LinkedIn profile for a unified professional brand.",
      color: "cyan",
      benefits: [
        "Profile content optimization",
        "Skills section improvement",
        "Unified professional brand",
      ]
    },
    {
      icon: FileText,
      title: "Expert Templates",
      description: "Access resume templates designed by HR experts, suitable for different industries and job levels.",
      color: "pink",
      benefits: [
        "Industry-specific templates",
        "Professional HR design",
        "ATS-friendly formats",
      ]
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
      case 'pear': return 'bg-pear-400/10 border-pear-400/20';
      case 'cyan': return 'bg-cyan-400/10 border-cyan-400/20';
      case 'pink': return 'bg-pink-400/10 border-pink-400/20';
      default: return 'bg-pear-400/10 border-pear-400/20';
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="orb orb-pear w-[600px] h-[600px] -top-48 -left-48 opacity-15" />
      <div className="orb orb-cyan w-[400px] h-[400px] top-1/3 -right-32 opacity-10" />
      <div className="orb orb-pink w-[300px] h-[300px] bottom-1/4 left-1/4 opacity-10" />
      
      <div className="container mx-auto px-4 py-8 md:py-12 relative">
        {/* Header — compact */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pear-400/10 border border-pear-400/20 text-pear-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Powered by Advanced AI
          </div>
          <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold mb-3 leading-tight">
            Features That
            <br />
            <span className="gradient-text">Transform Careers</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our AI-powered resume optimization tools designed to help you stand out in a competitive job market.
          </p>
        </div>

        {/* Core features — 3 columns, tighter */}

        {/* Desktop: scrollable row; Mobile: stacked */}

        {/* Workflow section — compact */}
        <div className="mb-10">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Three Simple Steps
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Our platform is designed to be intuitive, requiring just a few easy steps to get a professionally optimized resume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                step: 1,
                icon: Upload,
                title: "Upload Resume",
                description: "Upload your current resume (PDF or Word), or input your content directly.",
              },
              {
                step: 2,
                icon: Terminal,
                title: "Add Job Description",
                description: "Paste the job description you're targeting. Our AI will analyze and match your experience.",
              },
              {
                step: 3,
                icon: Download,
                title: "Get Results",
                description: "Receive your AI-optimized resume in seconds, ready to download and submit.",
              },
            ].map((item, index) => (
              <div 
                key={item.step}
                className="glass-card p-6 relative animate-fade-in-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="step-indicator absolute -top-4 -left-4 text-sm">
                  {item.step}
                </div>
                <div className="text-center pt-2">
                  <div className="w-12 h-12 rounded-2xl bg-pear-400/10 border border-pear-400/20 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="h-6 w-6 text-pear-400" />
                  </div>
                  <h3 className="font-display text-base font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Features grid — compact cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {features.map((feature, index) => (
            <div 
              key={feature.title}
              className="glass-card-hover p-6 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-10 h-10 rounded-xl ${getIconBg(feature.color)} border flex items-center justify-center mb-4`}>
                <feature.icon className={`h-5 w-5 ${getIconColor(feature.color)}`} />
              </div>
              <h2 className="font-display text-base font-bold mb-2">{feature.title}</h2>
              <p className="text-muted-foreground text-xs mb-4 leading-relaxed">
                {feature.description}
              </p>
              <ul className="space-y-1.5">
                {feature.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA — compact */}
        <div className="relative glass-card p-8 md:p-10 text-center overflow-hidden animate-fade-in-up">
          <div className="absolute inset-0 bg-gradient-to-br from-pear-400/10 via-transparent to-cyan-400/10" />
          
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-pear-400/10 border border-pear-400/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-pear-400" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
              Ready to Transform Your Resume?
            </h2>
            <p className="text-base text-muted-foreground mb-5 max-w-xl mx-auto">
              Start using our AI-powered tools today and boost your job search success.
            </p>
            {user ? (
              <Link to="/dashboard">
                <Button size="default" className="px-8 group">
                  Start Optimizing 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <Link to="/">
                <Button size="default" className="px-8 group">
                  Try for Free 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
