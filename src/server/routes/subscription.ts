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

// Create Stripe checkout session
subscriptionRoutes.post('/create-checkout', authMiddleware, async (c) => {
  try {
    const user = getCurrentUser(c);
    const body = await c.req.json();
    const { planType } = body;
    
    if (!planType) {
      return c.json({ error: 'Plan type is required' }, 400);
    }
    
    const db = createDb(c.env.DB);
    
    // Get plan details
    const plan = await db
      .select()
      .from(subscriptionPlans)
      .where(and(
        eq(subscriptionPlans.planType, planType),
        eq(subscriptionPlans.active, true)
      ))
      .limit(1);
    
    if (plan.length === 0) {
      return c.json({ error: 'Plan not found' }, 404);
    }
    
    // Initialize Stripe
    const stripe = new Stripe(c.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
    
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
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
    }
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan[0].currency.toLowerCase(),
            product_data: {
              name: plan[0].name,
              description: plan[0].description || undefined,
            },
            recurring: {
              interval: plan[0].interval as 'month' | 'year',
            },
            unit_amount: Math.round(plan[0].price * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${c.env.APP_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${c.env.APP_URL}/pricing`,
      metadata: {
        userId: user.id,
        planId: plan[0].id,
        planType: plan[0].planType,
      },
    });
    
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

