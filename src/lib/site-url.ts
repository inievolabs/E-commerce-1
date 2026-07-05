function readEnv(name: string): string | undefined {
  if (typeof window !== "undefined" && (window as any).ENV?.[name]) {
    return (window as any).ENV[name];
  }
  if (typeof import.meta !== "undefined" && import.meta.env?.[name]) {
    return import.meta.env[name] as string;
  }
  if (typeof process !== "undefined" && process.env?.[name]) {
    return process.env[name];
  }
  if (typeof globalThis !== "undefined" && (globalThis as any)[name]) {
    return (globalThis as any)[name];
  }
  return undefined;
}

/** Canonical site origin from `VITE_SITE_URL` (no trailing slash). */
export function getSiteUrl(): string {
  const raw = readEnv("VITE_SITE_URL") || "";
  return String(raw).replace(/\/$/, "");
}

/** Build an absolute URL for canonical / Open Graph tags. */
export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
