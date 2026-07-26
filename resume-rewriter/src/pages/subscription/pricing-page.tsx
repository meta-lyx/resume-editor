import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { getSubscriptionPlans, createCheckoutSession } from '@/services/subscription-service';
import { Check, AlertCircle, Mail, Lock, Rocket, Star, Crown, Zap, X, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ModalPortal } from '@/components/ui/modal-portal';

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function PricingPage() {
  const { user, signUp } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isOnboarding = searchParams.get('onboarding') === 'true';
  
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [showAccountCreation, setShowAccountCreation] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [creatingAccount, setCreatingAccount] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  useEffect(() => {
    async function loadPlans() {
      try {
        const plansData = await getSubscriptionPlans();
        setPlans(plansData);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load subscription plans');
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  const handleSubscribe = async (planType: string) => {
    if (!user && isOnboarding) {
      setSelectedPlan(planType);
      setShowAccountCreation(true);
      return;
    }

    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setSubscribing(planType);

    try {
      const checkoutUrl = await createCheckoutSession(planType);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create checkout session');
    } finally {
      setSubscribing(null);
    }
  };

  const onSubmitRegistration = async (data: RegisterFormValues) => {
    setCreatingAccount(true);
    try {
      await signUp(data.email, data.password);
      toast.success('Account created successfully! Proceeding to payment...');
      
      if (selectedPlan) {
        try {
          const checkoutUrl = await createCheckoutSession(selectedPlan);
          if (checkoutUrl) {
            window.location.href = checkoutUrl;
          } else {
            throw new Error('No checkout URL returned');
          }
        } catch (error: any) {
          console.error('Checkout error:', error);
          toast.error(error.message || 'Failed to create checkout session');
        }
      }
      setCreatingAccount(false);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
      setCreatingAccount(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="orb orb-pear w-[500px] h-[500px] -top-32 left-1/4 opacity-20" />
      <div className="orb orb-pink w-[400px] h-[400px] bottom-0 right-0 opacity-15" />
      
      <div className="container mx-auto px-4 py-6 md:py-8 relative">
        {/* Onboarding banner — compact */}
        {isOnboarding && (
          <div className="mb-6 glass-card p-4 max-w-4xl mx-auto border-green-500/30 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-green-400 text-sm mb-0.5">Resume Ready!</h3>
                <p className="text-muted-foreground text-xs">
                  Your resume is ready to be customized. Choose a plan below to get your AI-optimized resume.
                  {!user && ' You\'ll create an account after selecting a plan.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Account Creation Modal */}
        {showAccountCreation && !user && (
          <ModalPortal>
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start sm:items-center justify-center z-[100] p-4 overflow-y-auto overscroll-contain animate-fade-in">
              <div className="glass-card max-w-md w-full max-h-[calc(100dvh-2rem)] overflow-y-auto p-6 sm:p-8 my-auto relative animate-scale-in">
              <button
                onClick={() => setShowAccountCreation(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
              
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-pear-400/10 border border-pear-400/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-7 w-7 text-pear-400" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">Create Your Account</h2>
                <p className="text-muted-foreground text-sm">
                  Create an account to proceed with your purchase.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmitRegistration)} className="space-y-4">
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
                      autoComplete="new-password"
                      className={`block w-full pl-11 pr-4 py-3 bg-surface-light border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 transition-all ${
                        errors.password ? 'border-red-500' : 'border-border focus:border-pear-400/50'
                      }`}
                      placeholder="At least 6 characters"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      className={`block w-full pl-11 pr-4 py-3 bg-surface-light border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 transition-all ${
                        errors.confirmPassword ? 'border-red-500' : 'border-border focus:border-pear-400/50'
                      }`}
                      placeholder="Re-enter password"
                      {...register('confirmPassword')}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={creatingAccount}
                >
                  {creatingAccount ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account & Continue'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By creating an account, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
              </div>
            </div>
          </ModalPortal>
        )}

        {/* Header — compact */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pear-400/10 border border-pear-400/20 text-pear-400 text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            Simple, One-Time Pricing
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Choose Your Plan
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            Get AI-powered resume customization with our flexible pricing options. 
            No subscriptions, no hidden fees.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 animate-pulse">
                <div className="h-10 w-10 bg-white/10 rounded-xl mb-4"></div>
                <div className="h-6 bg-white/10 rounded w-1/2 mb-3"></div>
                <div className="h-10 bg-white/10 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-3 bg-white/10 rounded w-full"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="glass-card p-10 text-center max-w-md mx-auto">
            <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="font-display text-xl font-semibold mb-1">No plans available</h2>
            <p className="text-muted-foreground text-sm">Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in-up">
            {/* Starter Plan */}
            <div className="glass-card-hover p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-pear-400/10 flex items-center justify-center mb-4">
                <Rocket className="h-5 w-5 text-pear-400" />
              </div>
              <h2 className="font-display text-xl font-bold mb-1">Starter</h2>
              <div className="mb-4">
                <span className="font-mono text-3xl font-bold text-pear-400">$9</span>
                <span className="text-muted-foreground text-sm"> one-time</span>
              </div>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">3 Custom Resumes</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">ATS Optimization</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Job Matching</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Email Support</span>
                </li>
              </ul>
              
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleSubscribe('starter-plan')}
                disabled={!!subscribing}
              >
                {subscribing === 'starter-plan' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  'Choose Plan'
                )}
              </Button>
            </div>

            {/* Professional Plan */}
            <div className="glass-card p-6 relative border-pear-400/30 shadow-glow">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-4 py-1 bg-gradient-pear text-background text-xs font-semibold rounded-full">
                  Most Popular
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-pear-400/20 flex items-center justify-center mb-4">
                <Star className="h-5 w-5 text-pear-400" />
              </div>
              <h2 className="font-display text-xl font-bold mb-1">Professional</h2>
              <div className="mb-4">
                <span className="font-mono text-3xl font-bold text-pear-400">$19</span>
                <span className="text-muted-foreground text-sm"> one-time</span>
              </div>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-medium text-xs">10 Custom Resumes</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Advanced ATS Optimization</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">AI-Powered Job Matching</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Priority Support</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">LinkedIn Tips</span>
                </li>
              </ul>
              
              <Button
                className="w-full"
                onClick={() => handleSubscribe('professional-plan')}
                disabled={!!subscribing}
              >
                {subscribing === 'professional-plan' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  'Choose Plan'
                )}
              </Button>
            </div>

            {/* Lifetime Plan */}
            <div className="glass-card-hover p-6 relative">
              <div className="w-10 h-10 rounded-xl bg-pink-400/10 flex items-center justify-center mb-4">
                <Crown className="h-5 w-5 text-pink-400" />
              </div>
              <h2 className="font-display text-xl font-bold mb-1">Lifetime</h2>
              <div className="mb-4">
                <span className="font-mono text-3xl font-bold text-pink-400">$49</span>
                <span className="text-muted-foreground text-sm"> one-time</span>
              </div>
              
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground font-semibold text-xs">Unlimited Resumes</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">All Pro Features</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Lifetime Updates</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">VIP Support</span>
                </li>
                <li className="flex items-start gap-2 text-xs">
                  <Check className="h-3.5 w-3.5 text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">Early Access</span>
                </li>
              </ul>
              
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleSubscribe('lifetime-plan')}
                disabled={!!subscribing}
              >
                {subscribing === 'lifetime-plan' ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  'Choose Plan'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* FAQ — compact */}
        <div className="mt-10 glass-card p-6 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <h2 className="font-display text-lg font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-medium text-foreground mb-1">Are these one-time payments?</h3>
              <p className="text-muted-foreground text-xs">Yes! All plans are one-time purchases. Pay once and use your credits whenever you need them. No recurring charges.</p>
            </div>
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-medium text-foreground mb-1">What happens if I use up all my custom resumes?</h3>
              <p className="text-muted-foreground text-xs">You can purchase additional credits by selecting another plan, or upgrade to the Lifetime plan for unlimited resumes.</p>
            </div>
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-medium text-foreground mb-1">Do the credits expire?</h3>
              <p className="text-muted-foreground text-xs">No! Your credits never expire. Use them at your own pace.</p>
            </div>
            <div className="border-t border-white/5 pt-4">
              <h3 className="font-medium text-foreground mb-1">What payment methods are supported?</h3>
              <p className="text-muted-foreground text-xs">We support all major credit and debit cards. All payments are securely processed through Stripe.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
