import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { getSubscriptionPlans, createCheckoutSession } from '@/services/subscription-service';
import { formatCurrency } from '@/lib/utils';
import { Check, AlertCircle, Mail, Lock, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
    // If coming from onboarding and no user, show account creation
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
      
      // Proceed to checkout immediately (signUp already sets the token)
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
    <div className="container mx-auto px-4 py-12">
      {/* Show onboarding context if coming from onboarding */}
      {isOnboarding && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-6 max-w-4xl mx-auto">
          <div className="flex items-start">
            <Check className="h-6 w-6 text-green-600 mr-3 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-green-900 mb-2">Resume and Job Description Uploaded!</h3>
              <p className="text-green-800 text-sm">
                Great! Your resume is ready to be customized. Choose a plan below to get your AI-optimized resume.
                {!user && ' You\'ll create an account after selecting a plan.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Account Creation Modal */}
      {showAccountCreation && !user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowAccountCreation(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
            
            <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
            <p className="text-gray-600 mb-6">
              Create an account to proceed with your purchase and access your customized resume.
            </p>

            <form onSubmit={handleSubmit(onSubmitRegistration)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                    placeholder="your@email.com"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.password ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                    placeholder="At least 6 characters"
                    {...register('password')}
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                    } rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                    placeholder="Re-enter password"
                    {...register('confirmPassword')}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={creatingAccount}
              >
                {creatingAccount ? 'Creating Account...' : 'Create Account & Continue to Payment'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By creating an account, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>
      )}

      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Get AI-powered resume customization with our flexible pricing options.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 h-96">
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-900 mb-2">No subscription plans available</h2>
          <p className="text-gray-500">Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Starter Plan */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">Starter</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-gray-500"> one-time</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>3 Custom Resumes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>ATS Optimization</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Job Matching</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Email Support</span>
                </li>
              </ul>
              
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleSubscribe('starter')}
                disabled={!!subscribing}
              >
                {subscribing === 'starter' ? 'Processing...' : 'Choose Plan'}
              </Button>
            </div>
          </div>

          {/* Professional Plan - Most Popular */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ring-2 ring-primary border-transparent relative">
            <div className="bg-primary text-white text-center py-2 font-medium">
              Most Popular
            </div>
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">Professional</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">$19</span>
                <span className="text-gray-500"> one-time</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">10 Custom Resumes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Advanced ATS Optimization</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>AI-Powered Job Matching</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Priority Support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>LinkedIn Optimization Tips</span>
                </li>
              </ul>
              
              <Button
                className="w-full"
                onClick={() => handleSubscribe('professional')}
                disabled={!!subscribing}
              >
                {subscribing === 'professional' ? 'Processing...' : 'Choose Plan'}
              </Button>
            </div>
          </div>

          {/* Lifetime Plan */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-2">Lifetime</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold">$49</span>
                <span className="text-gray-500"> one-time</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="font-bold">Unlimited Custom Resumes</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>All Professional Features</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Lifetime Updates</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>VIP Support</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Early Access to New Features</span>
                </li>
              </ul>
              
              <Button
                className="w-full"
                variant="outline"
                onClick={() => handleSubscribe('lifetime')}
                disabled={!!subscribing}
              >
                {subscribing === 'lifetime' ? 'Processing...' : 'Choose Plan'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-12 bg-gray-50 rounded-lg p-6 border border-gray-200 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Are these one-time payments?</h3>
            <p className="text-gray-600">Yes! All plans are one-time purchases. Pay once and use your credits whenever you need them. No recurring charges.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What happens if I use up all my custom resumes?</h3>
            <p className="text-gray-600">You can purchase additional credits by selecting another plan, or upgrade to the Lifetime plan for unlimited resumes.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Do the credits expire?</h3>
            <p className="text-gray-600">No! Your credits never expire. Use them at your own pace.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What payment methods are supported?</h3>
            <p className="text-gray-600">We support all major credit and debit cards. All payments are securely processed through Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
