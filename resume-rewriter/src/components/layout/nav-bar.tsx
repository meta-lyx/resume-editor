import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogIn, Menu, User, X, ChevronDown, Zap } from 'lucide-react';
import { useState } from 'react';

// Pixel Pear Logo component
function PixelPearLogo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Pixel art pear icon */}
      <div className="relative w-9 h-9">
        <svg viewBox="0 0 32 32" className="w-full h-full" fill="none">
          {/* Pear body - pixelated style */}
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
          {/* Shine effect */}
          <rect x="10" y="14" width="2" height="2" fill="rgba(255,255,255,0.4)" />
        </svg>
        {/* Glow effect */}
        <div className="absolute inset-0 blur-md bg-pear-400/30 -z-10 scale-150" />
      </div>
      
      {/* Brand name */}
      <div className="flex flex-col leading-none">
        <span className="font-display text-xl font-bold tracking-tight text-foreground">
          Pixel<span className="text-pear-400">Pear</span>
        </span>
        <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
          Resume AI
        </span>
      </div>
    </div>
  );
}

export function NavBar() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <PixelPearLogo />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link 
            to="/" 
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
          >
            Get Started
          </Link>
          <Link 
            to="/home" 
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
          >
            About
          </Link>
          <Link 
            to="/features" 
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
          >
            Features
          </Link>
          <Link 
            to="/pricing" 
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
          >
            Pricing
          </Link>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className="px-4 py-2 text-sm font-medium text-pear-400 hover:text-pear-300 transition-colors rounded-lg hover:bg-pear-400/10"
              >
                <Zap className="inline-block w-4 h-4 mr-1" />
                Dashboard
              </Link>
              <div className="relative ml-2">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-white/5"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pear-400 to-cyan-400 flex items-center justify-center">
                    <User className="h-4 w-4 text-background" />
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-card rounded-xl py-2 z-50 animate-scale-in">
                    <div className="px-4 py-2 border-b border-white/10 mb-2">
                      <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Free tier</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/my-resumes"
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Resumes
                    </Link>
                    <Link
                      to="/subscription"
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Subscription
                    </Link>
                    <div className="border-t border-white/10 mt-2 pt-2">
                      <button
                        onClick={() => {
                          signOut();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-colors"
                      >
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login">
              <Button className="btn-glow ml-2">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile navigation toggle */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>

        {/* Mobile navigation menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/5 md:hidden z-50 animate-fade-in">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              <Link
                to="/"
                className="px-4 py-3 text-foreground hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
              <Link
                to="/home"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/features"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </Link>
              
              <div className="h-px bg-border my-2" />
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-3 text-pear-400 hover:bg-pear-400/10 rounded-lg transition-colors font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    <Zap className="inline-block w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-resumes"
                    className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Resumes
                  </Link>
                  <Link
                    to="/subscription"
                    className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Subscription
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="text-left px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="mx-4 mt-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <Button className="w-full btn-glow">
                    <LogIn className="mr-2 h-4 w-4" /> Login
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
