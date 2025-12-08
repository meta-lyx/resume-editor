import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { LogIn, Menu, User } from 'lucide-react';
import { useState } from 'react';

export function NavBar() {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          Resume Builder
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-700 hover:text-primary font-medium">
            Get Started
          </Link>
          <Link to="/home" className="text-gray-700 hover:text-primary font-medium">
            About
          </Link>
          <Link to="/features" className="text-gray-700 hover:text-primary font-medium">
            Features
          </Link>
          <Link to="/pricing" className="text-gray-700 hover:text-primary font-medium">
            Pricing
          </Link>
          {user ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-primary font-medium">
                Dashboard
              </Link>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/my-resumes"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Resumes
                    </Link>
                    <Link
                      to="/subscription"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}
                    >
                      Subscription
                    </Link>
                    <button
                      onClick={() => {
                        signOut();
                        setMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login">
              <Button>
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile navigation toggle */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu className="h-6 w-6" />
        </button>

        {/* Mobile navigation menu */}
        {menuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg md:hidden z-50">
            <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
              <Link
                to="/"
                className="text-gray-700 hover:text-primary font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Get Started
              </Link>
              <Link
                to="/home"
                className="text-gray-700 hover:text-primary font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
              <Link
                to="/features"
                className="text-gray-700 hover:text-primary font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                to="/pricing"
                className="text-gray-700 hover:text-primary font-medium py-2"
                onClick={() => setMenuOpen(false)}
              >
                Pricing
              </Link>
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-primary font-medium py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary font-medium py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/my-resumes"
                    className="text-gray-700 hover:text-primary font-medium py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    My Resumes
                  </Link>
                  <Link
                    to="/subscription"
                    className="text-gray-700 hover:text-primary font-medium py-2"
                    onClick={() => setMenuOpen(false)}
                  >
                    Subscription
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="text-left text-red-600 hover:text-red-700 font-medium py-2"
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-primary hover:text-primary-dark font-medium py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  Login / Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
