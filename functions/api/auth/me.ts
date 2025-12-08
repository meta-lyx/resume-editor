// This endpoint is accessed as /api/auth/me
// Simplified version that doesn't use createDb to avoid import issues

export async function onRequest(context: any) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log('Auth/me called with token:', token ? token.substring(0, 8) + '...' : 'none');

    if (!token) {
      return new Response(JSON.stringify({ error: 'No token provided', user: null }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Verify session using direct D1 query
    const sessionResult = await env.DB.prepare(
      'SELECT user_id, expires_at FROM sessions WHERE token = ? AND expires_at > ?'
    ).bind(token, Math.floor(Date.now() / 1000)).all();

    console.log('Session query result:', sessionResult.results?.length || 0, 'sessions found');

    if (!sessionResult.results || sessionResult.results.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session', user: null }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const session = sessionResult.results[0] as any;

    // Get user using direct D1 query
    const userResult = await env.DB.prepare(
      'SELECT id, email, name, email_verified, created_at, updated_at FROM users WHERE id = ?'
    ).bind(session.user_id).all();

    console.log('User query result:', userResult.results?.length || 0, 'users found');

    if (!userResult.results || userResult.results.length === 0) {
      return new Response(JSON.stringify({ error: 'User not found', user: null }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const user = userResult.results[0] as any;

    console.log('Returning user:', user.email);

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.email_verified === 1,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error: any) {
    console.error('Get current user error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to get user', user: null }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
