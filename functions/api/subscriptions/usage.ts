// Get subscription usage endpoint
export async function onRequest(context: any) {
  try {
    const { request, env } = context;
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }
    
    if (request.method !== 'GET') {
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
      return new Response(JSON.stringify({ 
        hasSubscription: false,
        usageCount: 0,
        monthlyLimit: 0,
        remaining: 0,
      }), {
        status: 200,
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
      return new Response(JSON.stringify({ 
        hasSubscription: false,
        usageCount: 0,
        monthlyLimit: 0,
        remaining: 0,
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const userId = (sessions.results[0] as any).user_id;
    
    // Get user's subscription with plan details
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
        hasSubscription: false,
        usageCount: 0,
        monthlyLimit: 0,
        remaining: 0,
      }), {
        status: 200,
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
      // Reset usage
      await env.DB.prepare(`
        UPDATE user_subscriptions 
        SET usage_count = 0, usage_reset_at = current_period_end
        WHERE id = ?
      `).bind(sub.id).run();
      usageCount = 0;
    }
    
    const monthlyLimit = sub.monthly_limit || 0;
    const remaining = Math.max(0, monthlyLimit - usageCount);
    
    return new Response(JSON.stringify({
      hasSubscription: true,
      usageCount,
      monthlyLimit,
      remaining,
      resetDate: sub.usage_reset_at ? new Date(sub.usage_reset_at * 1000).toISOString() : null,
      planName: sub.plan_name,
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Get usage error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to get usage',
      hasSubscription: false,
      usageCount: 0,
      monthlyLimit: 0,
      remaining: 0,
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

