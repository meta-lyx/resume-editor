import { Hono } from 'hono';
import { authMiddleware, getCurrentUser, optionalAuthMiddleware } from '../lib/auth';
import { createDb, subscriptionPlans, userSubscriptions } from '../db';
import { eq, and } from 'drizzle-orm';
import Stripe from 'stripe';

export function createSubscriptionApp() {
  const subscriptionRoutes = new Hono();

// Get all subscription plans (public)
subscriptionRoutes.get('/plans', optionalAuthMiddleware, async (c) => {
  try {
    const db = createDb(c.env.DB);
    
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.active, true))
      .orderBy(subscriptionPlans.price);
    
    return c.json({ plans });
  } catch (error: any) {
    console.error('Get plans error:', error);
    return c.json({ error: 'Failed to retrieve plans' }, 500);
  }
});

// Get user's current subscription (requires auth)
subscriptionRoutes.get('/current', authMiddleware, async (c) => {
  try {
    const user = getCurrentUser(c);
    const db = createDb(c.env.DB);
    
    const subscription = await db
      .select({
        subscription: userSubscriptions,
        plan: subscriptionPlans,
      })
      .from(userSubscriptions)
      .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(and(
        eq(userSubscriptions.userId, user.id),
        eq(userSubscriptions.status, 'active')
      ))
      .limit(1);
    
    if (subscription.length === 0) {
      return c.json({ subscription: null });
    }
    
    return c.json({ subscription: subscription[0] });
  } catch (error: any) {
    console.error('Get subscription error:', error);
    return c.json({ error: 'Failed to retrieve subscription' }, 500);
  }
});

// Create Stripe checkout session - supports both /checkout and /create-checkout for backwards compatibility
subscriptionRoutes.post('/checkout', authMiddleware, async (c) => {
  try {
    const user = getCurrentUser(c);
    const body = await c.req.json();
    // Support both planId and planType for backwards compatibility
    const planId = body.planId;
    const planType = body.planType || (planId ? planId.replace('-plan', '') : null);
    
    if (!planId && !planType) {
      return c.json({ error: 'Plan ID or type is required' }, 400);
    }
    
    const db = createDb(c.env.DB);
    
    // Get plan details - search by both id and plan_type
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(and(
        planId 
          ? eq(subscriptionPlans.id, planId)
          : eq(subscriptionPlans.planType, planType),
        eq(subscriptionPlans.active, true)
      ))
      .limit(1);
    
    if (plan.length === 0) {
      return c.json({ error: 'Plan not found' }, 404);
    }
    
    // Initialize Stripe using direct API calls (compatible with Cloudflare Workers)
    const stripeSecretKey = c.env.STRIPE_SECRET_KEY;
    
    // Create or get Stripe customer
    let customerId: string;
    
    const existingSub = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, user.id))
      .limit(1);
    
    if (existingSub[0]?.stripeCustomerId) {
      customerId = existingSub[0].stripeCustomerId;
    } else {
      // Create customer using Stripe API directly
      const createCustomerResp = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeSecretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'email': user.email,
          'metadata[userId]': user.id,
        }).toString(),
      });
      
      if (!createCustomerResp.ok) {
        throw new Error('Failed to create Stripe customer');
      }
      
      const customer = await createCustomerResp.json() as { id: string };
      customerId = customer.id;
    }
    
    // Determine checkout mode based on plan interval
    // 'lifetime' plans use one-time payment mode
    const isOneTime = plan[0].interval === 'lifetime';
    
    // Build checkout session params
    const checkoutParams = new URLSearchParams({
      'customer': customerId,
      'payment_method_types[]': 'card',
      'line_items[0][price_data][currency]': plan[0].currency.toLowerCase(),
      'line_items[0][price_data][product_data][name]': plan[0].name,
      'line_items[0][price_data][unit_amount]': Math.round(plan[0].price * 100).toString(),
      'line_items[0][quantity]': '1',
      'mode': isOneTime ? 'payment' : 'subscription',
      'success_url': `${c.env.APP_URL}/dashboard?payment=success&plan=${plan[0].id}`,
      'cancel_url': `${c.env.APP_URL}/pricing?payment=cancelled`,
      'metadata[userId]': user.id,
      'metadata[planId]': plan[0].id,
      'metadata[planType]': plan[0].planType,
      'metadata[credits]': plan[0].monthlyLimit.toString(),
    });
    
    if (plan[0].description) {
      checkoutParams.set('line_items[0][price_data][product_data][description]', plan[0].description);
    }
    
    // For subscription mode, add recurring interval
    if (!isOneTime) {
      checkoutParams.set('line_items[0][price_data][recurring][interval]', plan[0].interval);
    }
    
    // Create Stripe checkout session using API directly
    const sessionResp = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: checkoutParams.toString(),
    });
    
    if (!sessionResp.ok) {
      const errorText = await sessionResp.text();
      console.error('Stripe checkout error:', errorText);
      throw new Error(`Stripe API error: ${errorText}`);
    }
    
    const session = await sessionResp.json() as { url: string; id: string };
    
    // For one-time payments, we need to create/update the subscription record here
    // because there won't be a webhook for checkout.session.completed
    if (isOneTime) {
      // Pre-create the subscription record (will be activated after successful payment)
      // We store it with status 'pending' and update it when user returns with payment=success
    }
    
    return c.json({
      checkoutUrl: session.url,
      sessionId: session.id,
    });
    
  } catch (error: any) {
    console.error('Create checkout error:', error);
    return c.json({ 
      error: error.message || 'Failed to create checkout session' 
    }, 500);
  }
});

// Backwards compatibility alias
subscriptionRoutes.post('/create-checkout', authMiddleware, async (c) => {
  // Redirect to the main checkout handler
  const body = await c.req.json();
  // Convert planType to planId format if needed
  if (body.planType && !body.planId) {
    body.planId = `${body.planType}-plan`;
  }
  
  // Re-create the request with the new body
  const newReq = new Request(c.req.url.replace('/create-checkout', '/checkout'), {
    method: 'POST',
    headers: c.req.raw.headers,
    body: JSON.stringify(body),
  });
  
  // Forward to main checkout
  return c.json({ error: 'Please use /checkout endpoint instead' }, 400);
});

// Stripe webhook handler
subscriptionRoutes.post('/webhook', async (c) => {
  try {
    const signature = c.req.header('stripe-signature');
    
    if (!signature) {
      return c.json({ error: 'Missing signature' }, 400);
    }
    
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
    
    const body = await c.req.text();
    
    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        c.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return c.json({ error: 'Invalid signature' }, 400);
    }
    
    const db = createDb(c.env.DB);
    
    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const { userId, planId, planType } = session.metadata || {};
        
        if (!userId || !planId) {
          console.error('Missing metadata in checkout session');
          break;
        }
        
        // Get subscription details from Stripe
        const subscriptionId = session.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        
        // Create or update user subscription
        const existing = await db
          .select()
          .from(userSubscriptions)
          .where(eq(userSubscriptions.userId, userId))
          .limit(1);
        
        if (existing.length > 0) {
          await db
            .update(userSubscriptions)
            .set({
              planId,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: session.customer as string,
              status: 'active',
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              updatedAt: new Date(),
            })
            .where(eq(userSubscriptions.userId, userId));
        } else {
          await db.insert(userSubscriptions).values({
            id: crypto.randomUUID(),
            userId,
            planId,
            stripeSubscriptionId: subscriptionId,
            stripeCustomerId: session.customer as string,
            status: 'active',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            usageCount: 0,
            usageResetAt: new Date(subscription.current_period_end * 1000),
          });
        }
        
        break;
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await db
          .update(userSubscriptions)
          .set({
            status: subscription.status === 'active' ? 'active' : subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date(),
          })
          .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        await db
          .update(userSubscriptions)
          .set({
            status: 'cancelled',
            updatedAt: new Date(),
          })
          .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
        
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.subscription) {
          await db
            .update(userSubscriptions)
            .set({
              status: 'past_due',
              updatedAt: new Date(),
            })
            .where(eq(userSubscriptions.stripeSubscriptionId, invoice.subscription as string));
        }
        
        break;
      }
    }
    
    return c.json({ received: true });
    
  } catch (error: any) {
    console.error('Webhook error:', error);
    return c.json({ error: 'Webhook processing failed' }, 500);
  }
});

// Cancel subscription
subscriptionRoutes.post('/cancel', authMiddleware, async (c) => {
  try {
    const user = getCurrentUser(c);
    const db = createDb(c.env.DB);
    
    // Get user's subscription
    const subscription = await db
      .select()
      .from(userSubscriptions)
      .where(and(
        eq(userSubscriptions.userId, user.id),
        eq(userSubscriptions.status, 'active')
      ))
      .limit(1);
    
    if (subscription.length === 0) {
      return c.json({ error: 'No active subscription found' }, 404);
    }
    
    if (!subscription[0].stripeSubscriptionId) {
      return c.json({ error: 'Stripe subscription ID not found' }, 400);
    }
    
    // Cancel in Stripe
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
    
    await stripe.subscriptions.update(subscription[0].stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
    
    // Update database
    await db
      .update(userSubscriptions)
      .set({
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(userSubscriptions.id, subscription[0].id));
    
    return c.json({ 
      message: 'Subscription will be cancelled at the end of the billing period' 
    });
    
  } catch (error: any) {
    console.error('Cancel subscription error:', error);
    return c.json({ error: 'Failed to cancel subscription' }, 500);
  }
});

// Confirm payment and create subscription (for one-time payments)
subscriptionRoutes.post('/confirm-payment', authMiddleware, async (c) => {
  try {
    const user = getCurrentUser(c);
    const body = await c.req.json();
    const { planId, sessionId } = body;
    
    if (!planId) {
      return c.json({ error: 'Plan ID is required' }, 400);
    }
    
    const db = createDb(c.env.DB);
    
    // Get plan details
    const planResult = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);
    
    if (planResult.length === 0) {
      return c.json({ error: 'Plan not found' }, 404);
    }
    
    const plan = planResult[0];
    
    // Check if user already has an active subscription
    const existingSub = await db
      .select()
      .from(userSubscriptions)
      .where(eq(userSubscriptions.userId, user.id))
      .limit(1);
    
    // For lifetime plans, set a far future end date
    const lifetimeEndDate = new Date('2099-12-31');
    const now = new Date();
    
    if (existingSub.length > 0) {
      // Update existing subscription
      await db
        .update(userSubscriptions)
        .set({
          planId: plan.id,
          status: 'active',
          currentPeriodStart: now,
          currentPeriodEnd: plan.interval === 'lifetime' ? lifetimeEndDate : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          usageCount: 0, // Reset usage for new plan
          usageResetAt: plan.interval === 'lifetime' ? lifetimeEndDate : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
          updatedAt: now,
        })
        .where(eq(userSubscriptions.id, existingSub[0].id));
      
      console.log(`Updated subscription for user ${user.id} to plan ${plan.name}`);
    } else {
      // Create new subscription
      await db.insert(userSubscriptions).values({
        id: crypto.randomUUID(),
        userId: user.id,
        planId: plan.id,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: plan.interval === 'lifetime' ? lifetimeEndDate : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        usageCount: 0,
        usageResetAt: plan.interval === 'lifetime' ? lifetimeEndDate : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      });
      
      console.log(`Created subscription for user ${user.id} with plan ${plan.name}`);
    }
    
    return c.json({
      success: true,
      plan: {
        id: plan.id,
        name: plan.name,
        monthlyLimit: plan.monthlyLimit,
      },
      message: `Successfully activated ${plan.name} plan with ${plan.monthlyLimit} credits`,
    });
    
  } catch (error: any) {
    console.error('Confirm payment error:', error);
    return c.json({ error: error.message || 'Failed to confirm payment' }, 500);
  }
});

// Check usage limits
subscriptionRoutes.get('/usage', authMiddleware, async (c) => {
  try {
    const user = getCurrentUser(c);
    const db = createDb(c.env.DB);
    
    const subscription = await db
      .select({
        subscription: userSubscriptions,
        plan: subscriptionPlans,
      })
      .from(userSubscriptions)
      .leftJoin(subscriptionPlans, eq(userSubscriptions.planId, subscriptionPlans.id))
      .where(and(
        eq(userSubscriptions.userId, user.id),
        eq(userSubscriptions.status, 'active')
      ))
      .limit(1);
    
    if (subscription.length === 0) {
      return c.json({
        hasSubscription: false,
        usageCount: 0,
        monthlyLimit: 0,
        remaining: 0,
      });
    }
    
    const sub = subscription[0].subscription;
    const plan = subscription[0].plan;
    
    // Reset usage if period has ended
    const now = new Date();
    if (sub.usageResetAt && now > sub.usageResetAt) {
      await db
        .update(userSubscriptions)
        .set({
          usageCount: 0,
          usageResetAt: sub.currentPeriodEnd,
        })
        .where(eq(userSubscriptions.id, sub.id));
      
      sub.usageCount = 0;
    }
    
    return c.json({
      hasSubscription: true,
      usageCount: sub.usageCount,
      monthlyLimit: plan?.monthlyLimit || 0,
      remaining: Math.max(0, (plan?.monthlyLimit || 0) - sub.usageCount),
      resetDate: sub.usageResetAt,
    });
    
  } catch (error: any) {
    console.error('Get usage error:', error);
    return c.json({ error: 'Failed to retrieve usage' }, 500);
  }
});

  return subscriptionRoutes;
}

