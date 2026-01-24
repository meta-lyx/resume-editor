// Stripe checkout endpoint for subscription purchases
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
    
    // Convert planId format: "starter-plan" -> "starter" OR use as-is for plan_type lookup
    const planType = planId.replace('-plan', '');
    
    // Get plan details from database (try both id and plan_type)
    const plans = await env.DB.prepare(
      'SELECT * FROM subscription_plans WHERE (id = ? OR plan_type = ?) AND active = 1'
    ).bind(planId, planType).all();
    
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
    
    // Get user email
    const users = await env.DB.prepare(
      'SELECT email FROM users WHERE id = ?'
    ).bind(userId).all();
    
    const userEmail = users.results.length > 0 ? (users.results[0] as any).email : '';
    
    // Determine if this is a one-time payment (lifetime) or subscription
    const isOneTime = plan.interval === 'lifetime';

    // Determine frontend base URL for redirect
    const originHeader = request.headers.get('origin');
    const baseUrl = originHeader || env.APP_URL || new URL(request.url).origin;
    
    // Validate Stripe key is configured
    if (!env.STRIPE_SECRET_KEY) {
      return new Response(JSON.stringify({ error: 'Stripe is not configured. Please contact support.' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Validate Stripe key format
    const stripeKey = env.STRIPE_SECRET_KEY.trim();
    if (!stripeKey.startsWith('sk_live_') && !stripeKey.startsWith('sk_test_')) {
      console.error('Invalid Stripe key format. Key should start with sk_live_ or sk_test_');
      return new Response(JSON.stringify({ 
        error: 'Stripe configuration error. Please check your API key.',
        hint: 'Make sure STRIPE_SECRET_KEY is set correctly in Cloudflare Pages environment variables'
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // Create Stripe checkout session using Stripe API directly
    const checkoutParams = new URLSearchParams({
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': plan.currency.toLowerCase(),
      'line_items[0][price_data][product_data][name]': plan.name,
      'line_items[0][price_data][unit_amount]': Math.round(plan.price * 100).toString(),
      'line_items[0][quantity]': '1',
      'mode': isOneTime ? 'payment' : 'subscription',
      'success_url': `${baseUrl}/dashboard?payment=success&plan=${planId}`,
      'cancel_url': `${baseUrl}/pricing?payment=cancelled`,
      'customer_email': userEmail,
      'client_reference_id': userId,
      'metadata[userId]': userId,
      'metadata[planId]': planId,
      'metadata[credits]': plan.monthly_limit.toString(),
    });
    
    if (plan.description) {
      checkoutParams.set('line_items[0][price_data][product_data][description]', plan.description);
    }
    
    // For subscription mode, add recurring interval
    if (!isOneTime) {
      checkoutParams.set('line_items[0][price_data][recurring][interval]', plan.interval);
    }
    
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: checkoutParams.toString(),
    });
    
    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text();
      let errorMessage = 'Stripe API error';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorText;
        
        // Provide helpful hints for common errors
        if (errorMessage.includes('Invalid API Key')) {
          errorMessage += '. Please check your STRIPE_SECRET_KEY in Cloudflare Pages environment variables. Make sure it\'s the correct key from your Stripe dashboard (https://dashboard.stripe.com/apikeys)';
        }
      } catch {
        errorMessage = errorText;
      }
      console.error('Stripe API error:', errorText);
      return new Response(JSON.stringify({ 
        error: errorMessage,
        hint: 'Check your Stripe API key in Cloudflare Pages → Settings → Environment Variables → STRIPE_SECRET_KEY'
      }), {
        status: stripeResponse.status,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    const session = await stripeResponse.json();
    
    return new Response(JSON.stringify({
      checkoutUrl: session.url,
      sessionId: session.id,
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Checkout failed',
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

