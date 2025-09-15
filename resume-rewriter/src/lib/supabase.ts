import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

const supabaseUrl = 'https://hsiguofeamzpufesnndw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaWd1b2ZlYW16cHVmZXNubmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NTY1NzAsImV4cCI6MjA3MDEzMjU3MH0.ai9kDWNP20XtOFkeDWb9JNgvcOjv_bBkHtUeE-GsGr0';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
