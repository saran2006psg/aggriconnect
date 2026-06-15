import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from '../config/config';

// Regular client (anon key)
export const supabaseClient: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseKey
);

// Admin client (service role — bypasses RLS)
export const supabaseAdmin: SupabaseClient = createClient(
  config.supabaseUrl,
  config.supabaseServiceKey
);
