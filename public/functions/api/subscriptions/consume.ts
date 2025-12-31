// Consume a credit from user's subscription
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
    
    // Get authorization token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Verify session
    const sessions = await env.DB.prepare(
      'SELECT user_id FROM sessions WHERE token = ? AND expires_at > ?'
    ).bind(token, Math.floor(Date.now() / 1000)).all();
    
    if (sessions.results.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        status: 401,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const userId = (sessions.results[0] as any).user_id;
    
    // Get user's active subscription with plan details
    const subscriptions = await env.DB.prepare(`
      SELECT 
        us.*,
        sp.name as plan_name,
        sp.monthly_limit,
        sp.plan_type
      FROM user_subscriptions us
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ? AND us.status = 'active'
      LIMIT 1
    `).bind(userId).all();
    
    if (subscriptions.results.length === 0) {
      return new Response(JSON.stringify({ 
        success: false,
        error: 'No active subscription found' 
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const sub = subscriptions.results[0] as any;
    const now = Math.floor(Date.now() / 1000);
    
    // Check if usage should be reset (period ended)
    let usageCount = sub.usage_count || 0;
    if (sub.usage_reset_at && now > sub.usage_reset_at) {
      // Reset usage for the new period
      usageCount = 0;
    }
    
    const monthlyLimit = sub.monthly_limit || 0;
    
    // Check if user has remaining credits
    if (usageCount >= monthlyLimit) {
      return new Response(JSON.stringify({ 
        success: false,
        error: `You've used all ${monthlyLimit} resume credits for this period`,
        usageCount,
        monthlyLimit,
        remaining: 0,
        planName: sub.plan_name,
      }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Increment usage count
    const newUsageCount = usageCount + 1;
    const newResetAt = sub.usage_reset_at && now > sub.usage_reset_at 
      ? sub.current_period_end 
      : sub.usage_reset_at;
    
    await env.DB.prepare(`
      UPDATE user_subscriptions 
      SET usage_count = ?, usage_reset_at = ?, updated_at = ?
      WHERE id = ?
    `).bind(newUsageCount, newResetAt, now, sub.id).run();
    
    const remaining = Math.max(0, monthlyLimit - newUsageCount);
    
    return new Response(JSON.stringify({
      success: true,
      usageCount: newUsageCount,
      monthlyLimit,
      remaining,
      planName: sub.plan_name,
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Consume credit error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to consume credit',
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

