// Confirm payment and create/update subscription record
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
    
    const body = await request.json();
    const { planId } = body;
    
    if (!planId) {
      return new Response(JSON.stringify({ error: 'Plan ID is required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Get plan details
    const plans = await env.DB.prepare(
      'SELECT * FROM subscription_plans WHERE id = ? AND active = 1'
    ).bind(planId).all();
    
    if (plans.results.length === 0) {
      return new Response(JSON.stringify({ error: 'Plan not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const plan = plans.results[0] as any;
    
    // Check if user already has a subscription
    const existingSubs = await env.DB.prepare(
      'SELECT * FROM user_subscriptions WHERE user_id = ?'
    ).bind(userId).all();
    
    const now = Math.floor(Date.now() / 1000);
    // For lifetime plans, set end date to year 2099
    const lifetimeEnd = Math.floor(new Date('2099-12-31').getTime() / 1000);
    const periodEnd = plan.interval === 'lifetime' ? lifetimeEnd : now + (30 * 24 * 60 * 60);
    
    if (existingSubs.results.length > 0) {
      // Update existing subscription
      await env.DB.prepare(`
        UPDATE user_subscriptions 
        SET plan_id = ?, 
            status = 'active', 
            current_period_start = ?, 
            current_period_end = ?,
            usage_count = 0,
            usage_reset_at = ?,
            updated_at = ?
        WHERE user_id = ?
      `).bind(plan.id, now, periodEnd, periodEnd, now, userId).run();
      
      console.log(`Updated subscription for user ${userId} to plan ${plan.name}`);
    } else {
      // Create new subscription
      const subId = crypto.randomUUID();
      await env.DB.prepare(`
        INSERT INTO user_subscriptions (id, user_id, plan_id, status, current_period_start, current_period_end, usage_count, usage_reset_at, created_at, updated_at)
        VALUES (?, ?, ?, 'active', ?, ?, 0, ?, ?, ?)
      `).bind(subId, userId, plan.id, now, periodEnd, periodEnd, now, now).run();
      
      console.log(`Created subscription for user ${userId} with plan ${plan.name}`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      plan: {
        id: plan.id,
        name: plan.name,
        monthlyLimit: plan.monthly_limit,
      },
      message: `Successfully activated ${plan.name} plan with ${plan.monthly_limit} credits`,
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Confirm payment error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to confirm payment',
      details: error.stack,
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

