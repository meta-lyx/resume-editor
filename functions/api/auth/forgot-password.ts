// Sends a password-reset token to the user's email via Resend.
// The token is stored in the verification_tokens table (1-hour expiry).

export async function onRequest(context: any) {
  try {
    const { request, env } = context;

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
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Always return success to avoid leaking whether the email exists
    const successResponse = () =>
      new Response(
        JSON.stringify({ message: 'If an account with that email exists, a reset email has been sent.' }),
        { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } },
      );

    // Look up user (case-insensitive)
    const users = await env.DB.prepare(
      'SELECT id, email FROM users WHERE LOWER(email) = LOWER(?)'
    ).bind(email).all();

    if (users.results.length === 0) {
      return successResponse();
    }

    const user = users.results[0] as any;

    // Generate a short token (8 hex chars) the user can paste easily
    const tokenBytes = crypto.getRandomValues(new Uint8Array(4));
    const token = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();

    const now = Math.floor(Date.now() / 1000);
    const expires = now + 60 * 60; // 1 hour

    // Delete any existing reset tokens for this user
    await env.DB.prepare(
      "DELETE FROM verification_tokens WHERE identifier = ? AND token LIKE 'RESET-%'"
    ).bind(user.id).run();

    // Store the token
    const tokenId = crypto.randomUUID();
    await env.DB.prepare(
      'INSERT INTO verification_tokens (id, identifier, token, expires, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(tokenId, user.id, `RESET-${token}`, expires, now).run();

    // Send email via Resend
    const resendKey = env.RESEND_API_KEY;
    if (!resendKey) {
      console.error('RESEND_API_KEY not configured');
      return successResponse();
    }

    const emailBody = {
      from: 'PixelPear <noreply@pixelpear.io>',
      to: [user.email],
      subject: 'Reset your PixelPear password',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
          <h2 style="margin: 0 0 16px;">Password Reset</h2>
          <p style="color: #555; line-height: 1.6;">
            We received a request to reset the password for your PixelPear account.
            Enter this code in the app to set a new password:
          </p>
          <div style="margin: 24px 0; padding: 16px 24px; background: #f5f5f5; border-radius: 8px; text-align: center;">
            <span style="font-family: monospace; font-size: 28px; letter-spacing: 4px; font-weight: bold;">${token}</span>
          </div>
          <p style="color: #555; line-height: 1.6;">
            This code expires in 1 hour. If you didn't request a password reset, you can ignore this email.
          </p>
          <p style="color: #999; font-size: 13px; margin-top: 32px;">— PixelPear</p>
        </div>
      `,
    };

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailBody),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      console.error('Resend error:', errText);
    }

    // Log the email
    await env.DB.prepare(
      'INSERT INTO email_logs (id, user_id, recipient, subject, email_type, status, sent_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(crypto.randomUUID(), user.id, user.email, 'Reset your PixelPear password', 'password_reset', emailRes.ok ? 'sent' : 'failed', now).run();

    return successResponse();
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
