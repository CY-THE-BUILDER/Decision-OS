import { createClient } from "@supabase/supabase-js";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
export const isLocalDemoMode =
  process.env.NODE_ENV !== "production" && !isSupabaseConfigured;

export const authClient: {
  getSession: () => Promise<{ data: { session: { access_token: string } | null } }>;
  signInWithPassword: (payload: { email: string; password: string }) => Promise<{ error: Error | null }>;
  signUp: (payload: { email: string; password: string; options?: { data?: Record<string, unknown> } }) => Promise<{ error: Error | null }>;
} = isSupabaseConfigured
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
    ).auth
  : {
      getSession: async () => ({ data: { session: null } }),
      signInWithPassword: async () => ({
        error: isLocalDemoMode ? null : new Error("Supabase env vars are missing in production.")
      }),
      signUp: async () => ({
        error: isLocalDemoMode ? null : new Error("Supabase env vars are missing in production.")
      })
    };
