import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function GoogleCallbackPage() {
  useEffect(() => {
    // Extract the authorization code from the URL
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: error === 'access_denied' ? 'Sign-in was cancelled' : 'Authentication failed',
          },
          window.location.origin
        );
        window.close();
      }
      return;
    }

    if (code) {
      // Send code to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_SUCCESS',
            code,
          },
          window.location.origin
        );
        // Parent window will close this popup
      }
    } else {
      // No code or error - something went wrong
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: 'No authorization code received',
          },
          window.location.origin
        );
        window.close();
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-pear-400" />
        <p className="mt-4 text-gray-600">Completing sign-in...</p>
      </div>
    </div>
  );
}
