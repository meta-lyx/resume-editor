import { supabase } from '@/lib/supabase';

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function createUserProfile(userId: string, email: string, fullName?: string) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      email,
      full_name: fullName || null,
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

export async function updateUserProfile(userId: string, updates: { full_name?: string; email?: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}
