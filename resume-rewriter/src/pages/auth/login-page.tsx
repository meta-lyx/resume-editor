import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { Lock, Mail, Loader2, Sparkles, Github } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 px-4 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="orb orb-pear w-[400px] h-[400px] -top-32 -left-32 opacity-20" />
      <div className="orb orb-cyan w-[300px] h-[300px] bottom-0 right-0 opacity-15" />
      
      <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-pear-400/10 border border-pear-400/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-pear-400" />
          </div>
          <h2 className="font-display text-3xl font-bold">Welcome Back</h2>
          <p className="mt-2 text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-pear-400 hover:text-pear-300 font-medium">
              Create one
            </Link>
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 animate-fade-in-up">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
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
                  className={`block w-full pl-11 pr-4 py-3 bg-surface-light border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 transition-all ${
                    errors.email ? 'border-red-500' : 'border-border focus:border-pear-400/50'
                  }`}
                  placeholder="your@email.com"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
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
                  className={`block w-full pl-11 pr-4 py-3 bg-surface-light border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 transition-all ${
                    errors.password ? 'border-red-500' : 'border-border focus:border-pear-400/50'
                  }`}
                  placeholder="Enter your password"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
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
              size="lg"
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

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface-light border border-border rounded-xl text-foreground hover:bg-white/5 transition-colors"
                onClick={() => toast.error('This login method is not supported yet')}
              >
                <Github className="w-5 h-5" />
                <span className="font-medium">Sign in with GitHub</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-pear-400 hover:underline">Terms</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-pear-400 hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
