import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import { User, CreditCard, Zap, Clock, AlertTriangle } from 'lucide-react';

interface SubscriptionData {
  hasSubscription: boolean;
  usageCount: number;
  monthlyLimit: number;
  remaining: number;
  planName?: string;
  // Trial-specific fields
  isTrial?: boolean;
  trialActive?: boolean;
  trialExpired?: boolean;
  trialCreditsExhausted?: boolean;
  trialDaysRemaining?: number | null;
}

interface AccountInfoProps {
  className?: string;
  // External subscription data for dynamic updates
  externalSubscription?: {
    planName?: string;
    remaining: number;
    monthlyLimit: number;
    usageCount: number;
  } | null;
}

export function AccountInfo({ className = '', externalSubscription }: AccountInfoProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Update subscription when external data changes
  useEffect(() => {
    if (externalSubscription) {
      setSubscription({
        hasSubscription: externalSubscription.remaining > 0 || externalSubscription.usageCount > 0,
        usageCount: externalSubscription.usageCount,
        monthlyLimit: externalSubscription.monthlyLimit,
        remaining: externalSubscription.remaining,
        planName: externalSubscription.planName,
      });
      setLoading(false);
    }
  }, [externalSubscription]);

  useEffect(() => {
    // Skip fetching if external data is provided
    if (externalSubscription) return;
    
    async function loadSubscription() {
      try {
        const token = apiClient.getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        const { data, error } = await apiClient.getSubscriptionUsage();
        if (error) {
          console.error('Failed to load subscription:', error);
          setLoading(false);
          return;
        }

        if (data) {
          const { data: subData } = await apiClient.getCurrentSubscription();
          const planName = subData?.subscription?.plan?.name || data.planName || 'Free';

          setSubscription({
            hasSubscription: data.hasSubscription,
            usageCount: data.usageCount,
            monthlyLimit: data.monthlyLimit,
            remaining: data.remaining,
            planName,
            // Trial-specific fields
            isTrial: data.isTrial,
            trialActive: data.trialActive,
            trialExpired: data.trialExpired,
            trialCreditsExhausted: data.trialCreditsExhausted,
            trialDaysRemaining: data.trialDaysRemaining,
          });
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, [externalSubscription]);

  if (loading) {
    return (
      <div className={`glass-card p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-white/10 rounded w-24 mb-3"></div>
          <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
          <div className="h-4 bg-white/10 rounded w-28"></div>
        </div>
      </div>
    );
  }

  const isTrial = subscription?.isTrial;
  const trialActive = subscription?.trialActive;
  const trialExpired = subscription?.trialExpired;
  const trialCreditsExhausted = subscription?.trialCreditsExhausted;
  
  // Determine plan display
  let planDisplay = 'Free';
  if (isTrial) {
    planDisplay = trialActive ? 'Free Trial' : 'Trial Expired';
  } else if (subscription?.hasSubscription) {
    planDisplay = subscription?.planName || 'Paid Plan';
  }
  
  // Determine credits display
  let remainingDisplay = 'No credits';
  if (isTrial && trialActive) {
    remainingDisplay = `${subscription?.remaining || 0} trial credits`;
  } else if (subscription?.hasSubscription) {
    remainingDisplay = `${subscription?.remaining || 0} remaining`;
  }
  
  const isPaid = subscription?.hasSubscription && !isTrial;

  return (
    <div className={`glass-card p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-pear-400/10 flex items-center justify-center">
          <User className="h-4 w-4 text-pear-400" />
        </div>
        <h3 className="font-display font-semibold text-sm">Your Account</h3>
      </div>
      
      {/* Trial Banner */}
      {isTrial && trialActive && subscription?.trialDaysRemaining !== null && (
        <div className="mb-4 p-3 rounded-lg bg-cyan-400/10 border border-cyan-400/20">
          <div className="flex items-center gap-2 text-cyan-400 text-sm">
            <Clock className="h-4 w-4" />
            <span className="font-medium">
              {subscription?.trialDaysRemaining} day{subscription?.trialDaysRemaining !== 1 ? 's' : ''} left in trial
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {subscription?.remaining || 0} of 3 credits remaining
          </p>
        </div>
      )}
      
      {/* Trial Expired/Exhausted Warning */}
      {isTrial && (trialExpired || trialCreditsExhausted) && (
        <div className="mb-4 p-3 rounded-lg bg-orange-400/10 border border-orange-400/20">
          <div className="flex items-center gap-2 text-orange-400 text-sm">
            <AlertTriangle className="h-4 w-4" />
            <span className="font-medium">
              {trialExpired ? 'Trial expired' : 'Trial credits used'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Purchase a plan to continue customizing resumes
          </p>
          <Link 
            to="/pricing" 
            className="mt-2 inline-block text-xs text-pear-400 hover:text-pear-300 font-medium"
          >
            View Plans →
          </Link>
        </div>
      )}
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Plan</span>
          <span className={`font-medium flex items-center gap-1.5 ${isPaid ? 'text-pear-400' : isTrial && trialActive ? 'text-cyan-400' : 'text-foreground'}`}>
            {isPaid ? <Zap className="h-3.5 w-3.5" /> : isTrial ? <Clock className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
            {planDisplay}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Credits</span>
          <span className={`font-mono text-sm ${isPaid ? 'text-pear-400' : isTrial && trialActive ? 'text-cyan-400' : 'text-muted-foreground'}`}>
            {remainingDisplay}
          </span>
        </div>
        
        {(subscription?.hasSubscription || trialActive) && subscription?.monthlyLimit && subscription.monthlyLimit > 0 && (
          <div className="pt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Usage</span>
              <span>{subscription.usageCount} / {subscription.monthlyLimit}</span>
            </div>
            <div className="h-2 bg-surface-light rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isPaid ? 'bg-gradient-pear' : 'bg-cyan-400'}`}
                style={{ 
                  width: `${Math.min((subscription.usageCount / subscription.monthlyLimit) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}
        
        {/* Upgrade CTA for trial users */}
        {isTrial && trialActive && (
          <div className="pt-3 border-t border-border">
            <Link 
              to="/pricing" 
              className="block w-full text-center py-2 px-3 text-xs font-medium rounded-lg bg-pear-400/10 text-pear-400 hover:bg-pear-400/20 transition-colors"
            >
              Upgrade for more credits
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
