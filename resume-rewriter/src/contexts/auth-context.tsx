import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { initiateGoogleOAuth, isGoogleOAuthConfigured } from '@/lib/google-oauth';

type User = {
  id: string;
  email: string;
  name?: string;
  emailVerified: boolean;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  session: { token: string } | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<{ token: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user state on mount
    async function loadUser() {
      try {
        const token = apiClient.getToken();
        if (token) {
          const { data, error } = await apiClient.getCurrentUser();
          if (data && !error) {
            setUser(data.user);
            setSession({ token });
          } else {
            // Invalid token, clear it
            apiClient.setToken(null);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function signIn(email: string, password: string) {
    const { data, error } = await apiClient.login(email, password);
    console.log('Login response:', { data, error });
    if (error) throw new Error(error.message);
    if (data) {
      const token = data.session?.token;
      console.log('Extracted token:', token);
      console.log('Full data object:', data);
      if (token) {
        apiClient.setToken(token);
        setUser(data.user);
        setSession({ token });
      }
    }
  }

  async function signUp(email: string, password: string, name?: string) {
    const { data, error } = await apiClient.register(email, password, name || '');
    console.log('Register response:', { data, error });
    if (error) throw new Error(error.message);
    if (data) {
      const token = data.session?.token;
      console.log('Extracted token from registration:', token);
      console.log('Full registration data:', data);
      if (token) {
        apiClient.setToken(token);
        setUser(data.user);
        setSession({ token });
        console.log('Token saved to localStorage:', localStorage.getItem('auth_token'));
      }
    }
  }

  async function signInWithGoogle() {
    if (!isGoogleOAuthConfigured()) {
      throw new Error('Google OAuth is not configured. Please contact support.');
    }

    // Initiate OAuth flow
    const popup = initiateGoogleOAuth();
    
    if (!popup) {
      throw new Error('Failed to open Google Sign-In window. Please check your popup blocker.');
    }

    // Listen for OAuth callback
    return new Promise<void>((resolve, reject) => {
      const checkPopup = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkPopup);
          reject(new Error('Sign-in was cancelled'));
        }
      }, 500);

      // Listen for message from popup
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
          clearInterval(checkPopup);
          window.removeEventListener('message', messageHandler);
          popup.close();

          // Exchange code for token via backend
          try {
            const { data, error } = await apiClient.googleAuth(event.data.code);
            if (error) throw new Error(error.message);
            if (data) {
              const token = data.session?.token;
              if (token) {
                apiClient.setToken(token);
                setUser(data.user);
                setSession({ token });
                resolve();
              }
            }
          } catch (err: any) {
            reject(err);
          }
        } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
          clearInterval(checkPopup);
          window.removeEventListener('message', messageHandler);
          popup.close();
          reject(new Error(event.data.error || 'Google Sign-In failed'));
        }
      };

      window.addEventListener('message', messageHandler);
    });
  }

  async function signOut() {
    // Clear local state regardless of API response
    // Token-based auth means client-side clearing is sufficient
    try {
      await apiClient.logout();
    } catch (e) {
      // Ignore API errors - logout should always succeed client-side
      console.log('Logout API error (ignored):', e);
    }
    setUser(null);
    setSession(null);
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
