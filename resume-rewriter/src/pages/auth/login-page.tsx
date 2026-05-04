import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Lock, Mail, Loader2, Sparkles } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      toast.success('Login successful');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Successfully signed in with Google!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Google Sign-In failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="orb orb-pear w-[400px] h-[400px] -top-32 -left-32 opacity-20" />
      <div className="orb orb-cyan w-[300px] h-[300px] bottom-0 right-0 opacity-15" />
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full sm:max-w-md">
          {/* Header */}
          <div className="text-center mb-6 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-pear-400/10 border border-pear-400/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="h-7 w-7 text-pear-400" />
            </div>
            <h2 className="font-display text-2xl font-bold">Welcome Back</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/register" className="text-pear-400 hover:text-pear-300 font-medium">
                Create one
              </Link>
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-card p-6 animate-fade-in-up">
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`block w-full pl-11 pr-4 py-2.5 bg-surface-light border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 transition-all ${
                      errors.email ? 'border-red-500' : 'border-border focus:border-pear-400/50'
                    }`}
                    placeholder="your@email.com"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className={`block w-full pl-11 pr-4 py-2.5 bg-surface-light border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 transition-all ${
                      errors.password ? 'border-red-500' : 'border-border focus:border-pear-400/50'
                    }`}
                    placeholder="Enter your password"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-border bg-surface-light text-pear-400 focus:ring-pear-400/50"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                    Remember me
                  </label>
                </div>

                <Link to="/forgot-password" className="text-sm text-pear-400 hover:text-pear-300">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            <div className="mt-5">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <div className="mt-5">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-surface-light border border-border rounded-xl text-foreground hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="font-medium">Signing in...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="font-medium">Sign in with Google</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <Link to="/terms" className="text-pear-400 hover:underline">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-pear-400 hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
