import { supabase } from '@/lib/supabase';

export async function getSubscriptionPlans() {
  const { data, error } = await supabase
    .from('resume_plans')
    .select('*')
    .order('price', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('resume_subscriptions')
    .select(`
      *,
      resume_plans!price_id(
        plan_type,
        price,
        monthly_limit
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function createSubscription(planType: string, customerEmail: string) {
  const { data, error } = await supabase.functions.invoke('create-subscription', {
    body: {
      planType,
      customerEmail,
    },
  });
  
  if (error) {
    throw error;
  }
  
  return data;
}
