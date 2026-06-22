import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import {
  createSupabaseClient,
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  type TypedSupabaseClient,
} from "./supabase";

type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };

function parseCookieHeader(cookieHeader: string | null): { name: string; value: string }[] {
  if (!cookieHeader) return [];
  return cookieHeader.split(";").flatMap((part) => {
    const [rawName, ...rest] = part.trim().split("=");
    if (!rawName) return [];
    return [{ name: rawName, value: rest.join("=") }];
  });
}

/**
 * SSR / server-function client with cookie-backed auth.
 * Pass responseHeaders when you can mutate the outgoing Response (middleware, route handlers).
 */
export function createSupabaseServerClient(
  request: Request,
  responseHeaders?: Headers,
): TypedSupabaseClient {
  const cookies = parseCookieHeader(request.headers.get("cookie"));

  return createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookies;
      },
      setAll(cookiesToSet: CookieToSet[]) {
        if (!responseHeaders) return;
        cookiesToSet.forEach(({ name, value, options }) => {
          responseHeaders.append("Set-Cookie", serializeCookie(name, value, options));
        });
      },
    },
  });
}

/** Service-role client — bypasses RLS. Never import from client bundles. */
export function createSupabaseAdminClient(): TypedSupabaseClient {
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!serviceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient<Database>(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/** Read-only server client without cookies (public catalog queries). */
export function createSupabaseServerAnonClient(): TypedSupabaseClient {
  return createSupabaseClient(getSupabaseAnonKey());
}

function serializeCookie(
  name: string,
  value: string,
  options: Record<string, unknown> = {},
): string {
  const segments = [`${name}=${value}`];
  if (options.maxAge != null) segments.push(`Max-Age=${options.maxAge}`);
  if (options.domain) segments.push(`Domain=${options.domain}`);
  if (options.path) segments.push(`Path=${options.path}`);
  else segments.push("Path=/");
  if (options.expires instanceof Date) {
    segments.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.httpOnly) segments.push("HttpOnly");
  if (options.secure) segments.push("Secure");
  if (options.sameSite) segments.push(`SameSite=${options.sameSite}`);
  return segments.join("; ");
}
