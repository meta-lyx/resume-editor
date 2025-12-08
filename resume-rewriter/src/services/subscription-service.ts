import { apiClient } from '@/lib/api-client';

export async function getSubscriptionPlans() {
  const { data, error } = await apiClient.getSubscriptionPlans();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data?.plans || [];
}

export async function getCurrentSubscription() {
  const { data, error } = await apiClient.getCurrentSubscription();
  
  if (error) {
    // User might not have a subscription yet, that's okay
    if (error.code === 'NOT_FOUND') {
      return null;
    }
    throw new Error(error.message);
  }
  
  return data?.subscription;
}

export async function createCheckoutSession(planId: string) {
  const { data, error } = await apiClient.createCheckoutSession(planId);
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data?.checkoutUrl;
}

export async function cancelSubscription() {
  const { error } = await apiClient.cancelSubscription();
  
  if (error) {
    throw new Error(error.message);
  }
}
