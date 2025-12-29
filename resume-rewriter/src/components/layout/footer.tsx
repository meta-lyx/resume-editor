import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

// Pixel Pear Logo component (mini version)
function PixelPearLogoMini() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-8 h-8">
        <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
          <rect x="12" y="4" width="4" height="4" fill="#84CC16" />
          <rect x="14" y="2" width="4" height="4" fill="#65A30D" />
          <rect x="8" y="8" width="4" height="4" fill="#A3E635" />
          <rect x="12" y="8" width="4" height="4" fill="#BEF264" />
          <rect x="16" y="8" width="4" height="4" fill="#A3E635" />
          <rect x="20" y="8" width="4" height="4" fill="#84CC16" />
          <rect x="6" y="12" width="4" height="4" fill="#A3E635" />
          <rect x="10" y="12" width="4" height="4" fill="#BEF264" />
          <rect x="14" y="12" width="4" height="4" fill="#D9F99D" />
          <rect x="18" y="12" width="4" height="4" fill="#BEF264" />
          <rect x="22" y="12" width="4" height="4" fill="#84CC16" />
          <rect x="6" y="16" width="4" height="4" fill="#84CC16" />
          <rect x="10" y="16" width="4" height="4" fill="#A3E635" />
          <rect x="14" y="16" width="4" height="4" fill="#BEF264" />
          <rect x="18" y="16" width="4" height="4" fill="#A3E635" />
          <rect x="22" y="16" width="4" height="4" fill="#65A30D" />
          <rect x="8" y="20" width="4" height="4" fill="#84CC16" />
          <rect x="12" y="20" width="4" height="4" fill="#A3E635" />
          <rect x="16" y="20" width="4" height="4" fill="#A3E635" />
          <rect x="20" y="20" width="4" height="4" fill="#65A30D" />
          <rect x="10" y="24" width="4" height="4" fill="#65A30D" />
          <rect x="14" y="24" width="4" height="4" fill="#84CC16" />
          <rect x="18" y="24" width="4" height="4" fill="#65A30D" />
          <rect x="12" y="28" width="4" height="4" fill="#4D7C0F" />
          <rect x="16" y="28" width="4" height="4" fill="#4D7C0F" />
        </svg>
        <div className="absolute inset-0 blur-md bg-pear-400/20 -z-10 scale-150" />
      </div>
      <span className="font-display text-lg font-bold">
        Pixel<span className="text-pear-400">Pear</span>
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-background overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 orb orb-pear opacity-10" />
      <div className="absolute top-0 right-1/4 w-64 h-64 orb orb-cyan opacity-10" />
      
      <div className="container mx-auto px-4 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-12">
          {/* Brand column */}
          <div className="md:col-span-2">
            <PixelPearLogoMini />
            <p className="text-muted-foreground mt-4 max-w-sm leading-relaxed">
              AI-powered resume optimization that helps you land your dream job. 
              Transform your resume to match any job description perfectly.
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-3 mt-6">
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-200"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-200"
              >
                <Github className="w-4 h-4" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-200"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="mailto:hello@pixelpear.io" 
                className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all duration-200"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
              Product
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-pear-400 transition-colors text-sm">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-pear-400 transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-pear-400 transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-muted-foreground hover:text-pear-400 transition-colors text-sm">
                  Templates
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-pear-400 transition-colors text-sm">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-pear-400 transition-colors text-sm">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-pear-400 transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-pear-400 transition-colors text-sm">
                  API Docs
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-pear-400 transition-colors text-sm">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-pear-400 transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-pear-400 transition-colors text-sm">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm flex items-center gap-1">
            © {new Date().getFullYear()} PixelPear. Made with 
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            for job seekers.
          </p>
          
          <div className="flex items-center gap-6 text-sm">
            <span className="text-muted-foreground">
              Status: <span className="text-green-400">● All systems operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
