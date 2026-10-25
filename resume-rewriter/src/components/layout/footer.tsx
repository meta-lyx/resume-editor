import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="/favicon.svg" 
        alt="PixelPear Logo" 
        className="h-8 w-8 object-contain"
      />
      <span className="font-display text-lg font-bold">
        Pixel<span className="text-primary">Pear</span>
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-10">
          {/* Brand column */}
          <div className="md:col-span-2">
            <Logo />
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
              AI-powered resume optimization with job description-specific editing, 
              ATS keyword enhancement, and a wide array of professional PDF templates.
            </p>
            
            <a
              href="mailto:hello@pixelpear.io"
              className="inline-flex items-center gap-2 mt-5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="w-4 h-4" />
              hello@pixelpear.io
            </a>
          </div>
          
          {/* Product */}
          <div>
            <h3 className="text-sm font-medium mb-4">Product</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Get Started
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/templates" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Templates
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h3 className="text-sm font-medium mb-4">Company</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:hello@pixelpear.io" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="text-sm font-medium mb-4">Legal</h3>
            <ul className="space-y-2.5">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} PixelPear. All rights reserved.
          </p>
          
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">
              Status: <span className="text-green-500">● Operational</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
