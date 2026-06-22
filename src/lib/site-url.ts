/** Canonical site origin from `VITE_SITE_URL` (no trailing slash). */
export function getSiteUrl(): string {
  const raw =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_SITE_URL) ||
    (typeof process !== "undefined" && process.env?.VITE_SITE_URL) ||
    "";
  return String(raw).replace(/\/$/, "");
}

/** Build an absolute URL for canonical / Open Graph tags. */
export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
