import { apiClient } from '@/lib/api-client';

export async function getUserProfile() {
  const { data, error } = await apiClient.getCurrentUser();
  
  if (error) {
    throw new Error(error.message);
  }
  
  return data?.user;
}

export async function updateUserProfile(updates: { name?: string; email?: string }) {
  // Profile updates would go through the user update endpoint
  // This is a placeholder - you may need to implement a dedicated profile update endpoint
  console.warn('Profile update not fully implemented yet', updates);
  throw new Error('Profile update endpoint not implemented');
}
