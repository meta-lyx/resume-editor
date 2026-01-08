// Logout endpoint - clears session
// Since we use token-based auth stored client-side, this just returns success
// The client is responsible for clearing the token from localStorage

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  // Handle preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // For token-based auth, logout is handled client-side by clearing the token
  // This endpoint just confirms the logout action
  return new Response(JSON.stringify({
    success: true,
    message: 'Logged out successfully',
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
};

interface Env {
  DB: D1Database;
}

