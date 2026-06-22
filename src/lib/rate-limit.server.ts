import {
  API_RATE_LIMITS,
  checkRateLimit,
  clientIpFromHeaders,
  rateLimitKey,
  type RateLimitStore,
} from "./rate-limit";

const store: RateLimitStore = new Map();

export function checkApiRateLimit(request: Request): { ok: true } | { ok: false; retryAfterSec: number } {
  const url = new URL(request.url);
  if (!url.pathname.startsWith("/api/")) {
    return { ok: true };
  }

  const configKey = `${request.method}:${url.pathname}`;
  const config = API_RATE_LIMITS[configKey];
  if (!config) {
    return { ok: true };
  }

  const ip = clientIpFromHeaders(request.headers);
  const key = rateLimitKey(request.method, url.pathname, ip);
  return checkRateLimit(store, key, config);
}

export function rateLimitResponse(retryAfterSec: number): Response {
  return new Response(
    JSON.stringify({
      ok: false,
      error: "Too many requests. Please wait and try again.",
    }),
    {
      status: 429,
      headers: {
        "content-type": "application/json",
        "retry-after": String(retryAfterSec),
      },
    },
  );
}

/** Test helper — reset in-memory buckets between tests. */
export function resetRateLimitStore(): void {
  store.clear();
}
