import { createBrowserClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";

export type TypedSupabaseClient = SupabaseClient<Database>;

function readEnv(name: string): string | undefined {
  if (typeof import.meta !== "undefined" && import.meta.env?.[name]) {
    return import.meta.env[name] as string;
  }
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }
  return undefined;
}

export function getSupabaseUrl(): string {
  const url = readEnv("VITE_SUPABASE_URL");
  if (!url) {
    throw new Error("Missing VITE_SUPABASE_URL");
  }
  return url;
}

export function getSupabaseAnonKey(): string {
  const key = readEnv("VITE_SUPABASE_ANON_KEY");
  if (!key) {
    throw new Error("Missing VITE_SUPABASE_ANON_KEY");
  }
  return key;
}

export function getSupabaseServiceRoleKey(): string | undefined {
  return readEnv("SUPABASE_SERVICE_ROLE_KEY");
}

/** Browser client — use in React components (client-only). */
export function createSupabaseBrowserClient(): TypedSupabaseClient {
  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}

/** Generic client for scripts or server-only contexts with an explicit key. */
export function createSupabaseClient(
  supabaseKey = getSupabaseAnonKey(),
): TypedSupabaseClient {
  return createClient<Database>(getSupabaseUrl(), supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
