import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { getSubscriptionPlans, createSubscription } from '@/services/subscription-service';
import { formatCurrency } from '@/lib/utils';
import { Check, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);

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
    if (!user) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setSubscribing(planType);

    try {
      const result = await createSubscription(planType, user.email || '');
      if (result.data?.checkoutUrl) {
        window.location.href = result.data.checkoutUrl;
      } else {
        throw new Error('Failed to create subscription');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create subscription');
    } finally {
      setSubscribing(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Subscription Plan</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Unlock all features, get more resume optimization credits, and boost your job search competitiveness.
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
          {plans.map((plan) => {
            const isBasic = plan.plan_type === 'basic';
            const isPremium = plan.plan_type === 'premium';
            const isEnterprise = plan.plan_type === 'enterprise';
            
            return (
              <div 
                key={plan.id} 
                className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${isPremium ? 'ring-2 ring-primary border-transparent' : 'border border-gray-200'}`}
              >
                {isPremium && (
                  <div className="bg-primary text-white text-center py-2 font-medium">
                    Most Popular
                  </div>
                )}
                <div className="p-8">
                  <h2 className="text-2xl font-bold mb-2">
                    {plan.plan_type === 'basic' && 'Basic Plan'}
                    {plan.plan_type === 'premium' && 'Premium Plan'}
                    {plan.plan_type === 'enterprise' && 'Enterprise Plan'}
                  </h2>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
                    <span className="text-gray-500">/month</span>
                  </div>
                  
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{plan.monthly_limit} resume optimizations per month</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{isBasic ? 'Basic' : 'Advanced'} ATS optimization</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{!isBasic ? 'Unlimited' : 'Limited'} job matching optimization</span>
                    </li>
                    {!isBasic && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>Advanced language polishing tools</span>
                      </li>
                    )}
                    {isPremium && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>LinkedIn profile sync</span>
                      </li>
                    )}
                    {isEnterprise && (
                      <>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Contact and team member sharing</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span>Priority customer support</span>
                        </li>
                      </>
                    )}
                  </ul>
                  
                  <Button
                    className="w-full"
                    variant={isPremium ? 'default' : 'outline'}
                    onClick={() => handleSubscribe(plan.plan_type)}
                    disabled={!!subscribing}
                  >
                    {subscribing === plan.plan_type ? 'Processing...' : 'Choose Plan'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 bg-gray-50 rounded-lg p-6 border border-gray-200 max-w-3xl mx-auto">
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Can I cancel my subscription at any time?</h3>
            <p className="text-gray-600">Yes, you can cancel your subscription at any time. After cancellation, your subscription will continue until the end of the current billing period.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What happens if I use up all my optimization credits?</h3>
            <p className="text-gray-600">When you use up all your optimization credits, you can upgrade to a higher plan or wait until the next billing cycle to reset your credits.</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">What payment methods are supported?</h3>
            <p className="text-gray-600">We support credit card and debit card payments. All payments are securely processed through Stripe.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
