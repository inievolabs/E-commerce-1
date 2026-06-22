# Velin Studio — Cloudflare Deploy Guide

Deploy the TanStack Start + Nitro (Cloudflare module) app to Cloudflare Workers.

## Production (live)

| Item | Value |
|------|-------|
| **Site URL** | https://velinstudiobd.com |
| **WWW** | https://www.velinstudiobd.com |
| **Worker name** | `velinstudio` |
| **Cloudflare account** | velinsac@outlook.com |
| **Supabase project** | `xkqkwoxrwezywnoillgf` |
| **Latest deploy** | 2026-06-22 — Version `b426a957-2047-4519-8265-9335c04a5cea` |

Custom domains are attached via Wrangler (`--domain velinstudiobd.com` and `--domain www.velinstudiobd.com`). Cloudflare creates/proxies the needed DNS records (A/AAAA to Cloudflare anycast).

There is **no** `workers.dev` URL on this account until you register a subdomain at [Workers onboarding](https://dash.cloudflare.com/7e7d54497b385c6b9f4c262f1d5be69d/workers/onboarding). Production traffic uses the custom domain only.

## Prerequisites

- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/) (included as devDependency)
- Supabase project configured (see `.env.example`)
- Node.js 20+

## 1. Local setup

```bash
cp .env.example .env.local
# Fill in Supabase keys from:
# https://supabase.com/dashboard/project/xkqkwoxrwezywnoillgf/settings/api
```

Required variables:

| Variable | Where | Notes |
|----------|-------|-------|
| `VITE_SITE_URL` | Client + Worker | Production URL (no trailing slash) |
| `VITE_SUPABASE_URL` | Client + Worker | `https://xkqkwoxrwezywnoillgf.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Client + Worker | Anon or publishable key — set as Worker **secret** in production |
| `SUPABASE_SERVICE_ROLE_KEY` | Worker only | Server-side admin operations — Worker **secret** |
| `CLOUDINARY_CLOUD_NAME` | Worker only | From [Cloudinary dashboard](https://console.cloudinary.com/settings/api-keys) |
| `CLOUDINARY_API_KEY` | Worker only | Cloudinary API key — Worker **secret** |
| `CLOUDINARY_API_SECRET` | Worker only | Cloudinary API secret — Worker **secret** (never expose to client) |

## 2. Build

```bash
npm install
npm run build
```

Build output:

- `.output/public/` — static assets (PWA, product images)
- `.output/server/` — Worker entry + auto-generated `wrangler.json`

## 3. Preview locally (Cloudflare runtime)

```bash
npm run preview:cf
```

Uses Wrangler dev against the built Worker.

## 4. Deploy to Cloudflare

```bash
npx wrangler login   # once
npm run deploy
```

`npm run deploy` builds and runs:

```bash
wrangler deploy --config .output/server/wrangler.json \
  --domain velinstudiobd.com \
  --domain www.velinstudiobd.com
```

Deploy **without** custom domains or a registered `workers.dev` subdomain will fail with an error asking for routes or onboarding.

### Worker secrets (production)

```bash
npx wrangler secret put VITE_SUPABASE_ANON_KEY --config .output/server/wrangler.json
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --config .output/server/wrangler.json
npx wrangler secret put CLOUDINARY_CLOUD_NAME --config .output/server/wrangler.json
npx wrangler secret put CLOUDINARY_API_KEY --config .output/server/wrangler.json
npx wrangler secret put CLOUDINARY_API_SECRET --config .output/server/wrangler.json
```

Paste values from `.env.local`. If `SUPABASE_SERVICE_ROLE_KEY` is empty locally, add it from [Supabase API settings](https://supabase.com/dashboard/project/xkqkwoxrwezywnoillgf/settings/api) before server-side admin features work in production.

### Non-secret vars

In `wrangler.toml` / Worker **Variables** (already set for production):

- `VITE_SITE_URL` = `https://velinstudiobd.com`
- `VITE_SUPABASE_URL` = `https://xkqkwoxrwezywnoillgf.supabase.co`

## 5. Custom domain (velinstudiobd.com)

Zone **velinstudiobd.com** must stay on Cloudflare (nameservers e.g. frida / zeus).

Domains are bound on each deploy via `--domain` flags (see above). You can also manage them under **Workers & Pages → velinstudio → Settings → Domains & Routes**.

Verify DNS (public resolver):

```bash
nslookup velinstudiobd.com 1.1.1.1
nslookup www.velinstudiobd.com 1.1.1.1
```

SSL is automatic when the zone is proxied through Cloudflare.

## 6. Supabase auth redirect URLs

In Supabase Dashboard → **Authentication → URL Configuration**  
([project settings](https://supabase.com/dashboard/project/xkqkwoxrwezywnoillgf/auth/url-configuration)):

| Setting | Value |
|---------|-------|
| **Site URL** | `https://velinstudiobd.com` |
| **Redirect URLs** | `https://velinstudiobd.com/**` |
| | `https://www.velinstudiobd.com/**` |
| | `http://localhost:5173/**` |

## 7. Database migrations

Migrations live in `supabase/migrations/`. They are already applied to project `xkqkwoxrwezywnoillgf`.

To apply on a fresh Supabase project:

```bash
supabase db push
```

## 8. Post-deploy checklist

- [ ] https://velinstudiobd.com returns 200
- [ ] Homepage loads with product images from `/products/`
- [ ] Shop page shows products from Supabase
- [ ] PWA manifest and service worker register
- [ ] Supabase anon key works from the browser (Network tab)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Worker if using server admin APIs

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Deploy asks for workers.dev subdomain | Use `--domain` flags (included in `npm run deploy`) or register workers.dev in dashboard |
| Build fails on Windows path | Run `npm run build` from project root |
| 500 on site | `npx wrangler tail --config .output/server/wrangler.json` |
| Local DNS cannot resolve domain | Use `1.1.1.1`; flush local DNS cache; public DNS may be ahead of ISP cache |
| Env vars missing in Worker | `wrangler secret put` or dashboard Variables |

## Scripts reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build + PWA service worker |
| `npm run preview:cf` | Wrangler dev against built output |
| `npm run deploy` | Build + deploy to Cloudflare with custom domains |
