import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogIn, Menu, User, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <img 
        src="/images/pixelpear-logo.png" 
        alt="PixelPear Logo" 
        className="h-8 w-8 object-contain"
      />
      <span className="font-display text-lg font-bold">
        Pixel<span className="text-primary">Pear</span>
      </span>
    </div>
  );
}

export function NavBar() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="hover:opacity-90 transition-opacity">
          <Logo />
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link 
            to="/" 
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
          >
            Get Started
          </Link>
          <Link 
            to="/home" 
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
          >
            About
          </Link>
          <Link 
            to="/features" 
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
          >
            Features
          </Link>
          <Link 
            to="/pricing" 
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
          >
            Pricing
          </Link>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          {user ? (
            <>
              <Link 
                to="/dashboard" 
                className="px-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors rounded-lg hover:bg-primary/10"
              >
                Dashboard
              </Link>
              <div className="relative ml-2">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl py-2 z-50 shadow-lg">
                    <div className="px-4 py-2 border-b border-border mb-2">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <p className="text-xs text-muted-foreground">Free tier</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/my-resumes"
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Resumes
                    </Link>
                    <Link
                      to="/subscription"
                      className="flex items-center px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Subscription
                    </Link>
                    <div className="border-t border-border mt-2 pt-2">
                      <button
                        onClick={() => {
                          signOut();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
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
              <Button className="ml-2">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile navigation toggle */}
        <button 
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" 
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>

        {/* Mobile navigation menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border md:hidden z-50">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              <Link
                to="/"
                className="px-4 py-3 hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
              <Link
                to="/home"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/features"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </Link>
              
              <div className="h-px bg-border my-2" />
              
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="px-4 py-3 text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-resumes"
                    className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Resumes
                  </Link>
                  <Link
                    to="/subscription"
                    className="px-4 py-3 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    Subscription
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="text-left px-4 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
                  <Button className="w-full">
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
