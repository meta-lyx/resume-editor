// Get current subscription endpoint
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
      return new Response(JSON.stringify({ subscription: null }), {
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
      return new Response(JSON.stringify({ subscription: null }), {
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
        us.id,
        us.user_id,
        us.plan_id,
        us.status,
        us.current_period_start,
        us.current_period_end,
        us.cancel_at_period_end,
        us.usage_count,
        sp.id as plan_id,
        sp.name as plan_name,
        sp.description as plan_description,
        sp.plan_type,
        sp.price as plan_price,
        sp.currency as plan_currency,
        sp.interval as plan_interval,
        sp.monthly_limit as plan_monthly_limit,
        sp.features as plan_features
      FROM user_subscriptions us
      LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
      WHERE us.user_id = ? AND us.status = 'active'
      LIMIT 1
    `).bind(userId).all();
    
    if (subscriptions.results.length === 0) {
      return new Response(JSON.stringify({ subscription: null }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const sub = subscriptions.results[0] as any;
    
    return new Response(JSON.stringify({
      subscription: {
        id: sub.id,
        userId: sub.user_id,
        status: sub.status,
        currentPeriodStart: sub.current_period_start,
        currentPeriodEnd: sub.current_period_end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        usageCount: sub.usage_count,
        plan: {
          id: sub.plan_id,
          name: sub.plan_name,
          description: sub.plan_description,
          planType: sub.plan_type,
          price: sub.plan_price,
          currency: sub.plan_currency,
          interval: sub.plan_interval,
          monthlyLimit: sub.plan_monthly_limit,
          features: sub.plan_features ? JSON.parse(sub.plan_features) : [],
        },
      },
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Get current subscription error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to get subscription',
      subscription: null,
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

