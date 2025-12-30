import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground">Please log in to view your profile.</p>
          <Link to="/login" className="inline-block mt-4">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto glass-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-pear-400/10 flex items-center justify-center">
            <User className="h-5 w-5 text-pear-400" />
          </div>
          <h1 className="font-display text-xl font-semibold">Profile</h1>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{user.name || user.email.split('@')[0]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email Verified</span>
            <span className="font-medium">{user.emailVerified ? 'Yes' : 'No'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member Since</span>
            <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="mt-8 flex gap-3">
          <Link to="/subscription">
            <Button variant="outline">View Subscription</Button>
          </Link>
          <Link to="/my-resumes">
            <Button>My Resumes</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
