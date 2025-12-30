import { AccountInfo } from '@/components/ui/account-info';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function SubscriptionPage() {
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="font-display text-2xl font-semibold">Subscription</h1>
        <AccountInfo />
        <div className="flex gap-3">
          <Button onClick={() => navigate('/pricing')}>Upgrade</Button>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}
