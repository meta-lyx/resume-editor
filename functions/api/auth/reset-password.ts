// Verifies the reset token and sets a new password.

import { hashPassword } from './password-utils';

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

    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return new Response(JSON.stringify({ error: 'Token and new password are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (newPassword.length < 6) {
      return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Look up the token (stored as "RESET-<CODE>")
    const normalizedToken = token.trim().toUpperCase();
    const now = Math.floor(Date.now() / 1000);

    const tokens = await env.DB.prepare(
      "SELECT * FROM verification_tokens WHERE token = ? AND expires > ?"
    ).bind(`RESET-${normalizedToken}`, now).all();

    if (tokens.results.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or expired reset token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const resetRecord = tokens.results[0] as any;
    const userId = resetRecord.identifier;

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update user's password
    await env.DB.prepare(
      'UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?'
    ).bind(passwordHash, now, userId).run();

    // Delete the used token
    await env.DB.prepare(
      'DELETE FROM verification_tokens WHERE id = ?'
    ).bind(resetRecord.id).run();

    // Invalidate all existing sessions so stolen sessions can't persist
    await env.DB.prepare(
      'DELETE FROM sessions WHERE user_id = ?'
    ).bind(userId).run();

    return new Response(JSON.stringify({ message: 'Password updated successfully. Please log in.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
