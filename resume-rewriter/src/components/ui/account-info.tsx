import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { User, CreditCard } from 'lucide-react';

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
          // Also get plan name if available
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
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  // Show component even if no subscription (will show Free)
  const planDisplay = subscription?.planName || (subscription?.hasSubscription ? 'Paid Plan' : 'Free');
  const remainingDisplay = subscription?.hasSubscription 
    ? `${subscription.remaining} remaining`
    : 'Free Trial';

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center mb-3">
        <User className="h-5 w-5 text-gray-500 mr-2" />
        <h3 className="font-bold text-sm">Your Account</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Plan</span>
          <span className="font-medium flex items-center">
            <CreditCard className="h-4 w-4 mr-1" />
            {planDisplay}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Resumes</span>
          <span className="font-medium text-primary">{remainingDisplay}</span>
        </div>
      </div>
    </div>
  );
}

