import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { KeyRound, Loader2, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

const inputClass =
  'block w-full pl-11 pr-4 py-2.5 bg-surface-light border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 focus:border-pear-400/50 transition-all';

function Field({ id, label, icon, ...input }: { id: string; label: string; icon: JSX.Element } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">{icon}</div>
        <input id={id} className={inputClass} required {...input} />
      </div>
    </div>
  );
}

// Two steps: request a code by email, then enter the code with a new password.
export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<'request' | 'reset'>('request');
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await apiClient.requestPasswordReset(email.trim());
    setLoading(false);
    if (error) return toast.error(error.message || 'Something went wrong. Please try again.');
    toast.success('If that email has an account, we sent a reset code.');
    setStage('reset');
  };

  const resetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirm) return toast.error('Passwords do not match');
    setLoading(true);
    const { error } = await apiClient.resetPassword(code.trim(), password);
    setLoading(false);
    if (error) return toast.error(error.message || 'Invalid or expired code');
    toast.success('Password updated. Log in with your new password.');
    navigate('/login');
  };

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full sm:max-w-md">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-pear-400/10 border border-pear-400/20 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="h-7 w-7 text-pear-400" />
            </div>
            <h1 className="font-display text-2xl font-bold">{stage === 'request' ? 'Reset your password' : 'Enter your reset code'}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {stage === 'request'
                ? "Enter your account email and we'll send you an 8-character code."
                : `We sent a code to ${email}. It expires in 1 hour.`}
            </p>
          </div>

          <div className="glass-card p-6">
            {stage === 'request' ? (
              <form className="space-y-4" onSubmit={requestCode}>
                <Field id="email" label="Email Address" type="email" autoComplete="email" placeholder="your@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="h-4 w-4 text-muted-foreground" />} />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending…</> : 'Send reset code'}
                </Button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={resetPassword}>
                <Field id="code" label="Reset code" autoComplete="one-time-code" placeholder="e.g. 3F9A1C2B" maxLength={8}
                  value={code} onChange={(e) => setCode(e.target.value)} icon={<KeyRound className="h-4 w-4 text-muted-foreground" />} />
                <Field id="new-password" label="New password" type="password" autoComplete="new-password" placeholder="At least 6 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="h-4 w-4 text-muted-foreground" />} />
                <Field id="confirm-password" label="Confirm new password" type="password" autoComplete="new-password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)} icon={<Lock className="h-4 w-4 text-muted-foreground" />} />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Updating…</> : 'Set new password'}
                </Button>
                <button type="button" onClick={() => setStage('request')} className="w-full text-sm text-muted-foreground hover:text-foreground">
                  Didn't get it? Send a new code
                </button>
              </form>
            )}
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Remembered it?{' '}
            <Link to="/login" className="text-pear-400 hover:text-pear-300 font-medium">Back to log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
