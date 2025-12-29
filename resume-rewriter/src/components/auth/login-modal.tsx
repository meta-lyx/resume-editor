import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Mail, Lock, Loader2, X, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const { signIn, signUp } = useAuth();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStage, setForgotStage] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgotPassword) {
        if (forgotStage === 'request') {
          const { error } = await apiClient.requestPasswordReset(email);
          if (error) {
            throw new Error(error.message);
          }
          toast.success('Password reset email sent. Check your inbox.');
          setForgotStage('reset');
        } else {
          if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            setLoading(false);
            return;
          }
          if (newPassword !== newPasswordConfirm) {
            toast.error('Passwords do not match');
            setLoading(false);
            return;
          }
          const { error } = await apiClient.resetPassword(resetToken, newPassword);
          if (error) {
            throw new Error(error.message);
          }
          toast.success('Password updated. Please log in with your new password.');
          setIsForgotPassword(false);
          setForgotStage('request');
          setResetToken('');
          setNewPassword('');
          setNewPasswordConfirm('');
        }
      } else if (isCreatingAccount) {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await signUp(email, password);
        toast.success('Account created successfully!');
        setIsCreatingAccount(false);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        if (onSuccess) onSuccess();
        onClose();
      } else {
        await signIn(email, password);
        toast.success('Logged in successfully!');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setIsCreatingAccount(false);
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (error: any) {
      const message = typeof error?.message === 'string' && error.message !== 'An error occurred'
        ? error.message
        : 'Authentication failed. Please check your email and password.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="glass-card max-w-md w-full p-8 relative animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-pear-400/10 border border-pear-400/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-7 w-7 text-pear-400" />
          </div>
          <h2 className="font-display text-2xl font-bold mb-2">
            {isForgotPassword ? (forgotStage === 'request' ? 'Reset Password' : 'Set New Password') : (isCreatingAccount ? 'Create Account' : 'Welcome Back')}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isForgotPassword
              ? (forgotStage === 'request' ? 'Enter your email to receive a reset token' : 'Enter the token and your new password')
              : (isCreatingAccount ? 'Create an account to download your customized resume' : 'Log in to access your optimized resume')}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isForgotPassword ? (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-surface-light border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 focus:border-pear-400/50 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete={isCreatingAccount ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 bg-surface-light border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 focus:border-pear-400/50 transition-all"
                    placeholder="Enter your password"
                    minLength={6}
                  />
                </div>
              </div>

              {isCreatingAccount && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-surface-light border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 focus:border-pear-400/50 transition-all"
                      placeholder="Confirm your password"
                      minLength={6}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isCreatingAccount ? 'Creating Account...' : 'Logging In...'}
                    </>
                  ) : (
                    isCreatingAccount ? 'Create Account' : 'Log In'
                  )}
                </Button>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingAccount(!isCreatingAccount);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-sm text-pear-400 hover:text-pear-300 transition-colors"
                  >
                    {isCreatingAccount ? 'Already have an account? Log in' : "Don't have an account? Create one"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(true);
                      setForgotStage('request');
                    }}
                    className="text-sm text-pear-400 hover:text-pear-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {forgotStage === 'request' ? (
                <div>
                  <label htmlFor="resetEmail" className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <input
                      id="resetEmail"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 bg-surface-light border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 focus:border-pear-400/50 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="flex flex-col gap-2 pt-4">
                    <Button type="submit" disabled={loading} className="w-full" size="lg">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Sending reset email...
                        </>
                      ) : (
                        'Send Reset Email'
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-sm text-pear-400 hover:text-pear-300 transition-colors"
                    >
                      Back to login
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="resetToken" className="block text-sm font-medium text-foreground mb-2">Reset Token</label>
                    <input
                      id="resetToken"
                      type="text"
                      required
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className="block w-full px-4 py-3 bg-surface-light border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 focus:border-pear-400/50 transition-all"
                      placeholder="Paste token from email"
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        id="newPassword"
                        type="password"
                        required
                        minLength={6}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-surface-light border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 focus:border-pear-400/50 transition-all"
                        placeholder="Enter new password"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="newPasswordConfirm" className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <input
                        id="newPasswordConfirm"
                        type="password"
                        required
                        minLength={6}
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        className="block w-full pl-11 pr-4 py-3 bg-surface-light border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-pear-400/50 focus:border-pear-400/50 transition-all"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-4">
                    <Button type="submit" disabled={loading} className="w-full" size="lg">
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Updating password...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-sm text-pear-400 hover:text-pear-300 transition-colors"
                    >
                      Back to login
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </form>
        
        {/* Footer */}
        <div className="mt-6 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-pear-400 hover:underline">Terms</a>
            {' '}and{' '}
            <a href="/privacy" className="text-pear-400 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
