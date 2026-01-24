// Google OAuth Configuration and Utilities

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;

export interface GoogleOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

export const googleOAuthConfig: GoogleOAuthConfig = {
  clientId: GOOGLE_CLIENT_ID,
  redirectUri: GOOGLE_REDIRECT_URI,
  scope: 'openid email profile',
};

/**
 * Initiates Google OAuth flow by redirecting to Google's authorization page
 */
export function initiateGoogleOAuth() {
  // For now, we'll use a simple popup-based OAuth flow
  // In production, you should use the official Google Sign-In library
  
  if (!googleOAuthConfig.clientId) {
    console.warn('Google OAuth not configured. Please set VITE_GOOGLE_CLIENT_ID environment variable.');
    return null;
  }

  const params = new URLSearchParams({
    client_id: googleOAuthConfig.clientId,
    redirect_uri: googleOAuthConfig.redirectUri,
    response_type: 'code',
    scope: googleOAuthConfig.scope,
    access_type: 'offline',
    prompt: 'consent',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  
  // Open in popup window
  const width = 500;
  const height = 600;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  const popup = window.open(
    authUrl,
    'Google Sign In',
    `width=${width},height=${height},left=${left},top=${top}`
  );

  return popup;
}

/**
 * Handle Google OAuth callback
 */
export function handleGoogleOAuthCallback(code: string) {
  // This will be handled by the backend
  return code;
}

/**
 * Check if Google OAuth is configured
 */
export function isGoogleOAuthConfigured(): boolean {
  return !!googleOAuthConfig.clientId && googleOAuthConfig.clientId !== '';
}
