// Google OAuth endpoint as direct Pages Function
export async function onRequest(context: any) {
  try {
    const { request, env } = context;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const body = await request.json();
    const { code } = body;
    
    if (!code) {
      return new Response(JSON.stringify({ error: 'Authorization code is required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID || '',
        client_secret: env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: env.GOOGLE_REDIRECT_URI || '',
        grant_type: 'authorization_code',
      }),
    });
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Google token exchange failed:', errorData);
      return new Response(JSON.stringify({ 
        error: 'Failed to authenticate with Google',
        details: errorData,
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const tokenData = await tokenResponse.json();
    const { access_token } = tokenData;
    
    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    
    if (!userInfoResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to get user info from Google' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const googleUser = await userInfoResponse.json();
    const { email, name, picture } = googleUser;
    
    // Check if user exists
    const existingUsers = await env.DB.prepare(
      'SELECT id, email, name, email_verified FROM users WHERE email = ?'
    ).bind(email).all();
    
    let userId: string;
    let userName: string;
    
    if (existingUsers.results.length > 0) {
      // User exists - log them in
      const user = existingUsers.results[0] as any;
      userId = user.id;
      userName = user.name;
      
      // Update email_verified if not already verified
      if (!user.email_verified) {
        const now = Math.floor(Date.now() / 1000);
        await env.DB.prepare(
          'UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?'
        ).bind(now, userId).run();
      }
    } else {
      // Create new user
      userId = crypto.randomUUID();
      userName = name || email.split('@')[0];
      const now = Math.floor(Date.now() / 1000);
      
      await env.DB.prepare(
        'INSERT INTO users (id, email, name, email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(userId, email, userName, 1, now, now).run();
    }
    
    // Create session
    const sessionId = crypto.randomUUID();
    const token = crypto.randomUUID();
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + (60 * 60 * 24 * 7); // 7 days
    
    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(sessionId, userId, token, expiresAt, now).run();
    
    return new Response(JSON.stringify({
      message: 'Google authentication successful',
      user: {
        id: userId,
        email,
        name: userName,
        emailVerified: true,
      },
      session: {
        token,
        expiresAt,
      },
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Google authentication failed',
      stack: error.stack,
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
