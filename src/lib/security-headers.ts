const SUPABASE_HOST = "*.supabase.co";
const CLOUDINARY_HOST = "https://res.cloudinary.com";

export function buildContentSecurityPolicy(siteUrl?: string): string {
  const self = "'self'";
  const origins = [self];
  if (siteUrl?.startsWith("http")) {
    try {
      origins.push(new URL(siteUrl).origin);
    } catch {
      // ignore invalid site url
    }
  }

  const directives = [
    `default-src ${self}`,
    `base-uri ${self}`,
    `form-action ${self}`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `script-src ${self} 'unsafe-inline'`,
    `style-src ${self} 'unsafe-inline'`,
    `img-src ${self} data: blob: ${CLOUDINARY_HOST} https://*.cloudinary.com`,
    `font-src ${self} data:`,
    `connect-src ${self} https://${SUPABASE_HOST} wss://${SUPABASE_HOST} https://api.pwnedpasswords.com`,
    `manifest-src ${self}`,
    `worker-src ${self} blob:`,
    "upgrade-insecure-requests",
  ];

  return directives.join("; ");
}

export function securityHeaders(siteUrl?: string): Record<string, string> {
  return {
    "Content-Security-Policy": buildContentSecurityPolicy(siteUrl),
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
  };
}

export function applySecurityHeaders(response: Response, siteUrl?: string): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(securityHeaders(siteUrl))) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
