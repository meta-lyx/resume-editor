import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { User, CreditCard, Zap } from 'lucide-react';

interface AccountInfoProps {
  className?: string;
}

export function AccountInfo({ className = '' }: AccountInfoProps) {
  const [subscription, setSubscription] = useState<{
    hasSubscription: boolean;
    usageCount: number;
    monthlyLimit: number;
    remaining: number;
    planName?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
          const planName = subData?.subscription?.plan?.name || 'Free';

          setSubscription({
            hasSubscription: data.hasSubscription,
            usageCount: data.usageCount,
            monthlyLimit: data.monthlyLimit,
            remaining: data.remaining,
            planName,
          });
        }
      } catch (error) {
        console.error('Error loading subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSubscription();
  }, []);

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

  const planDisplay = subscription?.planName || (subscription?.hasSubscription ? 'Paid Plan' : 'Free');
  const remainingDisplay = subscription?.hasSubscription 
    ? `${subscription.remaining} remaining`
    : 'Free Trial';
  
  const isPaid = subscription?.hasSubscription;

  return (
    <div className={`glass-card p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-pear-400/10 flex items-center justify-center">
          <User className="h-4 w-4 text-pear-400" />
        </div>
        <h3 className="font-display font-semibold text-sm">Your Account</h3>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Plan</span>
          <span className={`font-medium flex items-center gap-1.5 ${isPaid ? 'text-pear-400' : 'text-foreground'}`}>
            {isPaid ? <Zap className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
            {planDisplay}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Credits</span>
          <span className={`font-mono text-sm ${isPaid ? 'text-pear-400' : 'text-muted-foreground'}`}>
            {remainingDisplay}
          </span>
        </div>
        
        {subscription?.hasSubscription && subscription.monthlyLimit > 0 && (
          <div className="pt-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Usage</span>
              <span>{subscription.usageCount} / {subscription.monthlyLimit}</span>
            </div>
            <div className="h-2 bg-surface-light rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-pear rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((subscription.usageCount / subscription.monthlyLimit) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
