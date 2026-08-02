import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const supabaseServiceKey = (import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY as string | undefined)?.trim();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Placeholder values so `createClient()` NEVER throws at module load,
// even if the env vars are missing (e.g. not yet added on Vercel).
// Queries will simply fail gracefully and the UI keeps rendering.
const SAFE_URL = 'https://placeholder.supabase.co';
const SAFE_KEY = 'placeholder-anon-key';

export const supabase: SupabaseClient = createClient(
  supabaseUrl || SAFE_URL,
  supabaseAnonKey || SAFE_KEY
);

// Admin client (bypasses RLS) — used ONLY server-side flows like auto-confirming new signups.
// NOTE: In a production app, move this logic to a Supabase Edge Function to avoid
// exposing the service_role key in the client bundle.
// `null` when VITE_SUPABASE_SERVICE_ROLE_KEY is missing, so the app never crashes.
export const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null;
