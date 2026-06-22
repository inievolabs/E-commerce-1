export interface RateLimitConfig {
  windowMs: number;
  max: number;
}

export interface RateLimitState {
  count: number;
  resetAt: number;
}

export type RateLimitStore = Map<string, RateLimitState>;

export function clientIpFromHeaders(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export function checkRateLimit(
  store: RateLimitStore,
  key: string,
  config: RateLimitConfig,
  now = Date.now(),
): { ok: true } | { ok: false; retryAfterSec: number } {
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs });
    return { ok: true };
  }

  if (bucket.count >= config.max) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { ok: true };
}

export const API_RATE_LIMITS: Record<string, RateLimitConfig> = {
  "POST:/api/orders": { windowMs: 15 * 60_000, max: 12 },
  "POST:/api/upload-media": { windowMs: 60 * 60_000, max: 40 },
  "POST:/api/contact": { windowMs: 15 * 60_000, max: 8 },
  "POST:/api/newsletter": { windowMs: 60 * 60_000, max: 20 },
  "GET:/api/admin/customers": { windowMs: 60_000, max: 60 },
  "GET:/api/admin/inbox": { windowMs: 60_000, max: 60 },
  "PATCH:/api/admin/inbox": { windowMs: 60_000, max: 60 },
};

export function rateLimitKey(method: string, pathname: string, ip: string): string {
  return `${method}:${pathname}:${ip}`;
}
